"use client";

import * as React from "react";
import { useEffect, useState } from "react"; // Import hooks
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"; // Removed UseFormReturn import
import * as z from "zod";
import { formatISO, parseISO } from 'date-fns'; // For handling datetime-local

import { Button } from "@/components/ui/button";
import { type Profile } from "../../../types/supabase"; // Import Profile type
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
// Assuming Appointment type might be needed, adjust import path if necessary
// import { type Appointment } from "./columns"; // If columns file exists
import { type Customer } from "../customers/columns"; // Import Customer type for dropdown
import { User } from "@supabase/supabase-js"; // Import User type

// Define simple type for fetched dropdown data
type DropdownOption = { id: string; name: string };

// Define the form schema using Zod
const formSchema = z.object({
  customer_id: z.string().uuid({ message: "Please select a customer." }),
  appointment_time: z.string().refine((val) => {
    // Validate that the string can be parsed into a valid date
    try {
      return !!parseISO(val);
    } catch {
      return false;
    }
  }, { message: "Invalid date/time format." }),
  duration_minutes: z.coerce.number().int().min(5, { message: "Duration must be at least 5 minutes." }), // Keep coerce, remove default
  type: z.enum(['eye_exam', 'contact_lens_fitting', 'follow_up', 'frame_selection', 'other']),
  // provider_name: z.string().optional(), // Remove this
  provider_id: z.string().uuid({ message: "Invalid provider selected." }).optional().nullable(), // Add this
  notes: z.string().optional(),
  // Status will likely be set server-side or defaulted, not usually in the add form
});

type AppointmentFormValues = z.infer<typeof formSchema>;

// Import AppointmentData type from page component (adjust path if needed)
// Assuming AppointmentData is defined in ../appointments/page.tsx or similar
// If not, we might need to define it here or in a shared types file.
// For now, let's assume it's accessible via a relative path or a shared types location.
// If the type isn't directly importable, we might need to redefine a similar type here.
import { type AppointmentData } from "./page"; // Adjust path if needed

interface AppointmentFormProps {
  initialData?: AppointmentData | null; // For editing
  initialDateTime?: Date; // For setting time from calendar slot selection
  onSuccess?: () => void; // Callback after successful submission
  clinicSettings?: any; // Add clinicSettings prop
}

// Define simple type for fetched customer dropdown data
type CustomerOption = { id: string; name: string };

