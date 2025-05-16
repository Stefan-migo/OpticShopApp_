"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, Control } from "react-hook-form"; // Import SubmitHandler, Control
import * as z from "zod";
import { useEffect } from 'react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { type Dictionary } from "@/lib/i18n/types";
import { type Supplier } from "@/lib/supabase/types/database.types";
import { addSupplier, updateSupplier } from "./actions";

const supplierFormSchema = z.object({
  name: z.string().min(1, { message: "Supplier name is required." }), // TODO: Use dictionary
  contact_person: z.string().nullable(),
  email: z.string().email({ message: "Invalid email address." }).nullable(), // TODO: Use dictionary
  phone: z.string().nullable(),
  address: z.string().nullable(), // Simplified address for now
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

interface SupplierFormProps {
  dictionary: Dictionary;
  initialData?: Supplier | null;
  onSupplierAdded: (newSupplier: Supplier) => void;
  onSupplierUpdated: (updatedSupplier: Supplier) => void;
  onCancelEdit: () => void;
}

export function SupplierForm({ dictionary, initialData, onSupplierAdded, onSupplierUpdated, onCancelEdit }: SupplierFormProps) {
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      contact_person: initialData?.contact_person || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address as string | null | undefined || "", // Explicitly cast address
    },
  });

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        contact_person: initialData.contact_person || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address as string | null | undefined || "", // Explicitly cast address
      });
    } else {
      form.reset({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [initialData, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<SupplierFormValues> = async (values) => { // Explicitly type onSubmit
    if (isEditing && initialData) {
      // Update existing supplier
      const { data, error } = await updateSupplier(initialData.id, values);

      if (error) {
        toast({
          title: dictionary.inventory.supplierForm?.saveErrorTitle || "Error updating supplier", // TODO: Use dictionary
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        toast({
          title: dictionary.inventory.supplierForm?.saveSuccess || "Supplier updated successfully.", // TODO: Use dictionary
          variant: "default",
        });
        onSupplierUpdated(data);
      }
    } else {
      // Add new supplier
      const { data, error } = await addSupplier(values);

      if (error) {
        toast({
          title: dictionary.inventory.supplierForm?.saveErrorTitle || "Error adding supplier", // TODO: Use dictionary
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        toast({
          title: dictionary.inventory.supplierForm?.saveSuccess || "Supplier added successfully.", // TODO: Use dictionary
          variant: "default",
        });
        onSupplierAdded(data);
        form.reset();
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control as Control<SupplierFormValues>}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.inventory.supplierForm?.nameLabel || "Name"} *</FormLabel>
                <Input placeholder={dictionary.inventory.supplierForm?.namePlaceholder || "Supplier Name"} {...field} disabled={isLoading} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as Control<SupplierFormValues>}
          name="contact_person"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.inventory.supplierForm?.contactPersonLabel || "Contact Person"}</FormLabel>
                <Input placeholder={dictionary.inventory.supplierForm?.contactPersonPlaceholder || "Contact Person"} {...field} value={field.value || ''} disabled={isLoading} />
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control as Control<SupplierFormValues>}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.inventory.supplierForm?.emailLabel || "Email"}</FormLabel>
                <Input type="email" placeholder={dictionary.inventory.supplierForm?.emailPlaceholder || "Email"} {...field} value={field.value || ''} disabled={isLoading} />
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control as Control<SupplierFormValues>}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.inventory.supplierForm?.phoneLabel || "Phone"}</FormLabel>
                <Input placeholder={dictionary.inventory.supplierForm?.phonePlaceholder || "Phone"} {...field} value={field.value || ''} disabled={isLoading} />
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control as Control<SupplierFormValues>}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.inventory.supplierForm?.addressLabel || "Address"}</FormLabel>
                <Input placeholder={dictionary.inventory.supplierForm?.addressPlaceholder || "Address"} {...field} value={field.value as string | null | undefined || ''} disabled={isLoading} /> 
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? (isEditing ? dictionary.common.saving : dictionary.common.adding)
              : (isEditing ? dictionary.inventory.supplierForm?.saveChangesButton || "Save Changes" : dictionary.inventory.supplierForm?.addButton || "Add Supplier")
            }
          </Button>
          {isEditing && (
            <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isLoading}>
              {dictionary.common.cancel || "Cancel"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
