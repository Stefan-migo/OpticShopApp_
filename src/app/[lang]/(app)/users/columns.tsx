"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger, // Added DropdownMenuTrigger
  DropdownMenuSub, // For nested role change
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup, // For selecting role
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import * as React from "react"; // Need React for state in actions
import { useDictionary } from "@/lib/i18n/dictionary-context"; // Import useDictionary

// Define the shape of our user data (joining profiles and roles)
export type UserProfile = {
  id: string; // Corresponds to auth.users.id
  email: string | null; // From profiles table
  full_name?: string | null; // Assuming 'full_name' column in profiles
  role_id: string | null;
  // Joined data
  roles?: {
    id: string;
    name: string;
  } | null;
};

// Define props for the columns function
import { type Dictionary } from "@/lib/i18n/types"; // Import Dictionary type

// Define props for the columns function
interface UserManagementColumnsProps {
  availableRoles: { id: string; name: string }[]; // Pass available roles for dropdown
  onChangeRole: (userId: string, newRoleId: string) => void; // Callback to handle role change
  dictionary: Dictionary; // Add dictionary prop
  // Add other actions if needed, e.g., disable/delete user
}

// Export a function that generates the columns array
export const getUserManagementColumns = ({ availableRoles, onChangeRole, dictionary }: UserManagementColumnsProps): ColumnDef<UserProfile>[] => {

  return [
  {
    accessorKey: "full_name",
    header: dictionary.userManagement.columns.nameHeader,
    cell: ({ row }) => <div>{row.original.full_name || dictionary.common.notAvailable}</div>,
  },
  {
    accessorKey: "email", // Need to fetch email separately or adjust query
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {dictionary.userManagement.columns.emailHeader}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.original.email || dictionary.common.notAvailable}</div>, // Display placeholder if email not fetched
  },
  {
    accessorKey: "roles.name", // Access nested role name
    header: dictionary.userManagement.columns.roleHeader,
    cell: ({ row }) => {
        const roleName = row.original.roles?.name;
        return <Badge variant={roleName === 'admin' ? 'destructive' : 'secondary'} className="capitalize">{roleName || dictionary.userManagement.columns.noRole}</Badge>;
    },
     filterFn: (row, id, value) => {
        const roleName = row.original.roles?.name || '';
        return value.includes(roleName);
    },
  },
  // Add other columns like 'Created At' if needed from auth.users table
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const userProfile = row.original;
      const currentRoleId = userProfile.role_id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{dictionary.userManagement.columns.openMenu}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{dictionary.userManagement.columns.actions}</DropdownMenuLabel>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <span>{dictionary.userManagement.columns.changeRole}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup
                            value={currentRoleId ?? undefined}
                            onValueChange={(newRoleId) => {
                                if (newRoleId && newRoleId !== currentRoleId) {
                                    onChangeRole(userProfile.id, newRoleId);
                                }
                            }}
                        >
                            {availableRoles.map((role) => (
                                <DropdownMenuRadioItem key={role.id} value={role.id} className="capitalize">
                                    {role.name}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
            {/* Add other actions like Disable User, Delete User */}
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-100">
              Delete User
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
};
