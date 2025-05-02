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
  DropdownMenuTrigger,
  DropdownMenuSub, // For nested role change
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup, // For selecting role
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import * as React from "react"; // Need React for state in actions

// Define the shape of our user data (joining profiles and roles)
export type UserProfile = {
  id: string; // Corresponds to auth.users.id
  email?: string; // From auth.users table (might need separate fetch or join)
  role_id: string | null;
  // Joined data
  roles?: {
    id: string;
    name: string;
  } | null;
  // Add other profile fields like full_name if they exist
};

// Define props for the columns function
interface UserManagementColumnsProps {
  availableRoles: { id: string; name: string }[]; // Pass available roles for dropdown
  onChangeRole: (userId: string, newRoleId: string) => void; // Callback to handle role change
  // Add other actions if needed, e.g., disable/delete user
}

// Export a function that generates the columns array
export const getUserManagementColumns = ({ availableRoles, onChangeRole }: UserManagementColumnsProps): ColumnDef<UserProfile>[] => [
  {
    accessorKey: "email", // Need to fetch email separately or adjust query
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.original.email || 'N/A'}</div>, // Display placeholder if email not fetched
  },
  {
    accessorKey: "roles.name", // Access nested role name
    header: "Role",
    cell: ({ row }) => {
        const roleName = row.original.roles?.name;
        return <Badge variant={roleName === 'admin' ? 'destructive' : 'secondary'} className="capitalize">{roleName || 'No Role'}</Badge>;
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
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <span>Change Role</span>
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
