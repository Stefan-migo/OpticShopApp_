"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye } from "lucide-react"; // Added Eye icon
import Link from 'next/link'; // Added Link import

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Need to add checkbox component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dictionary } from "@/lib/i18n/types"; // Import Dictionary type
import { useParams } from 'next/navigation'; // Import useParams

// TODO: Add checkbox component using shadcn-ui add

// Define the shape of our customer data (adjust based on actual schema/fetch)
export type Customer = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string; // Assuming string format for simplicity here
  // Added fields from migration
  dob: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
};

// Define props for the columns function
interface CustomerColumnsProps {
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  dictionary: Dictionary; // Add dictionary to props
}

// Export a function that generates the columns array
export const getColumns = ({ onEdit, onDelete, dictionary }: CustomerColumnsProps): ColumnDef<Customer>[] => [
  // Optional: Select column
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label={dictionary.common.selectAll || "Select all"} // Use dictionary
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label={dictionary.common.selectRow || "Select row"} // Use dictionary
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "first_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {dictionary.customers.form?.firstNameLabel || "First Name"} {/* Use dictionary parameter */}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("first_name") || "-"}</div>,
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {dictionary.customers.form?.lastNameLabel || "Last Name"} {/* Use dictionary parameter */}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("last_name") || "-"}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {dictionary.customers.form?.emailLabel || "Email"} {/* Use dictionary parameter */}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email") || "-"}</div>,
  },
  {
    accessorKey: "phone",
    header: () => {
      return dictionary.customers.form?.phoneLabel || "Phone"; // Use dictionary parameter
    },
    cell: ({ row }) => <div>{row.getValue("phone") || "-"}</div>,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
       return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {dictionary.customers.form?.createdAtLabel || "Created At"} {/* Use dictionary parameter */}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      // Date is now pre-formatted on the server
      const formattedDate = row.getValue("created_at") as string;
      return <div className="font-medium">{formattedDate}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const customer = row.original;
      // Removed useDictionary() call

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{dictionary.common.openMenu || "Open menu"}</span> {/* Use dictionary parameter */}
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{dictionary.common.actions || "Actions"}</DropdownMenuLabel> {/* Use dictionary parameter */}
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(customer.id)}
            >
              {dictionary.customers.tableActions?.copyId || "Copy customer ID"} {/* Use dictionary parameter */}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${useParams().lang}/customers/${customer.id}`} className="flex items-center">
                <Eye className="mr-2 h-4 w-4" /> {dictionary.customers.tableActions?.viewDetails || "View Details"} {/* Use dictionary parameter */}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(customer)}>{dictionary.customers.tableActions?.editCustomer || "Edit customer"}</DropdownMenuItem> {/* Use dictionary parameter */}
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700 focus:bg-red-100"
              onClick={() => onDelete(customer.id)}
            >
              {dictionary.customers.tableActions?.deleteCustomer || "Delete customer"} {/* Use dictionary parameter */}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