export function AppointmentForm({ initialData, initialDateTime, onSuccess }: AppointmentFormProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const isEditing = !!initialData;
  const [user, setUser] = useState<User | null>(null); // State for logged-in user
  const [customers, setCustomers] = React.useState<CustomerOption[]>([]);
  const [professionals, setProfessionals] = useState<DropdownOption[]>([]); // State for professionals
  const [isLoadingDropdowns, setIsLoadingDropdowns] = React.useState(true);
  const [clinicSettings, setClinicSettings] = useState<any>(null); // State for clinic settings
  const [isLoadingSettings, setIsLoadingSettings] = useState(true); // Loading state for settings


  // Fetch customers for dropdown
  React.useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingDropdowns(true);
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("id, first_name, last_name")
          .order("last_name");
        if (error) throw error;
        setCustomers(data?.map(c => ({
            id: c.id,
            name: `${c.last_name || ''}${c.last_name && c.first_name ? ', ' : ''}${c.first_name || ''}` || 'Unnamed Customer'
        })) || []);
      } catch (error: any) {
        console.error("Error fetching customers for dropdown:", error);
        toast({
          title: "Error loading form data",
          description: "Could not load customers.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    fetchCustomers();
  }, [supabase, toast]);

  // Fetch professionals for dropdown (Add this useEffect)
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        // First, get the ID of the 'professional' role
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("id")
          .eq("name", "professional")
          .single();

        if (roleError) throw roleError;

        const professionalRoleId = roleData.id;

        // Then, fetch profiles with that role_id
        const { data: professionalData, error: professionalError } = await supabase
          .from("profiles")
          .select("id, full_name") // Select id and full_name
          .eq("role_id", professionalRoleId) // Filter by role_id
          .order("full_name", { ascending: true }); // Order by full_name

        if (professionalError) throw professionalError;

         setProfessionals(professionalData?.map(p => ({
            id: p.id,
            name: p.full_name || 'Unnamed Professional' // Use full_name for display
        })) || []);

      } catch (error: any) {
        console.error("Error fetching professionals for dropdown:", error);
        toast({
          title: "Error loading professionals",
          description: "Could not load professional list.",
          variant: "destructive",
        });
      }
    };
    fetchProfessionals();
  }, [supabase, toast]); // Add supabase and toast to dependencies

  // Fetch logged-in user and clinic settings on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingSettings(true);
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUser(userData.user);

        if (userData.user) {
          const { data: settingsData, error: settingsError } = await supabase
            .from('clinic_settings')
            .select('default_slot_duration_minutes')
            .eq('clinic_id', userData.user.id) // Filter by user's profile ID
            .maybeSingle(); // Use maybeSingle()

          if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 means no rows found
            throw settingsError;
          }

          if (settingsData) {
            setClinicSettings(settingsData);
          }
        }

      } catch (error: any) {
        console.error("Error fetching clinic settings:", error);
        // Handle error silently for now, form will use default duration
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchData();
  }, [supabase]); // Dependency: supabase client


  // Define form (removed explicit type annotation)
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: initialData?.customer_id || "",
      // Prioritize initialDateTime from slot selection, then initialData for editing, then empty
      appointment_time: initialDateTime
        ? formatISO(initialDateTime, { representation: 'complete' }).substring(0, 16)
        : initialData?.appointment_time
          ? formatISO(new Date(initialData.appointment_time), { representation: 'complete' }).substring(0, 16)
          : "",
      duration_minutes: Number(initialData?.duration_minutes || clinicSettings?.default_slot_duration_minutes || 30), // Use fetched setting or default
      type: (initialData?.type || 'eye_exam') as AppointmentFormValues['type'], // Re-added explicit cast
      // provider_name: initialData?.provider_name || "", // Remove this
      provider_id: initialData?.provider_id || null, // Add this
      notes: initialData?.notes || "",
    },
  });

  // Update default duration when settings load
  useEffect(() => {
    if (clinicSettings && !isEditing) { // Only set default if adding new
      form.reset({
        ...form.getValues(), // Keep other values
        duration_minutes: Number(clinicSettings.default_slot_duration_minutes || 30),
      });
    }
  }, [clinicSettings, form, isEditing]); // Remove initialDateTime from dependencies


  const isLoading = form.formState.isSubmitting || isLoadingDropdowns || isLoadingSettings;

  // Define submit handler - Explicitly type 'values' with our Zod schema type
  const onSubmit = async (values: AppointmentFormValues) => {
    try {
      let error = null;

      // Convert local datetime string back to ISO string for Supabase
      const appointmentTimeISO = parseISO(values.appointment_time).toISOString();

      const appointmentData = {
        customer_id: values.customer_id,
        appointment_time: appointmentTimeISO,
        duration_minutes: values.duration_minutes,
        type: values.type,
        // provider_name: values.provider_name || null, // Remove this
        provider_id: values.provider_id || null, // Add this
        notes: values.notes || null,
        status: initialData?.status || 'scheduled', // Keep existing status if editing, default if adding
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        // Update logic
        const { error: updateError } = await supabase
          .from("appointments")
          .update(appointmentData)
          .eq("id", initialData.id);
        error = updateError;
      } else {
        // Insert logic
        const { error: insertError } = await supabase
          .from("appointments")
          .insert([appointmentData]);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: `Appointment ${isEditing ? "updated" : "scheduled"} successfully.`,
      });
      onSuccess?.(); // Call the success callback
      form.reset(); // Reset form

    } catch (error: any) {
      console.error("Error saving appointment:", error);
      toast({
        title: `Error ${isEditing ? "saving" : "scheduling"} appointment`,
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} disabled={isLoading || isEditing}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((cust) => (
                    <SelectItem key={cust.id} value={cust.id}>
                      {cust.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appointment_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date & Time *</FormLabel>
              <FormControl>
                {/* Use datetime-local for combined date and time input */}
                <Input type="datetime-local" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormField
          control={form.control}
          name="duration_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes) *</FormLabel>
              <FormControl>
                <Input type="number" min="5" step="5" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appointment Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="eye_exam">Eye Exam</SelectItem>
                  <SelectItem value="contact_lens_fitting">Contact Lens Fitting</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="frame_selection">Frame Selection</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="provider_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider</FormLabel> {/* Label for provider */}
              <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider (Optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                   {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.name} {/* Display professional's name */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional notes about the appointment..."
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
          {isLoading ? (isEditing ? "Saving..." : "Scheduling...") : (isEditing ? "Save Changes" : "Schedule Appointment")}
        </Button>
      </form>
    </Form>
  );
}
