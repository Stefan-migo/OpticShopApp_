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

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(1, { message: "Product name is required." }).max(100),
  description: z.string().optional(),
  category_id: z.string().uuid({ message: "Please select a valid category." }).nullable(), // Allow null
  supplier_id: z.string().uuid({ message: "Please select a valid supplier." }).nullable(), // Allow null
  brand: z.string().optional(),
  model: z.string().optional(),
  base_price: z.coerce.number().min(0, { message: "Price must be non-negative." }), // Coerce input to number
  // attributes: z.string().optional(), // Consider JSON editor or key-value pairs later
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: Product | null; // For editing existing product
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
        toast({
          title: "Error loading form data",
          description: "Could not load categories or suppliers.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    fetchDropdownData();
  }, [supabase, toast]);

  // Define form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category_id: initialData?.category_id || null,
      supplier_id: initialData?.supplier_id || null,
      brand: initialData?.brand || "",
      model: initialData?.model || "",
      base_price: initialData?.base_price || 0,
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
        title: `Product ${isEditing ? "updated" : "added"} successfully.`,
      });
      onSuccess?.(); // Call the success callback
      form.reset(); // Reset form

    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: `Error ${isEditing ? "saving" : "adding"} product`,
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Ray-Ban Aviator" {...field} disabled={isLoading} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Product details..."
                  className="resize-none"
                  {...field}
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
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">-- None --</SelectItem>
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
                <FormLabel>Supplier</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                     <SelectItem value="null">-- None --</SelectItem>
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
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Ray-Ban" {...field} disabled={isLoading} />
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
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., RB3025" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
         </div>
        <FormField
          control={form.control}
          name="base_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Price *</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* TODO: Add field for attributes (JSON) */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Product")}
        </Button>
      </form>
    </Form>
  );
}
