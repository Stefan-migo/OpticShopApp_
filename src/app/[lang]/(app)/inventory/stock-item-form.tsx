"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
// import { CalendarIcon } from "lucide-react"; // Removed CalendarIcon import

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl, // Keep FormControl import for type definition if needed elsewhere, but won't be used directly in JSX
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
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface
import { useDictionary } from '@/lib/i18n/dictionary-context'; // Import useDictionary hook

// Define the form schema using Zod
const createFormSchema = (dictionary: Dictionary) => z.object({
  product_id: z.string().uuid({ message: dictionary.inventory.stockItemForm.productRequired || "Please select a product." }), // Use dictionary
  serial_number: z.string().optional(),
  quantity: z.coerce.number().int().min(1, { message: dictionary.inventory.stockItemForm.quantityMin || "Quantity must be at least 1." }), // Use dictionary
  cost_price: z.coerce.number().min(0, { message: dictionary.inventory.stockItemForm.costNonNegative || "Cost must be non-negative." }).optional().nullable(), // Use dictionary
  purchase_date: z.string().optional().nullable(), // Changed to string for type="date" input
  location: z.string().optional(),
  status: z.enum(['available', 'sold', 'damaged', 'returned']), // Removed .default() here // TODO: Localize Zod messages
});

type StockItemFormValues = z.infer<ReturnType<typeof createFormSchema>>;

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

  const dictionary = useDictionary(); // Get dictionary from context

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
        // Use optional chaining for dictionary access
        toast({
          title: dictionary?.inventory?.stockItemForm?.loadErrorTitle || "Error loading data", // Use dictionary directly
          description: dictionary?.inventory?.stockItemForm?.loadErrorDescription || "Failed to load products.", // Use dictionary directly
          variant: "destructive",
        });
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    fetchProducts();
  }, [supabase, toast, dictionary]); // Add dictionary to dependencies

  // Define form
  const form = useForm<StockItemFormValues>({
    resolver: zodResolver(createFormSchema(dictionary)), // Pass dictionary to schema function
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
        title: dictionary?.inventory?.stockItemForm?.saveSuccess || "Stock item saved successfully.", // Use dictionary directly
      });
      onSuccess?.(); // Call the success callback
      form.reset(); // Reset form

    } catch (error: any) {
      console.error("Error saving stock item:", error);
      // Use optional chaining for dictionary access
      toast({
        title: dictionary?.inventory?.stockItemForm?.saveErrorTitle || "Error saving stock item.", // Use dictionary directly
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
          name="product_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.inventory.stockItemForm.productLabel} *</FormLabel> {/* Use dictionary directly */}
              <div> {/* Removed FormControl */}
                <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} disabled={isLoading || isEditing}> {/* Disable product change when editing */}
                  <SelectTrigger>
                    <SelectValue placeholder={dictionary.inventory.stockItemForm.selectProductPlaceholder} /> {/* Use dictionary directly */}
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((prod) => (
                      <SelectItem key={prod.id} value={prod.id}>
                        {prod.name}
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
          name="serial_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.inventory.stockItemForm.serialNumberLabel}</FormLabel> {/* Use dictionary directly */}
              <div> {/* Removed FormControl */}
                <Input placeholder={dictionary.inventory.stockItemForm.serialNumberPlaceholder} {...field} disabled={isLoading} /> {/* Use dictionary directly */}
              </div> {/* Close div */}
              <FormDescription>
                {dictionary.inventory.stockItemForm.serialNumberDescription} {/* Use dictionary directly */}
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
                    <FormLabel>{dictionary.inventory.stockItemForm.quantityLabel} *</FormLabel> {/* Use dictionary directly */}
                    <div> {/* Removed FormControl */}
                      <Input type="number" min="1" step="1" placeholder={dictionary.inventory.stockItemForm.quantityPlaceholder} {...field} disabled={isLoading} /> {/* Use dictionary directly */}
                    </div> {/* Close div */}
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{dictionary.inventory.stockItemForm.costPriceLabel}</FormLabel> {/* Use dictionary directly */}
                    <div> {/* Removed FormControl */}
                      <Input type="number" step="0.01" placeholder={dictionary.inventory.stockItemForm.costPricePlaceholder} {...field} value={field.value ?? ''} disabled={isLoading} /> {/* Use dictionary directly */}
                    </div> {/* Close div */}
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
                    <FormLabel>{dictionary.inventory.stockItemForm.purchaseDateLabel}</FormLabel> {/* Use dictionary directly */}
                    <div> {/* Removed FormControl */}
                      {/* Use standard HTML date input */}
                      <Input
                        type="date"
                        {...field}
                        value={field.value ?? ''} // Handle null value
                        disabled={isLoading}
                      />
                    </div> {/* Close div */}
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{dictionary.inventory.stockItemForm.locationLabel}</FormLabel> {/* Use dictionary directly */}
                    <div> {/* Removed FormControl */}
                      <Input placeholder={dictionary.inventory.stockItemForm.locationPlaceholder} {...field} disabled={isLoading} /> {/* Use dictionary directly */}
                    </div> {/* Close div */}
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
                <FormLabel>{dictionary.inventory.stockItemForm.statusLabel} *</FormLabel> {/* Use dictionary directly */}
                <div> {/* Removed FormControl */}
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={dictionary.inventory.stockItemForm.selectStatusPlaceholder} /> {/* Use dictionary directly */}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">{dictionary.common.status.available}</SelectItem> {/* Use dictionary directly */}
                        <SelectItem value="sold">{dictionary.common.status.sold}</SelectItem> {/* Use dictionary directly */}
                        <SelectItem value="damaged">{dictionary.common.status.damaged}</SelectItem> {/* Use dictionary directly */}
                        <SelectItem value="returned">{dictionary.common.status.returned}</SelectItem> {/* Use dictionary directly */}
                      </SelectContent>
                    </Select>
                  </div> {/* Close div */}
                <FormMessage />
              </FormItem>
            )}
          />

        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? (isEditing ? dictionary.common.saving : dictionary.common.adding) // Use dictionary directly
            : (isEditing ? dictionary.common.saveChanges : dictionary.common.addStockItem) // Use dictionary directly
          }
        </Button>
      </form>
    </Form>
  );
}
