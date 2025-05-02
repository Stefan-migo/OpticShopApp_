"use client"; // Needs to be client component for hooks and actions

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getPrescriptionColumns, type Prescription } from "./columns"; // Import columns and type
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
import { PrescriptionForm } from "./prescription-form";
import { PrescriptionDetailsDialog } from "./prescription-details-dialog"; // Import Details Dialog
import { useToast } from "@/components/ui/use-toast";

export default function PrescriptionsPage() {
  const [data, setData] = React.useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingPrescription, setEditingPrescription] = React.useState<Prescription | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingPrescriptionId, setDeletingPrescriptionId] = React.useState<string | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false); // State for Details dialog
  const [viewingPrescription, setViewingPrescription] = React.useState<Prescription | null>(null); // Prescription being viewed
  const supabase = createClient();
  const { toast } = useToast();

  // Function to refresh data
  const fetchPrescriptions = React.useCallback(async () => {
    setError(null);
    // Fetch prescriptions and join with customers
    const { data: prescriptions, error: fetchError } = await supabase
      .from("prescriptions")
      .select(`
        id,
        customer_id,
        prescriber_name,
        prescription_date,
        expiry_date,
        type,
        od_params,
        os_params,
        notes,
        created_at,
        customers ( first_name, last_name )
      `)
      .order("prescription_date", { ascending: false }); // Order by prescription date

    if (fetchError) {
      console.error("Error fetching prescriptions:", fetchError);
      setError(`Failed to load prescription data: ${fetchError.message}`);
      setData([]);
    } else {
      setData(prescriptions as any); // Cast needed due to joined data structure
    }
    setIsLoading(false);
  }, [supabase]);

  // Initial data fetch
  React.useEffect(() => {
    setIsLoading(true);
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  // Callbacks for form success
  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    fetchPrescriptions();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingPrescription(null);
    fetchPrescriptions();
  };

  // Functions to open dialogs
  const openEditDialog = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (prescriptionId: string) => {
    setDeletingPrescriptionId(prescriptionId);
    setIsDeleteDialogOpen(true);
  };

  const openDetailsDialog = (prescription: Prescription) => {
    setViewingPrescription(prescription);
    setIsDetailsDialogOpen(true);
  };

  // Function to perform deletion
  const confirmDelete = async () => {
    if (!deletingPrescriptionId) return;
    try {
      const { error: deleteError } = await supabase
        .from("prescriptions")
        .delete()
        .eq("id", deletingPrescriptionId);
      if (deleteError) throw deleteError;
      toast({ title: "Prescription deleted successfully." });
      fetchPrescriptions(); // Refresh list
    } catch (error: any) {
      console.error("Error deleting prescription:", error);
      toast({
        title: "Error deleting prescription",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingPrescriptionId(null);
    }
  };

  // Generate columns with action handlers
  const prescriptionColumns = React.useMemo(
    () => getPrescriptionColumns({
        onEdit: openEditDialog,
        onDelete: openDeleteDialog,
        onViewDetails: openDetailsDialog // Pass the details handler
     }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // Handlers don't change often, empty deps ok for now
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Prescriptions</h1>
        {/* Add Prescription Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg"> {/* Adjust size */}
            <DialogHeader>
              <DialogTitle>Add New Prescription</DialogTitle>
              <DialogDescription>
                Enter the details for the new prescription.
              </DialogDescription>
            </DialogHeader>
            <PrescriptionForm onSuccess={handleAddSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table Area */}
      {isLoading ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-muted-foreground">
          Loading prescriptions...
        </div>
      ) : error ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-red-600">
          {error}
        </div>
      ) : (
        <DataTable
          columns={prescriptionColumns}
          data={data}
          filterColumnKey="prescriber_name" // Filter by prescriber name instead
          filterPlaceholder="Filter by prescriber name..."
        />
      )}

      {/* Edit Prescription Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setEditingPrescription(null); // Clear state when closing
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Prescription</DialogTitle>
            <DialogDescription>
              Update the prescription details. Click save when done.
            </DialogDescription>
          </DialogHeader>
          {/* Pass initialData for editing */}
          <PrescriptionForm initialData={editingPrescription} onSuccess={handleEditSuccess} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              prescription record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingPrescriptionId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Prescription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       {/* View Details Dialog */}
       <PrescriptionDetailsDialog
         prescription={viewingPrescription}
         isOpen={isDetailsDialogOpen}
         onOpenChange={(open) => {
           setIsDetailsDialogOpen(open);
           if (!open) setViewingPrescription(null); // Clear state when closing
         }}
       />
    </div>
  );
}
