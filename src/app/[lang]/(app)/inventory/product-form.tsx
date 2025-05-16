"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Cookies from 'js-cookie'; // Import js-cookie

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
} from "@/components/ui/select"; // Keep Select import for now if needed elsewhere, but will replace in form
import { Combobox } from "@/components/ui/combobox"; // Import Combobox component
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { type Product } from "./columns"; // Import Product type
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface

type ProductFormValues = z.infer<z.ZodObject<{ // Define type based on the inlined schema
  name: z.ZodString;
  description: z.ZodOptional<z.ZodString>;
  category_id: z.ZodNullable<z.ZodString>;
  supplier_id: z.ZodNullable<z.ZodString>;
  brand: z.ZodOptional<z.ZodString>;
  model: z.ZodOptional<z.ZodString>;
  base_price: z.ZodNumber;
  reorder_level: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
  // attributes: z.ZodOptional<z.ZodString>;
}>>;

interface ProductFormProps {
  initialData?: Product | null; // For editing existing customer
  onSuccess?: () => void; // Callback after successful submission
  dictionary: Dictionary; // Add dictionary prop
  userTenantId: string | null; // Add userTenantId prop
  onCategoryAdded?: () => void; // New prop to trigger category refetch
}

// Define simple types for fetched dropdown data
type Category = { id: string; name: string };
type Supplier = { id: string; name: string };

export type ProductFormRef = {
  fetchCategories: () => Promise<void>;
};

