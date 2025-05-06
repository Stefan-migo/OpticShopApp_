"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Need to add textarea component
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { type Customer } from "./columns"; // Import Customer type
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface
import React from "react"; // Import React for Fragment

// TODO: Add textarea component using shadcn-ui add

// Define the form schema using Zod
const createFormSchema = (dictionary: Dictionary) => z.object({
  first_name: z.string().min(1, { message: dictionary.customers.form.firstNameRequired || "First name is required." }).max(50), // Use dictionary
  last_name: z.string().min(1, { message: dictionary.customers.form.lastNameRequired || "Last name is required." }).max(50), // Use dictionary
  email: z.string().email({ message: dictionary.customers.form.invalidEmail || "Invalid email address." }).optional().or(z.literal('')), // Use dictionary
  phone: z.string().optional(), // Optional phone number
  // Add address fields if needed (using nested object or separate fields)
  // address_street: z.string().optional(),
  // address_city: z.string().optional(),
  // ...
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface CustomerFormProps {
  initialData?: Customer | null; // For editing existing customer
  onSuccess?: () => void; // Callback after successful submission
  dictionary: Dictionary; // Use the imported Dictionary interface
}

export function CustomerForm({ initialData, onSuccess, dictionary }: CustomerFormProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const isEditing = !!initialData;

  // Define form
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(createFormSchema(dictionary)), // Pass dictionary to schema function
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      notes: "", // Assuming notes aren't typically pre-filled for edit
      // Set default address fields if using them
    },
  });

  const isLoading = form.formState.isSubmitting;

  // Define submit handler
  async function onSubmit(values: CustomerFormValues) {
    try {
      let error = null;
      if (isEditing) {
        // Update logic
        const { error: updateError } = await supabase
          .from("customers")
          .update({
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email || null, // Store null if empty
            phone: values.phone || null, // Store null if empty
            // Update address fields if using them
            notes: values.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);
        error = updateError;
      } else {
        // Insert logic
        const { error: insertError } = await supabase
          .from("customers")
          .insert([
            {
              first_name: values.first_name,
              last_name: values.last_name,
              email: values.email || null,
              phone: values.phone || null,
              notes: values.notes || null,
              // Add address fields if using them
            },
          ]);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: dictionary.customers.form.saveSuccess, // Use dictionary
      });
      onSuccess?.(); // Call the success callback (e.g., close dialog, refresh data)
      form.reset(); // Reset form after successful submission

    } catch (error: any) {
      console.error("Error saving customer:", error);
      toast({
        title: isEditing ? dictionary.customers.form.saveErrorTitle : dictionary.customers.form.saveErrorTitle, // Use dictionary for error title
        description: error.message || dictionary.common.unexpectedError, // Use dictionary for unexpected error
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.customers.form.firstNameLabel || "First Name"} *</FormLabel> {/* Use dictionary */}
                <div> {/* Removed FormControl */}
                  <Input placeholder={dictionary.customers.form.firstNamePlaceholder} {...field} disabled={isLoading} /> {/* Use dictionary */}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.customers.form.lastNameLabel || "Last Name"} *</FormLabel> {/* Use dictionary */}
                <div> {/* Removed FormControl */}
                  <Input placeholder={dictionary.customers.form.lastNamePlaceholder} {...field} disabled={isLoading} /> {/* Use dictionary */}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.customers.form.emailLabel || "Email"}</FormLabel> {/* Use dictionary */}
              <div> {/* Removed FormControl */}
                <Input type="email" placeholder={dictionary.customers.form.emailPlaceholder} {...field} disabled={isLoading} /> {/* Use dictionary */}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.customers.form.phoneLabel || "Phone"}</FormLabel> {/* Use dictionary */}
              <div> {/* Removed FormControl */}
                  <Input placeholder={dictionary.customers.form.phonePlaceholder} {...field} disabled={isLoading} /> {/* Use dictionary */}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
         {/* Add Address Fields Here if needed */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.customers.form.notesLabel || "Notes"}</FormLabel> {/* Use dictionary */}
              <div> {/* Removed FormControl */}
                <Textarea
                  placeholder={dictionary.customers.form.notesPlaceholder}
                  className="resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? (isEditing ? (dictionary.common.saving || "Saving...") : (dictionary.common.adding || "Adding...")) // Use dictionary
            : (isEditing ? (dictionary.common.saveChanges || "Save Changes") : (dictionary.common.addCustomer || "Add Customer")) // Use dictionary
          }
        </Button>
      </form>
    </Form>
  );
}
