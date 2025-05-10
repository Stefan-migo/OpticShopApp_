"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, Check, X } from "lucide-react";
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

// Define the structure for tax rate data
type TaxRate = {
  id: string;
  name: string;
  rate: number; // Stored as decimal, e.g., 0.07
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

// Define the structure for form values (subset of TaxRate)
type TaxRateFormValues = {
  name: string;
  rate: number; // Input as percentage, convert before saving
  is_default: boolean;
};

export function TaxRateManager() {
  const supabase = createClient();
  const { toast } = useToast();
  const [taxRates, setTaxRates] = React.useState<TaxRate[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingRate, setEditingRate] = React.useState<TaxRate | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingRateId, setDeletingRateId] = React.useState<string | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = React.useState<TaxRateFormValues>({
    name: "",
    rate: 0,
    is_default: false,
  });

  // Fetch tax rates
  const fetchTaxRates = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tax_rates")
        .select("*")
        .order("name");
      if (error) throw error;
      setTaxRates(data || []);
    } catch (error: any) {
      console.error("Error fetching tax rates:", error);
      toast({ title: "Error loading tax rates", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  React.useEffect(() => {
    fetchTaxRates();
  }, [fetchTaxRates]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) : value,
    }));
  };

  // Reset form and close dialog
  const resetAndCloseForm = () => {
    setFormData({ name: "", rate: 0, is_default: false });
    setEditingRate(null);
    setIsFormOpen(false);
  };

  // Handle opening the form for editing
  const handleEdit = (rate: TaxRate) => {
    setEditingRate(rate);
    setFormData({
      name: rate.name,
      rate: rate.rate * 100, // Convert decimal back to percentage for display
      is_default: rate.is_default,
    });
    setIsFormOpen(true);
  };

  // Handle form submission (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formData.name.trim() || formData.rate < 0) {
        toast({ title: "Invalid input", description: "Name is required and rate cannot be negative.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    const rateData = {
      name: formData.name.trim(),
      rate: formData.rate / 100, // Convert percentage to decimal for storage
      is_default: formData.is_default,
    };

    try {
      let error = null;
      // If setting this as default, unset other defaults first within a transaction
      if (rateData.is_default && (!editingRate || !editingRate.is_default)) {
        const { error: unsetError } = await supabase
          .from('tax_rates')
          .update({ is_default: false })
          .eq('is_default', true)
          .neq('id', editingRate?.id || '00000000-0000-0000-0000-000000000000'); // Exclude current if editing
        if (unsetError) throw new Error(`Failed to unset other defaults: ${unsetError.message}`);
      }

      if (editingRate) {
        // Update
        const { error: updateError } = await supabase
          .from("tax_rates")
          .update(rateData)
          .eq("id", editingRate.id);
        error = updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from("tax_rates")
          .insert([rateData]);
        error = insertError;
      }

      if (error) throw error;

      toast({ title: `Tax rate ${editingRate ? "updated" : "added"} successfully.` });
      resetAndCloseForm();
      fetchTaxRates(); // Refresh list
    } catch (error: any) {
      console.error("Error saving tax rate:", error);
      toast({
        title: `Error saving tax rate`,
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening delete confirmation
  const openDeleteDialog = (id: string) => {
    setDeletingRateId(id);
    setIsDeleteDialogOpen(true);
  };

  // Handle deleting a tax rate
  const confirmDelete = async () => {
    if (!deletingRateId) return;
    setIsSubmitting(true); // Use submitting state for delete as well
    try {
      const { error } = await supabase
        .from("tax_rates")
        .delete()
        .eq("id", deletingRateId);
      if (error) throw error;
      toast({ title: "Tax rate deleted successfully." });
      fetchTaxRates(); // Refresh list
    } catch (error: any) {
      console.error("Error deleting tax rate:", error);
      toast({
        title: "Error deleting tax rate",
        description: error.message || "Could not delete the tax rate.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingRateId(null);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Tax Rates</h2>
        <Dialog open={isFormOpen} onOpenChange={(open) => {
            if (!open) resetAndCloseForm(); // Reset form if dialog is closed
            else setIsFormOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Tax Rate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRate ? "Edit" : "Add"} Tax Rate</DialogTitle>
              <DialogDescription>
                {editingRate ? "Update the" : "Enter the"} details for the tax rate.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-muted-foreground">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4 text-muted-foreground">
                <Label htmlFor="rate" className="text-right">Rate (%)</Label>
                <Input
                  id="rate"
                  name="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.rate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4 text-muted-foreground">
                 <Label htmlFor="is_default" className="text-right">Default</Label>
                 <div className="col-span-3 flex items-center">
                    <Checkbox
                        id="is_default"
                        name="is_default"
                        checked={formData.is_default}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: !!checked }))}
                        disabled={isSubmitting || (editingRate?.is_default && taxRates.filter(r => r.is_default).length <= 1)} // Prevent unchecking the only default
                    />
                    <span className="ml-2 text-sm text-muted-foreground">Set as default tax rate</span>
                 </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={resetAndCloseForm}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : (editingRate ? "Save Changes" : "Add Rate")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Loading tax rates...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Default</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taxRates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell className="font-medium">{rate.name}</TableCell>
                <TableCell>{(rate.rate * 100).toFixed(2)}%</TableCell>
                <TableCell>{rate.is_default ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-muted-foreground"/>}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(rate)} disabled={isSubmitting}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => openDeleteDialog(rate.id)}
                    disabled={isSubmitting || rate.is_default} // Prevent deleting the default rate
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

       {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the tax rate. Make sure it's not currently in use by past orders if historical accuracy is critical.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingRateId(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isSubmitting}>
                 {isSubmitting ? "Deleting..." : "Delete Tax Rate"}
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
