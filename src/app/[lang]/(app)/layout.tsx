// app/[lang]/layout.tsx

import React from 'react';
import { redirect } from "next/navigation";

import { createServerComponentClient } from "@/lib/supabase/server-component-client";
import { getDictionary } from "@/lib/i18n";
import { Locale, i18n } from "@/lib/i18n/config"; // Import i18n config
import { DictionaryProvider } from "@/lib/i18n/dictionary-context";
import SidebarLayoutContent from "@/components/SidebarLayoutContent";
import { SidebarProvider } from "@/registry/new-york-v4/ui/sidebar";
import { headers } from 'next/headers'; // Import headers

interface AppLayoutProps {
  children: React.ReactNode;
  params: { lang: Locale };
}

// Optional: Define a more precise type for your profile data
interface UserProfile {
  id: string;
  role_id: string | null;
  is_superuser: boolean | null;
  tenant_id: string | null;
  roles: { name: string | null } | null; // Supabase returns related record or null for to-one relations
}


export const dynamic = 'force-dynamic'; // Force dynamic rendering

import { cookies } from 'next/headers'; // Import cookies

export default async function AppLayout(props: { children: React.ReactNode; params: { lang: Locale } }) { // Receive full props object
  const { children, params } = await props; // Attempt to await destructured props
  const lang = params.lang;

  const supabase = createServerComponentClient();
  const dictionary = await getDictionary(lang);

  if (!dictionary) {
    console.error(`Failed to load dictionary for locale: ${lang}`);
    return (
      <html>
        <body>
          <div>Error: Could not load language resources. Please try again later.</div>
        </body>
      </html>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("AppLayout - Fetched user:", user); // Log user object
  if (user) {
    console.log("AppLayout - User app_metadata:", user.app_metadata); // Log app_metadata
    // You might need to decode the JWT to see all claims, but app_metadata should be here
    // console.log("AppLayout - User JWT:", user.jwt); // JWT might not be directly accessible here or might be encoded
  }


  if (!user) {
    return redirect(`/${lang}/login`);
  }

  // Fetch user profile and role
  // `userProfileData` here will be of type `UserProfile | null`
  // `profileFetchError` will be of type `PostgrestError | null`
  const { data: userProfileData, error: profileFetchError } = await supabase
    .from('profiles')
    .select(`
      id,
      role_id,
      is_superuser,
      tenant_id,
      roles ( name )
    `)
    .eq('id', user.id)
    .maybeSingle<UserProfile>(); // Use the generic type if you defined UserProfile

  // Initialize variables with defaults
  let userRole = 'N/A';
  let isSuperuser = false;
  let userTenantId: string | null = null;

  if (profileFetchError) {
    console.error("Error fetching user profile/role:", profileFetchError.message);
    // You might want to handle this error more gracefully,
    // e.g., redirect to an error page or allow access with a default role.
    // For now, userRole, isSuperuser, userTenantId will remain at their defaults.
  } else if (userProfileData) { // Check if userProfileData (the actual profile object) exists
    if (userProfileData.is_superuser !== null && userProfileData.is_superuser !== undefined) {
      isSuperuser = userProfileData.is_superuser;
    }
    userTenantId = userProfileData.tenant_id;

    if (userProfileData.roles && typeof userProfileData.roles === 'object') {
      userRole = userProfileData.roles.name || 'Unknown Role';
    } else {
      console.warn("User profile role not found or invalid within profile for ID:", user.id);
      userRole = 'No Role Assigned';
    }
  } else {
    // No error, but also no profile data found (userProfileData is null)
    console.warn("User profile data not found for ID (no fetch error):", user.id);
    userRole = 'No Role Assigned'; // Or keep as 'N/A'
  }

  const navItems = [
    { href: `/${lang}/dashboard`, label: dictionary.navigation.dashboard || '', icon: 'Home' },
    { href: `/${lang}/customers`, label: dictionary.navigation.customers || '', icon: 'Contact' },
    { href: `/${lang}/inventory`, label: dictionary.navigation.inventory || '', icon: 'Package' },
    { href: `/${lang}/purchase-orders`, label: dictionary.navigation.purchaseOrders || '', icon: 'ShoppingCart' },
    { href: `/${lang}/prescriptions`, label: dictionary.navigation.prescriptions || '', icon: 'Eye' },
    { href: `/${lang}/appointments`, label: dictionary.navigation.appointments || '', icon: 'Calendar' },
    { href: `/${lang}/sales`, label: dictionary.navigation.sales || '', icon: 'ShoppingCart' },
    { href: `/${lang}/reports`, label: dictionary.navigation.reports || '', icon: 'LineChart' },
    { href: `/${lang}/medical-actions`, label: dictionary.navigation.medicalActions || '', icon: 'ClipboardPlus' },
    { href: `/${lang}/settings`, label: dictionary.navigation.settings || '', icon: 'Settings' },
  ];

  if (userRole === 'admin') {
    navItems.push({ href: `/${lang}/users`, label: dictionary.navigation.userManagement || '', icon: 'Users' });
  }

  return (
    <DictionaryProvider dictionary={dictionary}>
      <SidebarProvider defaultOpen={true}>
        <SidebarLayoutContent
          lang={lang}
          userRole={userRole}
          isSuperuser={isSuperuser}
          userTenantId={userTenantId}
          navItems={navItems}
          dictionary={dictionary}
        >
          {children}
        </SidebarLayoutContent>
      </SidebarProvider>
    </DictionaryProvider>
  );
}
