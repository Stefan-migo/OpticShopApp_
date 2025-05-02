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

  // Function to refresh data
  const fetchCustomers = React.useCallback(async () => {
    setError(null);
    const { data: customers, error: fetchError } = await supabase
      .from("customers")
      .select("id, first_name, last_name, email, phone, created_at")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching customers:", fetchError);
      setError(`Failed to load customer data: ${fetchError.message}`);
      setData([]);
    } else {
      setData(customers as Customer[]);
    }
    setIsLoading(false);
  }, [supabase]);

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
      toast({ title: "Customer deleted successfully." });
      fetchCustomers();
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error deleting customer",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingCustomerId(null);
    }
  };

  // Generate columns with action handlers
  const customerColumns = React.useMemo(
    () => getColumns({ onEdit: openEditDialog, onDelete: openDeleteDialog }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // Handlers don't change, empty dependency array is fine
     // If handlers needed fetchCustomers, add it: [fetchCustomers]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>

        {/* Add Customer Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Enter the details for the new customer. Click save when done.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm onSuccess={handleAddSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table Area */}
      {isLoading ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-muted-foreground">
          Loading customers...
        </div>
      ) : error ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-red-600">
          {error}
        </div>
      ) : (
        <DataTable
          columns={customerColumns}
          data={data}
          filterColumnKey="email"
          filterPlaceholder="Filter by email..."
        />
      )}

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setEditingCustomer(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update the customer's details. Click save when done.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm initialData={editingCustomer} onSuccess={handleEditSuccess} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              customer record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCustomerId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
