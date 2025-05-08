// app/[lang]/layout.tsx

import React from 'react';
import { redirect } from "next/navigation";
import { Home, Package, ShoppingCart, Users, Contact, Calendar, Settings, Eye, LineChart } from "lucide-react"; // Keep icons needed for navItems

import { createServerComponentClient } from "@/lib/supabase/server-component-client";
import { getDictionary } from "@/lib/i18n";
import { Locale } from "@/lib/i18n/config";
import { DictionaryProvider } from "@/lib/i18n/dictionary-context";
import SidebarLayoutContent from "@/components/SidebarLayoutContent"; // Ensure this path is correct
import { SidebarProvider } from "@/registry/new-york-v4/ui/sidebar";

// It's good practice to define the props type for async components
interface AppLayoutProps {
  children: React.ReactNode; // This is the actual page content for the current route
  params: { lang: Locale };
}

export default async function AppLayout({
  children,
  params: { lang },
}: AppLayoutProps) {
  const supabase = createServerComponentClient();
  const dictionary = await getDictionary(lang);

  if (!dictionary) {
    console.error(`Failed to load dictionary for locale: ${lang}`);
    // Render a minimal fallback UI or an error message
    // This UI won't have access to the dictionary, so keep messages generic or hardcoded in English
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
  let userRole = 'N/A'; // Default role display
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      role_id,
      roles ( name )
     `)
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching user profile/role:", profileError.message);
    // Potentially handle this more gracefully, e.g., assign a default limited role
    // or show an error message within the layout if crucial.
    // For now, it defaults to 'N/A' or 'No Role Assigned' below.
  }

  if (profileData?.roles && typeof profileData.roles === 'object' && !Array.isArray(profileData.roles)) {
    userRole = (profileData.roles as { name: string | null }).name || 'Unknown Role';
  } else if (!profileError) { // Only log warning if no error occurred but role is still missing
     console.warn("User profile or role not found/invalid for ID:", user.id);
     userRole = 'No Role Assigned';
  }


  // Define navigation items using the fetched dictionary
  // Define navigation items using the fetched dictionary
  // Pass icon names as strings instead of components to avoid passing non-plain objects to Client Components
  // Provide fallback for label in case dictionary lookup returns undefined
  const navItems = [
    { href: `/${lang}/dashboard`, label: dictionary.navigation.dashboard || '', icon: 'Home' },
    { href: `/${lang}/customers`, label: dictionary.navigation.customers || '', icon: 'Eye' },
    { href: `/${lang}/inventory`, label: dictionary.navigation.inventory || '', icon: 'Package' },
    { href: `/${lang}/purchase-orders`, label: dictionary.navigation.purchaseOrders || '', icon: 'ShoppingCart' },
    { href: `/${lang}/prescriptions`, label: dictionary.navigation.prescriptions || '', icon: 'Contact' },
    { href: `/${lang}/appointments`, label: dictionary.navigation.appointments || '', icon: 'Calendar' },
    { href: `/${lang}/sales`, label: dictionary.navigation.sales || '', icon: 'ShoppingCart' }, // Consider a different icon for sales if needed
    { href: `/${lang}/reports`, label: dictionary.navigation.reports || '', icon: 'LineChart' },
    { href: `/${lang}/medical-actions`, label: dictionary.navigation.medicalActions || '', icon: 'Settings' }, // Consider a more specific icon for medical actions
    { href: `/${lang}/settings`, label: dictionary.navigation.settings || '', icon: 'Settings' },
  ];

  // Conditionally add Admin link
  if (userRole === 'admin') {
    navItems.push({ href: `/${lang}/admin/users`, label: dictionary.navigation.userManagement || '', icon: 'Users' });
  }

  // AppLayout (Server Component) now passes all necessary data as props
  // to SidebarLayoutContent (Client Component).
  // It does NOT call any React hooks directly.
  return (
    <DictionaryProvider dictionary={dictionary}>
      <SidebarProvider defaultOpen={true}>
        <SidebarLayoutContent
          lang={lang}
          userRole={userRole}
          navItems={navItems}
          dictionary={dictionary} // Pass dictionary for SidebarLayoutContent to use if needed beyond navItems
        >
          {children} {/* This renders the actual page content */}
        </SidebarLayoutContent>
      </SidebarProvider>
    </DictionaryProvider>
  );
}
