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

// Optional: Define a type for tenant data
interface Tenant {
  id: string;
  name: string;
}


export const dynamic = 'force-dynamic'; // Force dynamic rendering

import { cookies } from 'next/headers'; // Import cookies

export default async function AppLayout(props: { children: React.ReactNode; params: { lang: Locale } }) { // Receive full props object
  const { children, params } = props;
  const awaitedParams = await params; // Await params
  const lang = awaitedParams.lang;

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

  // Fetch tenant name if userTenantId exists
  let tenantName: string | null = null;
  if (userTenantId) {
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('name')
      .eq('id', userTenantId)
      .single<Tenant>(); // Use the Tenant type

    if (tenantError) {
      console.error("Error fetching tenant name:", tenantError.message);
    } else {
      tenantName = tenantData?.name ?? null;
    }
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

  // Clone children to pass tenantName prop
  const childrenWithTenantName = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // Cast child to any to allow adding tenantName prop
      return React.cloneElement(child as any, { tenantName });
    }
    return child;
  });

  return (
    <DictionaryProvider dictionary={dictionary}>
      <SidebarProvider defaultOpen={true}>
        <SidebarLayoutContent
          lang={lang}
          userRole={userRole}
          isSuperuser={isSuperuser}
          userTenantId={userTenantId}
          tenantName={tenantName} // Pass tenantName here
          navItems={navItems}
          dictionary={dictionary}
        >
          {childrenWithTenantName} {/* Use cloned children */}
        </SidebarLayoutContent>
      </SidebarProvider>
    </DictionaryProvider>
  );
}
