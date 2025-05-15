"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getColumns, type Customer } from "./columns"; // Use getColumns function
import { DataTable } from "@/components/ui/data-table";
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
import { CustomerForm } from "./customer-form";
import { useToast } from "@/components/ui/use-toast";
import { type Dictionary } from "@/lib/i18n/types"; // Import Dictionary type
import { Locale } from "@/lib/i18n/config"; // Import Locale type
import { createClient } from "@/lib/supabase/client"; // Import client-side Supabase client
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { useDictionary } from '@/lib/i18n/dictionary-context'; // Import useDictionary hook

// Client Component to handle UI interactions (dialogs, forms, delete)
interface CustomersPageClientProps {
  // Remove dictionary prop
  lang: Locale;
  isSuperuser: boolean; // Add isSuperuser prop
}

function CustomersPageClient({ lang, isSuperuser }: CustomersPageClientProps) { // Remove dictionary prop
  const dictionary = useDictionary(); // Get dictionary from context
  const [data, setData] = React.useState<Customer[]>([]); // Initialize state as empty array
  const [loading, setLoading] = React.useState(true); // Add loading state
  const [error, setError] = React.useState<string | null>(null); // Add error state // Fix syntax error here
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = React.useState<string | null>(null);
  // Remove isDictionaryLoaded state and useEffect
  const { toast } = useToast();
  const supabase = createClient(); // Use client-side Supabase client for client-side mutations
  const searchParams = useSearchParams(); // Get search parameters
  const tenantId = searchParams.get('tenantId'); // Get tenantId from search parameters

  // Function to fetch data client-side
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from("customers")
      .select("id, first_name, last_name, email, phone, created_at");

    // Apply tenant filter if user is superuser AND tenantId search parameter is present
    if (isSuperuser && tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    // Note: For non-superusers, RLS policies will automatically filter by their tenant_id

    const { data: customers, error: fetchError } = await query
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching customers:", fetchError);
      setError(fetchError.message);
      setData([]); // Clear data on error
    } else {
      // Format the created_at date strings on the client
      const formattedCustomers = customers?.map(customer => {
        const date = new Date(customer.created_at);
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // MM
        const day = date.getDate().toString().padStart(2, '0'); // DD
        const year = date.getFullYear(); // YYYY
        return {
          ...customer,
          created_at: `${month}/${day}/${year}`, // MM/DD/YYYY format
        };
      }) as Customer[] | []; // Type assertion for formatted data
      setData(formattedCustomers);
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
  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    refreshData(); // Trigger data refresh
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingCustomer(null);
    refreshData(); // Trigger data refresh
  };

  // Functions to open dialogs
  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (customerId: string) => {
    setDeletingCustomerId(customerId);
    setIsDeleteDialogOpen(true);
  };

  // Function to perform deletion (should ideally be a Server Action)
  const confirmDelete = async () => {
    if (!deletingCustomerId) return;
    try {
      // This delete operation should ideally be a Server Action for security
      const { error: deleteError } = await supabase
        .from("customers")
        .delete()
        .eq("id", deletingCustomerId);
      if (deleteError) throw deleteError;
      toast({ title: dictionary?.customers?.deleteSuccess || "Customer deleted successfully." });
      refreshData(); // Trigger data refresh
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      toast({
        title: dictionary?.customers?.deleteErrorTitle || "Error deleting customer",
        description: error.message || dictionary?.common?.unexpectedError || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingCustomerId(null);
    }
  };

  // Generate columns with action handlers
  // Generate columns with action handlers
  const customerColumns = React.useMemo(
    () => getColumns({ onEdit: openEditDialog, onDelete: openDeleteDialog, dictionary }), // Pass dictionary here
    [dictionary] // Dependency on dictionary
  );

  // Add a check for dictionary availability before rendering
  if (!dictionary || !dictionary.customers?.title) {
      return <div>Loading language resources...</div>; // Or a more specific loading/error state
  }


  if (loading) {
    return <div>Loading customers...</div>; // Loading indicator
  }

  if (error) {
    return <div>Error: {error}</div>; // Error message
  }


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{dictionary.customers.title}</h1>

        {/* Add Customer Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> {dictionary.customers.addCustomerButton}
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dictionary.customers.addNewCustomerTitle}</DialogTitle>
            <DialogDescription>
              {dictionary.customers.addNewCustomerDescription}
            </DialogDescription>
          </DialogHeader>
          {/* Render CustomerForm directly */}
          <CustomerForm onSuccess={handleAddSuccess} />
        </DialogContent>
      </Dialog>
    </div>

      {/* Data Table Area */}
      <DataTable
        columns={customerColumns}
        data={data} // Use state data
        filterColumnKey="email"
        filterPlaceholder={dictionary.customers.filterPlaceholder}
      />


      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setEditingCustomer(null);
      }}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dictionary.customers.editCustomerTitle}</DialogTitle>
            <DialogDescription>
              {dictionary.customers.editCustomerDescription}
            </DialogDescription>
          </DialogHeader>
          {/* Render CustomerForm directly */}
          <CustomerForm initialData={editingCustomer} onSuccess={handleEditSuccess} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.customers.deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {dictionary.customers.deleteConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCustomerId(null)}>{dictionary.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {dictionary.customers.tableActions.deleteCustomer}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CustomersPageClient;
