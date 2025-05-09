"use client"; // Needs to be a client component

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getColumns, type Customer } from "./columns"; // Use getColumns function
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
import { CustomerForm } from "./customer-form";
import { useToast } from "@/components/ui/use-toast";
import { useDictionary } from "@/lib/i18n/dictionary-context"; // Import useDictionary hook

export default function CustomersPage() {
  const [data, setData] = React.useState<Customer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = React.useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();
  const dictionary = useDictionary(); // Use the useDictionary hook

  // Function to refresh data
  const fetchCustomers = React.useCallback(async () => {
    setError(null);
    const { data: customers, error: fetchError } = await supabase
      .from("customers")
      .select("id, first_name, last_name, email, phone, created_at")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching customers:", fetchError);
      setError(`${dictionary?.customers?.fetchError || "Failed to load customer data"}: ${fetchError.message}`); // Use optional chaining
      setData([]);
    } else {
      setData(customers as Customer[]);
    }
    setIsLoading(false);
  }, [supabase, dictionary]); // Add dictionary to dependency array

  // Initial data fetch
  React.useEffect(() => {
    setIsLoading(true);
    fetchCustomers();
  }, [fetchCustomers]);

  // Callbacks for form success
  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    fetchCustomers();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingCustomer(null);
    fetchCustomers();
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

  // Function to perform deletion
  const confirmDelete = async () => {
    if (!deletingCustomerId) return;
    try {
      const { error: deleteError } = await supabase
        .from("customers")
        .delete()
        .eq("id", deletingCustomerId);
      if (deleteError) throw deleteError;
      toast({ title: dictionary?.customers?.deleteSuccess || "Customer deleted successfully." }); // Use optional chaining
      fetchCustomers();
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      toast({
        title: dictionary?.customers?.deleteErrorTitle || "Error deleting customer", // Use optional chaining
        description: error.message || dictionary?.common?.unexpectedError || "An unexpected error occurred.", // Use optional chaining
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingCustomerId(null);
    }
  };

  // Generate columns with action handlers
  const customerColumns = React.useMemo(
    () => getColumns({ onEdit: openEditDialog, onDelete: openDeleteDialog }), // Removed dictionary prop
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // No dependencies needed as getColumns uses hook internally
  );

  if (!dictionary) {
    return <div>{dictionary?.common?.loading || "Loading..."}</div>; // Use optional chaining
  }


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{dictionary.customers?.title || "Customers"}</h1> {/* Use optional chaining */}

        {/* Add Customer Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> {dictionary.customers?.addCustomerButton || "Add Customer"} {/* Use optional chaining */}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{dictionary.customers?.addNewCustomerTitle || "Add New Customer"}</DialogTitle> {/* Use optional chaining */}
              <DialogDescription>
                {dictionary.customers?.addNewCustomerDescription || "Enter the details for the new customer. Click save when done."} {/* Use optional chaining */}
              </DialogDescription>
            </DialogHeader>
            <CustomerForm onSuccess={handleAddSuccess} dictionary={dictionary} /> {/* Pass dictionary */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table Area */}
      {isLoading ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-muted-foreground">
          {dictionary.customers?.loading || "Loading customers..."} {/* Use optional chaining */}
        </div>
      ) : error ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-destructive-foreground">
          {error}
        </div>
      ) : (
        <DataTable
          columns={customerColumns}
          data={data}
          filterColumnKey="email" // Filter key remains the same
          filterPlaceholder={dictionary.customers?.filterPlaceholder || "Filter by email..."} // Use optional chaining
        />
      )}

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setEditingCustomer(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dictionary.customers?.editCustomerTitle || "Edit Customer"}</DialogTitle> {/* Use optional chaining */}
            <DialogDescription>
              {dictionary.customers?.editCustomerDescription || "Update the customer's details. Click save when done."} {/* Use optional chaining */}
            </DialogDescription>
          </DialogHeader>
          <CustomerForm initialData={editingCustomer} onSuccess={handleEditSuccess} dictionary={dictionary} /> {/* Pass dictionary */}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.customers?.deleteConfirmTitle || "Are you absolutely sure?"}</AlertDialogTitle> {/* Use optional chaining */}
            <AlertDialogDescription>
              {dictionary.customers?.deleteConfirmDescription || "This action cannot be undone. This will permanently delete the customer record."} {/* Use optional chaining */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCustomerId(null)}>{dictionary.common?.cancel || "Cancel"}</AlertDialogCancel> {/* Use optional chaining */}
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {dictionary.common?.delete || "Delete"} {/* Use optional chaining */}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
