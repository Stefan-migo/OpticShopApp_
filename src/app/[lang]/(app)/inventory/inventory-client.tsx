"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal } from "lucide-react"; // Import MoreHorizontal
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
import { ProductForm, type ProductFormRef } from "./product-form"; // Import ProductForm and ProductFormRef
import { StockItemForm } from "./stock-item-form"; // Import StockItemForm component
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStockColumns, type InventoryItem } from "./stock-columns"; // Import stock columns and type
import { ProductViewDetailsDialog } from "./ProductViewDetailsDialog"; // Import the view dialog component
import { type Dictionary } from "@/lib/i18n/types"; // Import Dictionary type
import { Locale } from "@/lib/i18n/config"; // Import Locale type
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { SupplierManager } from "./SupplierManager"; // Import SupplierManager component
import { CategoryForm } from "./CategoryForm"; // Import CategoryForm component
import { getCategories, deleteProductCategory } from "./actions"; // Import category actions
import { type Category } from "@/lib/supabase/types/database.types"; // Import Category type
import { ColumnDef } from "@tanstack/react-table"; // Import ColumnDef
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components

// Client Component to handle UI interactions (dialogs, forms, delete)
interface InventoryPageClientProps {
  dictionary: Dictionary;
  lang: Locale;
  isSuperuser: boolean; // Add isSuperuser prop
  userTenantId: string | null; // Add userTenantId prop
}

