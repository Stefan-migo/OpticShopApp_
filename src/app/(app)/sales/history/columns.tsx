"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the shape of our sales order data (joining with customers)
export type SalesOrder = {
  id: string;
  order_number: string;
  customer_id: string | null;
  user_id: string | null;
  order_date: string; // ISO string
  total_amount: number;
  discount_amount: number | null;
  tax_amount: number | null;
  final_amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'returned';
  notes: string | null;
  created_at: string;
  // Joined data
  customers?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  // We might join user profiles later if needed
};

// Define props for the columns function
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface

interface SalesHistoryColumnsProps {
  onViewDetails: (order: SalesOrder) => void;
  dictionary?: Dictionary | null | undefined; // Add optional dictionary prop
  // Add other actions if needed, e.g., onRefund, onCancel
}

// Helper function to format date/time
const formatDateTime = (dateString: string | null | undefined, dictionary?: Dictionary | null | undefined) => { // Add dictionary param
    if (!dateString) return dictionary?.common?.notAvailable || "-"; // Localize placeholder '-'
    try {
        // TODO: Localize date formatting based on locale and dictionary format string
        return new Date(dateString).toLocaleString(); // Use locale default format
    } catch (e) {
        return dictionary?.common?.invalidDate || "Invalid Date"; // Use dictionary with optional chaining
    }
};

// Helper function to format currency
const formatCurrency = (amount: number | null | undefined, dictionary?: Dictionary | null | undefined) => { // Add dictionary param
    if (amount === null || amount === undefined) return dictionary?.common?.notAvailable || "-"; // Localize placeholder '-'
    // TODO: Localize currency formatting based on locale and dictionary currency settings
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Export a function that generates the columns array
export const getSalesHistoryColumns = ({ onViewDetails, dictionary }: SalesHistoryColumnsProps): ColumnDef<SalesOrder>[] => [
  {
    accessorKey: "order_number",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {dictionary?.sales?.history?.orderNumberHeader || "Order #"} {/* Use dictionary with optional chaining */}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("order_number")}</div>,
  },
  {
    accessorKey: "order_date",
    header: ({ column }) => (
       <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {dictionary?.sales?.history?.dateHeader || "Date"} {/* Use dictionary with optional chaining */}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => <div>{formatDateTime(row.getValue("order_date"), dictionary)}</div>, // Pass dictionary to helper
  },
  {
    accessorKey: "customers.last_name", // Use nested key for sorting/filtering reference
    header: dictionary?.sales?.history?.customerHeader || "Customer", // Use dictionary with optional chaining
    cell: ({ row }) => {
        const firstName = row.original.customers?.first_name;
        const lastName = row.original.customers?.last_name;
        // TODO: Localize customer name formatting
        // Use dictionary for "Unnamed Customer" fallback
        const customerName = lastName ? `${lastName}, ${firstName || ''}` : (firstName || (dictionary?.common?.unnamedCustomer || 'Unnamed Customer'));
        return <div>{customerName}</div>;
    },
     filterFn: (row, id, value) => { // Custom filter for nested object
        const firstName = row.original.customers?.first_name?.toLowerCase() || '';
        const lastName = row.original.customers?.last_name?.toLowerCase() || '';
        const filterValue = String(value).toLowerCase();
        return lastName.includes(filterValue) || firstName.includes(filterValue);
    },
  },
  {
    accessorKey: "status",
    header: dictionary?.sales?.history?.statusHeader || "Status", // Use dictionary with optional chaining
    cell: ({ row }) => {
        const status = row.getValue("status") as SalesOrder['status']; // Cast to expected type
        // Add color coding based on status if desired
        // Localize status text using dictionary
        const localizedStatus = dictionary?.common?.status?.[status] || status;
        return <Badge variant={status === 'completed' ? 'default' : 'secondary'} className="capitalize">{localizedStatus}</Badge>;
    },
     filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
   {
    accessorKey: "final_amount",
    header: ({ column }) => (
       <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {dictionary?.sales?.history?.totalAmountHeader || "Total Amount"} {/* Use dictionary with optional chaining */}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue("final_amount"), dictionary)}</div>, // Pass dictionary to helper
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const order = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{dictionary?.common?.openMenu || "Open menu"}</span> {/* Use dictionary with optional chaining */}
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{dictionary?.common?.actions || "Actions"}</DropdownMenuLabel> {/* Use dictionary with optional chaining */}
            <DropdownMenuItem onClick={() => onViewDetails(order)}>{dictionary?.sales?.history?.viewDetailsAction || "View Details"}</DropdownMenuItem> {/* Use dictionary with optional chaining */}
            {/* Add other actions like Print Receipt, Refund, Cancel if applicable */}
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-100">
              Cancel Order
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
