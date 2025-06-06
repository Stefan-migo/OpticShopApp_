'use client';

import Link from "next/link";
import React, { useEffect, useState } from 'react'; // Import useEffect and useState
import {
  Home, Eye, Package, ShoppingCart, Contact, Calendar, LineChart, Settings, Users, Package2, Menu, AlertCircle, FileText, TrendingUp, Stethoscope, ClipboardPlus
  // Add any other specific icons used directly (like Package2, Menu)
} from "lucide-react";

// Import UI components
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/user-nav";
import {
  Sidebar,
  SidebarTrigger as ActualSidebarTrigger, // Aliased if needed
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar
} from "@/registry/new-york-v4/ui/sidebar";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/types";

import { cn } from "@/lib/utils"; // Ensure cn is imported
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/new-york-v4/ui/breadcrumb";
import BreadcrumbDetailName from "./BreadcrumbDetailName"; // Import the new component


// Mapping of icon names (strings) to icon components
const iconMap: { [key: string]: React.ElementType } = {
  Home, // Short-hand if variable name matches key
  Eye,
  Package,
  ShoppingCart,
  Contact,
  Calendar,
  LineChart,
  Settings,
  Users,
  FileText, // If you used "FileText" as a string name
  TrendingUp,
  Stethoscope,
  ClipboardPlus,
  // Add a fallback icon
  AlertCircle: AlertCircle,
};

interface SidebarLayoutContentProps {
  children: React.ReactNode;
  lang: Locale;
  userRole: string;
  isSuperuser: boolean; // Add isSuperuser prop to the interface
  userTenantId: string | null; // Add userTenantId prop to the interface
  tenantName: string | null; // Add tenantName prop
  // navItems now expects 'icon' to be a string key for iconMap
  navItems: { href: string; label: string; icon: string }[];
  dictionary: Dictionary;
}

const SidebarLayoutContent: React.FC<SidebarLayoutContentProps> = ({
  children,
  lang,
  userRole,
  isSuperuser, // Accept isSuperuser prop
  userTenantId, // Accept userTenantId prop
  tenantName, // Accept tenantName prop
  navItems,
  dictionary,
}) => {
  const { state } = useSidebar(); // Access sidebar state
  const pathname = usePathname(); // Get current pathname
  // const supabase = createClientComponentClient(); // Client-side Supabase client - No longer needed here

  // Remove state and effect for fetching names
  // const [customerName, setCustomerName] = useState<string | null>(null);
  // const [productName, setProductName] = useState<string | null>(null);
  // const [loadingBreadcrumbData, setLoadingBreadcrumbData] = useState(false);

  // useEffect(() => {
  //   const segments = pathname.split('/').filter(segment => segment !== lang && segment !== '(app)' && segment !== '');
  //   const customerIdSegment = segments.find((segment, index) => segments[index - 1] === 'customers' && segment !== 'new');
  //   const productIdSegment = segments.find((segment, index) => segments[index - 1] === 'inventory' && segment !== 'new');

  //   const fetchBreadcrumbData = async () => {
  //     setLoadingBreadcrumbData(true);
  //     if (customerIdSegment) {
  //       let query = supabase
  //         .from('customers')
  //         .select('first_name, last_name')
  //         .eq('id', customerIdSegment);

  //       // Apply tenant filter if superuser and a tenant is selected
  //       if (isSuperuser && userTenantId) {
  //         query = query.eq('tenant_id', userTenantId);
  //       }

  //       const { data: customer, error } = await query.maybeSingle(); // Use maybeSingle()
  //       if (customer) {
  //         setCustomerName(`${customer.first_name || ''} ${customer.last_name || ''}`.trim());
  //       } else {
  //         setCustomerName(null);
  //         console.error('Error fetching customer for breadcrumb:', error);
  //       }
  //     } else {
  //       setCustomerName(null);
  //     }

  //     if (productIdSegment) {
  //       let query = supabase
  //         .from('products')
  //         .select('name')
  //         .eq('id', productIdSegment);

  //       // Apply tenant filter if superuser and a tenant is selected
  //       if (isSuperuser && userTenantId) {
  //         query = query.eq('tenant_id', userTenantId);
  //       }

  //       const { data: product, error } = await query.maybeSingle(); // Use maybeSingle()
  //       if (product) {
  //         setProductName(product.name);
  //       } else {
  //         setProductName(null);
  //         console.error('Error fetching product for breadcrumb:', error);
  //       }
  //     } else {
  //       setProductName(null);
  //     }
  //     setLoadingBreadcrumbData(false);
  //   };

  //   fetchBreadcrumbData();
  // }, [pathname, lang, supabase, isSuperuser, userTenantId]); // Add dependencies

  const FallbackIcon = iconMap['AlertCircle'] || AlertCircle; // Ensure AlertCircle is in the map or imported

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr]">
      <Sidebar side="left" collapsible="icon">
