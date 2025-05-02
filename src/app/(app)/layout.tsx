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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createServerComponentClient } from "@/lib/supabase/server-component-client"; // Use CORRECT server client for components
import { redirect } from "next/navigation";
import { UserNav } from "@/components/user-nav"; // Import UserNav component

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient(); // Use the correct client function

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // If no user is logged in, redirect to login page
    // This logic might also be handled/enforced by middleware
    return redirect("/login");
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
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/customers", label: "Customers", icon: Eye },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/prescriptions", label: "Prescriptions", icon: Contact },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    { href: "/sales", label: "Sales/POS", icon: ShoppingCart },
    { href: "/reports", label: "Reports", icon: LineChart },
    // { href: "/settings", label: "Settings", icon: Settings }, // Placeholder route
  ];

  // Conditionally add Admin link
  if (userRole === 'admin') {
    navItems.push({ href: "/admin/users", label: "User Management", icon: Users }); // Use Users icon for admin
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar - Desktop */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold"> {/* Updated href */}
              <Package2 className="h-6 w-6" /> {/* Replace with Optic Logo */}
              <span className="">OpticApp</span> {/* Replace with App Name */}
            </Link>
            {/* Optional: Notification Bell in Sidebar Header */}
            {/* <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button> */}
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
                  {/* {item.label === "Orders" && (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
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
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support
                  team.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div> */}
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
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <Package2 className="h-6 w-6" /> {/* Replace with Optic Logo */}
                  <span className="sr-only">OpticApp</span> {/* Replace with App Name */}
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
                        href="/admin/users"
                        className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                    >
                        <Users className="h-5 w-5" />
                        User Management
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
                  placeholder="Search products..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form> */}
          </div>

          {/* User Nav Component - Pass userRole */}
          <UserNav userRole={userRole} />

        </header>

        {/* Page Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
