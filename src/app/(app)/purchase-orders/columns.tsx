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
  onEdit: (purchaseOrder: PurchaseOrder) => void;
  onDelete: (purchaseOrderId: string) => void;
}

// Export a function that generates the columns array
export const getColumns = ({ onEdit, onDelete }: PurchaseOrderColumnsProps): ColumnDef<PurchaseOrder>[] => [
  {
    accessorKey: "order_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Order Date
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
    header: "Supplier",
     cell: ({ row }) => {
      const supplierName = row.original.suppliers?.name;
      return supplierName ? <div>{supplierName}</div> : <span className="text-muted-foreground">N/A</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
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
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
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
        Total Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount") || "0");
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
          Created At
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
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {/* Add specific purchase order actions here */}
            <DropdownMenuItem onClick={() => onEdit(purchaseOrder)}>Edit Purchase Order</DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem> {/* TODO: Implement view details page/dialog */}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700 focus:bg-red-100"
              onClick={() => onDelete(purchaseOrder.id)}
            >
              Delete Purchase Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
