"use client";

import * as React from "react";
import { useEffect, useState } from "react"; // Import useEffect and useState
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getPrescriptionColumns, type Prescription } from "./columns"; // Import columns and type
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
import { PrescriptionForm } from "./prescription-form";
import { PrescriptionDetailsDialog } from "./prescription-details-dialog"; // Import Details Dialog
import { useToast } from "@/components/ui/use-toast";
import { type Dictionary } from "@/lib/i18n/types"; // Import Dictionary type
import { Locale } from "@/lib/i18n/config"; // Import Locale type
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { User } from "@supabase/supabase-js"; // Import User type


// Client Component to handle UI interactions (dialogs, forms, delete)
interface PrescriptionsPageClientProps {
  dictionary: Dictionary;
  lang: Locale;
}

function PrescriptionsPageClient({ dictionary, lang }: PrescriptionsPageClientProps) {
  const [data, setData] = React.useState<Prescription[]>([]); // Initialize state as empty array
  const [loading, setLoading] = React.useState(true); // Add loading state
  const [error, setError] = React.useState<string | null>(null); // Add error state
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingPrescription, setEditingPrescription] = React.useState<Prescription | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingPrescriptionId, setDeletingPrescriptionId] = React.useState<string | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false); // State for Details dialog
  const [viewingPrescription, setViewingPrescription] = React.useState<Prescription | null>(null); // Prescription being viewed
  const [isSuperuser, setIsSuperuser] = React.useState(false); // State for isSuperuser flag
  const supabase = createClient(); // Use client-side Supabase client for client-side mutations
  const { toast } = useToast();
  const searchParams = useSearchParams(); // Get search parameters
  const tenantId = searchParams.get('tenantId'); // Get tenantId from search parameters

  // Fetch user and superuser status
  React.useEffect(() => {
    const checkSuperuser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_superuser')
          .eq('id', user.id)
          .single();
        if (profileData && profileData.is_superuser !== null) {
          setIsSuperuser(profileData.is_superuser);
        } else {
          setIsSuperuser(false);
        }
      } else {
        setIsSuperuser(false);
      }
    };
    checkSuperuser();
  }, [supabase]);


  // Function to fetch data client-side
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from("prescriptions")
      .select(`
        id, customer_id, medical_record_id, prescriber_id, prescriber_name, prescription_date, expiry_date, type, notes, od_params, os_params, created_at, updated_at,
        customers ( first_name, last_name ),
        profiles ( full_name )
      `) // Include joined tables
      .order("prescription_date", { ascending: false });

    // Apply tenant filter if user is superuser AND tenantId search parameter is present
    if (isSuperuser && tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    // Note: For non-superusers, RLS policies will automatically filter by their tenant_id


    const { data: prescriptions, error: fetchError } = await query;


    if (fetchError) {
      console.error("Error fetching prescriptions:", fetchError);
      setError(fetchError.message);
      setData([]); // Clear data on error
    } else {
       // Format the created_at date strings on the client
      const formattedPrescriptions = prescriptions?.map(prescription => {
        const date = new Date(prescription.created_at);
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // MM
        const day = date.getDate().toString().padStart(2, '0'); // DD
        const year = date.getFullYear(); // YYYY
        return {
          ...prescription,
          created_at: `${month}/${day}/${year}`, // MM/DD/YYYY format
        };
      }) as Prescription[] | []; // Type assertion for formatted data
      setData(formattedPrescriptions);
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
    setEditingPrescription(null);
    refreshData(); // Trigger data refresh
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

  // Function to perform deletion (should ideally be a Server Action)
  const confirmDelete = async () => {
    if (!deletingPrescriptionId) return;
    try {
      // This delete operation should ideally be a Server Action for security
      const { error: deleteError } = await supabase
        .from("prescriptions")
        .delete()
        .eq("id", deletingPrescriptionId);
      if (deleteError) throw deleteError;
      toast({ title: dictionary?.prescriptions?.deleteSuccess || "Prescription deleted successfully." }); // Use optional chaining
      refreshData(); // Refresh list
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

  if (loading) {
    return <div>Loading prescriptions...</div>; // Loading indicator
  }

  if (error) {
    return <div>Error: {error}</div>; // Error message
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
            {/* Pass isSuperuser and tenantId to PrescriptionForm */}
            <PrescriptionForm onSuccess={handleAddSuccess} dictionary={dictionary} isSuperuser={isSuperuser} tenantId={tenantId} /> {/* Added dictionary prop */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table Area */}
      {/* No loading/error state here, handled by Server Component */}
        <DataTable
          columns={prescriptionColumns}
          data={data} // Use state data initialized with initialData
          filterColumnKey="prescribers.full_name" // Filter by nested prescriber name
          filterPlaceholder={dictionary?.prescriptions?.filterPlaceholder || "Filter by prescriber name..."} // Use optional chaining
        />

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
          {/* Pass isSuperuser and tenantId to PrescriptionForm */}
          <PrescriptionForm initialData={editingPrescription} onSuccess={handleEditSuccess} dictionary={dictionary} isSuperuser={isSuperuser} tenantId={tenantId} /> {/* Added dictionary prop */}
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

export default PrescriptionsPageClient;
