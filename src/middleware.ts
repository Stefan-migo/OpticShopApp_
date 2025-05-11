import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n } from './lib/i18n/config';

let locales = i18n.locales;
let defaultLocale = i18n.defaultLocale;

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  return match(languages, locales, defaultLocale);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
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
          request.cookies.set({ // Modify request cookies as well for subsequent operations within the middleware if needed
            name,
            value,
            ...options,
          });
          response.cookies.set({ // Set on the response to send back to the client
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.delete(name); // Modify request cookies
          response.cookies.delete(name);  // Set on the response
        },
      },
    }
  );

  const { data: userData, error: userError } = await supabase.auth.getUser();

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
    // Match paths starting with any defined locale followed by a slash,
    // excluding specific directories and file types.
    '/(' + locales.join('|') + ')/(?!api|_next/static|_next/image|favicon.ico|_next/webpack-hmr|.*\\..+)(.*)',
  ],
};
