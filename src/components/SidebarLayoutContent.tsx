'use client';

import Link from "next/link";
import React from 'react';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import {
  Home, Eye, Package, ShoppingCart, Contact, Calendar, LineChart, Settings, Users, Package2, Menu, AlertCircle, FileText, TrendingUp, Stethoscope
  // Add any other specific icons used directly (like Package2, Menu)
} from "lucide-react";

// Import UI components
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"; // Import SheetTitle and SheetDescription
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
  // Add a fallback icon
  AlertCircle: AlertCircle,
};

interface SidebarLayoutContentProps {
  children: React.ReactNode;
  lang: Locale;
  userRole: string;
  // navItems now expects 'icon' to be a string key for iconMap
  navItems: { href: string; label: string; icon: string }[];
  dictionary: Dictionary;
}

const SidebarLayoutContent: React.FC<SidebarLayoutContentProps> = ({
  children,
  lang,
  userRole,
  navItems,
  dictionary,
}) => {
  const { state, setOpen } = useSidebar(); // Access sidebar state and setOpen function
  const [mounted, setMounted] = useState(false); // State for client-side mounting
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // State to track mobile sidebar open state

  useEffect(() => {
    setMounted(true); // Set mounted to true after initial render on the client
  }, []);

  const FallbackIcon = iconMap['AlertCircle'] || AlertCircle; // Ensure AlertCircle is in the map or imported

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr]">
      {/* Conditionally render Sidebar only on the client */}
      {mounted && (
        <Sidebar side="left" collapsible="icon">
          <SidebarHeader className={cn("flex flex-col gap-2 p-2", state === 'collapsed' && 'items-center p-1')}> {/* Changed items-start to items-center */}
            <Link href={`/${lang}/dashboard`} className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" /> {/* Direct usage of imported icon */}
              <span className={cn(state === 'collapsed' && 'hidden')}>{dictionary.app.name}</span> {/* Conditionally hide span */}
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
                        className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", state === 'collapsed' && 'justify-center')} /* Added conditional justify-center */
                       >
                          <IconComponent className="h-4 w-4" />
                          {item.label}
                       </Link>
                     </SidebarMenuButton>
                   </SidebarMenuItem>
                 );
               })}
               {userRole === 'admin' && (() => {
                   const AdminIcon = iconMap['Users'] || FallbackIcon;
                   return (
                     <SidebarMenuItem key={`/${lang}/admin/users`}>
                       <SidebarMenuButton asChild>
                         <Link
                            key={`/${lang}/admin/users`}
                            href={`/${lang}/admin/users`}
                            className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", state === 'collapsed' && 'justify-center')} /* Added conditional justify-center */
                          >
                            <AdminIcon className="h-4 w-4" />
                            {dictionary.navigation.userManagement}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                })()}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
               <UserNav userRole={userRole} />
            </SidebarFooter>
          </Sidebar>
        )}


      <div className="flex flex-col" inert={isMobileSidebarOpen || undefined}> {/* Adjusted inert attribute */}
        <header className="flex h-14 items-center gap-4 bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <ActualSidebarTrigger className="shrink-0 md:block">
            <Menu className="h-5 w-5" /> {/* Direct usage */}
            <span className="sr-only">{dictionary.common.toggleNavigationMenu}</span>
          </ActualSidebarTrigger>
          <Sheet onOpenChange={(open) => { setIsMobileSidebarOpen(open); if (!open && setOpen) setOpen(false); }}> {/* Added onOpenChange handler here and update mobile sidebar state */}
            <SheetTrigger asChild>
              <ActualSidebarTrigger className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" /> {/* Direct usage */}
                <span className="sr-only">{dictionary.common.toggleNavigationMenu}</span>
              </ActualSidebarTrigger>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-64"> {/* Added w-64 class for width */}
               {/* Add SheetTitle and SheetDescription for accessibility */}
               <SheetTitle className="sr-only">{dictionary.common.mobileSidebarTitle || 'Mobile Sidebar'}</SheetTitle> {/* Visually hidden title */}
               <SheetDescription className="sr-only">{dictionary.common.mobileSidebarDescription || 'Navigation menu'}</SheetDescription> {/* Visually hidden description */}
               <SidebarHeader>
                  <Link href={`/${lang}/dashboard`} className="flex items-center gap-2 text-lg font-semibold mb-4">
                     <Package2 className="h-6 w-6" /> {/* Direct usage */}
                     <span className="sr-only">{dictionary.app.name}</span>
                  </Link>
               </SidebarHeader>
               <nav className="grid gap-2 text-sm font-medium"> {/* Changed text-lg to text-sm */}
                  {navItems.map((item) => {
                     const IconComponent = iconMap[item.icon] || FallbackIcon;
                     return (
                       <Link
                          key={item.href}
                          href={item.href}
                          className="mx-[-0.65rem] flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground" /* Changed gap-4 to gap-3 */
                       >
                          <IconComponent className="h-4 w-4" /> {/* Changed h-5 w-5 to h-4 w-4 */}
                          {item.label}
                       </Link>
                     );
                  })}
                  {userRole === 'admin' && (() => {
                      const AdminIcon = iconMap['Users'] || FallbackIcon;
                      return (
                        <Link
                           key={`/${lang}/admin/users`}
                           href={`/${lang}/admin/users`}
                           className="mx-[-0.65rem] flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground" /* Changed gap-4 to gap-3 */
                         >
                           <AdminIcon className="h-4 w-4" /> {/* Changed h-5 w-5 to h-4 w-4 */}
                           {dictionary.navigation.userManagement}
                         </Link>
                      );
                  })()}
               </nav>
               {/* Add UserNav to mobile sidebar */}
               <div className="mt-auto border-t p-4"> {/* Added margin-top auto and padding/border */}
                 <UserNav userRole={userRole} />
               </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                {/* Home link */}
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/${lang}/dashboard`}>
                      {dictionary.navigation.dashboard || 'Dashboard'} {/* Use dictionary for Home link */}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {/* Dynamically generated breadcrumb items */}
                {usePathname().split('/').filter(segment => segment !== lang && segment !== '(app)' && segment !== '').map((segment: string, index: number, segments: string[]) => {
                  const isLastSegment = index === segments.length - 1;
                  const href = `/${lang}/${segments.slice(0, index + 1).join('/')}`; // Construct href for intermediate links
                  const segmentText = segment.replace(/-/g, ' '); // Replace hyphens with spaces for readability

                  return (
                    <React.Fragment key={segment}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {isLastSegment ? (
                          <BreadcrumbPage>{segmentText}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={href}>
                              {segmentText}
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
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayoutContent;
