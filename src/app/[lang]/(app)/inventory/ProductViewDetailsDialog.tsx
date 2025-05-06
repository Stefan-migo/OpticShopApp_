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
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface
import { useDictionary } from '@/lib/i18n/dictionary-context'; // Import useDictionary hook

interface ProductViewDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null; // Product data to display
}

export function ProductViewDetailsDialog({ open, onOpenChange, product }: ProductViewDetailsDialogProps) {
  const dictionary = useDictionary(); // Get dictionary from context

  if (!product) {
    return null; // Don't render if no product is provided
  }

  // TODO: Localize currency and date formatting
  const formatCurrency = (amount: number | null | undefined) => { // Removed dictionary param
    if (amount === null || amount === undefined) return dictionary.common.notAvailable; // Use dictionary for placeholder
    // TODO: Use dictionary for locale and currency
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD", // Adjust currency as needed
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => { // Removed dictionary param
      if (!dateString) return dictionary.common.notAvailable; // Use dictionary directly
      try {
          // TODO: Use dictionary for format string and locale
          return format(new Date(dateString), 'PPP');
      } catch (e) {
          return dictionary.common.invalidDate; // Use dictionary directly
      }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dictionary.inventory.productDetailsDialog.title}</DialogTitle> {/* Use dictionary directly */}
          <DialogDescription>
            {dictionary.inventory.productDetailsDialog.description} {/* Use dictionary directly */}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p><strong>{dictionary.inventory.productDetailsDialog.nameLabel}:</strong> {product.name}</p> {/* Use dictionary directly */}
          {product.description && <p><strong>{dictionary.inventory.productDetailsDialog.descriptionLabel}:</strong> {product.description}</p>} {/* Use dictionary directly */}
          <p><strong>{dictionary.inventory.productDetailsDialog.categoryLabel}:</strong> {product.product_categories?.name || dictionary.common.notAvailable}</p> {/* Use dictionary directly */}
          <p><strong>{dictionary.inventory.productDetailsDialog.supplierLabel}:</strong> {product.suppliers?.name || dictionary.common.notAvailable}</p> {/* Use dictionary directly */}
          {product.brand && <p><strong>{dictionary.inventory.productDetailsDialog.brandLabel}:</strong> {product.brand}</p>} {/* Use dictionary directly */}
          {product.model && <p><strong>{dictionary.inventory.productDetailsDialog.modelLabel}:</strong> {product.model}</p>} {/* Use dictionary directly */}
          <p><strong>{dictionary.inventory.productDetailsDialog.basePriceLabel}:</strong> {formatCurrency(product.base_price || 0)}</p> {/* Use dictionary directly and localized format */}
          {product.reorder_level !== null && product.reorder_level !== undefined && (
            <p><strong>{dictionary.inventory.productDetailsDialog.reorderLevelLabel}:</strong> {product.reorder_level}</p> /* Use dictionary directly */
          )}
          <p><strong>{dictionary.inventory.productDetailsDialog.createdAtLabel}:</strong> {formatDate(product.created_at)}</p> 
          <p><strong>{dictionary.inventory.productDetailsDialog.updatedAtLabel}:</strong> {formatDate(product.updated_at)}</p> 

          {/* TODO: Potentially display related stock items here */}
          {/* <Separator />
          <h3 className="text-lg font-semibold">{dictionary.inventory.productDetailsDialog.relatedStockItemsTitle}</h3> {/* Use dictionary directly */}
          {/* <p>{dictionary.inventory.productDetailsDialog.relatedStockItemsDescription}</p> {/* Use dictionary directly */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
