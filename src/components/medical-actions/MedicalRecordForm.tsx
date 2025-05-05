"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { type MedicalRecord } from "./MedicalHistoryDisplay"; // Import MedicalRecord type

// Define simple type for fetched dropdown data
type DropdownOption = { id: string; name: string };

// --- Form Schema ---
const formSchema = z.object({
  record_date: z.string().refine((val) => !!val, { message: "Record date is required." }),
  professional_id: z.string().uuid({ message: "Invalid professional selected." }).optional().nullable(),
  chief_complaint: z.string().optional().nullable(),
  diagnosis: z.string().optional().nullable(),
  examination_findings: z.string().optional().nullable(),
  medical_history: z.string().optional().nullable(),
  treatment_plan: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type MedicalRecordFormValues = z.infer<typeof formSchema>;

interface MedicalRecordFormProps {
  customerId: string; // Medical record must be linked to a customer
  initialData?: MedicalRecord | null; // For editing existing record
  onSuccess?: () => void; // Callback after successful submission
}

export function MedicalRecordForm({ customerId, initialData, onSuccess }: MedicalRecordFormProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const isEditing = !!initialData;
  const [professionals, setProfessionals] = useState<DropdownOption[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);

  // Fetch professionals for dropdown
  useEffect(() => {
    const fetchProfessionals = async () => {
      setIsLoadingDropdowns(true);
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
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("role_id", professionalRoleId)
          .order("full_name", { ascending: true });

        if (error) throw error;

         setProfessionals(data?.map(p => ({
            id: p.id,
            name: p.full_name || 'Unnamed Professional' // Use full_name for display
        })) || []);
      } catch (error: any) {
        console.error("Error fetching professionals for dropdown:", error);
        toast({
          title: "Error loading form data",
          description: "Could not load professionals.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    fetchProfessionals();
  }, [supabase, toast]);

  // Define form
  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      record_date: initialData?.record_date || "",
      professional_id: initialData?.professional_id || null,
      chief_complaint: initialData?.chief_complaint || null,
      diagnosis: initialData?.diagnosis || null,
      examination_findings: initialData?.examination_findings || null,
      medical_history: initialData?.medical_history || null,
      treatment_plan: initialData?.treatment_plan || null,
      notes: initialData?.notes || null,
    },
  });

  const isLoading = form.formState.isSubmitting || isLoadingDropdowns;

  // Define submit handler
  async function onSubmit(values: MedicalRecordFormValues) {
    try {
      let error = null;

      const medicalRecordData = {
        customer_id: customerId, // Link to the current customer
        record_date: values.record_date,
        professional_id: values.professional_id || null,
        chief_complaint: values.chief_complaint || null,
        diagnosis: values.diagnosis || null,
        examination_findings: values.examination_findings || null,
        medical_history: values.medical_history || null,
        treatment_plan: values.treatment_plan || null,
        notes: values.notes || null,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && initialData?.id) {
        // Update logic
        const { error: updateError } = await supabase
          .from("medical_records")
          .update(medicalRecordData)
          .eq("id", initialData.id);
        error = updateError;
      } else {
        // Insert logic
        const { error: insertError } = await supabase
          .from("medical_records")
          .insert([medicalRecordData]);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: `Medical Record ${isEditing ? "updated" : "added"} successfully.`,
      });
      onSuccess?.(); // Call the success callback
      form.reset(); // Reset form if adding, maybe not if editing? Depends on UX.

    } catch (error: any) {
      console.error("Error saving medical record:", error);
      toast({
        title: `Error ${isEditing ? "saving" : "adding"} medical record`,
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
          name="record_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Record Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ?? ''} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="professional_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a professional (Optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                   {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.name}
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
          name="chief_complaint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chief Complaint</FormLabel>
              <FormControl>
                <Textarea placeholder="Patient's main concern..." className="resize-none" {...field} value={field.value ?? ''} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnosis</FormLabel>
              <FormControl>
                <Textarea placeholder="Diagnosis details..." className="resize-none" {...field} value={field.value ?? ''} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="examination_findings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Examination Findings</FormLabel>
              <FormControl>
                <Textarea placeholder="Findings from the examination..." className="resize-none" {...field} value={field.value ?? ''} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medical_history"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical History</FormLabel>
              <FormControl>
                <Textarea placeholder="Relevant medical history..." className="resize-none" {...field} value={field.value ?? ''} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatment_plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment Plan</FormLabel>
              <FormControl>
                <Textarea placeholder="Outline of treatment plan..." className="resize-none" {...field} value={field.value ?? ''} disabled={isLoading} />
              </FormControl>
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
                <Textarea placeholder="Additional notes..." className="resize-none" {...field} value={field.value ?? ''} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Medical Record")}
        </Button>
      </form>
    </Form>
  );
}
