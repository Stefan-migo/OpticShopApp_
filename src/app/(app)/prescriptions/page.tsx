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
import { useDictionary } from "@/lib/i18n/dictionary-context"; // Import useDictionary hook


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
  const dictionary = useDictionary(); // Use the useDictionary hook


  // Function to refresh data
  const fetchPrescriptions = React.useCallback(async () => {
    setError(null);
    // Fetch prescriptions and join with customers
    const { data: prescriptions, error: fetchError } = await supabase
      .from("prescriptions")
      .select(`
        id,
        customer_id,
        prescriber_id,
        prescription_date,
        expiry_date,
        type,
        od_params,
        os_params,
        notes,
        created_at,
        customers ( first_name, last_name ),
        prescribers:profiles ( full_name )
      `)
      .order("prescription_date", { ascending: false }); // Order by prescription date

    if (fetchError) {
      console.error("Error fetching prescriptions:", fetchError);
      setError(`${dictionary?.prescriptions?.fetchError || "Failed to load prescription data"}: ${fetchError.message}`); // Use optional chaining
      setData([]);
    } else {
      setData(prescriptions as any); // Cast needed due to joined data structure
    }
    setIsLoading(false);
  }, [supabase, dictionary]); // Add dictionary to dependency array

  // Initial data fetch
  React.useEffect(() => {
    setIsLoading(true);
    fetchPrescriptions();
  }, [fetchPrescriptions]); // Removed dictionary from dependency array

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
      toast({ title: dictionary?.prescriptions?.deleteSuccess || "Prescription deleted successfully." }); // Use optional chaining
      fetchPrescriptions(); // Refresh list
    } catch (error: any) {
      console.error("Error deleting prescription:", error);
      toast({
        title: dictionary?.prescriptions?.deleteErrorTitle || "Error deleting prescription", // Use optional chaining
        description: error.message || dictionary?.common?.unexpectedError || "An unexpected error occurred.", // Use optional chaining
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
        onViewDetails: openDetailsDialog, // Pass the details handler
        dictionary // Pass dictionary
     }),
    [dictionary] // Re-generate columns when dictionary changes
  );

  if (!dictionary) {
    return <div>{dictionary?.common?.loading || "Loading..."}</div>; // Show loading until dictionary is fetched
  }


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{dictionary?.prescriptions?.title || "Prescriptions"}</h1> {/* Use optional chaining */}
        {/* Add Prescription Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> {dictionary?.prescriptions?.addPrescriptionButton || "Add Prescription"} {/* Use optional chaining */}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg"> {/* Adjust size */}
            <DialogHeader>
              <DialogTitle>{dictionary?.prescriptions?.addNewPrescriptionTitle || "Add New Prescription"}</DialogTitle> {/* Use optional chaining */}
              <DialogDescription>
                {dictionary?.prescriptions?.addNewPrescriptionDescription || "Enter the details for the new prescription."} {/* Use optional chaining */}
              </DialogDescription>
            </DialogHeader>
            <PrescriptionForm onSuccess={handleAddSuccess} dictionary={dictionary} /> {/* Added dictionary prop */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table Area */}
      {isLoading ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-muted-foreground">
          {dictionary?.prescriptions?.loading || "Loading prescriptions..."} {/* Use optional chaining */}
        </div>
      ) : error ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-red-600">
          {error}
        </div>
      ) : (
        <DataTable
          columns={prescriptionColumns}
          data={data}
          filterColumnKey="prescribers.full_name" // Filter by nested prescriber name
          filterPlaceholder={dictionary?.prescriptions?.filterPlaceholder || "Filter by prescriber name..."} // Use optional chaining
        />
      )}

      {/* Edit Prescription Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setEditingPrescription(null); // Clear state when closing
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dictionary?.prescriptions?.editPrescriptionTitle || "Edit Prescription"}</DialogTitle> {/* Use optional chaining */}
            <DialogDescription>
              {dictionary?.prescriptions?.editPrescriptionDescription || "Update the prescription details. Click save when done."} {/* Use optional chaining */}
            </DialogDescription>
          </DialogHeader>
          {/* Pass initialData for editing */}
          <PrescriptionForm initialData={editingPrescription} onSuccess={handleEditSuccess} dictionary={dictionary} /> {/* Added dictionary prop */}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary?.prescriptions?.deleteConfirmTitle || "Are you absolutely sure?"}</AlertDialogTitle> {/* Use optional chaining */}
            <AlertDialogDescription>
              {dictionary?.prescriptions?.deleteConfirmDescription || "This action cannot be undone. This will permanently delete this prescription record."} {/* Use optional chaining */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingPrescriptionId(null)}>{dictionary?.common?.cancel || "Cancel"}</AlertDialogCancel> {/* Use optional chaining */}
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {dictionary?.prescriptions?.deleteButton || "Delete Prescription"} {/* Use optional chaining */}
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
       /> {/* Removed dictionary prop */}
    </div>
  );
}
