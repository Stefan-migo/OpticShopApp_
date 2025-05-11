"use client";

import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, Control, useController } from "react-hook-form";
import * as z from "zod";

import { getRoleDisplayNames } from "@/lib/roleConfig"; // Corrected import path
import { Dictionary } from '@/lib/i18n/types';
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { type Prescription } from "./columns";
import { type Customer } from "../customers/columns";
// import { type Database } from "@/lib/supabase/types/database.types"; // Import Database type

// Manually define Profile type as a workaround
type Profile = {
  id: string;
  full_name: string | null;
  role_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

import { TestNumberInputForm } from "@/components/TestNumberInputForm"; // Import the test component

// Define simple type for fetched dropdown data
type DropdownOption = { id: string; name: string };

// --- Zod Schema Definition ---
const createFormSchema = (dictionary: Dictionary) => z.object({
  // Make sure these keys exist in dictionary.prescriptions.form
  customer_id: z.string().uuid({ message: dictionary.prescriptions.form.customerRequired ?? "Please select a customer." }),
  medical_record_id: z.string().uuid({ message: dictionary.prescriptions.form.invalidMedicalRecord ?? "Invalid medical record selected." }).optional().nullable(),
  prescriber_id: z.string().uuid({ message: dictionary.prescriptions.form.invalidPrescriber ?? "Invalid prescriber selected." }).optional().nullable(),
  prescriber_name: z.string().optional(),
  prescription_date: z.string().refine((val) => !!val, { message: dictionary.prescriptions.form.prescriptionDateRequired ?? "Prescription date is required." }),
  expiry_date: z.string().optional().nullable(),
  type: z.enum(['glasses', 'contact_lens'], { errorMap: () => ({ message: "Please select a prescription type." }) }), // Added errorMap for enum
  notes: z.string().optional(),
  // OD/OS Params
  od_sph: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().optional().nullable()),
  od_cyl: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().optional().nullable()),
  od_axis: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().int().min(0).max(180).optional().nullable()),
  od_add: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().optional().nullable()), // Glasses only
  od_prism: z.string().optional().nullable(), // Glasses only
  od_bc: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().optional().nullable()), // Contacts only
  od_dia: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().optional().nullable()), // Contacts only
  od_brand: z.string().optional().nullable(), // Contacts only
  os_sph: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().optional().nullable()),
  os_cyl: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().optional().nullable()),
  os_axis: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().int().min(0).max(180).optional().nullable()),
  os_add: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().optional().nullable()), // Glasses only
  os_prism: z.string().optional().nullable(), // Glasses only
  os_bc: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().optional().nullable()), // Contacts only
  os_dia: z.preprocess((val) => (val === '' ? null : val), z.coerce.number().optional().nullable()), // Contacts only
  os_brand: z.string().optional().nullable(), // Contacts only
});

type PrescriptionFormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface PrescriptionFormProps {
  initialData?: Prescription | null;
  onSuccess?: () => void;
  customerId?: string;
  dictionary: Dictionary | null | undefined;
  isSuperuser: boolean; // Add isSuperuser prop
  tenantId: string | null; // Add tenantId prop
}

