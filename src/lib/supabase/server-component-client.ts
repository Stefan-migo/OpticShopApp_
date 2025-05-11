import { type CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This client is specifically for use in Server Components.
// It relies on the middleware to handle cookie updates and session refresh.
export function createServerComponentClient() {
  // Ensure environment variables are defined
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!supabaseAnonKey) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  // Create client with minimal cookie handlers required by types
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        // Make the get method async
        async get(name: string) {
          // Get cookies within the function scope and await it
          const cookieStore = await cookies() // <-- Added await here
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // No-op: Server Components cannot set cookies directly.
          // Rely on middleware or Server Actions.
          // This is correct as Server Components are read-only for cookies.
        },
        remove(name: string, options: CookieOptions) {
          // No-op: Server Components cannot remove cookies directly.
          // Rely on middleware or Server Actions.
          // This is correct as Server Components are read-only for cookies.
        },
      },
    }
  )
}