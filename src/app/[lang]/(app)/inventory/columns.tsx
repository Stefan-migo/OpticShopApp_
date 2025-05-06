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
import { Badge } from "@/components/ui/badge"; // For category display

// Define the shape of our product data (adjust based on actual schema/fetch)
// We might need to join with categories/suppliers later for display names
export type Product = {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null; // Will need category name via join later
  supplier_id: string | null; // Will need supplier name via join later
  brand: string | null;
  model: string | null;
  base_price: number;
  reorder_level: number | null; // Add reorder_level
  created_at: string;
  updated_at: string; // Add updated_at
  // Add related data placeholders if joining
  product_categories?: { name: string } | null;
  suppliers?: { name: string } | null;
};

// Define props for the columns function
interface ProductColumnsProps {
  onView: (product: Product) => void; // Add onView handler
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  dictionary: any; // Add dictionary prop
}

// Export a function that generates the columns array
export const getColumns = ({ onView, onEdit, onDelete, dictionary }: ProductColumnsProps): ColumnDef<Product>[] => [
  // Optional: Select column
  // { id: "select", ... },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {dictionary.inventory.productColumns?.nameHeader || "Name"} {/* Use dictionary */}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    // Access nested category name if joined, otherwise show ID or placeholder
    accessorKey: "product_categories.name",
    header: dictionary.inventory.productColumns?.categoryHeader || "Category", // Use dictionary
    cell: ({ row }) => {
      const categoryName = row.original.product_categories?.name;
      return categoryName ? <Badge variant="outline">{categoryName}</Badge> : <span className="text-muted-foreground">{dictionary.common.notAvailable || "N/A"}</span>; // Use dictionary
    },
    filterFn: (row, id, value) => { // Custom filter for nested object
        return value.includes(row.original.product_categories?.name)
    },
  },
  {
    accessorKey: "brand",
    header: dictionary.inventory.productColumns?.brandHeader || "Brand", // Use dictionary
    cell: ({ row }) => <div>{row.getValue("brand") || "-"}</div>,
  },
  {
    accessorKey: "base_price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-right w-full justify-end" // Align right
      >
        {dictionary.inventory.productColumns?.priceHeader || "Price"} {/* Use dictionary */}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("base_price"));
      // TODO: Localize currency formatting
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD", // Adjust currency as needed
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
   {
    accessorKey: "created_at",
    header: ({ column }) => (
       <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {dictionary.inventory.productColumns?.createdAtHeader || "Created At"} {/* Use dictionary */}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      // TODO: Localize date formatting
      const formatted = date.toLocaleDateString(); // Basic formatting
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{dictionary.common.openMenu || "Open menu"}</span> {/* Use dictionary */}
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{dictionary.common.actions || "Actions"}</DropdownMenuLabel> {/* Use dictionary */}
            {/* Add specific product actions here */}
            <DropdownMenuItem onClick={() => onEdit(product)}>{dictionary.inventory.productColumns?.editProduct || "Edit Product"}</DropdownMenuItem> {/* Use dictionary */}
            <DropdownMenuItem onClick={() => onView(product)}>{dictionary.inventory.productColumns?.viewDetails || "View Details"}</DropdownMenuItem> {/* Use dictionary, Call onView handler */}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700 focus:bg-red-100"
              onClick={() => onDelete(product.id)}
            >
              {dictionary.inventory.productColumns?.deleteProduct || "Delete Product"} {/* Use dictionary */}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
