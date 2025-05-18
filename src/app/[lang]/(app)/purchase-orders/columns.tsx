"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Define the shape of a purchase order item
export type PurchaseOrderItem = {
  id: string;
  purchase_order_id: string;
  product_id: string; // Will need product name via join later
  quantity_ordered: number;
  unit_price: number;
  line_total: number;
  created_at: string;
  updated_at: string;
  // Add related data placeholders if joining
  products?: { name: string } | null;
};


// Define the shape of a purchase order
export type PurchaseOrder = {
  id: string;
  supplier_id: string | null; // Will need supplier name via join later
  order_date: string;
  expected_delivery_date: string | null;
  status: string;
  total_amount: number | null;
  created_at: string;
  updated_at: string;
  // Include nested items
  purchase_order_items: PurchaseOrderItem[];
   // Add related data placeholders if joining
  suppliers?: { name: string } | null;
};

// Define props for the columns function
interface PurchaseOrderColumnsProps {
  onView: (purchaseOrderId: string) => void; // Add onView handler
  onEdit: (purchaseOrder: PurchaseOrder) => void;
  onDelete: (purchaseOrderId: string) => void;
}

import { type Dictionary } from '@/lib/i18n/types'; // Import Dictionary type

// Export a function that generates the columns array and accepts the dictionary
export const getColumns = ({ onView, onEdit, onDelete, dictionary }: PurchaseOrderColumnsProps & { dictionary: Dictionary | null }): ColumnDef<PurchaseOrder>[] => { // Allow dictionary to be null

  // Add a check at the beginning of the function
  if (!dictionary) {
    // Return empty columns or a placeholder if dictionary is not loaded
    console.warn("Dictionary not loaded in getColumns, returning empty columns.");
    return []; // Return an empty array of columns
  }

  return [
  {
    accessorKey: "order_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {dictionary.purchaseOrders?.tableColumns?.orderDateHeader} {/* Translated header */}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("order_date"));
      const formatted = date.toLocaleDateString();
      return <div className="font-medium">{formatted}</div>;
    },
  },
   {
    // Access nested supplier name if joined, otherwise show ID or placeholder
    accessorKey: "suppliers.name",
    header: dictionary.purchaseOrders?.tableColumns?.supplierHeader,
     cell: ({ row }) => {
      const supplierName = row.original.suppliers?.name;
      return supplierName ? <div>{supplierName}</div> : <span className="text-muted-foreground">N/A</span>;
    },
  },
  {
    accessorKey: "status",
    header: dictionary.purchaseOrders?.tableColumns?.statusHeader,
    cell: ({ row }) => {
      const status: string = row.getValue("status");
      // Basic badge styling based on status - can be enhanced
      const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
          case 'received':
            return 'default'; // Or a success variant if available
          case 'cancelled':
            return 'destructive';
          case 'ordered':
            return 'secondary'; // Or a warning variant
          case 'draft':
          default:
            return 'outline';
        }
      };
      // Translate status text in badge
      const translatedStatus = dictionary.purchaseOrders?.form?.statusOptions?.[status.toLowerCase() as keyof typeof dictionary.purchaseOrders.form.statusOptions] || status;
      return <Badge variant={getStatusVariant(status)}>{translatedStatus}</Badge>;
    },
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-right w-full justify-end" // Align right
      >
        {dictionary.purchaseOrders?.tableColumns?.totalAmountHeader}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount") || "0");
      const formatted = new Intl.NumberFormat("en-US", { // Currency format might need localization later
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
          {dictionary.purchaseOrders?.tableColumns?.createdAtHeader}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      const formatted = date.toLocaleDateString();
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const purchaseOrder = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{dictionary.common?.openMenu}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{dictionary.common?.actions}</DropdownMenuLabel>
            {/* Add specific purchase order actions here */}
            <DropdownMenuItem onClick={() => onEdit(purchaseOrder)}>{dictionary.purchaseOrders?.tableActions?.editPurchaseOrder}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onView(purchaseOrder.id)}>{dictionary.purchaseOrders?.tableActions?.viewDetails}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700 focus:bg-red-100"
              onClick={() => onDelete(purchaseOrder.id)}
            >
              {dictionary.purchaseOrders?.tableActions?.deletePurchaseOrder}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
};