export const ProductForm = React.forwardRef<ProductFormRef, ProductFormProps>(
  ({ initialData, onSuccess, dictionary, userTenantId, onCategoryAdded }, ref) => {
  const { toast } = useToast();
  const supabase = createClient();
  const isEditing = !!initialData;
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = React.useState(true);

  // Function to fetch categories
  const fetchCategories = async () => {
     try {
        // Read superuser and selected tenant cookies
        const isSuperuser = Cookies.get('is_superuser') === 'true';
        const selectedTenantId = Cookies.get('selected_tenant_id');

        let categoryQuery = supabase.from("product_categories").select("id, name").order("name");

        // Apply tenant filter if user is superuser AND a tenant is selected (via cookie/search param)
        // OR if user is NOT a superuser and userTenantId prop is available
        if (isSuperuser && selectedTenantId) {
          categoryQuery = categoryQuery.eq('tenant_id', selectedTenantId);
        } else if (!isSuperuser && userTenantId) {
           categoryQuery = categoryQuery.eq('tenant_id', userTenantId);
        }

        const { data: categoryData, error: categoryError } = await categoryQuery;

        if (categoryError) throw categoryError;
        setCategories(categoryData || []);
     } catch (error: any) {
        console.error("Error fetching categories:", error);
        toast({
          title: dictionary.inventory.productForm.loadErrorTitle,
          description: error.message || dictionary.inventory.productForm.loadErrorDescription,
          variant: "destructive",
        });
     }
  };

  // Function to fetch suppliers
  const fetchSuppliers = async () => {
     try {
        // Read superuser and selected tenant cookies
        const isSuperuser = Cookies.get('is_superuser') === 'true';
        const selectedTenantId = Cookies.get('selected_tenant_id');

        let supplierQuery = supabase.from("suppliers").select("id, name").order("name");

        // Apply tenant filter if user is superuser AND a tenant is selected (via cookie/search param)
        // OR if user is NOT a superuser and userTenantId prop is available
        if (isSuperuser && selectedTenantId) {
          supplierQuery = supplierQuery.eq('tenant_id', selectedTenantId);
        } else if (!isSuperuser && userTenantId) {
           supplierQuery = supplierQuery.eq('tenant_id', userTenantId);
        }

        const { data: supplierData, error: supplierError } = await supplierQuery;

        if (supplierError) throw supplierError;
        setSuppliers(supplierData || []);
     } catch (error: any) {
        console.error("Error fetching suppliers:", error);
        toast({
          title: dictionary.inventory.productForm.loadErrorTitle,
          description: error.message || dictionary.inventory.productForm.loadErrorDescription,
          variant: "destructive",
        });
     }
  };


  // Fetch categories and suppliers for dropdowns on mount
  React.useEffect(() => {
    const fetchDropdownData = async () => {
      setIsLoadingDropdowns(true);
      await Promise.all([fetchCategories(), fetchSuppliers()]); // Fetch both concurrently
      setIsLoadingDropdowns(false);
    };
    fetchDropdownData();
  }, [supabase, toast, dictionary, userTenantId]); // Add userTenantId to dependencies

  // Define the form schema using Zod (inlined and memoized)
  const formSchema = React.useMemo(() => z.object({
    name: z.string().min(1, { message: dictionary.inventory.productForm.nameRequired }).max(100), // Access dictionary directly
    description: z.string().optional(),
    category_id: z.string().uuid({ message: dictionary.inventory.productForm.invalidCategory }).nullable(),
    supplier_id: z.string().uuid({ message: dictionary.inventory.productForm.invalidSupplier }).nullable(),
    brand: z.string().optional(),
    model: z.string().optional(),
    base_price: z.coerce.number().min(0, { message: dictionary.inventory.productForm.priceNonNegative }),
    reorder_level: z.coerce.number().int().min(0, { message: dictionary.inventory.productForm.reorderLevelNonNegativeInteger }).nullable().optional(),
    // attributes: z.ZodOptional<z.ZodString>;
  }), [dictionary]); // Dependency remains dictionary

  // Define form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema), // Use the memoized schema
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category_id: initialData?.category_id || null,
      supplier_id: initialData?.supplier_id || null,
      brand: initialData?.brand || "",
      model: initialData?.model || "",
      base_price: initialData?.base_price || 0,
      reorder_level: initialData?.reorder_level || null, // Add reorder_level default value
    },
  });

  const isLoading = form.formState.isSubmitting || isLoadingDropdowns;

  // Define submit handler
  async function onSubmit(values: ProductFormValues) {
    try {
      let error = null;
      const productData: any = { // Use any for now to easily add tenant_id
        name: values.name,
        description: values.description || null,
        category_id: values.category_id || null,
        supplier_id: values.supplier_id || null,
        brand: values.brand || null,
        model: values.model || null,
        base_price: values.base_price,
        reorder_level: values.reorder_level || null, // Include reorder_level in productData
        // attributes: values.attributes ? JSON.parse(values.attributes) : null, // Handle attributes later
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        // Update logic
        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", initialData.id);
        error = updateError;
      } else {
        // Insert logic
        // Add tenant_id for new products
        if (userTenantId) {
           productData.tenant_id = userTenantId;
        }
        const { error: insertError } = await supabase
          .from("products")
          .insert([productData]); // No need for created_at, handled by default
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: dictionary.inventory.productForm.saveSuccess,
      });
      onSuccess?.(); // Call the success callback
      form.reset(); // Reset form

    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: dictionary.inventory.productForm.saveErrorTitle,
        description: error.message || dictionary.common.unexpectedError,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.inventory.productForm.nameLabel} *</FormLabel>
                <FormControl>
                  <Input placeholder={dictionary.inventory.productForm.namePlaceholder} {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.inventory.productForm.descriptionLabel}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={dictionary.inventory.productForm.descriptionPlaceholder}
                  className="resize-none"
                  {...field}
                  value={field.value ?? ''} // Handle null/undefined by providing empty string
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
            <FormItem className="flex flex-col"> {/* Use flex-col for proper Combobox layout */}
              <FormLabel>{dictionary.inventory.productForm.categoryLabel}</FormLabel>
              <Combobox
                options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                selectedValue={field.value}
                onSelectValue={field.onChange}
                placeholder={dictionary.inventory.productForm.selectCategoryPlaceholder}
                specificSearchPlaceholder={dictionary.inventory.productForm.searchCategoryPlaceholder} // Use specific prop
                specificNoResultsText={dictionary.inventory.productForm.noCategoryFound} // Use specific prop
                disabled={isLoading}
                dictionary={dictionary} // Pass dictionary for localization
              />
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem className="flex flex-col"> {/* Use flex-col for proper Combobox layout */}
                <FormLabel>{dictionary.inventory.productForm.supplierLabel}</FormLabel>
                 <Combobox
                    options={suppliers.map(sup => ({ value: sup.id, label: sup.name }))}
                    selectedValue={field.value}
                    onSelectValue={field.onChange}
                    placeholder={dictionary.inventory.productForm.selectSupplierPlaceholder}
                    specificSearchPlaceholder={dictionary.inventory.productForm.searchSupplierPlaceholder} // Use specific prop
                    specificNoResultsText={dictionary.inventory.productForm.noSupplierFound} // Use specific prop
                    disabled={isLoading}
                    dictionary={dictionary} // Pass dictionary for localization
                  />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.inventory.productForm.brandLabel}</FormLabel>
                <FormControl>
                  <Input placeholder={dictionary.inventory.productForm.brandPlaceholder} {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.inventory.productForm.modelLabel}</FormLabel>
                <FormControl>
                  <Input placeholder={dictionary.inventory.productForm.modelPlaceholder} {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
           />
         </div>
         <FormField
            control={form.control}
            name="reorder_level"
            render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.inventory.productForm.reorderLevelLabel}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1"
                  placeholder={dictionary.inventory.productForm.reorderLevelPlaceholder}
                  {...field}
                  value={field.value ?? ''} // Handle null/undefined by providing empty string
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                {dictionary.inventory.productForm.reorderLevelDescription}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="base_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.inventory.productForm.basePriceLabel} *</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder={dictionary.inventory.productForm.basePricePlaceholder} {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* TODO: Add field for attributes (JSON) */}
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? (isEditing ? dictionary.common.saving : dictionary.common.adding)
            : (isEditing ? dictionary.common.saveChanges : dictionary.common.addProduct)
          }
        </Button>
      </form>
    </Form>
  );
});

