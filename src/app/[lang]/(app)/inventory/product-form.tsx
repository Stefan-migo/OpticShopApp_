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
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { type Product } from "./columns"; // Import Product type
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface

// Define the form schema using Zod
const createFormSchema = (dictionary: Dictionary) => z.object({
  name: z.string().min(1, { message: dictionary.inventory.productForm.nameRequired }).max(100), // Use dictionary
  description: z.string().optional(),
  category_id: z.string().uuid({ message: dictionary.inventory.productForm.invalidCategory }).nullable(), // Use dictionary
  supplier_id: z.string().uuid({ message: dictionary.inventory.productForm.invalidSupplier }).nullable(), // Use dictionary
  brand: z.string().optional(),
  model: z.string().optional(),
  base_price: z.coerce.number().min(0, { message: dictionary.inventory.productForm.priceNonNegative }), // Use dictionary
  reorder_level: z.coerce.number().int().min(0, { message: dictionary.inventory.productForm.reorderLevelNonNegativeInteger }).nullable().optional(), // Use dictionary
  // attributes: z.string().optional(), // Consider JSON editor or key-value pairs later
});

type ProductFormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface ProductFormProps {
  initialData?: Product | null; // For editing existing customer
  onSuccess?: () => void; // Callback after successful submission
  dictionary: Dictionary; // Add dictionary prop
}

// Define simple types for fetched dropdown data
type Category = { id: string; name: string };
type Supplier = { id: string; name: string };

export function ProductForm({ initialData, onSuccess, dictionary }: ProductFormProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const isEditing = !!initialData;
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = React.useState(true);

  // Fetch categories and suppliers for dropdowns
  React.useEffect(() => {
    const fetchDropdownData = async () => {
      setIsLoadingDropdowns(true);
      try {
        // Read superuser and selected tenant cookies
        const isSuperuser = Cookies.get('is_superuser') === 'true';
        const selectedTenantId = Cookies.get('selected_tenant_id');

        let categoryQuery = supabase.from("product_categories").select("id, name").order("name");
        let supplierQuery = supabase.from("suppliers").select("id, name").order("name");

        // Apply tenant filter if superuser and a tenant is selected
        if (isSuperuser && selectedTenantId) {
          categoryQuery = categoryQuery.eq('tenant_id', selectedTenantId);
          supplierQuery = supplierQuery.eq('tenant_id', selectedTenantId);
        }

        const [categoryRes, supplierRes] = await Promise.all([
          categoryQuery,
          supplierQuery,
        ]);

        if (categoryRes.error) throw categoryRes.error;
        if (supplierRes.error) throw supplierRes.error;

        setCategories(categoryRes.data || []);
        setSuppliers(supplierRes.data || []);
      } catch (error: any) {
        console.error("Error fetching dropdown data:", error);
        toast({
          title: dictionary.inventory.productForm.loadErrorTitle,
          description: error.message || dictionary.inventory.productForm.loadErrorDescription,
          variant: "destructive",
        });
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    fetchDropdownData();
  }, [supabase, toast, dictionary]);

  // Define form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(createFormSchema(dictionary)), // Pass dictionary to schema function
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
      const productData = {
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
              <FormItem>
                <FormLabel>{dictionary.inventory.productForm.categoryLabel}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={dictionary.inventory.productForm.selectCategoryPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">{dictionary.common.none}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
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
            name="supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.inventory.productForm.supplierLabel}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={dictionary.inventory.productForm.selectSupplierPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="null">{dictionary.common.none}</SelectItem>
                    {suppliers.map((sup) => (
                      <SelectItem key={sup.id} value={sup.id}>
                        {sup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
}