<SidebarHeader className={cn("flex flex-col gap-2 p-2", state === 'collapsed' && 'items-center p-1')}>
  <Link href={`/${lang}/dashboard`} className="flex items-center gap-2 font-semibold">
    <Package2 className="h-6 w-6" /> {/* Direct usage of imported icon */}
    <span className={cn(state === 'collapsed' && 'hidden')}>{dictionary?.app?.name}</span> {/* Conditionally hide span */}
  </Link>
</SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => {
              const IconComponent = iconMap[item.icon] || FallbackIcon;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                      <IconComponent className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <UserNav userRole={userRole} isSuperuser={isSuperuser} userTenantId={userTenantId} /> {/* Pass isSuperuser and userTenantId props */}
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <ActualSidebarTrigger className="shrink-0 hidden md:block">
            <Menu className="h-5 w-5" /> {/* Direct usage */}
            <span className="sr-only">{dictionary.common.toggleNavigationMenu}</span>
          </ActualSidebarTrigger>
          <Sheet>
            <SheetTrigger asChild>
              <ActualSidebarTrigger className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" /> {/* Direct usage */}
                <span className="sr-only">{dictionary.common.toggleNavigationMenu}</span>
              </ActualSidebarTrigger>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
               <SidebarHeader>
                  <Link href={`/${lang}/dashboard`} className="flex items-center gap-2 text-lg font-semibold mb-4">
                     <Package2 className="h-6 w-6" /> {/* Direct usage */}
                     <span className="sr-only">{dictionary.app.name}</span>
                  </Link>
               </SidebarHeader>
               <nav className="grid gap-2 text-lg font-medium">
                  {navItems.map((item) => {
                     const IconComponent = iconMap[item.icon] || FallbackIcon;
                     return (
                       <Link
                          key={item.href}
                          href={item.href}
                          className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                       >
                          <IconComponent className="h-5 w-5" />
                          {item.label}
                       </Link>
                     );
                  })}
                  {userRole === 'admin' && (() => {
                      const AdminIcon = iconMap['Users'] || FallbackIcon;
                      return (
                        <Link
                           key={`/${lang}/users`}
                           href={`/${lang}/users`}
                           className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                         >
                           <AdminIcon className="h-5 w-5" />
                           {dictionary.navigation.userManagement}
                         </Link>
                      );
                  })()}
               </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                {/* Home link - Use tenantName if available, otherwise fallback to Dashboard */}
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/${lang}/dashboard`}>
                      {tenantName || dictionary.navigation.dashboard || 'Dashboard'} {/* Use tenantName here */}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {/* Dynamically generated breadcrumb items */}
                {pathname.split('/').filter(segment => segment !== lang && segment !== '(app)' && segment !== '').map((segment: string, index: number, segments: string[]) => {
                  const isLastSegment = index === segments.length - 1;
                  const href = `/${lang}/${segments.slice(0, index + 1).join('/')}`; // Construct href for intermediate links
                  const previousSegment = segments[index - 1];

                  let segmentContent: React.ReactNode;

                  // Check if it's a detail page segment and use BreadcrumbDetailName
                  if (previousSegment === 'customers' && isLastSegment && segment !== 'new') {
                      segmentContent = <BreadcrumbDetailName id={segment} type="customer" isSuperuser={isSuperuser} userTenantId={userTenantId} />;
                  } else if (previousSegment === 'inventory' && isLastSegment && segment !== 'new') {
                      segmentContent = <BreadcrumbDetailName id={segment} type="product" isSuperuser={isSuperuser} userTenantId={userTenantId} />;
                  } else {
                      // Fallback to translated segment text or segment text with spaces
                      segmentContent = dictionary.navigation?.[segment as keyof typeof dictionary.navigation] || segment.replace(/-/g, ' ');
                  }


                  return (
                    <React.Fragment key={segment}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {isLastSegment ? (
                          <BreadcrumbPage>
                            {segmentContent}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={href}>
                              {segmentContent}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
            {/* Optional Search */}
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* Children are now cloned with props above */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayoutContent;
