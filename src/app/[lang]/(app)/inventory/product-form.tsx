"use client";

import * as React from "react";
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
import { useDictionary } from '@/lib/i18n/dictionary-context'; // Import useDictionary hook

// Define the form schema using Zod
const createFormSchema = (dictionary: Dictionary) => z.object({
  name: z.string().min(1, { message: dictionary.inventory.productForm.nameRequired || "Product name is required." }).max(100), // Use dictionary
  description: z.string().optional(),
  category_id: z.string().uuid({ message: dictionary.inventory.productForm.invalidCategory || "Please select a valid category." }).nullable(), // Use dictionary
  supplier_id: z.string().uuid({ message: dictionary.inventory.productForm.invalidSupplier || "Please select a valid supplier." }).nullable(), // Use dictionary
  brand: z.string().optional(),
  model: z.string().optional(),
  base_price: z.coerce.number().min(0, { message: dictionary.inventory.productForm.priceNonNegative || "Price must be non-negative." }), // Use dictionary
  reorder_level: z.coerce.number().int().min(0, { message: dictionary.inventory.productForm.reorderLevelNonNegativeInteger || "Reorder level must be a non-negative integer." }).nullable().optional(), // Use dictionary
  // attributes: z.string().optional(), // Consider JSON editor or key-value pairs later
});

type ProductFormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface ProductFormProps {
  initialData?: Product | null; // For editing existing customer
  onSuccess?: () => void; // Callback after successful submission
}

// Define simple types for fetched dropdown data
type Category = { id: string; name: string };
type Supplier = { id: string; name: string };

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const isEditing = !!initialData;
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = React.useState(true);

  const dictionary = useDictionary(); // Get dictionary from context

  // Fetch categories and suppliers for dropdowns
  React.useEffect(() => {
    const fetchDropdownData = async () => {
      setIsLoadingDropdowns(true);
      try {
        const [categoryRes, supplierRes] = await Promise.all([
          supabase.from("product_categories").select("id, name").order("name"),
          supabase.from("suppliers").select("id, name").order("name"),
        ]);

        if (categoryRes.error) throw categoryRes.error;
        if (supplierRes.error) throw supplierRes.error;

        setCategories(categoryRes.data || []);
        setSuppliers(supplierRes.data || []);
      } catch (error: any) {
        console.error("Error fetching dropdown data:", error);
        // Use optional chaining for dictionary access
        toast({
          title: dictionary?.inventory?.productForm?.loadErrorTitle || "Error loading data", // Use dictionary directly
          description: dictionary?.inventory?.productForm?.loadErrorDescription || "Failed to load categories or suppliers.", // Use dictionary directly
          variant: "destructive",
        });
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    fetchDropdownData();
  }, [supabase, toast, dictionary]); // Add dictionary to dependencies

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
        title: dictionary?.inventory?.productForm?.saveSuccess || "Product saved successfully.", // Use dictionary directly
      });
      onSuccess?.(); // Call the success callback
      form.reset(); // Reset form

    } catch (error: any) {
      console.error("Error saving product:", error);
      // Use optional chaining for dictionary access
      toast({
        title: dictionary?.inventory?.productForm?.saveErrorTitle || "Error saving product.", // Use dictionary directly
        description: error.message || dictionary?.common?.unexpectedError || "An unexpected error occurred.", // Use dictionary directly
        variant: "destructive",
      });
    }
  }

  // No need for dictionary check here, useDictionary hook handles it

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.inventory.productForm.nameLabel} *</FormLabel> {/* Use dictionary directly */}
                <div> {/* Removed FormControl */}
                  <Input placeholder={dictionary.inventory.productForm.namePlaceholder} {...field} disabled={isLoading} /> {/* Use dictionary directly */}
                </div> {/* Close div */}
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.inventory.productForm.descriptionLabel}</FormLabel> {/* Use dictionary directly */}
              <div> {/* Removed FormControl */}
                <Textarea
                  placeholder={dictionary.inventory.productForm.descriptionPlaceholder}
                  className="resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </div> {/* Close div */}
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
                <FormLabel>{dictionary.inventory.productForm.categoryLabel}</FormLabel> {/* Use dictionary directly */}
                <div> {/* Removed FormControl */}
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={dictionary.inventory.productForm.selectCategoryPlaceholder} /> {/* Use dictionary directly */}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">{dictionary.common.none}</SelectItem> {/* Use dictionary directly */}
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> {/* Close div */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.inventory.productForm.supplierLabel}</FormLabel> {/* Use dictionary directly */}
                <div> {/* Removed FormControl */}
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={dictionary.inventory.productForm.selectSupplierPlaceholder} /> {/* Use dictionary directly */}
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="null">{dictionary.common.none}</SelectItem> {/* Use dictionary directly */}
                      {suppliers.map((sup) => (
                        <SelectItem key={sup.id} value={sup.id}>
                          {sup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> {/* Close div */}
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
                <FormLabel>{dictionary.inventory.productForm.brandLabel}</FormLabel> {/* Use dictionary directly */}
                <div> {/* Removed FormControl */}
                  <Input placeholder={dictionary.inventory.productForm.brandPlaceholder} {...field} disabled={isLoading} /> {/* Use dictionary directly */}
                </div> {/* Close div */}
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.inventory.productForm.modelLabel}</FormLabel> {/* Use dictionary directly */}
                <div> {/* Removed FormControl */}
                  <Input placeholder={dictionary.inventory.productForm.modelPlaceholder} {...field} disabled={isLoading} /> {/* Use dictionary directly */}
                </div> {/* Close div */}
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
              <FormLabel>{dictionary.inventory.productForm.reorderLevelLabel}</FormLabel> {/* Use dictionary directly */}
              <div> {/* Removed FormControl */}
                <Input
                  type="number"
                  step="1"
                  placeholder={dictionary.inventory.productForm.reorderLevelPlaceholder}
                  {...field}
                  value={field.value ?? ''} // Handle null/undefined by providing empty string
                  disabled={isLoading}
                />
              </div> {/* Close div */}
              <FormDescription>
                {dictionary.inventory.productForm.reorderLevelDescription} {/* Use dictionary directly */}
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
              <FormLabel>{dictionary.inventory.productForm.basePriceLabel} *</FormLabel> {/* Use dictionary directly */}
              <div> {/* Removed FormControl */}
                <Input type="number" step="0.01" placeholder={dictionary.inventory.productForm.basePricePlaceholder} {...field} disabled={isLoading} /> {/* Use dictionary directly */}
              </div> {/* Close div */}
              <FormMessage />
            </FormItem>
          )}
        />
        {/* TODO: Add field for attributes (JSON) */}
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? (isEditing ? dictionary.common.saving : dictionary.common.adding) // Use dictionary directly
            : (isEditing ? dictionary.common.saveChanges : dictionary.common.addProduct) // Use dictionary directly
          }
        </Button>
      </form>
    </Form>
  );
}