export function PrescriptionForm({ initialData, onSuccess, customerId: propCustomerId, dictionary, isSuperuser, tenantId }: PrescriptionFormProps) { // Add isSuperuser and tenantId props
  // Main Guard Clause
  if (!dictionary) {
    return <div>Loading language resources...</div>;
  }

  const { toast } = useToast();
  const supabase = createClient();
  const isEditing = !!initialData;
  const [customers, setCustomers] = useState<DropdownOption[]>([]);
  const [professionals, setProfessionals] = useState<DropdownOption[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<DropdownOption[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [isLoadingMedicalRecords, setIsLoadingMedicalRecords] = useState(false);

  // Memoize Schema
  const formSchema = useMemo(() => {
      return createFormSchema(dictionary);
  }, [dictionary]);

  // Parse Initial Params (Helper)
  const parseInitialParams = (params: any): Record<string, any> => {
      if (!params) return {};
      try {
          // Check if it's already an object (e.g., from DB JSONB)
          if (typeof params === 'object' && params !== null) return params;
          // Otherwise, try parsing if it's a string
          if (typeof params === 'string') return JSON.parse(params);
      } catch (e) {
          console.error("Error parsing initial params:", e);
      }
      return {}; // Return empty object if parsing fails or input is invalid
  };
  const initialOdParams = parseInitialParams(initialData?.od_params);
  const initialOsParams = parseInitialParams(initialData?.os_params);

  // Define Form
  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(formSchema),
    // Set default values carefully, using null where appropriate
    defaultValues: {
      customer_id: initialData?.customer_id || propCustomerId || "",
      medical_record_id: initialData?.medical_record_id || null,
      prescriber_id: initialData?.prescriber_id || null,
      // prescriber_name: initialData?.prescriber_name || null, // Consider removing if always fetching from profile
      prescription_date: initialData?.prescription_date ? new Date(initialData.prescription_date).toISOString().split('T')[0] : "",
      expiry_date: initialData?.expiry_date ? new Date(initialData.expiry_date).toISOString().split('T')[0] : null,
      type: initialData?.type || 'glasses',
      notes: initialData?.notes || "",
      od_sph: initialOdParams.sph ?? null,
      od_cyl: initialOdParams.cyl ?? null,
      od_axis: initialOdParams.axis ?? null,
      od_add: initialOdParams.add ?? null,
      od_prism: initialOdParams.prism ?? null,
      od_bc: initialOdParams.bc ?? null,
      od_dia: initialOdParams.dia ?? null,
      od_brand: initialOdParams.brand ?? null,
      os_sph: initialOsParams.sph ?? null,
      os_cyl: initialOsParams.cyl ?? null,
      os_axis: initialOsParams.axis ?? null,
      os_add: initialOsParams.add ?? null,
      os_prism: initialOsParams.prism ?? null,
      os_bc: initialOsParams.bc ?? null,
      os_dia: initialOsParams.dia ?? null,
      os_brand: initialOsParams.brand ?? null,
    },
  });

  const actualCustomerId = propCustomerId || form.watch("customer_id");
  const isLoading = form.formState.isSubmitting || isLoadingDropdowns;
  const prescriptionType = form.watch("type"); // Watch type for conditional rendering

  // useEffect for Dropdown Data...
  useEffect(() => {
    // Added !dictionary check inside just for extra safety, although outer check should cover it
    if (!dictionary) return;
    let isMounted = true; // Prevent state update on unmounted component
        const fetchData = async () => {
          setIsLoadingDropdowns(true);
          let customerRes, professionalRes; // Declare professionalRes here

          try {
            // Fetch customers only if propCustomerId is NOT provided
            if (!propCustomerId) {
                let customerQuery = supabase.from("customers").select("id, first_name, last_name").order("last_name");
                 // Apply tenant filter if user is superuser AND tenantId search parameter is present
                if (isSuperuser && tenantId) {
                  customerQuery = customerQuery.eq('tenant_id', tenantId);
                }
                customerRes = await customerQuery;
            } else {
                customerRes = { data: [], error: null }; // Placeholder if customers aren't needed
            }

            // Fetch professionals by joining profiles directly with roles
            // Assuming professionals are NOT tenant-specific, otherwise add tenant filter here
            professionalRes = await supabase.from("profiles")
                .select("id, full_name, roles(name)") // Select profile id, full_name, and joined role name
                .eq("roles.name", "professional") // Filter by role name 'professional'
                .order("full_name", { ascending: true });

            if (isMounted) {
                 if (customerRes.error) throw customerRes.error;
                 if (professionalRes.error) throw professionalRes.error;

                if (!propCustomerId) {
                    setCustomers(customerRes.data?.map((c: any) => ({
                        id: c.id,
                        name: `${c.last_name || ''}${c.last_name && c.first_name ? ', ' : ''}${c.first_name || ''}` || (dictionary.common.unnamedCustomer || 'Unnamed Customer')
                    })) || []);
                }

                // Map fetched professional profiles to dropdown options
                setProfessionals(professionalRes.data?.map((p: any) => ({
                    id: p.id,
                    name: p.full_name || (dictionary.common.unnamedProfessional || 'Unnamed Professional')
                })) || []);
            }

          } catch (error: any) {
            console.error("Error fetching form data:", error);
            if (isMounted) {
                toast({
                  title: dictionary.prescriptions.form.loadErrorTitle || "Error loading form data",
                  description: error.message || dictionary.prescriptions.form.loadErrorDescription || "Could not load customers or professionals.", // Use error.message for more details
                  variant: "destructive",
                });
            }
          } finally {
            if (isMounted) {
                setIsLoadingDropdowns(false);
            }
          }
        };
        fetchData();
        return () => { isMounted = false; }; // Cleanup
      }, [supabase, toast, propCustomerId, dictionary, isSuperuser, tenantId]); // Add isSuperuser and tenantId to dependencies


  // useEffect for Medical Records...
   useEffect(() => {
      if (!actualCustomerId || !dictionary) { // Add dictionary check here too
          setMedicalRecords([]);
          return;
      }

      let isMounted = true;
      const fetchMedicalRecords = async () => {
          setIsLoadingMedicalRecords(true);
          try {
              let query = supabase
                  .from("medical_records")
                  .select("id, record_date")
                  .eq("customer_id", actualCustomerId)
                  .order("record_date", { ascending: false });

              // Apply tenant filter if user is superuser AND tenantId search parameter is present
              if (isSuperuser && tenantId) {
                query = query.eq('tenant_id', tenantId);
              }

              const { data, error } = await query;


              if (isMounted) {
                  if (error) throw error;
                  setMedicalRecords(data?.map(rec => ({
                      id: rec.id,
                      name: `${dictionary.prescriptions.form.recordLabel || "Record"}: ${new Date(rec.record_date).toLocaleDateString()}` // Format date nicely
                  })) || []);
              }

          } catch (error: any) {
              console.error("Error fetching medical records:", error);
              if (isMounted) {
                  toast({
                      title: dictionary.prescriptions.form.loadMedicalRecordsErrorTitle || "Error loading medical records",
                      description: dictionary.prescriptions.form.loadMedicalRecordsErrorDescription || "Could not load medical records for the selected customer.",
                      variant: "destructive",
                  });
              }
          } finally {
              if (isMounted) {
                  setIsLoadingMedicalRecords(false);
              }
          }
        };

      fetchMedicalRecords();
      return () => { isMounted = false; }; // Cleanup

  }, [actualCustomerId, supabase, toast, dictionary, isSuperuser, tenantId]); // Add isSuperuser and tenantId to dependencies


  // --- MODIFIED onSubmit Handler ---
  async function onSubmit(values: PrescriptionFormValues) {
    if (!dictionary) {
      console.error("onSubmit called but dictionary is null!");
      toast({ title: "Error", description: "Internal error: Missing resources.", variant: "destructive" });
      return;
    }

    try {
      let error = null;

      // Construct OD/OS params based on type
      let odParams = {};
      let osParams = {};

      if (values.type === 'glasses') {
        odParams = { sph: values.od_sph, cyl: values.od_cyl, axis: values.od_axis, add: values.od_add, prism: values.od_prism };
        osParams = { sph: values.os_sph, cyl: values.os_cyl, axis: values.os_axis, add: values.os_add, prism: values.os_prism };
      } else { // contact_lens
        odParams = { sph: values.od_sph, cyl: values.od_cyl, axis: values.od_axis, bc: values.od_bc, dia: values.od_dia, brand: values.od_brand };
        osParams = { sph: values.os_sph, cyl: values.os_cyl, axis: values.os_axis, bc: values.os_bc, dia: values.os_dia, brand: values.os_brand };
      }

      const cleanParams = (params: Record<string, any>) => {
        const cleaned = Object.entries(params)
          .filter(([_, v]) => v !== null && v !== undefined && v !== '')
          .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
        return cleaned; // Return the cleaned object (will be {} if empty)
      };

      const prescriptionData = {
        customer_id: actualCustomerId,
        prescriber_id: values.prescriber_id || null,
        // prescriber_name: values.prescriber_name || null, // Consider removing if always fetching from profile
        medical_record_id: values.medical_record_id || null,
        prescription_date: values.prescription_date,
        expiry_date: values.expiry_date || null,
        type: values.type,
        notes: values.notes || null,
        od_params: cleanParams(odParams),
        os_params: cleanParams(osParams),
        updated_at: new Date().toISOString(),
        // Include tenant_id for new records if user is superuser and tenantId is selected
        ...(isEditing ? {} : (isSuperuser && tenantId ? { tenant_id: tenantId } : {})),
      };

      console.log({ values, prescriptionData }); // Added logging

      if (isEditing && initialData) {
        const { error: updateError } = await supabase
          .from("prescriptions")
          .update(prescriptionData)
          .eq("id", initialData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("prescriptions")
          .insert([prescriptionData])
          .select(); // Add select if you need the inserted data back
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: dictionary.prescriptions.form.saveSuccess || `Prescription ${isEditing ? "updated" : "added"} successfully.`,
      });
      onSuccess?.();
      if (!isEditing) { // Reset form only when adding, not editing
          form.reset();
      }

    } catch (error: any) {
      console.error("Error saving prescription:", error);
      toast({
        title: dictionary.prescriptions.form.saveErrorTitle || `Error ${isEditing ? "saving" : "adding"} prescription`,
        description: error.message || dictionary.common.unexpectedError || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }

   // --- Render Logic ---
   return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pb-4"> {/* Added pb-4 for scroll padding */}

        {/* Customer Selection */}
        {!propCustomerId && (
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.prescriptions.form.customerLabel || "Customer"} *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""} // Changed || "" to ?? ""
                    disabled={isLoading || isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={dictionary.prescriptions.form.selectCustomerPlaceholder || "Select a customer"} />
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
        )}

        {/* Medical Record Selection */}
        {actualCustomerId && (
             <FormField
              control={form.control}
              name="medical_record_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.prescriptions.form.medicalRecordLabel || "Link to Medical Record"}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      console.log("Medical Record Select Change:", value); // Added console log
                      field.onChange(value);
                    }}
                    value={field.value ?? ""} // Changed || "" to ?? ""
                    disabled={isLoading || isLoadingMedicalRecords}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={dictionary.prescriptions.form.selectMedicalRecordPlaceholder || "Select a medical record (Optional)"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={null as any}>{dictionary.common.none || "-- None --"}</SelectItem> {/* Changed value to null */}
                      {medicalRecords.map((record) => (
                        <SelectItem key={record.id} value={record.id}>
                          {record.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
             />
        )}

        {/* Prescriber Selection */}
         <FormField
          control={form.control}
          name="prescriber_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.prescriptions.form.prescriberLabel || "Prescriber"}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? ""} // Changed || "" to ?? ""
                disabled={isLoading}
               >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={dictionary.prescriptions.form.selectPrescriberPlaceholder || "Select a prescriber (Optional)"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                   <SelectItem value={null as any}>{dictionary.common.none || "-- None --"}</SelectItem> {/* Changed value to null */}
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

        {/* Type Selection */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{dictionary.prescriptions.form.typeLabel || "Prescription Type"} *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex space-x-4"
                  disabled={isLoading}
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="glasses" id="type-glasses" />
                    </FormControl>
                    <FormLabel htmlFor="type-glasses" className="font-normal">{dictionary.prescriptions.form.typeGlasses || "Glasses"}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="contact_lens" id="type-contact-lens" />
                    </FormControl>
                    <FormLabel htmlFor="type-contact-lens" className="font-normal">{dictionary.prescriptions.form.typeContactLens || "Contact Lenses"}</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
         />

        {/* Date Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="prescription_date"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>{dictionary.prescriptions.form.prescriptionDateLabel || "Prescription Date"} *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiry_date"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>{dictionary.prescriptions.form.expiryDateLabel || "Expiry Date"}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )}
            />
        </div>

        {/* OD Parameters */}
        <div className="border p-3 rounded-md">
            <h4 className="font-medium mb-2">{dictionary.prescriptions.form.odTitle || "OD (Right Eye)"}</h4>
            <div className={`grid grid-cols-3 md:grid-cols-4 lg:grid-cols-${prescriptionType === 'glasses' ? 5 : 4} gap-2`}>
                <FormField
                  control={form.control}
                  name="od_sph"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.sphLabel || "SPH"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder={dictionary.prescriptions.form.paramPlaceholders.sphPlaceholder || "-1.00"}
                          {...field}
                          value={field.value ?? ''} // Explicitly handle null/undefined for display
                          disabled={isLoading}
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="od_cyl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.cylLabel || "CYL"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder={dictionary.prescriptions.form.paramPlaceholders.cylPlaceholder || "-0.50"}
                          {...field}
                          value={field.value ?? ''} // Explicitly handle null/undefined for display
                          disabled={isLoading}
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="od_axis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.axisLabel || "Axis"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder={dictionary.prescriptions.form.paramPlaceholders.axisPlaceholder || "90"}
                          {...field}
                          value={field.value ?? ''} // Explicitly handle null/undefined for display
                          disabled={isLoading}
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                {prescriptionType === 'glasses' && (
                    <>
                       <FormField
                          control={form.control}
                          name="od_add"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.addLabel || "Add"}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.25"
                                  placeholder={dictionary.prescriptions.form.paramPlaceholders.addPlaceholder || "+1.75"}
                                  {...field}
                                  value={field.value ?? ''} // Explicitly handle null/undefined for display
                                  disabled={isLoading}
                                  className="h-8 text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="od_prism"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.prismLabel || "Prism"}</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder={dictionary.prescriptions.form.paramPlaceholders.prismPlaceholder || "1.5 BI"}
                                  {...field}
                                  value={field.value ?? ''} // Explicitly handle null/undefined for display
                                  disabled={isLoading}
                                  className="h-8 text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                    </>
                )}
                {prescriptionType === 'contact_lens' && (
                    <>
                        <FormField
                          control={form.control}
                          name="od_bc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.bcLabel || "BC"}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder={dictionary.prescriptions.form.paramPlaceholders.bcPlaceholder || "8.6"}
                                  {...field}
                                  value={field.value ?? ''} // Explicitly handle null/undefined for display
                                  disabled={isLoading}
                                  className="h-8 text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="od_dia"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.diaLabel || "Dia"}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder={dictionary.prescriptions.form.paramPlaceholders.diaPlaceholder || "14.2"}
                                  {...field}
                                  value={field.value ?? ''} // Explicitly handle null/undefined for display
                                  disabled={isLoading}
                                  className="h-8 text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="od_brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.brandLabel || "Brand"}</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder={dictionary.prescriptions.form.paramPlaceholders.brandPlaceholder || "Acuvue Oasys"}
                                  {...field}
                                  value={field.value ?? ''} // Explicitly handle null/undefined for display
                                  disabled={isLoading}
                                  className="h-8 text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                    </>
                )}
            </div>
        </div>

        {/* OS Parameters */}
        <div className="border p-3 rounded-md">
            <h4 className="font-medium mb-2">{dictionary.prescriptions.form.osTitle || "OS (Left Eye)"}</h4>
             <div className={`grid grid-cols-3 md:grid-cols-4 lg:grid-cols-${prescriptionType === 'glasses' ? 5 : 4} gap-2`}>
                <FormField
                  control={form.control}
                  name="os_sph"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.sphLabel || "SPH"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder={dictionary.prescriptions.form.paramPlaceholders.sphPlaceholder || "-1.25"}
                          {...field}
                          value={field.value ?? ''} // Explicitly handle null/undefined for display
                          disabled={isLoading}
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="os_cyl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.cylLabel || "CYL"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder={dictionary.prescriptions.form.paramPlaceholders.cylPlaceholder || "-0.75"}
                          {...field}
                          value={field.value ?? ''} // Explicitly handle null/undefined for display
                          disabled={isLoading}
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="os_axis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.axisLabel || "Axis"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder={dictionary.prescriptions.form.paramPlaceholders.axisPlaceholder || "85"}
                          {...field}
                          value={field.value ?? ''} // Explicitly handle null/undefined for display
                          disabled={isLoading}
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                {prescriptionType === 'glasses' && (
                    <>
                        <FormField
                          control={form.control}
                          name="os_add"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.addLabel || "Add"}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.25"
                                  placeholder={dictionary.prescriptions.form.paramPlaceholders.addPlaceholder || "+1.75"}
                                  {...field}
                                  value={field.value ?? ''} // Explicitly handle null/undefined for display
                                  disabled={isLoading}
                                  className="h-8 text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="os_prism"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.prismLabel || "Prism"}</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder={dictionary.prescriptions.form.paramPlaceholders.prismPlaceholder || "1.5 BO"}
                                  {...field}
                                  value={field.value ?? ''} // Explicitly handle null/undefined for display
                                  disabled={isLoading}
                                  className="h-8 text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                    </>
                )}
                {prescriptionType === 'contact_lens' && (
                    <>
                        <FormField
                          control={form.control}
                          name="os_bc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.bcLabel || "BC"}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder={dictionary.prescriptions.form.paramPlaceholders.bcPlaceholder || "8.6"}
                                  {...field}
                                  value={field.value ?? ''} // Explicitly handle null/undefined for display
                                  disabled={isLoading}
                                  className="h-8 text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="os_dia"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.diaLabel || "Dia"}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder={dictionary.prescriptions.form.paramPlaceholders.diaPlaceholder || "14.2"}
                                  {...field}
                                  value={field.value ?? ''} // Explicitly handle null/undefined for display
                                  disabled={isLoading}
                                  className="h-8 text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="os_brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{dictionary.prescriptions.form.paramLabels.brandLabel || "Brand"}</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder={dictionary.prescriptions.form.paramPlaceholders.brandPlaceholder || "Acuvue Oasys"}
                                  {...field}
                                  value={field.value ?? ''} // Explicitly handle null/undefined for display
                                  disabled={isLoading}
                                  className="h-8 text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                    </>
                )}
            </div>
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.prescriptions.form.notesLabel || "Notes"}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={dictionary.prescriptions.form.notesPlaceholder || "Additional notes about the prescription..."}
                  className="resize-none"
                  {...field}
                  value={field.value || ''}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? (isEditing ? (dictionary.common.saving || "Saving...") : (dictionary.common.adding || "Adding..."))
            : (isEditing ? (dictionary.common.saveChanges || "Save Changes") : (dictionary.common.addPrescription || "Add Prescription"))
          }
        </Button>
      </form>
    </Form>
  );
}

