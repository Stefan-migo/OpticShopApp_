'use client';

import { createBrowserClient } from "@supabase/ssr"; // Import createBrowserClient

// Remove the old import
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
