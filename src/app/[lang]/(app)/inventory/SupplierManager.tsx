"use client";

import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { type Dictionary } from "@/lib/i18n/types";
import { SupplierForm } from "./SupplierForm";
import { SupplierTable } from "./SupplierTable";
import { type Supplier } from "@/lib/supabase/types/database.types"; // Assuming Supplier type is now exported
import { getSuppliers, deleteSupplier } from "./actions"; // Assuming actions.ts will have deleteSupplier
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

interface SupplierManagerProps {
  dictionary: Dictionary;
  userTenantId: string | null;
}

export function SupplierManager({ dictionary, userTenantId }: SupplierManagerProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null); // State for editing
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete confirmation dialog
  const [supplierToDeleteId, setSupplierToDeleteId] = useState<string | null>(null); // State to store the ID of the supplier to delete
  const { toast } = useToast();

  const fetchSuppliers = async () => {
    setIsLoading(true);
    const { data, error } = await getSuppliers();

    if (error) {
      toast({
        title: dictionary.common?.failedToLoadData,
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setSuppliers(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, [toast]);

  const handleSupplierAdded = (newSupplier: Supplier) => {
    setSuppliers([...suppliers, newSupplier]);
  };

  const handleSupplierUpdated = (updatedSupplier: Supplier) => {
    setSuppliers(suppliers.map(supplier =>
      supplier.id === updatedSupplier.id ? updatedSupplier : supplier
    ));
    setEditingSupplier(null); // Clear editing state
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSupplierToDeleteId(supplierId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSupplier = async () => {
    if (!supplierToDeleteId) return;

    const { error } = await deleteSupplier(supplierToDeleteId);

    if (error) {
      toast({
        title: dictionary.inventory?.supplierTable?.deleteErrorTitle || dictionary.common?.unexpectedError,
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: dictionary.inventory?.supplierTable?.deleteSuccess,
      });
      setSuppliers(suppliers.filter(supplier => supplier.id !== supplierToDeleteId));
    }

    setIsDeleteDialogOpen(false);
    setSupplierToDeleteId(null);
  };

  const handleCancelEdit = () => {
    setEditingSupplier(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{dictionary.inventory?.suppliersTabTitle || "Suppliers"}</h2>
      <SupplierForm
        dictionary={dictionary}
        initialData={editingSupplier} // Pass initial data for editing
        onSupplierAdded={handleSupplierAdded}
        onSupplierUpdated={handleSupplierUpdated} // Pass update handler
        onCancelEdit={handleCancelEdit} // Pass cancel handler
      />
      {isLoading ? (
        <div>{dictionary.common?.loading}...</div>
      ) : (
        <SupplierTable
          dictionary={dictionary}
          data={suppliers}
          onEdit={handleEditSupplier} // Pass edit handler
          onDelete={handleDeleteSupplier} // Pass delete handler
        />
      )}

      {/* Delete Supplier Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.inventory?.supplierTable?.deleteConfirmTitle || "Confirm Deletion"}</AlertDialogTitle> {/* TODO: Add dictionary key */}
            <AlertDialogDescription>
              {dictionary.inventory?.supplierTable?.deleteConfirmDescription || "Are you sure you want to delete this supplier? This action cannot be undone."} {/* TODO: Add dictionary key */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>{dictionary.common?.cancel || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSupplier} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {dictionary.common?.delete || "Delete"} {/* Use common delete dictionary key */}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
