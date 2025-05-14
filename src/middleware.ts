import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n, type Locale } from './lib/i18n/config'; // Import i18n and Locale type
import { parse } from 'cookie'; // Import the parse function from the 'cookie' library

let locales = i18n.locales;
let defaultLocale = i18n.defaultLocale;

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  console.log('getLocale - Negotiator Headers:', negotiatorHeaders); // Added logging

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  console.log('getLocale - Languages:', languages); // Added logging

  const matchedLocale = match(languages, locales, defaultLocale);
  console.log('getLocale - Matched Locale:', matchedLocale); // Added logging
  return matchedLocale;
}

export async function middleware(request: NextRequest) {
  console.log('Middleware is running!');
  const pathname = request.nextUrl.pathname;
  console.log('Middleware - Pathname:', pathname);

  // Allow access to the landing page without authentication
  const isLandingPage = locales.some((locale) => pathname.startsWith(`/${locale}/landing`));
  console.log('Middleware - Is landing page:', isLandingPage);

  if (isLandingPage) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing in middleware.");
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ // Set on the response to send back to the client
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete(name);  // Set on the response
        },
      },
    }
  );

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const isAuthenticated = !!userData.user;


  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // If authenticated and pathname is missing locale (and not the root path itself),
  // redirect to the default locale path.
  // This handles cases like redirecting from /login to /dashboard after successful login.
  if (isAuthenticated && pathnameIsMissingLocale && pathname !== '/') {
      // Attempt to read the preferred locale from the cookie
      const cookies = parse(request.headers.get('cookie') || '');
      const preferredLocale = cookies.NEXT_LOCALE;
      console.log('Middleware - Authenticated user, preferredLocale cookie:', preferredLocale); // Added logging

      let localeToUse: Locale = defaultLocale; // Default fallback, explicitly type as Locale
      console.log('Middleware - Initial localeToUse (default):', localeToUse); // Added logging

      if (preferredLocale && locales.includes(preferredLocale as Locale)) { // Check if preferredLocale is a valid locale
          localeToUse = preferredLocale as Locale; // Use preferred locale from cookie if valid, cast to Locale
          console.log('Middleware - Using preferred locale from cookie:', localeToUse); // Added logging
      } else {
          console.log('Middleware - Preferred locale cookie not set or invalid.'); // Added logging
          // If cookie not set or invalid, fall back to detecting from browser headers
          const detectedLocale = getLocale(request);
          console.log('Middleware - Detected locale from browser headers:', detectedLocale); // Added logging

          if (locales.includes(detectedLocale as Locale)) { // Check if detectedLocale is a valid locale
              localeToUse = detectedLocale as Locale;
              console.log('Middleware - Using detected locale from browser headers:', localeToUse); // Added logging
          } else {
              console.log('Middleware - Detected locale not in supported locales. Falling back to default locale:', localeToUse); // Added logging
          }
      }

      console.log('Middleware - Final localeToUse before redirect:', localeToUse); // Added logging

       return NextResponse.redirect(
        new URL(`/${localeToUse}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
      );
  }


  // Redirect if there is no locale (for non-authenticated users or root path)
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    console.log('Middleware - Redirecting with locale:', locale); // Added logging

    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }

  console.log('Middleware - Pathname after locale check:', pathname);


  if (userData?.user) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id, is_superuser')
      .eq('id', userData.user.id)
      .single();

    if (profileData) {
      // Read the selected_tenant_id cookie directly from the request
      const selectedTenantId = request.cookies.get('selected_tenant_id')?.value;
      console.log('Middleware - Read selected_tenant_id cookie:', selectedTenantId); // Debugging log

      if (profileData.is_superuser && selectedTenantId) {
        response.cookies.set('tenant_id', selectedTenantId);
        console.log('Middleware - Setting tenant_id cookie to selectedTenantId:', selectedTenantId); // Debugging log
      } else if (profileData.tenant_id) {
        response.cookies.set('tenant_id', profileData.tenant_id);
        console.log('Middleware - Setting tenant_id cookie to profile tenant_id:', profileData.tenant_id); // Debugging log
      } else {
        response.cookies.delete('tenant_id');
        console.log('Middleware - Deleting tenant_id cookie.'); // Debugging log
      }

      if (profileData.is_superuser) {
        response.cookies.set('is_superuser', 'true');
        console.log('Middleware - Setting is_superuser cookie to true.'); // Debugging log
      } else {
        response.cookies.delete('is_superuser');
        console.log('Middleware - Deleting is_superuser cookie.'); // Debugging log
      }

    } else if (profileError) {
      console.error('Middleware - Error fetching profile in middleware:', profileError);
    } else {
      console.warn('Middleware - User found but profile data not found:', userData.user.id);
      response.cookies.delete('tenant_id');
      response.cookies.delete('is_superuser');
    }
  } else if (userError) {
    console.error('Error getting user in middleware:', userError);
    response.cookies.delete('tenant_id');
    response.cookies.delete('is_superuser');
  } else {
    response.cookies.delete('tenant_id');
    response.cookies.delete('is_superuser');
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except those starting with /_next/ or the root path without a locale
    '/((?!_next).*)',
    '/', // Include the root path for locale detection
  ],
};
