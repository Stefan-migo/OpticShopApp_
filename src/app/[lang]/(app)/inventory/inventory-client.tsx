"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getColumns, type Product } from "./columns"; // Import product columns and type
import { DataTable } from "@/components/ui/data-table";
import { createClient } from "@/lib/supabase/client"; // Use client-side Supabase client
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
import { type Dictionary } from "@/lib/i18n/types"; // Import Dictionary type
import { Locale } from "@/lib/i18n/config"; // Import Locale type
import { useSearchParams } from 'next/navigation'; // Import useSearchParams

// Client Component to handle UI interactions (dialogs, forms, delete)
interface InventoryPageClientProps {
  dictionary: Dictionary;
  lang: Locale;
  isSuperuser: boolean; // Add isSuperuser prop
}

function InventoryPageClient({ dictionary, lang, isSuperuser }: InventoryPageClientProps) {
  const [productData, setProductData] = React.useState<Product[]>([]); // Initialize state as empty array
  const [stockData, setStockData] = React.useState<InventoryItem[]>([]); // Initialize state as empty array
  const [loading, setLoading] = React.useState(true); // Add loading state
  const [error, setError] = React.useState<string | null>(null); // Add error state
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
  const supabase = createClient(); // Use client-side Supabase client for client-side mutations
  const { toast } = useToast();
  const searchParams = useSearchParams(); // Get search parameters
  const tenantId = searchParams.get('tenantId'); // Get tenantId from search parameters

  // Function to fetch data client-side
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // Fetch products
    let productsQuery = supabase
      .from("products")
      .select(`
        id, name, description, category_id, supplier_id, brand, model, base_price, created_at, updated_at,
        product_categories ( name ), suppliers ( name )
      `);

    // Apply tenant filter to products if user is superuser AND tenantId search parameter is present
    if (isSuperuser && tenantId) {
      productsQuery = productsQuery.eq('tenant_id', tenantId);
    }

    const { data: products, error: productsFetchError } = await productsQuery
      .order("created_at", { ascending: false });

    if (productsFetchError) {
      console.error("Error fetching products:", productsFetchError);
      setError(productsFetchError.message);
      setProductData([]); // Clear data on error
    } else {
      // Format the created_at date strings for products on the client
      const formattedProductData = products?.map(product => {
        const date = new Date(product.created_at);
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // MM
        const day = date.getDate().toString().padStart(2, '0'); // DD
        const year = date.getFullYear(); // YYYY
        return {
          ...product,
          created_at: `${month}/${day}/${year}`, // MM/DD/YYYY format
        };
      }) as any[] | []; // Type assertion
      setProductData(formattedProductData);
    }

    // Fetch stock items
    let stockItemsQuery = supabase
      .from("inventory_items")
      .select(`
        id, product_id, serial_number, location, quantity, cost_price, purchase_date, status, created_at,
        products ( name, brand, model )
      `);

    // Apply tenant filter to stock items if user is superuser AND tenantId search parameter is present
    if (isSuperuser && tenantId) {
      stockItemsQuery = stockItemsQuery.eq('tenant_id', tenantId);
    }

    const { data: stockItems, error: stockItemsFetchError } = await stockItemsQuery
      .order("created_at", { ascending: false });

    if (stockItemsFetchError) {
      console.error("Error fetching stock items:", stockItemsFetchError);
      // If product fetch was successful, only set stock error, otherwise overall error
      if (!productsFetchError) {
         setError(stockItemsFetchError.message);
      }
      setStockData([]); // Clear data on error
    } else {
      // Format the created_at date strings for stock items on the client
      const formattedStockData = stockItems?.map(item => {
        const date = new Date(item.created_at);
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // MM
        const day = date.getDate().toString().padStart(2, '0'); // DD
        const year = date.getFullYear(); // YYYY
        return {
          ...item,
          created_at: `${month}/${day}/${year}`, // MM/DD/YYYY format
        };
      }) as any[] | []; // Type assertion
      setStockData(formattedStockData);
    }

    setLoading(false);
  };

  // Effect to fetch data when tenantId or isSuperuser changes
  React.useEffect(() => {
    fetchData();
  }, [tenantId, isSuperuser]); // Dependencies: tenantId and isSuperuser

  // Function to refresh data after mutations (now calls client-side fetch)
  const refreshData = async () => {
    fetchData(); // Re-run client-side fetch
  };

  // Callbacks for form success
  const handleAddProductSuccess = () => {
    setIsAddProductDialogOpen(false);
    refreshData(); // Trigger data refresh
  };

  const handleEditProductSuccess = () => {
    setIsEditProductDialogOpen(false);
    setEditingProduct(null);
    refreshData(); // Trigger data refresh
  };

   const handleAddStockSuccess = () => {
    setIsAddStockDialogOpen(false);
    refreshData(); // Refresh stock list
  };

  // Callbacks/Handlers for Stock Items
  const handleEditStockSuccess = () => {
    setIsEditStockDialogOpen(false);
    setEditingStockItem(null);
    refreshData(); // Refresh stock list
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

  // Function to perform Product deletion (should ideally be a Server Action)
  const confirmDeleteProduct = async () => {
    if (!deletingProductId) return;
    try {
      // Note: Consider adding cascade delete or checking for related stock items first
      // This delete operation should ideally be a Server Action for security
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", deletingProductId);
      if (deleteError) throw deleteError;
      toast({ title: dictionary?.inventory?.productDeleteSuccess || "Product deleted successfully." });
      refreshData(); // Refresh data
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: dictionary?.inventory?.productDeleteErrorTitle || "Error deleting product",
        description: error.message || dictionary?.common?.unexpectedError || "An unexpected error occurred.",
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
      // This delete operation should ideally be a Server Action for security
      const { error: deleteError } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", deletingStockItemId);
      if (deleteError) throw deleteError;
      toast({ title: dictionary?.inventory?.stockDeleteSuccess || "Stock item deleted successfully." });
      refreshData(); // Refresh data
    } catch (error: any) {
      console.error("Error deleting stock item:", error);
      toast({
        title: dictionary?.inventory?.stockDeleteErrorTitle || "Error deleting stock item",
        description: error.message || dictionary?.common?.unexpectedError || "An unexpected error occurred.",
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
    [openViewProductDialog, openEditProductDialog, openDeleteProductDialog, dictionary] // Add dictionary to dependencies
  );

  // Generate columns for Stock table
  const stockColumns = React.useMemo(
    () => getStockColumns({ onEdit: openEditStockDialog, onDelete: openDeleteStockDialog, dictionary }), // Pass dictionary prop
    [openEditStockDialog, openDeleteStockDialog, dictionary] // Add dictionary to dependencies
  );

  // Dictionary is guaranteed non-null from parent Server Component

  if (loading) {
    return <div>Loading inventory...</div>; // Loading indicator
  }

  if (error) {
    return <div>Error: {error}</div>; // Error message
  }


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
        {/* No loading/error state here, handled by Server Component */}
          <DataTable
            columns={productColumns}
            data={productData} // Use state data initialized with initialProductData
            filterColumnKey="name"
            filterPlaceholder={dictionary.inventory.filterProductsPlaceholder}
          />
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

         {/* No loading/error state here, handled by Server Component */}
        <DataTable
          columns={stockColumns}
          data={stockData} // Use state data initialized with initialStockData
          filterColumnKey="serial_number" // Filter by serial number
          filterPlaceholder={dictionary.inventory.filterStockPlaceholder}
        />
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

export default InventoryPageClient;
