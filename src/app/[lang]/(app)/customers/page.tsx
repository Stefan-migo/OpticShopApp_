import * as React from "react";
import { createServerComponentClient } from "@/lib/supabase/server-component-client"; // Use server-side client
import { getDictionary } from "@/lib/i18n"; // Use server-side getDictionary
import { type Dictionary } from "@/lib/i18n/types"; // Import Dictionary type
import { Locale } from "@/lib/i18n/config"; // Import Locale type
import CustomersPageClient from "./customers-client"; // Import the client component

export const dynamic = 'force-dynamic'; // Force dynamic rendering

// This is now an async Server Component
export default async function CustomersPage({ params, searchParams }: { params: { lang: Locale }, searchParams: { [key: string]: string | string[] | undefined } }) { // Receive params and searchParams directly
  const awaitedParams = await params; // Explicitly await params
  const lang = awaitedParams.lang;
  const dictionary = await getDictionary(lang); // Fetch dictionary on the server

  if (!dictionary) {
    console.error(`Failed to load dictionary for locale: ${lang}`);
    // Handle error - perhaps redirect to an error page or show a fallback UI
    return <div>Error loading language resources.</div>;
  }

  const supabase = createServerComponentClient(); // Use server-side client

  // Fetch user and check if superuser
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  let isSuperuser = false;
  if (user) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_superuser')
      .eq('id', user.id)
      .single();
    if (profileData && profileData.is_superuser !== null) {
      isSuperuser = profileData.is_superuser;
    }
  }

  // Render the client component and pass the dictionary and isSuperuser flag
  return (
    <CustomersPageClient
      dictionary={dictionary}
      lang={lang} // Pass lang if needed by client components
      isSuperuser={isSuperuser} // Pass isSuperuser flag
    />
  );
}
