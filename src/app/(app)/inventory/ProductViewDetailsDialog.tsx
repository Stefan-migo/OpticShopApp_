"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { type Product } from "./columns"; // Import Product type
import { Separator } from "@/components/ui/separator"; // Assuming Separator component exists
import { format } from "date-fns"; // For date formatting

interface ProductViewDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null; // Product data to display
}

export function ProductViewDetailsDialog({ open, onOpenChange, product }: ProductViewDetailsDialogProps) {
  if (!product) {
    return null; // Don't render if no product is provided
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            Details for the selected product.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p><strong>Name:</strong> {product.name}</p>
          {product.description && <p><strong>Description:</strong> {product.description}</p>}
          <p><strong>Category:</strong> {product.product_categories?.name || 'N/A'}</p> {/* Display category name */}
          <p><strong>Supplier:</strong> {product.suppliers?.name || 'N/A'}</p> {/* Display supplier name */}
          {product.brand && <p><strong>Brand:</strong> {product.brand}</p>}
          {product.model && <p><strong>Model:</strong> {product.model}</p>}
          <p><strong>Base Price:</strong> {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.base_price || 0)}</p>
          {product.reorder_level !== null && product.reorder_level !== undefined && (
            <p><strong>Reorder Level:</strong> {product.reorder_level}</p>
          )}
          <p><strong>Created At:</strong> {format(new Date(product.created_at), 'PPP')}</p>
          <p><strong>Updated At:</strong> {format(new Date(product.updated_at), 'PPP')}</p>

          {/* TODO: Potentially display related stock items here */}
          {/* <Separator />
          <h3 className="text-lg font-semibold">Related Stock Items</h3>
          <p>Stock item details would go here...</p> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
