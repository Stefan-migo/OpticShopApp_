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
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface

// Define simple type for fetched dropdown data
type DropdownOption = { id: string; name: string };

// --- Form Schema ---
// Define the form schema using Zod with localized messages
const createFormSchema = (dictionary: Dictionary) => z.object({
  record_date: z.string().refine((val) => !!val, { message: dictionary.medicalActions.recordForm.recordDateRequired || "Record date is required." }),
  professional_id: z.string().uuid({ message: dictionary.medicalActions.recordForm.invalidProfessional || "Invalid professional selected." }).optional().nullable(),
  chief_complaint: z.string().optional().nullable(),
  diagnosis: z.string().optional().nullable(),
  examination_findings: z.string().optional().nullable(),
  medical_history: z.string().optional().nullable(),
  treatment_plan: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type MedicalRecordFormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface MedicalRecordFormProps {
  customerId: string; // Medical record must be linked to a customer
  initialData?: MedicalRecord | null; // For editing existing record
  onSuccess?: () => void; // Callback after successful submission
  dictionary: Dictionary | null | undefined; // Use the imported Dictionary interface and allow null/undefined
}

export function MedicalRecordForm({ customerId, initialData, onSuccess, dictionary }: MedicalRecordFormProps) {
  // Add conditional rendering check for dictionary
  if (!dictionary) {
    // You can return a loading indicator or null here
    return <div>Loading language resources...</div>; // Or <SomeLoadingSpinner />
  }

  // Now dictionary is guaranteed to be non-null and loaded
  const { toast } = useToast();
  const supabase = createClient();
  const isEditing = !!initialData;
  const [professionals, setProfessionals] = useState<DropdownOption[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);

  // Fetch professionals for dropdown
  useEffect(() => {
    if (!dictionary) return; // Ensure dictionary is loaded before fetching data
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
          name: p.full_name || dictionary.common.unnamedProfessional // Use dictionary directly
        })) || []);
      } catch (error: any) {
        console.error("Error fetching professionals for dropdown:", error);
        toast({
          title: dictionary.medicalActions.recordForm.loadErrorTitle, // Use dictionary directly
          description: dictionary.medicalActions.recordForm.loadErrorDescription || dictionary.common.unexpectedError, // Use dictionary directly
          variant: "destructive",
        });
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    fetchProfessionals();
  }, [supabase, toast, dictionary]); // Add dictionary to dependencies

  // Define form
  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(createFormSchema(dictionary)), // Pass dictionary to schema function
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
    // Explicit check within onSubmit scope
    if (!dictionary) {
      console.error("onSubmit called but dictionary is null!"); // Log error if this impossible state occurs
      toast({ title: "Error", description: "Internal error: Missing resources.", variant: "destructive" });
      return; // Prevent execution
    }

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

      // Dictionary access is now safe due to the check at the start of onSubmit
      toast({
        title: dictionary.medicalActions.recordForm.saveSuccess || `Record ${isEditing ? 'updated' : 'added'} successfully.`,
      });
      onSuccess?.(); // Call the success callback
      if (!isEditing) { // Only reset if adding
        form.reset();
      }

    } catch (error: any) {
      console.error("Error saving medical record:", error);
      // Dictionary access is now safe due to the check at the start of onSubmit
      toast({
        title: dictionary.medicalActions.recordForm.saveErrorTitle || `Error ${isEditing ? 'saving' : 'adding'} record.`,
        description: error.message || dictionary.common.unexpectedError || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 rounded-lg bg-element-bg shadow-neumorphic"> {/* Applied Neumorphic styles */}
        <FormField
          control={form.control}
          name="record_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.medicalActions.recordForm.recordDateLabel || "Record Date"} *</FormLabel> {/* Use dictionary directly */}
              <FormControl><Input type="date" {...field} value={field.value ?? ''} disabled={isLoading} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="professional_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.medicalActions.recordForm.professionalLabel || "Professional"}</FormLabel> {/* Use dictionary directly */}
              <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} disabled={isLoading}>
                <FormControl><SelectTrigger><SelectValue placeholder={dictionary.medicalActions.recordForm.selectProfessionalPlaceholder || "Select a professional (Optional)"} /></SelectTrigger></FormControl>
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
              <FormLabel>{dictionary.medicalActions.recordForm.chiefComplaintLabel || "Chief Complaint"}</FormLabel> {/* Use dictionary directly */}
              <FormControl><Textarea placeholder={dictionary.medicalActions.recordForm.chiefComplaintPlaceholder || "Enter chief complaint..."} className="resize-none" {...field} value={field.value ?? ''} disabled={isLoading} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.medicalActions.recordForm.diagnosisLabel || "Diagnosis"}</FormLabel> {/* Use dictionary directly */}
              <FormControl><Textarea placeholder={dictionary.medicalActions.recordForm.diagnosisPlaceholder || "Enter diagnosis..."} className="resize-none" {...field} value={field.value ?? ''} disabled={isLoading} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="examination_findings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.medicalActions.recordForm.examinationFindingsLabel || "Examination Findings"}</FormLabel> {/* Use dictionary directly */}
              <FormControl><Textarea placeholder={dictionary.medicalActions.recordForm.examinationFindingsPlaceholder || "Enter examination findings..."} className="resize-none" {...field} value={field.value ?? ''} disabled={isLoading} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medical_history"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.medicalActions.recordForm.medicalHistoryLabel || "Medical History"}</FormLabel> {/* Use dictionary directly */}
              <FormControl><Textarea placeholder={dictionary.medicalActions.recordForm.medicalHistoryPlaceholder || "Enter medical history..."} className="resize-none" {...field} value={field.value ?? ''} disabled={isLoading} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatment_plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.medicalActions.recordForm.treatmentPlanLabel || "Treatment Plan"}</FormLabel> {/* Use dictionary directly */}
              <FormControl><Textarea placeholder={dictionary.medicalActions.recordForm.treatmentPlanPlaceholder || "Enter treatment plan..."} className="resize-none" {...field} value={field.value ?? ''} disabled={isLoading} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.medicalActions.recordForm.notesLabel || "Notes"}</FormLabel> {/* Use dictionary directly */}
              <FormControl><Textarea placeholder={dictionary.medicalActions.recordForm.notesPlaceholder || "Additional notes..."} className="resize-none" {...field} value={field.value ?? ''} disabled={isLoading} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? dictionary.common.saving : dictionary.common.adding) : (isEditing ? dictionary.common.saveChanges : dictionary.medicalActions.recordForm.addRecordButton || "Add Record")} {/* Use dictionary directly */}
        </Button>
      </form>
    </Form>
  );
}
