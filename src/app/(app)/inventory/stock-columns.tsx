"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Define the shape of our inventory item data (joining with products)
export type InventoryItem = {
  id: string;
  product_id: string;
  serial_number: string | null;
  location: string | null;
  quantity: number;
  cost_price: number | null;
  purchase_date: string | null;
  status: 'available' | 'sold' | 'damaged' | 'returned' | null; // Match enum
  created_at: string;
  // Joined data from products table
  products?: {
    name: string;
    brand: string | null;
    model: string | null;
  } | null;
};

// Define props for the columns function
interface InventoryItemColumnsProps {
  onEdit: (item: InventoryItem) => void;
  onDelete: (itemId: string) => void;
  // Add other actions if needed, e.g., onStatusChange
}

// Helper function to format currency
const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // Adjust currency as needed
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (e) {
        return "Invalid Date";
    }
};

// Export a function that generates the columns array
export const getStockColumns = ({ onEdit, onDelete }: InventoryItemColumnsProps): ColumnDef<InventoryItem>[] => [
  // Optional: Select column
  // { id: "select", ... },
  {
    accessorKey: "products.name", // Access nested product name
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Product Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.original.products?.name || "N/A"}</div>,
    filterFn: (row, id, value) => { // Custom filter for nested object
        // Ensure value is a string and productName exists before filtering
        const productName = row.original.products?.name;
        if (typeof value !== 'string' || !productName) {
            return false; // Don't filter if types are wrong or name is missing
        }
        // Perform case-insensitive comparison
        return productName.toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "serial_number",
    header: "Serial Number",
    cell: ({ row }) => <div>{row.getValue("serial_number") || "-"}</div>,
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-right w-full justify-end"
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    cell: ({ row }) => <div className="text-center">{row.getValue("quantity")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status");
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        if (status === 'available') variant = 'default';
        if (status === 'sold') variant = 'outline';
        if (status === 'damaged' || status === 'returned') variant = 'destructive';
        return status ? <Badge variant={variant} className="capitalize">{status}</Badge> : "-";
    },
    // Removed filterFn temporarily due to persistent type errors
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => <div>{row.getValue("location") || "-"}</div>,
  },
  {
    accessorKey: "cost_price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-right w-full justify-end"
      >
        Cost Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("cost_price"))}</div>,
  },
   {
    accessorKey: "purchase_date",
    header: ({ column }) => (
       <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Purchase Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => <div>{formatDate(row.getValue("purchase_date"))}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original;
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
            {/* Add specific inventory actions here */}
            <DropdownMenuItem onClick={() => onEdit(item)}>Edit Stock Item</DropdownMenuItem>
            {/* <DropdownMenuItem>Adjust Quantity</DropdownMenuItem> */}
            {/* <DropdownMenuItem>Change Status</DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700 focus:bg-red-100"
              onClick={() => onDelete(item.id)}
            >
              Delete Stock Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
