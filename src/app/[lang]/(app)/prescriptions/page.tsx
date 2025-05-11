import * as React from "react";
import { createServerComponentClient } from "@/lib/supabase/server-component-client"; // Use server-side client
import { getDictionary } from "@/lib/i18n"; // Use server-side getDictionary
import { type Dictionary } from "@/lib/i18n/types"; // Import Dictionary type
import { Locale } from "@/lib/i18n/config"; // Import Locale type
import PrescriptionsPageClient from "./prescriptions-client"; // Import the client component
// No need to import useSearchParams here, it's accessed via props

export const dynamic = 'force-dynamic'; // Force dynamic rendering

// Define props for the Server Component page, including searchParams
interface PrescriptionsPageProps {
  params: { lang: Locale };
  searchParams: { [key: string]: string | string[] | undefined }; // Add searchParams prop
}

// This is now an async Server Component
export default async function PrescriptionsPage(props: PrescriptionsPageProps) { // Receive props object
  const { params, searchParams } = props; // Destructure params and searchParams
  // Attempt to await params as suggested by error message (though likely not needed with correct prop access)
  const awaitedParams = await params;
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

  // Get tenantId from search parameters
  const selectedTenantId = searchParams.tenantId; // Access tenantId from searchParams prop

  // Fetch prescriptions data on the server.
  let prescriptionsQuery = supabase
    .from("prescriptions")
    .select(`
      id,
      customer_id,
      prescriber_id,
      prescription_date,
      expiry_date,
      type,
      od_params,
      os_params,
      notes,
      created_at,
      customers ( first_name, last_name ),
      prescribers:profiles ( full_name )
    `);

  // Apply tenant filter to prescriptions if user is superuser AND tenantId search parameter is present
  if (isSuperuser && selectedTenantId && typeof selectedTenantId === 'string') {
    prescriptionsQuery = prescriptionsQuery.eq('tenant_id', selectedTenantId);
  }
  // Note: For non-superusers, RLS policies will automatically filter by their tenant_id

  const { data: prescriptions, error: fetchError } = await prescriptionsQuery
    .order("prescription_date", { ascending: false }); // Order by prescription date

  if (fetchError) {
    console.error("Error fetching prescriptions:", fetchError);
    // Handle error - pass error message to the client component or show error UI
    return <div>{dictionary?.prescriptions?.fetchError || "Failed to load prescription data"}: {fetchError.message}</div>;
  }

  // Format date strings on the server to prevent hydration mismatches
  const formattedPrescriptions = prescriptions?.map(prescription => {
    const date = new Date(prescription.created_at);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // MM
    const day = date.getDate().toString().padStart(2, '0'); // DD
    const year = date.getFullYear(); // YYYY
    return {
      ...prescription,
      created_at: `${month}/${day}/${year}`, // MM/DD/YYYY format
      // Format other date fields if necessary (e.g., prescription_date, expiry_date)
      prescription_date: prescription.prescription_date ? `${(new Date(prescription.prescription_date).getMonth() + 1).toString().padStart(2, '0')}/${new Date(prescription.prescription_date).getDate().toString().padStart(2, '0')}/${new Date(prescription.prescription_date).getFullYear()}` : null,
      expiry_date: prescription.expiry_date ? `${(new Date(prescription.expiry_date).getMonth() + 1).toString().padStart(2, '0')}/${new Date(prescription.expiry_date).getDate().toString().padStart(2, '0')}/${new Date(prescription.expiry_date).getFullYear()}` : null,
    };
  }) as any[] | []; // Type assertion for formatted data


  // Render the client component and pass the fetched data and dictionary
  return (
    <PrescriptionsPageClient
      initialData={formattedPrescriptions} // Pass formatted data
      dictionary={dictionary}
      lang={lang} // Pass lang if needed by client components
    />
  );
}


