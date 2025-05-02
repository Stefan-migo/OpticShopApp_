"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Need RadioGroup
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { type Prescription } from "./columns"; // Import Prescription type
import { type Customer } from "../customers/columns"; // Import Customer type for dropdown

// TODO: Add RadioGroup component using shadcn-ui add

// --- Zod Schemas for Parameters ---
const glassesParamsSchema = z.object({
  sph: z.coerce.number().optional().nullable(),
  cyl: z.coerce.number().optional().nullable(),
  axis: z.coerce.number().int().min(0).max(180).optional().nullable(),
  add: z.coerce.number().optional().nullable(),
  prism: z.string().optional().nullable(), // Prism often includes base direction (e.g., "1.5 BI")
});

const contactLensParamsSchema = z.object({
  sph: z.coerce.number().optional().nullable(),
  cyl: z.coerce.number().optional().nullable(),
  axis: z.coerce.number().int().min(0).max(180).optional().nullable(),
  bc: z.coerce.number().optional().nullable(), // Base Curve
  dia: z.coerce.number().optional().nullable(), // Diameter
  brand: z.string().optional().nullable(),
});

// --- Main Form Schema ---
const formSchema = z.object({
  customer_id: z.string().uuid({ message: "Please select a customer." }),
  prescriber_name: z.string().optional(),
  prescription_date: z.string().refine((val) => !!val, { message: "Prescription date is required." }), // Required string
  expiry_date: z.string().optional().nullable(),
  type: z.enum(['glasses', 'contact_lens']),
  notes: z.string().optional(),
  // Conditional OD/OS params based on 'type'
  od_sph: z.coerce.number().optional().nullable(),
  od_cyl: z.coerce.number().optional().nullable(),
  od_axis: z.coerce.number().int().min(0).max(180).optional().nullable(),
  od_add: z.coerce.number().optional().nullable(), // Glasses only
  od_prism: z.string().optional().nullable(), // Glasses only
  od_bc: z.coerce.number().optional().nullable(), // Contacts only
  od_dia: z.coerce.number().optional().nullable(), // Contacts only
  od_brand: z.string().optional().nullable(), // Contacts only

  os_sph: z.coerce.number().optional().nullable(),
  os_cyl: z.coerce.number().optional().nullable(),
  os_axis: z.coerce.number().int().min(0).max(180).optional().nullable(),
  os_add: z.coerce.number().optional().nullable(), // Glasses only
  os_prism: z.string().optional().nullable(), // Glasses only
  os_bc: z.coerce.number().optional().nullable(), // Contacts only
  os_dia: z.coerce.number().optional().nullable(), // Contacts only
  os_brand: z.string().optional().nullable(), // Contacts only
});

type PrescriptionFormValues = z.infer<typeof formSchema>;

interface PrescriptionFormProps {
  initialData?: Prescription | null; // For editing existing prescription
  onSuccess?: () => void; // Callback after successful submission
}

// Define simple type for fetched customer dropdown data
type CustomerOption = { id: string; name: string };