function InventoryPageClient({ dictionary, lang, isSuperuser, userTenantId }: InventoryPageClientProps) {
  const [productData, setProductData] = React.useState<Product[]>([]); // Initialize state as empty array
  const [stockData, setStockData] = React.useState<InventoryItem[]>([]); // Initialize state as empty array
  const [categoryData, setCategoryData] = React.useState<Category[]>([]); // State for category data
  const [loading, setLoading] = React.useState(true); // Add loading state
  const [loadingCategories, setLoadingCategories] = React.useState(true); // Loading state for categories
  const [error, setError] = React.useState<string | null>(null); // Add error state
  const [categoryError, setCategoryError] = React.useState<string | null>(null); // Error state for categories
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
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = React.useState(false); // State for Edit Category dialog
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null); // Category being edited
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = React.useState(false); // State for Delete Category dialog
  const [deletingCategoryId, setDeletingCategoryId] = React.useState<string | null>(null); // Category ID to delete
  const productFormRef = React.useRef<ProductFormRef>(null); // Create a ref for ProductForm
  const supabase = createClient(); // Use client-side Supabase client for client-side mutations
  const { toast } = useToast();
  const searchParams = useSearchParams(); // Get search parameters
  const tenantId = searchParams.get('tenantId'); // Get tenantId from search parameters

  // Function to fetch products and stock items client-side
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

    // Apply tenant filter to products if user is superuser AND tenantId search parameter is present,
    // OR if user is NOT a superuser and userTenantId is available
    if (isSuperuser && tenantId) {
      productsQuery = productsQuery.eq('tenant_id', tenantId);
    } else if (!isSuperuser && userTenantId) {
      productsQuery = productsQuery.eq('tenant_id', userTenantId);
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

    // Apply tenant filter to stock items if user is superuser AND tenantId search parameter is present,
    // OR if user is NOT a superuser and userTenantId is available
    if (isSuperuser && tenantId) {
      stockItemsQuery = stockItemsQuery.eq('tenant_id', tenantId);
    } else if (!isSuperuser && userTenantId) {
      stockItemsQuery = stockItemsQuery.eq('tenant_id', userTenantId);
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

  // Function to fetch categories client-side
  const fetchCategories = async () => {
    setLoadingCategories(true);
    setCategoryError(null);

    const { data: categories, error: categoriesFetchError } = await getCategories();

    if (categoriesFetchError) {
      console.error("Error fetching categories:", categoriesFetchError);
      setCategoryError(categoriesFetchError.message);
      setCategoryData([]); // Clear data on error
    } else {
      setCategoryData(categories || []);
    }
    setLoadingCategories(false);
  };


  // Effect to fetch data when tenantId, isSuperuser, or userTenantId changes
  React.useEffect(() => {
    fetchData();
    fetchCategories(); // Fetch categories as well
  }, [tenantId, isSuperuser, userTenantId]); // Dependencies: tenantId, isSuperuser, and userTenantId

  // Function to refresh data after mutations (now calls client-side fetch)
  const refreshData = async () => {
    fetchData(); // Re-run client-side fetch
    fetchCategories(); // Re-run category fetch
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

  // Callbacks/Handlers for Categories
  const handleAddCategorySuccess = () => {
    refreshData(); // Refresh all data including categories
  };

  const handleEditCategorySuccess = () => {
    setIsEditCategoryDialogOpen(false);
    setEditingCategory(null);
    refreshData(); // Refresh all data including categories
  };

  const handleDeleteCategory = (categoryId: string) => {
    setDeletingCategoryId(categoryId);
    setIsDeleteCategoryDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategoryId) return;
    try {
      const { error: deleteError } = await deleteProductCategory(deletingCategoryId);
      if (deleteError) throw deleteError;
      toast({ title: dictionary?.inventory?.categoryForm?.deleteSuccess || "Category deleted successfully." }); // TODO: Add dictionary key
      refreshData(); // Refresh data
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast({
        title: dictionary?.inventory?.categoryForm?.deleteErrorTitle || "Error deleting category", // TODO: Add dictionary key
        description: error.message || dictionary?.common?.unexpectedError || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteCategoryDialogOpen(false);
      setDeletingCategoryId(null);
    }
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

  // Generate columns for Categories table
  const categoryColumns: ColumnDef<Category>[] = React.useMemo( // TODO: Use Category type
    () => [
      {
        accessorKey: "name",
        header: dictionary.inventory?.categoryForm?.nameLabel || "Category Name", // Use dictionary key
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const category = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{dictionary.common?.actions}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(category.id)}>
                  {dictionary.common?.copyId}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setEditingCategory(category); setIsEditCategoryDialogOpen(true); }}> {/* Open edit dialog */}
                  {dictionary.common?.edit}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteCategory(category.id)} className="text-red-500 focus:text-red-600"> {/* Open delete dialog */}
                  {dictionary.common?.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [dictionary] // Add dictionary to dependencies
  );


  // Dictionary is guaranteed non-null from parent Server Component

  if (loading || loadingCategories) { // Check both loading states
    return <div>{dictionary.common?.loading || "Loading inventory..."}</div>; // Loading indicator
  }

  if (error || categoryError) { // Check both error states
    return <div>Error: {error || categoryError}</div>; // Error message
  }


  return (
    <Tabs defaultValue="products" className="flex flex-col gap-4">
      <div className="flex items-center justify-between ">
        <TabsList>
          {/* Use dictionary directly */}
          <TabsTrigger value="products">{dictionary.inventory.productCatalogTab}</TabsTrigger>
          {/* Use dictionary directly */}
          <TabsTrigger value="stock">{dictionary.inventory.inventoryStockTab}</TabsTrigger>
          {/* Add Suppliers Tab Trigger */}
          <TabsTrigger value="suppliers">{dictionary.inventory.suppliersTabTitle}</TabsTrigger>
          {/* Add Categories Tab Trigger */}
          <TabsTrigger value="categories">{dictionary.inventory.categoriesTabTitle || "Categories"}</TabsTrigger> {/* TODO: Add dictionary key */}
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
            <ProductForm ref={productFormRef} onSuccess={handleAddProductSuccess} initialData={null} dictionary={dictionary} userTenantId={userTenantId} /> {/* Pass dictionary and userTenantId */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Catalog Tab */}
      <TabsContent value="products" className="mt-0 flex flex-col gap-4"> {/* Added flex and gap for spacing */}
        {/* Add Category Dialog Trigger */}
        <div className="flex items-center justify-end"> {/* Container for button, aligned to end */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"> {/* Use outline variant and small size */}
                <PlusCircle className="mr-2 h-4 w-4" /> {dictionary.inventory.categoryForm?.addButton || "Add Category"} {/* Use dictionary */}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{dictionary.inventory.categoryForm?.addButton || "Add Category"}</DialogTitle> {/* Use dictionary */}
                <DialogDescription>
                  Add a new product category.
                </DialogDescription>
              </DialogHeader>
              <CategoryForm dictionary={dictionary} onCategoryAdded={handleAddCategorySuccess} /> {/* Render CategoryForm and refresh data on success */}
            </DialogContent>
          </Dialog>
        </div>
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
        <div className="flex items-center justify-end ">
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
              <StockItemForm onSuccess={handleAddStockSuccess} initialData={null} dictionary={dictionary} userTenantId={userTenantId} /> {/* Pass dictionary and userTenantId */}
            </DialogContent>
          </Dialog>
        </div>

        {/* No loading/error state here, handled by Server Component */}
        <div className="overflow-x-auto"> {/* Add responsive wrapper */}
          <DataTable
            columns={stockColumns}
            data={stockData} // Use state data initialized with initialStockData
            filterColumnKey="serial_number" // Filter by serial number
            filterPlaceholder={dictionary.inventory.filterStockPlaceholder}
          />
        </div>
      </TabsContent>

      {/* Suppliers Tab */}
      <TabsContent value="suppliers" className="mt-0">
        <SupplierManager dictionary={dictionary} userTenantId={userTenantId} />
      </TabsContent>

      {/* Categories Tab */}
      <TabsContent value="categories" className="mt-0 flex flex-col gap-4"> {/* Added flex and gap for spacing */}
        <div className="flex items-center justify-end"> {/* Container for button, aligned to end */}
          {/* Add Category Dialog Trigger */}
          <div className="flex items-center justify-end"> {/* Container for button, aligned to end */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"> {/* Use outline variant and small size */}
                  <PlusCircle className="mr-2 h-4 w-4" /> {dictionary.inventory.categoryForm?.addButton || "Add Category"} {/* Use dictionary */}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{dictionary.inventory.categoryForm?.addButton || "Add Category"}</DialogTitle> {/* Use dictionary */}
                  <DialogDescription>
                    Add a new product category.
                  </DialogDescription>
                </DialogHeader>
                <CategoryForm dictionary={dictionary} onCategoryAdded={handleAddCategorySuccess} /> {/* Render CategoryForm and refresh data on success */}
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* No loading/error state here, handled by Server Component */}
        <DataTable
          columns={categoryColumns}
          data={categoryData} // Use state data for categories
          filterColumnKey="name" // Filter by category name
          filterPlaceholder={dictionary.inventory.categoryForm?.namePlaceholder || "Filter categories..."}
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
          <ProductForm initialData={editingProduct} onSuccess={handleEditProductSuccess} dictionary={dictionary} userTenantId={userTenantId} /> {/* Pass dictionary and userTenantId */}
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
          <StockItemForm onSuccess={handleEditStockSuccess} initialData={editingStockItem} dictionary={dictionary} userTenantId={userTenantId} /> {/* Pass dictionary and userTenantId */}
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

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryDialogOpen} onOpenChange={(open) => {
        setIsEditCategoryDialogOpen(open);
        if (!open) setEditingCategory(null); // Clear state when closing
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dictionary.inventory.categoryForm?.editTitle}</DialogTitle>
            <DialogDescription>
              {dictionary.inventory.categoryForm?.editDescription}
            </DialogDescription>
          </DialogHeader>
          {/* Pass initialData for editing */}
          <CategoryForm initialData={editingCategory} onCategoryUpdated={handleEditCategorySuccess} dictionary={dictionary} /> {/* Pass dictionary */}
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.inventory.categoryForm?.deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {dictionary.inventory.categoryForm?.deleteConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteCategoryDialogOpen(false)}>{dictionary.common?.cancel || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {dictionary.common?.delete || "Delete"} {/* Use common delete dictionary key */}
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
