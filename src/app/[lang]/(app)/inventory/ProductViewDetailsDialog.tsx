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
import { createClient } from "@/lib/supabase/client"; // Import client-side Supabase client
import { DataTable } from "@/components/ui/data-table"; // Import DataTable component
import { getStockColumns, type InventoryItem } from "./stock-columns"; // Import stock columns and type

interface ProductViewDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null; // Product data to display
  dictionary: Dictionary; // Add dictionary prop
}

export function ProductViewDetailsDialog({ open, onOpenChange, product, dictionary }: ProductViewDetailsDialogProps) {
  const [relatedStockItems, setRelatedStockItems] = React.useState<InventoryItem[]>([]);
  const [isLoadingStockItems, setIsLoadingStockItems] = React.useState(true);
  const [stockItemsError, setStockItemsError] = React.useState<string | null>(null);
  const supabase = createClient();

  React.useEffect(() => {
    if (!product?.id || !open) {
      setRelatedStockItems([]); // Clear data when dialog is closed or no product
      setIsLoadingStockItems(false);
      return;
    }

    const fetchRelatedStockItems = async () => {
      setIsLoadingStockItems(true);
      setStockItemsError(null);
      try {
        const { data, error } = await supabase
          .from("inventory_items")
          .select(`
            id, product_id, serial_number, location, quantity, cost_price, purchase_date, status, created_at,
            products ( name, brand, model )
          `) // Select necessary fields, including joined product data
          .eq("product_id", product.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Format the created_at date strings for stock items on the client
        const formattedStockData = data?.map(item => {
          const date = new Date(item.created_at); // Potential typo here? Should be item.created_at
          const month = (date.getMonth() + 1).toString().padStart(2, '0'); // MM
          const day = date.getDate().toString().padStart(2, '0'); // DD
          const year = date.getFullYear(); // YYYY
          return {
            ...item,
            created_at: `${month}/${day}/${year}`, // MM/DD/YYYY format
          };
        }) as any[] | []; // Type assertion

        setRelatedStockItems(formattedStockData);
      } catch (error: any) {
        console.error("Error fetching related stock items:", error);
        setStockItemsError(error.message || dictionary.common.failedToLoadData);
        setRelatedStockItems([]);
      } finally {
        setIsLoadingStockItems(false);
      }
    };

    fetchRelatedStockItems();
  }, [product?.id, open, supabase, dictionary]); // Dependencies: product ID, dialog open state, supabase, dictionary

  // Generate columns for Stock table (reusing the definition)
  const stockColumns = React.useMemo(
    () => getStockColumns({ onEdit: () => {}, onDelete: () => {}, dictionary }), // Pass dummy functions for actions not needed in view
    [dictionary] // Dependency: dictionary
  );


  if (!product) {
    return null; // Don't render if no product is provided
  }

  // TODO: Localize currency and date formatting
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return dictionary.common.notAvailable;
    // TODO: Use dictionary for locale and currency
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD", // Adjust currency as needed
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
      if (!dateString) return (dictionary.common.notAvailable)
      try {
          // TODO: Use dictionary for format string and locale
          return format(new Date(dateString), 'PPP');
      } catch (e) {
          return dictionary.common.invalidDate;
      }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dictionary.inventory.productDetailsDialog.title}</DialogTitle>
          <DialogDescription>
            {dictionary.inventory.productDetailsDialog.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 ">
          <p><strong className="text-muted-foreground">{dictionary.inventory.productDetailsDialog.nameLabel}:</strong> {product.name}</p>
          {product.description && <p><strong className="text-muted-foreground">{dictionary.inventory.productDetailsDialog.descriptionLabel}:</strong> {product.description}</p>}
          <p><strong className="text-muted-foreground">{dictionary.inventory.productDetailsDialog.categoryLabel}:</strong> {product.product_categories?.name || dictionary.common.notAvailable}</p>
          <p><strong className="text-muted-foreground">{dictionary.inventory.productDetailsDialog.supplierLabel}:</strong> {product.suppliers?.name || dictionary.common.notAvailable}</p>
          {product.brand && <p><strong className="text-muted-foreground">{dictionary.inventory.productDetailsDialog.brandLabel}:</strong> {product.brand}</p>}
          {product.model && <p><strong className="text-muted-foreground">{dictionary.inventory.productDetailsDialog.modelLabel}:</strong> {product.model}</p>}
          <p><strong className="text-muted-foreground">{dictionary.inventory.productDetailsDialog.basePriceLabel}:</strong> {formatCurrency(product.base_price || 0)}</p>
          {product.reorder_level !== null && product.reorder_level !== undefined && (
            <p><strong className="text-muted-foreground">{dictionary.inventory.productDetailsDialog.reorderLevelLabel}:</strong> {product.reorder_level}</p>
          )}
          <p><strong className="text-muted-foreground">{dictionary.inventory.productDetailsDialog.createdAtLabel}:</strong> {formatDate(product.created_at)}</p>
          <p><strong className="text-muted-foreground">{dictionary.inventory.productDetailsDialog.updatedAtLabel}:</strong> {formatDate(product.updated_at)}</p>
          {/* Display related stock items here */}
          <Separator />
          <h3 className="text-lg font-semibold text-muted-foreground">{dictionary.inventory.productDetailsDialog.relatedStockItemsTitle}</h3>
          {isLoadingStockItems ? (
            <p className="text-muted-foreground">{dictionary.common.loading}</p>
          ) : stockItemsError ? (
            <p className="text-destructive">{stockItemsError}</p>
          ) : relatedStockItems.length > 0 ? (
            <div className="space-y-2"> {/* Add some spacing between stock items */}
              {relatedStockItems.map(item => (
                <div key={item.id} className="border border-border p-2 rounded-md"> {/* Add a border and padding for clarity */}
                  <p><strong className="text-muted-foreground">{dictionary.inventory.stockItemForm.quantityLabel}:</strong> {item.quantity}</p> {/* Assuming dictionary has this key */}
                  <p><strong className="text-muted-foreground">{dictionary.inventory.stockItemForm.statusLabel}:</strong> {item.status}</p> {/* Assuming dictionary has this key */}
                  <p><strong className="text-muted-foreground">{dictionary.inventory.stockItemForm.locationLabel}:</strong> {item.location}</p> {/* Assuming dictionary has this key */}
                  <p><strong className="text-muted-foreground">{dictionary.inventory.stockItemForm.costPriceLabel}:</strong> {formatCurrency(item.cost_price)}</p> {/* Reuse formatCurrency */}
                </div>
              ))}
            </div>
          ) : (
            <p>{dictionary.inventory.productDetailsDialog.relatedStockItemsDescription}</p> /* Reuse description as no data message */
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