export function PrescriptionForm({ initialData, onSuccess }: PrescriptionFormProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const isEditing = !!initialData;
  const [customers, setCustomers] = React.useState<CustomerOption[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = React.useState(true);

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

  // Helper to parse JSONB params from initialData
  const parseInitialParams = (params: any) => {
      if (!params) return {};
      try {
          return typeof params === 'string' ? JSON.parse(params) : params;
      } catch (e) {
          console.error("Error parsing initial params:", e);
          return {};
      }
  }

  const initialOdParams = parseInitialParams(initialData?.od_params);
  const initialOsParams = parseInitialParams(initialData?.os_params);

  // Define form
  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: initialData?.customer_id || "",
      prescriber_name: initialData?.prescriber_name || "",
      prescription_date: initialData?.prescription_date
        ? new Date(initialData.prescription_date).toISOString().split('T')[0]
        : "", // Default to empty string, required validation handles it
      expiry_date: initialData?.expiry_date
        ? new Date(initialData.expiry_date).toISOString().split('T')[0]
        : null,
      type: initialData?.type || 'glasses', // Default to glasses
      notes: initialData?.notes || "",
      // OD Params
      od_sph: initialOdParams.sph ?? null,
      od_cyl: initialOdParams.cyl ?? null,
      od_axis: initialOdParams.axis ?? null,
      od_add: initialOdParams.add ?? null,
      od_prism: initialOdParams.prism ?? null,
      od_bc: initialOdParams.bc ?? null,
      od_dia: initialOdParams.dia ?? null,
      od_brand: initialOdParams.brand ?? null,
      // OS Params
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

  const isLoading = form.formState.isSubmitting || isLoadingDropdowns;
  const prescriptionType = form.watch("type"); // Watch the type field

  // Define submit handler
  async function onSubmit(values: PrescriptionFormValues) {
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

      // Remove null/undefined values from params before saving
      const cleanParams = (params: Record<string, any>) =>
        Object.entries(params)
          .filter(([_, v]) => v !== null && v !== undefined && v !== '')
          .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

      const prescriptionData = {
        customer_id: values.customer_id,
        prescriber_name: values.prescriber_name || null,
        prescription_date: values.prescription_date, // Already string 'yyyy-mm-dd'
        expiry_date: values.expiry_date || null,
        type: values.type,
        notes: values.notes || null,
        od_params: cleanParams(odParams),
        os_params: cleanParams(osParams),
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        // Update logic
        const { error: updateError } = await supabase
          .from("prescriptions")
          .update(prescriptionData)
          .eq("id", initialData.id);
        error = updateError;
      } else {
        // Insert logic
        const { error: insertError } = await supabase
          .from("prescriptions")
          .insert([prescriptionData]);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: `Prescription ${isEditing ? "updated" : "added"} successfully.`,
      });
      onSuccess?.(); // Call the success callback
      form.reset(); // Reset form

    } catch (error: any) {
      console.error("Error saving prescription:", error);
      toast({
        title: `Error ${isEditing ? "saving" : "adding"} prescription`,
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }

  // Helper component for parameter inputs
  const ParamInput = ({ control, namePrefix, label, placeholder, type = "number", step = "0.25" }: any) => (
     <FormField
        control={control}
        name={`${namePrefix}_${label.toLowerCase()}`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">{label}</FormLabel>
            <FormControl>
              <Input
                type={type}
                step={type === "number" ? step : undefined}
                placeholder={placeholder}
                {...field}
                value={field.value ?? ''}
                disabled={isLoading}
                className="h-8 text-sm" // Smaller input
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1"> {/* Scrollable */}
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
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Prescription Type *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                  disabled={isLoading}
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="glasses" />
                    </FormControl>
                    <FormLabel className="font-normal">Glasses</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="contact_lens" />
                    </FormControl>
                    <FormLabel className="font-normal">Contact Lenses</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="prescription_date"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Prescription Date *</FormLabel>
                    <FormControl>
                    <Input type="date" {...field} value={field.value ?? ''} disabled={isLoading} />
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
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                    <Input type="date" {...field} value={field.value ?? ''} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <FormField
            control={form.control}
            name="prescriber_name"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Prescriber</FormLabel>
                <FormControl>
                <Input placeholder="Dr. Smith" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />

        {/* OD Parameters */}
        <div className="border p-3 rounded-md">
            <h4 className="font-medium mb-2">OD (Right Eye)</h4>
            <div className={`grid grid-cols-3 md:grid-cols-4 lg:grid-cols-${prescriptionType === 'glasses' ? 5 : 4} gap-2`}>
                <ParamInput control={form.control} namePrefix="od" label="SPH" placeholder="-1.00" />
                <ParamInput control={form.control} namePrefix="od" label="CYL" placeholder="-0.50" />
                <ParamInput control={form.control} namePrefix="od" label="Axis" placeholder="90" type="number" step="1" />
                {prescriptionType === 'glasses' && (
                    <>
                        <ParamInput control={form.control} namePrefix="od" label="Add" placeholder="+1.75" />
                        <ParamInput control={form.control} namePrefix="od" label="Prism" placeholder="1.5 BI" type="text" />
                    </>
                )}
                 {prescriptionType === 'contact_lens' && (
                    <>
                        <ParamInput control={form.control} namePrefix="od" label="BC" placeholder="8.6" step="0.1" />
                        <ParamInput control={form.control} namePrefix="od" label="Dia" placeholder="14.2" step="0.1" />
                        <ParamInput control={form.control} namePrefix="od" label="Brand" placeholder="Acuvue Oasys" type="text" />
                    </>
                )}
            </div>
        </div>

         {/* OS Parameters */}
        <div className="border p-3 rounded-md">
            <h4 className="font-medium mb-2">OS (Left Eye)</h4>
             <div className={`grid grid-cols-3 md:grid-cols-4 lg:grid-cols-${prescriptionType === 'glasses' ? 5 : 4} gap-2`}>
                <ParamInput control={form.control} namePrefix="os" label="SPH" placeholder="-1.25" />
                <ParamInput control={form.control} namePrefix="os" label="CYL" placeholder="-0.75" />
                <ParamInput control={form.control} namePrefix="os" label="Axis" placeholder="85" type="number" step="1" />
                {prescriptionType === 'glasses' && (
                    <>
                        <ParamInput control={form.control} namePrefix="os" label="Add" placeholder="+1.75" />
                        <ParamInput control={form.control} namePrefix="os" label="Prism" placeholder="1.5 BO" type="text" />
                    </>
                )}
                 {prescriptionType === 'contact_lens' && (
                    <>
                        <ParamInput control={form.control} namePrefix="os" label="BC" placeholder="8.6" step="0.1" />
                        <ParamInput control={form.control} namePrefix="os" label="Dia" placeholder="14.2" step="0.1" />
                        <ParamInput control={form.control} namePrefix="os" label="Brand" placeholder="Acuvue Oasys" type="text" />
                    </>
                )}
            </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes about the prescription..."
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
          {isLoading ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Prescription")}
        </Button>
      </form>
    </Form>
  );
}
