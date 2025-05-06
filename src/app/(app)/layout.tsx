import Link from "next/link";
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
  Contact, // Assuming Contact icon for Prescriptions
  Calendar, // Assuming Calendar icon for Appointments
  Settings,
  Eye, // Assuming Eye icon for Customers/Patients
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import React from 'react'; // Import React
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createServerComponentClient } from "@/lib/supabase/server-component-client"; // Use CORRECT server client for components
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user-nav"; // Import UserNav component
import { getDictionary } from "@/lib/i18n";
import { Locale } from "@/lib/i18n/config";
import { DictionaryProvider } from "@/lib/i18n/dictionary-context"; // Import DictionaryProvider

export default async function AppLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const supabase = createServerComponentClient(); // Use the correct client function
  const dictionary = await getDictionary(lang);

  if (!dictionary) {
    // Handle the case where the dictionary failed to load
    console.error(`Failed to load dictionary for locale: ${lang}`);
    // You could render an error message, a fallback UI, or redirect
    // Depending on your error handling strategy, you might want to show a global error page
    // or a minimal layout without translations. For now, we'll show a simple error message.
    return <div>Error: Could not load language resources for locale: {lang}.</div>;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // If no user is logged in, redirect to login page
    // This logic might also be handled/enforced by middleware
    return redirect(`/${lang}/login`); // Redirect with locale
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
    .maybeSingle(); // Use maybeSingle() to handle potentially missing profile

  if (profileError) {
    console.error("Error fetching user profile/role:", profileError.message);
  } else if (profileData?.roles && typeof profileData.roles === 'object' && !Array.isArray(profileData.roles)) {
    // Explicitly check if roles is a single object before accessing name
    userRole = (profileData.roles as { name: string | null }).name || 'Unknown Role';
  } else {
     console.warn("User profile or role not found/invalid for ID:", user.id);
     userRole = 'No Role Assigned';
  }


  // Placeholder for navigation items - adjust icons and paths as needed
  const navItems = [
    { href: `/dashboard`, label: dictionary.navigation.dashboard, icon: Home }, // Use dictionary directly
    { href: `/customers`, label: dictionary.navigation.customers, icon: Eye }, // Use dictionary directly
    { href: `/inventory`, label: dictionary.navigation.inventory, icon: Package }, // Use dictionary directly
    { href: `/purchase-orders`, label: dictionary.navigation.purchaseOrders, icon: ShoppingCart }, // Use dictionary directly
    { href: `/prescriptions`, label: dictionary.navigation.prescriptions, icon: Contact }, // Use dictionary directly
    { href: `/appointments`, label: dictionary.navigation.appointments, icon: Calendar }, // Use dictionary directly
    { href: `/sales`, label: dictionary.navigation.sales, icon: ShoppingCart }, // Use dictionary directly
    { href: `/reports`, label: dictionary.navigation.reports, icon: LineChart }, // Use dictionary directly
    { href: `/medical-actions`, label: dictionary.navigation.medicalActions, icon: Settings }, // Use dictionary directly, Add Medical Actions link
    // { href: `/settings`, label: dictionary.navigation.settings, icon: Settings }, // Use dictionary directly, Placeholder route
  ];

  // Conditionally add Admin link
  if (userRole === 'admin') {
    navItems.push({ href: `/admin/users`, label: dictionary.navigation.userManagement, icon: Users }); // Use dictionary directly, Use Users icon for admin
  }

  return (
    <DictionaryProvider dictionary={dictionary}> {/* Wrap children with DictionaryProvider */}
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Sidebar - Desktop */}
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href={`/dashboard`} className="flex items-center gap-2 font-semibold"> {/* Updated href */}
                <Package2 className="h-6 w-6" /> {/* Replace with Optic Logo */}
                <span className="">{dictionary.app.name}</span> {/* Use dictionary directly */}
              </Link>
              {/* Optional: Notification Bell in Sidebar Header */}
              {/* <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="sr-only">{dictionary.common.toggleNotifications}</span> {/* Use dictionary directly */}
              {/* </Button> */}
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    // Add active state logic here based on current path
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {/* Optional: Badges for notifications/counts */}
                    {/* {item.label === dictionary.navigation.orders && ( {/* Use dictionary */}
                      {/* <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                        6
                      </Badge>
                    )} */}
                  </Link>
                ))}
              </nav>
            </div>
            {/* Optional: Sidebar Footer Content */}
            {/* <div className="mt-auto p-4">
              <Card x-chunk="dashboard-02-chunk-0">
                <CardHeader className="p-2 pt-0 md:p-4">
                  <CardTitle>{dictionary.sidebar.upgradeTitle}</CardTitle> {/* Use dictionary directly */}
                  {/* <CardDescription>
                    {dictionary.sidebar.upgradeDescription} {/* Use dictionary directly */}
                  {/* </CardDescription> */}
                {/* </CardHeader> */}
                {/* <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                  <Button size="sm" className="w-full">
                    {dictionary.sidebar.upgradeButton} {/* Use dictionary directly */}
                  {/* </Button> */}
                {/* </CardContent> */}
              {/* </Card> */}
            {/* </div> */}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col">
          {/* Header */}
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            {/* Mobile Sidebar Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{dictionary.common.toggleNavigationMenu}</span> {/* Use dictionary directly */}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link
                    href={`/${lang}/dashboard`} // Updated href with locale
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                  >
                    <Package2 className="h-6 w-6" /> {/* Replace with Optic Logo */}
                    <span className="sr-only">{dictionary.app.name}</span> {/* Use dictionary directly */}
                  </Link>
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                      // Add active state logic here
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                      {/* Optional: Badges */}
                    </Link>
                  ))}
                   {/* Conditional Admin Link for Mobile */}
                   {userRole === 'admin' && (
                       <Link
                          key="admin-users-mobile"
                          href={`/${lang}/admin/users`} // Updated href with locale
                          className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                      >
                          <Users className="h-5 w-5" />
                          {dictionary.navigation.userManagement} {/* Use dictionary directly */}
                      </Link>
                   )}
                </nav>
                {/* Optional: Mobile Sidebar Footer */}
              </SheetContent>
            </Sheet>

            {/* Header Content (e.g., Search, User Menu) */}
            <div className="w-full flex-1">
              {/* Optional: Search Form */}
              {/* <form>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={dictionary.common.searchProducts} {/* Use dictionary directly */}
                    {/* className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                  />
                </div>
              </form> */}
            </div>

            {/* User Nav Component - Pass userRole */}
            <UserNav userRole={userRole} />

          </header>

          {/* Page Content */}
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children} {/* Render children directly */}
          </main>
        </div>
      </div>
    </DictionaryProvider> // Close DictionaryProvider
  );
}
