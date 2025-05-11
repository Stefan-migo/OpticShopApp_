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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { type PurchaseOrder, type PurchaseOrderItem } from "./columns"; // Import types
import { format } from "date-fns"; // For date formatting
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react"; // Icons
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // For date picker
import { Calendar } from "@/components/ui/calendar"; // Date picker
import { cn } from "@/lib/utils"; // Utility for class names

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
  order_date: z.date({ required_error: "Order date is required." }),
  expected_delivery_date: z.date().nullable().optional(),
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
  const { toast } = useToast();
  const supabase = createClient();
  const isEditing = !!initialData;
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);

  // Fetch suppliers and products for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      setIsLoadingDropdowns(true);
      try {
        const [supplierRes, productRes] = await Promise.all([
          supabase.from("suppliers").select("id, name").order("name"),
          supabase.from("products").select("id, name, base_price").order("name"), // Fetch base_price
        ]);

        if (supplierRes.error) throw supplierRes.error;
        if (productRes.error) throw productRes.error;

        setSuppliers(supplierRes.data || []);
        setProducts(productRes.data || []);
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
  }, [supabase, toast]);

  // Define form
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      supplier_id: initialData?.supplier_id || null,
      order_date: initialData?.order_date ? new Date(initialData.order_date) : new Date(),
      expected_delivery_date: initialData?.expected_delivery_date ? new Date(initialData.expected_delivery_date) : null,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined} disabled={overallLoading}>
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
           <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={overallLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
              <FormItem className="flex flex-col">
                <FormLabel>Order Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                         disabled={overallLoading}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="expected_delivery_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expected Delivery Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                         disabled={overallLoading}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date (Optional)</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ?? undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Items</h3>
           {fields.map((item, index) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border p-4 rounded-md">
              <FormField
                control={form.control}
                name={`items.${index}.product_id`} // Use template literal for name
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Optional: Auto-fill unit price based on selected product's base price
                        const selectedProduct = products.find(p => p.id === value);
                        if (selectedProduct) {
                           form.setValue(`items.${index}.unit_price`, selectedProduct.base_price, { shouldValidate: true }); // Set value and trigger validation
                        }
                      }}
                      value={field.value}
                      disabled={overallLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
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
                name={`items.${index}.quantity_ordered`} // Use template literal for name
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="1" placeholder="1" {...field} disabled={overallLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name={`items.${index}.unit_price`} // Use template literal for name
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} disabled={overallLoading} />
                    </FormControl>
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
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
           {form.formState.errors.items && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.items.message}
              </p>
            )}
        </div>


        <Button type="submit" disabled={overallLoading}>
          {isEditing ? "Save Changes" : "Create Purchase Order"}
        </Button>
      </form>
    </Form>
  );
}
