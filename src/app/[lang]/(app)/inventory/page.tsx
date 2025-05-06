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
import { ProductViewDetailsDialog } from "./ProductViewDetailsDialog"; // Import the view dialog component
import { useDictionary } from "@/lib/i18n/dictionary-context"; // Import useDictionary hook

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
  const [isViewProductDialogOpen, setIsViewProductDialogOpen] = React.useState(false); // State for View Product dialog
  const [viewingProduct, setViewingProduct] = React.useState<Product | null>(null); // Product being viewed
  const supabase = createClient();
  const { toast } = useToast();
  const dictionary = useDictionary(); // Use the useDictionary hook at the top level

  // Function to refresh product data
  const fetchProducts = React.useCallback(async () => {
    setProductError(null);
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select(`
        id, name, description, category_id, supplier_id, brand, model, base_price, created_at, updated_at,
        product_categories ( name ), suppliers ( name )
      `)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching products:", fetchError);
      setProductError(`${dictionary?.inventory?.fetchProductsError || "Failed to load product data"}: ${fetchError.message}`); // Use optional chaining
      setProductData([]);
    } else {
      setProductData(products as any);
    }
    setIsProductLoading(false);
  }, [supabase, dictionary]); // Add dictionary to dependency array

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
        setStockError(`${dictionary?.inventory?.fetchStockError || "Failed to load stock items"}: ${fetchError.message}`); // Use optional chaining
        setStockData([]);
      } else {
        setStockData(items as any);
      }
      setIsStockLoading(false);
  }, [supabase, dictionary]); // Add dictionary to dependency array

  // Initial data fetch for both
  React.useEffect(() => {
    setIsProductLoading(true);
    setIsStockLoading(true);
    fetchProducts();
    fetchStockItems();
  }, [fetchProducts, fetchStockItems]); // Removed dictionary from dependency array

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

  // Callbacks/Handlers for Stock Items
  const handleEditStockSuccess = () => {
    setIsEditStockDialogOpen(false);
    setEditingStockItem(null);
    fetchStockItems(); // Refresh stock list
  };

  // Functions to open Product dialogs
  const openViewProductDialog = (product: Product) => {
    setViewingProduct(product);
    setIsViewProductDialogOpen(true);
  };

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
      // Note: Consider adding cascade delete or checking for related stock items first
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", deletingProductId);
      if (deleteError) throw deleteError;
      toast({ title: dictionary?.inventory?.productDeleteSuccess || "Product deleted successfully." }); // Use optional chaining
      fetchProducts();
      fetchStockItems(); // Refresh stock list too in case of cascades/relations
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: dictionary?.inventory?.productDeleteErrorTitle || "Error deleting product", // Use optional chaining
        description: error.message || dictionary?.common?.unexpectedError || "An unexpected error occurred.", // Use optional chaining
        variant: "destructive",
      });
    } finally {
      setIsDeleteProductDialogOpen(false);
      setDeletingProductId(null);
    }
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
      toast({ title: dictionary?.inventory?.stockDeleteSuccess || "Stock item deleted successfully." }); // Use optional chaining
      fetchStockItems(); // Refresh stock list
    } catch (error: any) {
      console.error("Error deleting stock item:", error);
      toast({
        title: dictionary?.inventory?.stockDeleteErrorTitle || "Error deleting stock item", // Use optional chaining
        description: error.message || dictionary?.common?.unexpectedError || "An unexpected error occurred.", // Use optional chaining
        variant: "destructive",
      });
    } finally {
      setIsDeleteStockDialogOpen(false);
      setDeletingStockItemId(null);
    }
  };

  // Generate columns for Products table
  const productColumns = React.useMemo(
    () => getColumns({ onView: openViewProductDialog, onEdit: openEditProductDialog, onDelete: openDeleteProductDialog, dictionary }), // Pass dictionary prop
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openViewProductDialog, openEditProductDialog, openDeleteProductDialog, dictionary] // Add dictionary to dependencies
  );

  // Generate columns for Stock table
  const stockColumns = React.useMemo(
    () => getStockColumns({ onEdit: openEditStockDialog, onDelete: openDeleteStockDialog, dictionary }), // Pass dictionary prop
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openEditStockDialog, openDeleteStockDialog, dictionary] // Add dictionary to dependencies
  );

  if (!dictionary) {
    return (
      <div className="flex items-center justify-center h-screen">
        {dictionary?.common?.loading || "Loading..."} {/* Use optional chaining */}
      </div>
    );
  }

  // --- Dictionary is guaranteed non-null below ---

  return (
    <Tabs defaultValue="products" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <TabsList>
          {/* Use dictionary directly */}
          <TabsTrigger value="products">{dictionary.inventory.productCatalogTab}</TabsTrigger>
          {/* Use dictionary directly */}
          <TabsTrigger value="stock">{dictionary.inventory.inventoryStockTab}</TabsTrigger>
        </TabsList>

        {/* Add Product Dialog Trigger */}
        <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> {dictionary.inventory.addProductButton} {/* Use dictionary directly */}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{dictionary.inventory.addNewProductTitle}</DialogTitle> {/* Use dictionary directly */}
              <DialogDescription>
                {dictionary.inventory.addNewProductDescription} {/* Use dictionary directly */}
              </DialogDescription>
            </DialogHeader>
            {/* Pass initialData as null or undefined for adding */}
            <ProductForm onSuccess={handleAddProductSuccess} initialData={null} dictionary={dictionary} /> {/* Pass dictionary */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Catalog Tab */}
      <TabsContent value="products" className="mt-0">
        {isProductLoading ? (
          <div className="border shadow-sm rounded-lg p-4 text-center text-muted-foreground">
            {dictionary.inventory.loadingProducts} {/* Use dictionary directly */}
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
            filterPlaceholder={dictionary.inventory.filterProductsPlaceholder}
          />
        )}
      </TabsContent>

      {/* Inventory Stock Tab */}
      <TabsContent value="stock" className="mt-0 flex flex-col gap-4">
         <div className="flex items-center justify-end">
            <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> {dictionary.inventory.addStockItemButton} {/* Use dictionary directly */}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{dictionary.inventory.addNewStockItemTitle}</DialogTitle> {/* Use dictionary directly */}
                  <DialogDescription>
                    {dictionary.inventory.addNewStockItemDescription} {/* Use dictionary directly */}
                  </DialogDescription>
                </DialogHeader>
                 {/* Pass initialData as null or undefined for adding */}
                <StockItemForm onSuccess={handleAddStockSuccess} initialData={null} dictionary={dictionary} /> {/* Pass dictionary */}
              </DialogContent>
            </Dialog>
         </div>

         {isStockLoading ? (
          <div className="border shadow-sm rounded-lg p-4 text-center text-muted-foreground">
            {dictionary.inventory.loadingStockItems} {/* Use dictionary directly */}
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
          filterPlaceholder={dictionary.inventory.filterStockPlaceholder}
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
            <DialogTitle>{dictionary.inventory.editProductTitle}</DialogTitle> {/* Use dictionary directly */}
            <DialogDescription>
              {dictionary.inventory.editProductDescription} {/* Use dictionary directly */}
            </DialogDescription>
          </DialogHeader>
          <ProductForm initialData={editingProduct} onSuccess={handleEditProductSuccess} dictionary={dictionary} /> {/* Pass dictionary */}
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={isDeleteProductDialogOpen} onOpenChange={setIsDeleteProductDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.inventory.deleteProductConfirmTitle}</AlertDialogTitle> {/* Use dictionary directly */}
            <AlertDialogDescription>
              {dictionary.inventory.deleteProductConfirmDescription} {/* Use dictionary directly */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingProductId(null)}>{dictionary.common.cancel}</AlertDialogCancel> {/* Use dictionary directly */}
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {dictionary.inventory.deleteProductButton} {/* Use dictionary directly */}
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
            <DialogTitle>{dictionary.inventory.editStockItemTitle}</DialogTitle> {/* Use dictionary directly */}
            <DialogDescription>
              {dictionary.inventory.editStockItemDescription} {/* Use dictionary directly */}
            </DialogDescription>
          </DialogHeader>
          {/* Pass initialData for editing */}
          <StockItemForm onSuccess={handleEditStockSuccess} initialData={editingStockItem} dictionary={dictionary} /> {/* Pass dictionary */}
        </DialogContent>
      </Dialog>

      {/* Delete Stock Item Confirmation Dialog */}
      {/* <<< FIXED: Corrected onOpenChange handler */}
      <AlertDialog open={isDeleteStockDialogOpen} onOpenChange={setIsDeleteStockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.inventory.deleteStockItemConfirmTitle}</AlertDialogTitle> {/* Use dictionary directly */}
            <AlertDialogDescription>
              {dictionary.inventory.deleteStockItemConfirmDescription} {/* Corrected typo and Use dictionary directly */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingStockItemId(null)}>{dictionary.common.cancel}</AlertDialogCancel> {/* Use dictionary directly */}
            <AlertDialogAction onClick={confirmDeleteStockItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {dictionary.inventory.deleteStockItemButton} {/* Use dictionary directly */}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Product Details Dialog */}
      <ProductViewDetailsDialog
        open={isViewProductDialogOpen}
        onOpenChange={setIsViewProductDialogOpen}
        product={viewingProduct}
        dictionary={dictionary} // Pass dictionary
      />
    </Tabs>
  );
}
