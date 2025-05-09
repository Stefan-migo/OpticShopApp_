"use client";

import * as React from "react"; // Add React import back
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Need to add avatar component
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link"; // Import Link
import { useRouter, useParams } from "next/navigation"; // Import useRouter and useParams
import { useToast } from "./ui/use-toast";

// TODO: Add avatar component using shadcn-ui add

interface UserNavProps {
  userRole?: string; // Make role optional for flexibility
}

export function UserNav({ userRole = "User" }: UserNavProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const params = useParams(); // Call useParams() here
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string | null>("User"); // Keep placeholder for name for now

  // Fetch user email on mount
  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
      // Could potentially fetch profile here too for name, but keep it simple for now
    };
    fetchUser();
  }, [supabase]);

const handleLogout = async () => {
  console.log("Attempting to log out..."); // Log start of logout
  const { error } = await supabase.auth.signOut();
  console.log("Supabase signOut result:", { error }); // Log result
  if (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Redirect to login page with locale and refresh to clear server state
      router.push(`/${params.lang}/login`); // Use the params variable
      router.refresh();
      toast({ title: "Logged out successfully." });
    }
  };

  // No need for these placeholders anymore, we use state variables
  // const userEmail = "user@example.com";
  // const userName = "User Name";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 shadow-neumorphic-sm rounded-full"> {/* Applied Neumorphic shadow and rounded-full */}
            {/* Optional: Add user avatar image */}
            {/* <AvatarImage src="/avatars/01.png" alt="@shadcn" /> */}
            <AvatarFallback>
              {/* Display initials or a default icon */}
              {userName?.substring(0, 1).toUpperCase() || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {/* Use state variable for name */}
            <p className="text-sm font-medium leading-none text-text-primary">{userName || 'User'}</p> {/* Applied text-text-primary */}
            {/* Use state variable for email */}
            <p className="text-xs leading-none text-text-secondary"> {/* Applied text-text-secondary */}
              {userEmail || 'Loading...'}
            </p>
            {/* Display the role */}
            <p className="text-xs leading-none text-text-secondary pt-1"> {/* Applied text-text-secondary */}
              Role: <span className="font-medium capitalize text-text-primary">{userRole}</span> {/* Applied text-text-primary */}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Wrap Profile item in Link */}
          <DropdownMenuItem asChild>
            <Link href={`/${useParams().lang}/profile`}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
            </Link>
          </DropdownMenuItem>
          {/* Wrap Settings item in Link */}
          <DropdownMenuItem asChild>
             <Link href={`/${useParams().lang}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                {/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
             </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
