"use client"; // Needs to be client component for hooks and actions

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getColumns, type Product } from "./columns"; // Import product columns and type
import { DataTable } from "@/components/ui/data-table";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductForm } from "./product-form";
import { StockItemForm } from "./stock-item-form"; // Import StockItemForm component
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStockColumns, type InventoryItem } from "./stock-columns"; // Import stock columns and type

export default function InventoryPage() {
  const [productData, setProductData] = React.useState<Product[]>([]);
  const [stockData, setStockData] = React.useState<InventoryItem[]>([]);
  const [isProductLoading, setIsProductLoading] = React.useState(true);
  const [isStockLoading, setIsStockLoading] = React.useState(true);
  const [productError, setProductError] = React.useState<string | null>(null);
  const [stockError, setStockError] = React.useState<string | null>(null);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = React.useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = React.useState(false);
  const [deletingProductId, setDeletingProductId] = React.useState<string | null>(null);
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = React.useState(false);
  const [isEditStockDialogOpen, setIsEditStockDialogOpen] = React.useState(false); // State for Edit Stock dialog
  const [editingStockItem, setEditingStockItem] = React.useState<InventoryItem | null>(null); // Stock item being edited
  const [isDeleteStockDialogOpen, setIsDeleteStockDialogOpen] = React.useState(false); // State for Delete Stock dialog
  const [deletingStockItemId, setDeletingStockItemId] = React.useState<string | null>(null); // Stock item ID to delete
  const supabase = createClient();
  const { toast } = useToast();

  // Function to refresh product data
  const fetchProducts = React.useCallback(async () => {
    setProductError(null);
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select(`
        id, name, description, category_id, supplier_id, brand, model, base_price, created_at,
        product_categories ( name ), suppliers ( name )
      `)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching products:", fetchError);
      setProductError(`Failed to load product data: ${fetchError.message}`);
      setProductData([]);
    } else {
      setProductData(products as any);
    }
    setIsProductLoading(false);
  }, [supabase]);

  // Function to refresh stock data
  const fetchStockItems = React.useCallback(async () => {
    setStockError(null);
    const { data: items, error: fetchError } = await supabase
      .from("inventory_items")
      .select(`
        id, product_id, serial_number, location, quantity, cost_price, purchase_date, status, created_at,
        products ( name, brand, model )
      `)
      .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching stock items:", fetchError);
        setStockError(`Failed to load stock data: ${fetchError.message}`);
        setStockData([]);
      } else {
        setStockData(items as any);
      }
      setIsStockLoading(false);
  }, [supabase]);

  // Initial data fetch for both
  React.useEffect(() => {
    setIsProductLoading(true);
    setIsStockLoading(true);
    fetchProducts();
    fetchStockItems();
  }, [fetchProducts, fetchStockItems]);

  // Callbacks for form success
  const handleAddProductSuccess = () => {
    setIsAddProductDialogOpen(false);
    fetchProducts();
  };

  const handleEditProductSuccess = () => {
    setIsEditProductDialogOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

   const handleAddStockSuccess = () => {
    setIsAddStockDialogOpen(false);
    fetchStockItems(); // Refresh stock list
  };

  // TODO: Implement handleEditStockSuccess

  // Functions to open Product dialogs
  const openEditProductDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditProductDialogOpen(true);
  };

  const openDeleteProductDialog = (productId: string) => {
    setDeletingProductId(productId);
    setIsDeleteProductDialogOpen(true);
  };

  // Function to perform Product deletion
  const confirmDeleteProduct = async () => {
    if (!deletingProductId) return;
    try {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", deletingProductId);
      if (deleteError) throw deleteError;
      toast({ title: "Product deleted successfully." });
      fetchProducts();
      fetchStockItems(); // Refresh stock list too
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error deleting product",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteProductDialogOpen(false);
      setDeletingProductId(null);
    }
  };

  // Callbacks/Handlers for Stock Items
  const handleEditStockSuccess = () => {
    setIsEditStockDialogOpen(false);
    setEditingStockItem(null);
    fetchStockItems(); // Refresh stock list
  };

  const openEditStockDialog = (item: InventoryItem) => {
    setEditingStockItem(item);
    setIsEditStockDialogOpen(true);
  };

  const openDeleteStockDialog = (itemId: string) => {
    setDeletingStockItemId(itemId);
    setIsDeleteStockDialogOpen(true);
  };

  const confirmDeleteStockItem = async () => {
    if (!deletingStockItemId) return;
    try {
      const { error: deleteError } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", deletingStockItemId);
      if (deleteError) throw deleteError;
      toast({ title: "Stock item deleted successfully." });
      fetchStockItems(); // Refresh stock list
    } catch (error: any) {
      console.error("Error deleting stock item:", error);
      toast({
        title: "Error deleting stock item",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteStockDialogOpen(false);
      setDeletingStockItemId(null);
    }
  };

  // Generate columns for Products table
  const productColumns = React.useMemo(
    () => getColumns({ onEdit: openEditProductDialog, onDelete: openDeleteProductDialog }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Generate columns for Stock table
  const stockColumns = React.useMemo(
    () => getStockColumns({ onEdit: openEditStockDialog, onDelete: openDeleteStockDialog }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // Handlers don't change often, empty deps ok for now
  );

  return (
    <Tabs defaultValue="products" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="products">Product Catalog</TabsTrigger>
          <TabsTrigger value="stock">Inventory Stock</TabsTrigger>
        </TabsList>

        {/* Add Product Dialog Trigger */}
        <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Enter the details for the new product catalog item.
              </DialogDescription>
            </DialogHeader>
            <ProductForm onSuccess={handleAddProductSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Catalog Tab */}
      <TabsContent value="products" className="mt-0">
        {isProductLoading ? (
          <div className="border shadow-sm rounded-lg p-4 text-center text-muted-foreground">
            Loading products...
          </div>
        ) : productError ? (
          <div className="border shadow-sm rounded-lg p-4 text-center text-red-600">
            {productError}
          </div>
        ) : (
          <DataTable
            columns={productColumns}
            data={productData}
            filterColumnKey="name"
            filterPlaceholder="Filter products by name..."
          />
        )}
      </TabsContent>

      {/* Inventory Stock Tab */}
      <TabsContent value="stock" className="mt-0 flex flex-col gap-4">
         <div className="flex items-center justify-end">
            <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Stock Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Stock Item</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new inventory item.
                  </DialogDescription>
                </DialogHeader>
                <StockItemForm onSuccess={handleAddStockSuccess} />
              </DialogContent>
            </Dialog>
         </div>

         {isStockLoading ? (
          <div className="border shadow-sm rounded-lg p-4 text-center text-muted-foreground">
            Loading stock items...
          </div>
        ) : stockError ? (
          <div className="border shadow-sm rounded-lg p-4 text-center text-red-600">
            {stockError}
          </div>
        ) : (
        <DataTable
          columns={stockColumns}
          data={stockData}
          filterColumnKey="serial_number" // Filter by serial number
          filterPlaceholder="Filter by serial number..."
        />
        )}
      </TabsContent>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductDialogOpen} onOpenChange={(open) => {
        setIsEditProductDialogOpen(open);
        if (!open) setEditingProduct(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product's details. Click save when done.
            </DialogDescription>
          </DialogHeader>
          <ProductForm initialData={editingProduct} onSuccess={handleEditProductSuccess} />
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={isDeleteProductDialogOpen} onOpenChange={setIsDeleteProductDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and potentially associated inventory items (depending on DB constraints).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingProductId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Stock Item Dialog */}
      <Dialog open={isEditStockDialogOpen} onOpenChange={(open) => {
        setIsEditStockDialogOpen(open);
        if (!open) setEditingStockItem(null); // Clear state when closing
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Stock Item</DialogTitle>
            <DialogDescription>
              Update the stock item details. Click save when done.
            </DialogDescription>
          </DialogHeader>
          {/* Pass initialData for editing */}
          <StockItemForm initialData={editingStockItem} onSuccess={handleEditStockSuccess} />
        </DialogContent>
      </Dialog>

      {/* Delete Stock Item Confirmation Dialog */}
      <AlertDialog open={isDeleteStockDialogOpen} onOpenChange={setIsDeleteStockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              stock item record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingStockItemId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStockItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Stock Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  );
}
