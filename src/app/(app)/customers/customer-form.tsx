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

// TODO: Add textarea component using shadcn-ui add

// Define the form schema using Zod
const formSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required." }).max(50),
  last_name: z.string().min(1, { message: "Last name is required." }).max(50),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')), // Optional but must be valid email if provided
  phone: z.string().optional(), // Optional phone number
  // Add address fields if needed (using nested object or separate fields)
  // address_street: z.string().optional(),
  // address_city: z.string().optional(),
  // ...
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof formSchema>;

interface CustomerFormProps {
  initialData?: Customer | null; // For editing existing customer
  onSuccess?: () => void; // Callback after successful submission
}

export function CustomerForm({ initialData, onSuccess }: CustomerFormProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const isEditing = !!initialData;

  // Define form
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
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
        title: `Customer ${isEditing ? "updated" : "added"} successfully.`,
      });
      onSuccess?.(); // Call the success callback (e.g., close dialog, refresh data)
      form.reset(); // Reset form after successful submission

    } catch (error: any) {
      console.error("Error saving customer:", error);
      toast({
        title: `Error ${isEditing ? "updating" : "adding"} customer`,
        description: error.message || "An unexpected error occurred.",
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
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} disabled={isLoading} />
                </FormControl>
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="555-123-4567" {...field} disabled={isLoading} />
              </FormControl>
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any relevant notes about the customer..."
                  className="resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Customer")}
        </Button>
      </form>
    </Form>
  );
}
