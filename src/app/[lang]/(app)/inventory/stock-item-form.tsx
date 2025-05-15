"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Cookies from 'js-cookie'; // Import js-cookie
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
} from "@/components/ui/select"; // Keep Select import for now if needed elsewhere, but will replace in form
import { Combobox } from "@/components/ui/combobox"; // Import Combobox component
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

// Define the form schema using Zod
const createFormSchema = (dictionary: Dictionary) => z.object({
  product_id: z.string().uuid({ message: dictionary.inventory.stockItemForm.productRequired }), // Use dictionary
  serial_number: z.string().optional(),
  quantity: z.coerce.number().int().min(1, { message: dictionary.inventory.stockItemForm.quantityMin }), // Use dictionary
  cost_price: z.coerce.number().min(0, { message: dictionary.inventory.stockItemForm.costNonNegative }).optional().nullable(), // Use dictionary
  purchase_date: z.string().optional().nullable(), // Changed to string for type="date" input
  location: z.string().optional(),
  status: z.enum(['available', 'sold', 'damaged', 'returned']), // Removed .default() here // TODO: Localize Zod messages
});

type StockItemFormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface StockItemFormProps {
  initialData?: InventoryItem | null; // For editing existing item
  onSuccess?: () => void; // Callback after successful submission
  dictionary: Dictionary; // Add dictionary prop
  userTenantId: string | null; // Add userTenantId prop
}

// Define simple type for fetched product dropdown data
type ProductOption = { id: string; name: string };

export function StockItemForm({ initialData, onSuccess, dictionary, userTenantId }: StockItemFormProps) {
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
        // Read superuser and selected tenant cookies
        const isSuperuser = Cookies.get('is_superuser') === 'true';
        const selectedTenantId = Cookies.get('selected_tenant_id');

        let query = supabase
          .from("products")
          .select("id, name")
          .order("name");

        // Apply tenant filter if user is superuser AND a tenant is selected (via cookie/search param)
        // OR if user is NOT a superuser and userTenantId prop is available
        if (isSuperuser && selectedTenantId) {
          query = query.eq('tenant_id', selectedTenantId);
        } else if (!isSuperuser && userTenantId) {
           query = query.eq('tenant_id', userTenantId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
      } catch (error: any) {
        console.error("Error fetching products for dropdown:", error);
        toast({
          title: dictionary.inventory.stockItemForm.loadErrorTitle,
          description: error.message || dictionary.inventory.stockItemForm.loadErrorDescription,
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
      const stockData: any = { // Use any for now to easily add tenant_id
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
        // Add tenant_id for new stock items
        if (userTenantId) {
           stockData.tenant_id = userTenantId;
        }
        const { error: insertError } = await supabase
          .from("inventory_items")
          .insert([stockData]);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: dictionary.inventory.stockItemForm.saveSuccess,
      });
      onSuccess?.(); // Call the success callback
      form.reset(); // Reset form

    } catch (error: any) {
      console.error("Error saving stock item:", error);
      toast({
        title: dictionary.inventory.stockItemForm.saveErrorTitle,
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
          name="product_id"
          render={({ field }) => (
            <FormItem className="flex flex-col"> {/* Use flex-col for proper Combobox layout */}
              <FormLabel>{dictionary.inventory.stockItemForm.productLabel} *</FormLabel>
              <Combobox
                options={products.map(prod => ({ value: prod.id, label: prod.name }))}
                selectedValue={field.value}
                onSelectValue={field.onChange}
                placeholder={dictionary.inventory.stockItemForm.selectProductPlaceholder}
                specificSearchPlaceholder={dictionary.inventory.stockItemForm.searchProductPlaceholder} // Use specific prop
                specificNoResultsText={dictionary.inventory.stockItemForm.noProductFound} // Use specific prop
                disabled={isLoading || isEditing} // Disable product change when editing
                dictionary={dictionary} // Pass dictionary for localization
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="serial_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.inventory.stockItemForm.serialNumberLabel}</FormLabel>
              <FormControl>
                <Input placeholder={dictionary.inventory.stockItemForm.serialNumberPlaceholder} {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>
                {dictionary.inventory.stockItemForm.serialNumberDescription}
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
                    <FormLabel>{dictionary.inventory.stockItemForm.quantityLabel} *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="1" placeholder={dictionary.inventory.stockItemForm.quantityPlaceholder} {...field} disabled={isLoading} />
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
                    <FormLabel>{dictionary.inventory.stockItemForm.costPriceLabel}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder={dictionary.inventory.stockItemForm.costPricePlaceholder} {...field} value={field.value ?? ''} disabled={isLoading} />
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
                    <FormLabel>{dictionary.inventory.stockItemForm.purchaseDateLabel}</FormLabel>
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
                    <FormLabel>{dictionary.inventory.stockItemForm.locationLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={dictionary.inventory.stockItemForm.locationPlaceholder} {...field} disabled={isLoading} />
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
                <FormLabel>{dictionary.inventory.stockItemForm.statusLabel} *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={dictionary.inventory.stockItemForm.selectStatusPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">{dictionary.common.status.available}</SelectItem>
                    <SelectItem value="sold">{dictionary.common.status.sold}</SelectItem>
                    <SelectItem value="damaged">{dictionary.common.status.damaged}</SelectItem>
                    <SelectItem value="returned">{dictionary.common.status.returned}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? (isEditing ? dictionary.common.saving : dictionary.common.adding)
            : (isEditing ? dictionary.common.saveChanges : dictionary.common.addStockItem)
          }
        </Button>
      </form>
    </Form>
  );
}
