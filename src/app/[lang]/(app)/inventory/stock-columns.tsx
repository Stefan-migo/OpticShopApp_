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

import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface

// Define props for the columns function
interface InventoryItemColumnsProps {
  onEdit: (item: InventoryItem) => void;
  onDelete: (itemId: string) => void;
  dictionary: Dictionary | null | undefined; // Use the imported Dictionary interface and allow null/undefined
  // Add other actions if needed, e.g., onStatusChange
}

// Helper function to format currency
const formatCurrency = (amount: number | null | undefined, locale: string = 'en-US', currency: string = 'USD', dictionary: Dictionary) => { // Add locale, currency params, and dictionary
  if (amount === null || amount === undefined) return dictionary?.common?.notAvailable || "-"; // Use dictionary for placeholder
  // TODO: Localize currency formatting based on locale
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency, // Adjust currency as needed
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString: string | null | undefined, locale: string = 'en-US', dictionary: Dictionary) => { // Add locale param and dictionary
    if (!dateString) return dictionary.common.notAvailable; // Use dictionary for placeholder
    try {
        // TODO: Localize date formatting based on locale
        return new Date(dateString).toLocaleDateString(locale);
    } catch (e) {
        return dictionary.common.invalidDate; // Use dictionary for "Invalid Date"
    }
};

// Export a function that generates the columns array
export const getStockColumns = ({ onEdit, onDelete, dictionary }: InventoryItemColumnsProps): ColumnDef<InventoryItem>[] => {
  // Since the parent component (inventory/page.tsx) now ensures the dictionary is loaded
  // before rendering the DataTable (which calls this function), we can safely assume
  // dictionary is not null here. We can remove the optional chaining (|| 'Default Text').

  // Add a check just in case, although the parent should prevent this state
  if (!dictionary) {
    console.error("getStockColumns called without a dictionary.");
    // Return empty columns or columns with default text if dictionary is missing
    return []; // Or return columns with hardcoded default text
  }

  return [
    // Optional: Select column
    // { id: "select", ... },
    {
      accessorKey: "products.name", // Access nested product name
      header: ({ column }) => {
        // Explicitly cast dictionary to Dictionary within the header function
        const loadedDictionary = dictionary as Dictionary;
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {loadedDictionary.inventory.stockColumns?.productNameHeader} {/* Use loadedDictionary */}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-medium">{row.original.products?.name ? dictionary.inventory.stockColumns?.productNameHeader : dictionary.common.notAvailable}</div>, // Use dictionary for fallback
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
      header: dictionary.inventory.stockColumns?.serialNumberHeader, // Use dictionary directly
      cell: ({ row }) => <div>{row.getValue("serial_number") || dictionary.common.notAvailable}</div>, // Use dictionary for placeholder
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-right w-full justify-end"
          >
            {dictionary.inventory.stockColumns?.quantityHeader} {/* Use dictionary directly */}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      cell: ({ row }) => <div className="text-center">{row.getValue("quantity")}</div>,
    },
    {
      accessorKey: "status",
      header: dictionary.inventory.stockColumns?.statusHeader, // Use dictionary directly
      cell: ({ row }) => {
          const status = row.getValue("status");
          let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
          if (status === 'available') variant = 'default';
          if (status === 'sold') variant = 'outline';
          if (status === 'damaged' || status === 'returned') variant = 'destructive';
          // TODO: Localize status text
          return status ? <Badge variant={variant} className="capitalize">{status as string}</Badge> : "-";
      },
      // Removed filterFn temporarily due to persistent type errors
    },
    {
      accessorKey: "location",
      header: dictionary.inventory.stockColumns?.locationHeader, // Use dictionary directly
      cell: ({ row }) => <div>{row.getValue("location") || dictionary.common.notAvailable}</div>, // Use dictionary for placeholder
    },
    {
      accessorKey: "cost_price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-right w-full justify-end"
        >
          {dictionary.inventory.stockColumns?.costPriceHeader} {/* Use dictionary directly */}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("cost_price"), 'en-US', 'USD', dictionary)}</div>, // Use localized formatCurrency and pass dictionary
    },
     {
      accessorKey: "purchase_date",
      header: ({ column }) => (
         <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {dictionary.inventory.stockColumns?.purchaseDateHeader} {/* Use dictionary directly */}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
      ),
      cell: ({ row }) => <div>{formatDate(row.getValue("purchase_date"), 'en-US', dictionary)}</div>, // Use localized formatDate and pass dictionary
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
                <span className="sr-only">{dictionary.common.openMenu}</span> {/* Use dictionary directly */}
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{dictionary.common.actions}</DropdownMenuLabel> {/* Use dictionary directly */}
              {/* Add specific inventory actions here */}
              <DropdownMenuItem onClick={() => onEdit(item)}>{dictionary.inventory.stockColumns?.editStockItem}</DropdownMenuItem> {/* Use dictionary directly */}
              {/* <DropdownMenuItem>Adjust Quantity</DropdownMenuItem> */}
              {/* <DropdownMenuItem>Change Status</DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700 focus:bg-red-100"
                onClick={() => onDelete(item.id)}
              >
                {dictionary.inventory.stockColumns?.deleteStockItem} {/* Use dictionary directly */}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
