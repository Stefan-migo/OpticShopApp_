import { type CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This client is intended for Route Handlers and Server Actions
// where setting/removing cookies might be necessary.
export async function createClient() {
  const cookieStore = cookies()

  // Ensure environment variables are defined
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!supabaseAnonKey) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        async get(name: string) {
          return (await cookies()).get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            (await cookies()).set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a context where cookies
            // cannot be set, such as a Server Component.
            // This can be ignored if middleware handles cookie updates.
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            (await cookies()).set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a context where cookies
            // cannot be set, such as a Server Component.
            // This can be ignored if middleware handles cookie updates.
          }
        },
      },
    }
  )
}
