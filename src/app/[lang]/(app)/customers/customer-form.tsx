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
import { useDictionary } from '@/lib/i18n/dictionary-context'; // Import useDictionary hook

// TODO: Add textarea component using shadcn-ui add

// Define the form schema using Zod
const createFormSchema = (dictionary: Dictionary) => z.object({
  first_name: z.string().min(1, { message: dictionary?.customers?.form?.firstNameRequired || "First name is required." }).max(50), // Use optional chaining
  last_name: z.string().min(1, { message: dictionary?.customers?.form?.lastNameRequired || "Last name is required." }).max(50), // Use optional chaining
  email: z.string().email({ message: dictionary?.customers?.form?.invalidEmail || "Invalid email address." }).optional().or(z.literal('')), // Use optional chaining
  phone: z.string().optional(), // Optional phone number
  dob: z.string().optional(), // Date of birth
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  insurance_provider: z.string().optional(),
  insurance_policy_number: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface CustomerFormProps {
  initialData?: Customer | null; // For editing existing customer
  onSuccess?: () => void; // Callback after successful submission
  // Remove dictionary prop
}

export function CustomerForm({ initialData, onSuccess }: CustomerFormProps) { // Remove dictionary prop
  const dictionary = useDictionary(); // Get dictionary from context

  const { toast } = useToast();
  const supabase = createClient();
  const isEditing = !!initialData;

  // Define form
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(createFormSchema(dictionary)), // Pass the full dictionary
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      notes: "", // Assuming notes aren't typically pre-filled for edit
      dob: initialData?.dob || "",
      address_line1: initialData?.address_line1 || "",
      address_line2: initialData?.address_line2 || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      postal_code: initialData?.postal_code || "",
      country: initialData?.country || "",
      insurance_provider: initialData?.insurance_provider || "",
      insurance_policy_number: initialData?.insurance_policy_number || "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // Define submit handler
  async function onSubmit(values: CustomerFormValues) {
    try {
      let error = null;

      // Fetch the current user and their tenant_id
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(dictionary?.customers?.form?.userFetchError || "Could not fetch user information."); // Use optional chaining
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.tenant_id) {
         throw new Error(dictionary?.customers?.form?.tenantFetchError || "Could not fetch user's tenant information."); // Use optional chaining
      }

      const userTenantId = profile.tenant_id;


      if (isEditing) {
        // Update logic
        const { error: updateError } = await supabase
          .from("customers")
          .update({
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email || null, // Store null if empty
            phone: values.phone || null, // Store null if empty
            dob: values.dob || null,
            address_line1: values.address_line1 || null,
            address_line2: values.address_line2 || null,
            city: values.city || null,
            state: values.state || null,
            postal_code: values.postal_code || null,
            country: values.country || null,
            insurance_provider: values.insurance_provider || null,
            insurance_policy_number: values.insurance_policy_number || null,
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
              dob: values.dob || null,
              address_line1: values.address_line1 || null,
              address_line2: values.address_line2 || null,
              city: values.city || null,
              state: values.state || null,
              postal_code: values.postal_code || null,
              country: values.country || null,
              insurance_provider: values.insurance_provider || null,
              insurance_policy_number: values.insurance_policy_number || null,
              notes: values.notes || null,
              tenant_id: userTenantId, // Include the user's tenant_id
            },
          ]);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: dictionary?.customers?.form?.saveSuccess || dictionary?.common?.unexpectedError, // Use optional chaining and fallback
      });
      onSuccess?.(); // Call the success callback (e.g., close dialog, refresh data)
      form.reset(); // Reset form after successful submission

    } catch (error: any) {
      console.error("Error saving customer:", error);
      toast({
        title: isEditing ? (dictionary?.customers?.form?.saveErrorTitle || dictionary?.common?.unexpectedError) : (dictionary?.customers?.form?.saveErrorTitle || dictionary?.common?.unexpectedError), // Use optional chaining and fallback
        description: error.message || dictionary?.common?.unexpectedError, // Use optional chaining and fallback
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary?.customers?.form?.firstNameLabel || "First Name"} *</FormLabel> {/* Use optional chaining */}
                <div> {/* Removed FormControl */}
                  <Input placeholder={dictionary?.customers?.form?.firstNamePlaceholder} {...field} disabled={isLoading} /> {/* Use optional chaining */}
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
                <FormLabel>{dictionary?.customers?.form?.lastNameLabel || "Last Name"} *</FormLabel> {/* Use optional chaining */}
                <div> {/* Removed FormControl */}
                  <Input placeholder={dictionary?.customers?.form?.lastNamePlaceholder} {...field} disabled={isLoading} /> {/* Use optional chaining */}
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
              <FormLabel>{dictionary?.customers?.form?.emailLabel || "Email"}</FormLabel> {/* Use optional chaining */}
              <div> {/* Removed FormControl */}
                <Input type="email" placeholder={dictionary?.customers?.form?.emailPlaceholder} {...field} disabled={isLoading} /> {/* Use optional chaining */}
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
              <FormLabel>{dictionary?.customers?.form?.phoneLabel || "Phone"}</FormLabel> {/* Use optional chaining */}
              <div> {/* Removed FormControl */}
                  <Input placeholder={dictionary?.customers?.form?.phonePlaceholder} {...field} disabled={isLoading} /> {/* Use optional chaining */}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary?.customers?.form?.dobLabel || "Date of Birth"}</FormLabel>
                <div>
                  <Input type="date" placeholder={dictionary?.customers?.form?.dobPlaceholder} {...field} disabled={isLoading} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address_line1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary?.customers?.form?.addressLine1Label || "Address Line 1"}</FormLabel>
                <div>
                  <Input placeholder={dictionary?.customers?.form?.addressLine1Placeholder} {...field} disabled={isLoading} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address_line2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary?.customers?.form?.addressLine2Label || "Address Line 2"}</FormLabel>
                <div>
                  <Input placeholder={dictionary?.customers?.form?.addressLine2Placeholder} {...field} disabled={isLoading} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary?.customers?.form?.cityLabel || "City"}</FormLabel>
                  <div>
                    <Input placeholder={dictionary?.customers?.form?.cityPlaceholder} {...field} disabled={isLoading} />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary?.customers?.form?.stateLabel || "State"}</FormLabel>
                  <div>
                    <Input placeholder={dictionary?.customers?.form?.statePlaceholder} {...field} disabled={isLoading} />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary?.customers?.form?.postalCodeLabel || "Postal Code"}</FormLabel>
                  <div>
                    <Input placeholder={dictionary?.customers?.form?.postalCodePlaceholder} {...field} disabled={isLoading} />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary?.customers?.form?.countryLabel || "Country"}</FormLabel>
                <div>
                  <Input placeholder={dictionary?.customers?.form?.countryPlaceholder} {...field} disabled={isLoading} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="insurance_provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary?.customers?.form?.insuranceProviderLabel || "Insurance Provider"}</FormLabel>
                <div>
                  <Input placeholder={dictionary?.customers?.form?.insuranceProviderPlaceholder} {...field} disabled={isLoading} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="insurance_policy_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary?.customers?.form?.insurancePolicyNumberLabel || "Insurance Policy Number"}</FormLabel>
                <div>
                  <Input placeholder={dictionary?.customers?.form?.insurancePolicyNumberPlaceholder} {...field} disabled={isLoading} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary?.customers?.form?.notesLabel || "Notes"}</FormLabel>
              <div>
                <Textarea
                  placeholder={dictionary?.customers?.form?.notesPlaceholder}
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
            ? (isEditing ? (dictionary?.common?.saving || "Saving...") : (dictionary?.common?.adding || "Adding...")) // Use optional chaining
            : (isEditing ? (dictionary?.common?.saveChanges || "Save Changes") : (dictionary?.common?.addCustomer || "Add Customer")) // Use optional chaining
          }
        </Button>
      </form>
    </Form>
  );
}
