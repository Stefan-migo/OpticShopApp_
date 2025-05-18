"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form"; // Import useFieldArray
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
import {
  Select,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox"; // Import Combobox
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { type PurchaseOrder, type PurchaseOrderItem } from "./columns"; // Import types
import { format } from "date-fns"; // For date formatting
import { PlusCircle, Trash2 } from "lucide-react"; // Icons
import Cookies from 'js-cookie'; // Import js-cookie
// Removed Popover, Calendar, CalendarIcon imports
import { cn } from "@/lib/utils"; // Utility for class names
import { useDictionary } from '@/lib/i18n/dictionary-context'; // Import useDictionary

// Import Combobox components
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Keep Popover for Combobox

// Define the form schema using Zod
const purchaseOrderItemSchema = z.object({
  id: z.string().uuid().optional(), // Add optional ID for existing items
  product_id: z.string().uuid({ message: "Please select a valid product." }),
  quantity_ordered: z.coerce.number().int().min(1, { message: "Quantity must be at least 1." }),
  unit_price: z.coerce.number().min(0, { message: "Unit price must be non-negative." }),
  // line_total will be calculated
});

const purchaseOrderFormSchema = z.object({
  supplier_id: z.string().uuid({ message: "Please select a valid supplier." }).nullable(),
  order_date: z.string({ required_error: "Order date is required." }), // Keep as string for datetime-local
  expected_delivery_date: z.string().nullable().optional(), // Keep as string for datetime-local
  status: z.string().optional(), // Make status optional to match PurchaseOrder type
  items: z.array(purchaseOrderItemSchema).min(1, { message: "At least one item is required." }),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>; // Export the type

interface PurchaseOrderFormProps {
  initialData?: PurchaseOrder | null; // For editing existing purchase order
  onSubmit: (values: PurchaseOrderFormValues) => void;
  isLoading: boolean;
}

// Define simple types for fetched dropdown data
type Supplier = { id: string; name: string };
type Product = { id: string; name: string; base_price: number }; // Include base_price for item price default

export function PurchaseOrderForm({ initialData, onSubmit, isLoading }: PurchaseOrderFormProps) {
  const dictionary = useDictionary(); // Get the dictionary
  const { toast } = useToast();
  const supabase = createClient();
  const isEditing = !!initialData;
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]); // Store all suppliers
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all products
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null); // State to hold selected tenant ID

  // State for search queries
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Effect to read selected tenant from cookie on initial load
  useEffect(() => {
    const storedTenantId = Cookies.get('selected_tenant_id');
    setSelectedTenantId(storedTenantId || null);
  }, []);


  // Fetch all suppliers and products for the tenant initially
  useEffect(() => {
    const fetchDropdownData = async () => {
      // Only fetch if a tenant is selected
      if (!selectedTenantId) {
        setIsLoadingDropdowns(false);
        setAllSuppliers([]); // Clear previous data
        setAllProducts([]); // Clear previous data
        return;
      }

      setIsLoadingDropdowns(true);
      try {
        const [supplierRes, productRes] = await Promise.all([
          supabase.from("suppliers")
            .select("id, name")
            .eq('tenant_id', selectedTenantId)
            .order("name"),
          supabase.from("products")
            .select("id, name, base_price")
            .eq('tenant_id', selectedTenantId)
            .order("name"),
        ]);

        if (supplierRes.error) throw supplierRes.error;
        if (productRes.error) throw productRes.error;

        setAllSuppliers(supplierRes.data || []);
        setAllProducts(productRes.data || []);
      } catch (error: any) {
        console.error("Error fetching dropdown data:", error);
        toast({
          title: "Error loading form data",
          description: "Could not load suppliers or products.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    fetchDropdownData();
  }, [supabase, toast, selectedTenantId]); // Dependency on selectedTenantId

  // Filter suppliers and products based on search query and initial limit
  const filteredSuppliers = React.useMemo(() => {
    const query = supplierSearchQuery.toLowerCase();
    const filtered = allSuppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(query)
    );
    if (query === '') {
      return filtered.slice(0, 3); // Limit to 3 if search is empty
    }
    return filtered;
  }, [allSuppliers, supplierSearchQuery]);

  const filteredProducts = React.useMemo(() => {
    const query = productSearchQuery.toLowerCase();
    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(query)
    );
     if (query === '') {
      return filtered.slice(0, 3); // Limit to 3 if search is empty
    }
    return filtered;
  }, [allProducts, productSearchQuery]);


  // Define form
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      supplier_id: initialData?.supplier_id || null,
      // Format dates to "YYYY-MM-DDThh:mm" string for datetime-local input
      order_date: initialData?.order_date ? format(new Date(initialData.order_date), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      expected_delivery_date: initialData?.expected_delivery_date ? format(new Date(initialData.expected_delivery_date), "yyyy-MM-dd'T'HH:mm") : null,
      status: initialData?.status || 'draft',
      items: initialData?.purchase_order_items.map(item => ({
        product_id: item.product_id,
        quantity_ordered: item.quantity_ordered,
        unit_price: item.unit_price,
      })) || [{ product_id: '', quantity_ordered: 1, unit_price: 0 }], // Default initial item
  },
});

const { fields, append, remove } = useFieldArray<PurchaseOrderFormValues>({ // Explicitly type useFieldArray
  control: form.control,
  name: "items",
});

  const handleAddItem = () => {
    append({ product_id: '', quantity_ordered: 1, unit_price: 0 });
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };

  const overallLoading = isLoading || isLoadingDropdowns;

  // Add Guard Clause for dictionary
  if (!dictionary) {
    return <div>Loading form resources...</div>; // Or a specific loading spinner
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8"> {/* Increased space-y */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-5"> {/* Increased gap */}
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem className="flex flex-col"> {/* Add flex flex-col */}
                <FormLabel>{dictionary.purchaseOrders?.form?.supplierLabel}</FormLabel>
                <Combobox
                  options={filteredSuppliers.map(sup => ({ value: sup.id, label: sup.name }))} // Use filtered suppliers
                  selectedValue={field.value}
                  onSelectValue={field.onChange}
                  placeholder={dictionary.purchaseOrders?.form?.selectSupplierPlaceholder}
                  specificSearchPlaceholder={dictionary.purchaseOrders?.form?.searchSupplierPlaceholder}
                  specificNoResultsText={dictionary.purchaseOrders?.form?.noSupplierFound}
                  disabled={overallLoading}
                  dictionary={dictionary}
                  onSearchChange={setSupplierSearchQuery} // Pass search change handler
                />
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-col w-max"> {/* Add flex flex-col */}
                <FormLabel>{dictionary.purchaseOrders?.form?.statusLabel}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={overallLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={dictionary.purchaseOrders?.form?.selectStatusPlaceholder} />
                    </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{dictionary.purchaseOrders?.form?.statusOptions?.draft}</SelectItem>
                    <SelectItem value="ordered">{dictionary.purchaseOrders?.form?.statusOptions?.ordered}</SelectItem>
                    <SelectItem value="received">{dictionary.purchaseOrders?.form?.statusOptions?.received}</SelectItem>
                    <SelectItem value="cancelled">{dictionary.purchaseOrders?.form?.statusOptions?.cancelled}</SelectItem>
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
            name="order_date"
            render={({ field }) => (
              <FormItem className="flex flex-col w-max"> {/* Added w-full */}
                <FormLabel>{dictionary.purchaseOrders?.form?.orderDateLabel}</FormLabel>
                 <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value || ''} // Ensure value is string or empty string
                      disabled={overallLoading}
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // Applied Shadcn Input styles
                    />
                  </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="expected_delivery_date"
            render={({ field }) => (
              <FormItem className="flex flex-col w-max"> {/* Added w-full */}
                <FormLabel>{dictionary.purchaseOrders?.form?.expectedDeliveryDateLabel}</FormLabel>
                 <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value || ''} // Ensure value is string or empty string
                      disabled={overallLoading}
                       className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // Applied Shadcn Input styles
                    />
                  </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{dictionary.purchaseOrders?.form?.itemsTitle}</h3>
           {fields.map((item, index) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border border-border p-4 rounded-md">
              <FormField
                control={form.control}
                name={`items.${index}.product_id`} // Use template literal for name
                render={({ field }) => (
                  <FormItem className="flex flex-col"> {/* Add flex flex-col */}
                    <FormLabel>{dictionary.purchaseOrders?.form?.productLabel}</FormLabel>
                     <Combobox
                      options={filteredProducts.map(prod => ({ value: prod.id, label: prod.name }))} // Use filtered products
                      selectedValue={field.value}
                      onSelectValue={(value: string | null) => {
                        field.onChange(value);
                        // Optional: Auto-fill unit price based on selected product's base price
                        const selectedProduct = allProducts.find(p => p.id === value); // Find from allProducts
                        if (selectedProduct) {
                           form.setValue(`items.${index}.unit_price`, selectedProduct.base_price, { shouldValidate: true }); // Set value and trigger validation
                        }
                      }}
                      placeholder={dictionary.purchaseOrders?.form?.selectProductPlaceholder}
                      specificSearchPlaceholder={dictionary.purchaseOrders?.form?.searchProductPlaceholder}
                      specificNoResultsText={dictionary.purchaseOrders?.form?.noProductFound}
                      disabled={overallLoading}
                      dictionary={dictionary}
                      onSearchChange={setProductSearchQuery} // Pass search change handler
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`items.${index}.quantity_ordered`} // Use template literal for name
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.purchaseOrders?.form?.quantityLabel}</FormLabel>
                      <Input type="number" step="1" min="1" placeholder="1" {...field} disabled={overallLoading} />
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`items.${index}.unit_price`} // Use template literal for name
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.purchaseOrders?.form?.unitPriceLabel}</FormLabel>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} disabled={overallLoading} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center h-full pt-6">
                 <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                  disabled={overallLoading || fields.length === 1} // Disable if only one item
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
           <Button type="button" variant="outline" onClick={handleAddItem} disabled={overallLoading}>
            <PlusCircle className="mr-2 h-4 w-4" /> {dictionary.purchaseOrders?.form?.addItemButton}
          </Button>
           {form.formState.errors.items && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.items.message}
              </p>
            )}
        </div>
        <Button type="submit" disabled={overallLoading}>
          {isEditing ? dictionary.purchaseOrders?.form?.saveChangesButton : dictionary.purchaseOrders?.form?.createPurchaseOrderButton}
        </Button>
      </form>
    </Form>
  );
}
