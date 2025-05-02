"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
// import { CalendarIcon } from "lucide-react"; // Removed CalendarIcon import

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
import { Textarea } from "@/components/ui/textarea"; // Assuming needed for location/notes
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover, // Removed Popover imports as DatePicker is removed
  PopoverContent, // Removed Popover imports as DatePicker is removed
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { type InventoryItem } from "./stock-columns"; // Import InventoryItem type
import { type Product } from "./columns"; // Import Product type for dropdown

// Define the form schema using Zod
const formSchema = z.object({
  product_id: z.string().uuid({ message: "Please select a product." }),
  serial_number: z.string().optional(),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1." }),
  cost_price: z.coerce.number().min(0, { message: "Cost must be non-negative." }).optional().nullable(),
  purchase_date: z.string().optional().nullable(), // Changed to string for type="date" input
  location: z.string().optional(),
  status: z.enum(['available', 'sold', 'damaged', 'returned']), // Removed .default() here
});

type StockItemFormValues = z.infer<typeof formSchema>;

interface StockItemFormProps {
  initialData?: InventoryItem | null; // For editing existing item
  onSuccess?: () => void; // Callback after successful submission
}

// Define simple type for fetched product dropdown data
type ProductOption = { id: string; name: string };

export function StockItemForm({ initialData, onSuccess }: StockItemFormProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const isEditing = !!initialData;
  const [products, setProducts] = React.useState<ProductOption[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = React.useState(true);

  // Fetch products for dropdown
  React.useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingDropdowns(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name")
          .order("name");
        if (error) throw error;
        setProducts(data || []);
      } catch (error: any) {
        console.error("Error fetching products for dropdown:", error);
        toast({
          title: "Error loading form data",
          description: "Could not load products.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    fetchProducts();
  }, [supabase, toast]);

  // Define form
  const form = useForm<StockItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_id: initialData?.product_id || "",
      serial_number: initialData?.serial_number || "",
      quantity: initialData?.quantity || 1,
      cost_price: initialData?.cost_price || null,
      // Format date string for default value if editing, otherwise null
      purchase_date: initialData?.purchase_date
        ? new Date(initialData.purchase_date).toISOString().split('T')[0] // Format as 'yyyy-mm-dd'
        : null,
      location: initialData?.location || "",
      status: initialData?.status || 'available',
    },
  });

  const isLoading = form.formState.isSubmitting || isLoadingDropdowns;

  // Define submit handler
  async function onSubmit(values: StockItemFormValues) {
    try {
      let error = null;
      const stockData = {
        product_id: values.product_id,
        serial_number: values.serial_number || null,
        quantity: values.quantity,
        cost_price: values.cost_price,
        purchase_date: values.purchase_date || null,
        location: values.location || null,
        status: values.status,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        // Update logic
        const { error: updateError } = await supabase
          .from("inventory_items")
          .update(stockData)
          .eq("id", initialData.id);
        error = updateError;
      } else {
        // Insert logic
        const { error: insertError } = await supabase
          .from("inventory_items")
          .insert([stockData]);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: `Stock item ${isEditing ? "updated" : "added"} successfully.`,
      });
      onSuccess?.(); // Call the success callback
      form.reset(); // Reset form

    } catch (error: any) {
      console.error("Error saving stock item:", error);
      toast({
        title: `Error ${isEditing ? "saving" : "adding"} stock item`,
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
          name="product_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} disabled={isLoading || isEditing}> {/* Disable product change when editing */}
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id}>
                      {prod.name}
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
          name="serial_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial Number</FormLabel>
              <FormControl>
                <Input placeholder="Optional serial number" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>
                Leave blank if not applicable (e.g., for contact lenses).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                    <Input type="number" min="1" step="1" placeholder="1" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Cost Price</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <FormControl>
                      {/* Use standard HTML date input */}
                      <Input
                        type="date"
                        {...field}
                        value={field.value ?? ''} // Handle null value
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., Shelf A1, Display Case" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
         </div>
         <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Stock Item")}
        </Button>
      </form>
    </Form>
  );
}
