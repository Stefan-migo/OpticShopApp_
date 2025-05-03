"use client"; // Likely needs to be client component for interactivity

import * as React from "react";
import Link from "next/link"; // Import Link
import { Button } from "@/components/ui/button";
import { PlusCircle, ShoppingCart, Check, ChevronsUpDown, X } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

// Define type for customer options in combobox
type CustomerOption = {
  value: string; // customer id
  label: string; // customer name
};

// Define type for inventory item options in combobox
type StockItemOption = {
    value: string; // inventory_item id
    label: string; // e.g., "Brand Model (Serial: 123)" or "Brand Model (Qty: 5)"
    product_id: string;
    unit_price: number; // Store base price for calculation
    inventory_quantity: number; // Store available quantity
};

// Define type for items added to the current sale
type SaleLineItem = {
    inventory_item_id: string;
    product_id: string;
    label: string; // Display label (e.g., Brand Model SN:123)
    quantity: number; // Quantity being sold in this line
    unit_price: number;
    line_total: number;
};

export default function SalesPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [customers, setCustomers] = React.useState<CustomerOption[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = React.useState(true);
  const [stockItems, setStockItems] = React.useState<StockItemOption[]>([]);
  const [isLoadingStock, setIsLoadingStock] = React.useState(true);
  const [selectedStockItemId, setSelectedStockItemId] = React.useState<string | null>(null);
  const [currentOrderItems, setCurrentOrderItems] = React.useState<SaleLineItem[]>([]);
  const [subtotal, setSubtotal] = React.useState(0);
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [taxAmount, setTaxAmount] = React.useState(0); // This will now be calculated automatically
  const [finalTotal, setFinalTotal] = React.useState(0);
  const [isSavingSale, setIsSavingSale] = React.useState(false);
  const [defaultTaxRate, setDefaultTaxRate] = React.useState<number | null>(null);
  const [defaultTaxRateId, setDefaultTaxRateId] = React.useState<string | null>(null);


  // Function to fetch stock items (memoized)
   const fetchStock = React.useCallback(async () => {
      setIsLoadingStock(true);
      const { data, error } = await supabase
        .from("inventory_items")
        .select(`id, product_id, serial_number, quantity, products ( name, brand, model, base_price )`)
        .eq('status', 'available').gt('quantity', 0);
      if (error) { console.error("Error fetching stock items:", error); setStockItems([]); }
      else {
        setStockItems( data?.map((item) => {
            // Explicitly handle potential null for joined product and type check
            const product = (item.products && typeof item.products === 'object' && !Array.isArray(item.products))
              ? item.products as { name: string, brand: string | null, model: string | null, base_price: number }
              : null;
            return { value: item.id, label: `${product?.brand || ''} ${product?.name || 'Unknown Product'} ${product?.model || ''} (${item.serial_number ? `SN: ${item.serial_number}` : `Qty: ${item.quantity}`})`, product_id: item.product_id, unit_price: product?.base_price || 0, inventory_quantity: item.quantity };
          }) || [] );
      }
      setIsLoadingStock(false);
    }, [supabase]); // Dependency: supabase client instance

  // Fetch customers for combobox
  React.useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true);
      const { data, error } = await supabase
        .from("customers")
        .select("id, first_name, last_name")
        .order("last_name");
      if (error) { console.error("Error fetching customers:", error); setCustomers([]); }
      else { setCustomers( data?.map((c) => ({ value: c.id, label: `${c.last_name || ''}${c.last_name && c.first_name ? ', ' : ''}${c.first_name || ''}` || 'Unnamed Customer' })) || [] ); }
      setIsLoadingCustomers(false);
    };
    fetchCustomers();
  }, [supabase]);

  // Fetch initial stock items
  React.useEffect(() => {
    fetchStock();
  }, [fetchStock]); // Dependency: memoized fetchStock function

  // Fetch default tax rate
  React.useEffect(() => {
    const fetchDefaultTaxRate = async () => {
      const { data, error } = await supabase
        .from("tax_rates")
        .select("id, rate")
        .eq("is_default", true)
        .single();

      if (error) {
        console.error("Error fetching default tax rate:", error);
        setDefaultTaxRate(null);
        setDefaultTaxRateId(null);
        toast({
          title: "Warning",
          description: "Could not fetch default tax rate. Tax will not be calculated automatically.",
          variant: "destructive",
        });
      } else if (data) {
        setDefaultTaxRate(data.rate);
        setDefaultTaxRateId(data.id);
      } else {
         // No default tax rate found
         setDefaultTaxRate(null);
         setDefaultTaxRateId(null);
         toast({
            title: "Info",
            description: "No default tax rate is set. Tax will not be calculated automatically.",
            variant: "default",
         });
      }
    };

    fetchDefaultTaxRate();
  }, [supabase, toast]); // Dependencies: supabase client and toast


  // Function to add the selected stock item to the current order
  const handleAddItem = () => {
    if (!selectedStockItemId) return;
    const selectedItemOption = stockItems.find(item => item.value === selectedStockItemId);
    if (!selectedItemOption) return;
    const quantityToAdd = 1; // TODO: Allow specifying quantity
    const newLineItem: SaleLineItem = { inventory_item_id: selectedItemOption.value, product_id: selectedItemOption.product_id, label: selectedItemOption.label, quantity: quantityToAdd, unit_price: selectedItemOption.unit_price, line_total: quantityToAdd * selectedItemOption.unit_price };
    setCurrentOrderItems(prevItems => [...prevItems, newLineItem]);
    setSelectedStockItemId(null);
  };

  // Calculate subtotal whenever items change
  React.useEffect(() => {
    const newSubtotal = currentOrderItems.reduce((sum, item) => sum + item.line_total, 0);
    setSubtotal(newSubtotal);
  }, [currentOrderItems]);

  // Calculate tax amount and final total whenever subtotal, discount, or defaultTaxRate changes
  React.useEffect(() => {
    const calculatedTaxAmount = defaultTaxRate !== null ? subtotal * (defaultTaxRate / 100) : 0;
    setTaxAmount(calculatedTaxAmount); // Update taxAmount state

    const total = subtotal - discountAmount + calculatedTaxAmount; // Use calculated tax amount
    setFinalTotal(total >= 0 ? total : 0);
  }, [subtotal, discountAmount, defaultTaxRate]); // Add defaultTaxRate to dependencies


  // Function to remove an item from the current order by its index
  const handleRemoveItem = (indexToRemove: number) => {
    setCurrentOrderItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
  };

  // Function to record the sale
  const handleRecordSale = async () => {
    if (currentOrderItems.length === 0) {
      toast({ title: "Cannot record empty sale.", variant: "destructive" });
      return;
    }
    setIsSavingSale(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found.");

      // --- Transaction Start (Conceptual) ---
      const orderData = {
        customer_id: selectedCustomerId,
        user_id: user.id,
        total_amount: subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount, // Use the calculated taxAmount
        tax_rate_id: defaultTaxRateId, // Include the tax_rate_id
        final_amount: finalTotal,
        status: 'completed' as const
      };
      const { data: newOrder, error: orderError } = await supabase.from("sales_orders").insert(orderData).select().single();
      if (orderError || !newOrder) throw orderError || new Error("Failed to create sales order.");

      const orderItemsData = currentOrderItems.map(item => ({ order_id: newOrder.id, inventory_item_id: item.inventory_item_id, product_id: item.product_id, quantity: item.quantity, unit_price: item.unit_price, discount_amount: 0, line_total: item.line_total }));
      const { error: itemsError } = await supabase.from("sales_order_items").insert(orderItemsData);
      if (itemsError) throw itemsError; // TODO: Rollback order?

      const paymentData = { order_id: newOrder.id, amount: finalTotal, method: 'cash' as const };
      const { error: paymentError } = await supabase.from("payments").insert(paymentData);
      if (paymentError) throw paymentError; // TODO: Rollback order/items?

      // --- Update Inventory using RPC Function ---
      const inventoryUpdatePromises = currentOrderItems.map(item =>
        supabase.rpc('decrement_inventory', {
          item_id: item.inventory_item_id,
          quantity_sold: item.quantity
        })
      );

      // Wait for all inventory updates to attempt completion
      const updateResults = await Promise.allSettled(inventoryUpdatePromises);

      // Check for any failed inventory updates
      const failedUpdates = updateResults.filter(result => result.status === 'rejected');
      if (failedUpdates.length > 0) {
          // Log errors and potentially notify user, but proceed with sale confirmation for now
          failedUpdates.forEach((failure, index) => {
               console.error(`Failed to update inventory for item ID: ${currentOrderItems[index]?.inventory_item_id}`, (failure as PromiseRejectedResult).reason);
          });
          toast({
              title: "Warning: Inventory Update Issue",
              description: "Some inventory items might not have been updated correctly. Please verify stock levels.",
              variant: "destructive", // Use destructive to highlight potential issue
              duration: 10000, // Keep message longer
          });
          // In a real-world scenario, you might implement more complex rollback logic here
          // or prevent the sale if inventory update fails critically.
      }
      // --- Transaction End (Conceptual) ---

      toast({ title: "Sale recorded successfully!", description: `Order #${newOrder.order_number}` });

      // Reset POS state
      setCurrentOrderItems([]);
      setSelectedCustomerId(null);
      setSelectedStockItemId(null);
      setDiscountAmount(0);
      setTaxAmount(0); // Reset calculated tax amount
      fetchStock(); // Refresh stock list

    } catch (error: any) {
      console.error("Error recording sale:", error);
      toast({ title: "Error Recording Sale", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSavingSale(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Point of Sale</h1>
        <Button asChild variant="outline">
            <Link href="/sales/history">View Past Sales</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-3 border rounded-lg shadow-sm p-4 space-y-4">
           <h2 className="text-lg font-semibold">New Sale</h2>
           <div>
             <label className="text-sm font-medium mb-1 block">Customer</label>
             <Combobox options={customers} selectedValue={selectedCustomerId} onSelectValue={setSelectedCustomerId} placeholder="Select customer..." searchPlaceholder="Search customers..." noResultsText="No customer found." triggerClassName="w-[300px]" disabled={isLoadingCustomers || isSavingSale} />
           </div>
            <div>
             <label className="text-sm font-medium mb-1 block">Add Item</label>
             <div className="flex items-center gap-2">
                <Combobox options={stockItems} selectedValue={selectedStockItemId} onSelectValue={setSelectedStockItemId} placeholder="Select item..." searchPlaceholder="Search items..." noResultsText="No available stock found." triggerClassName="w-[400px]" disabled={isLoadingStock || isSavingSale} />
                <Button onClick={handleAddItem} disabled={!selectedStockItemId || isLoadingStock || isSavingSale}>
                    <PlusCircle className="mr-1 h-4 w-4" /> Add
                </Button>
             </div>
           </div>
           <div className="border rounded-md p-2 min-h-[100px]">
                <h3 className="text-sm font-medium mb-2">Current Sale Items</h3>
                {currentOrderItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No items added yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {currentOrderItems.map((item, index) => (
                            <li key={`${item.inventory_item_id}-${index}`} className="flex justify-between items-center border-b pb-1">
                                <div>
                                    <span className="font-medium">{item.label}</span>
                                    <span className="text-xs text-muted-foreground ml-2">Qty: {item.quantity}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{item.line_total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveItem(index)} disabled={isSavingSale}>
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Remove item</span>
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
           </div>
        </div>

        <div className="border rounded-lg shadow-sm p-4 flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
             <div className="flex justify-between items-center">
                 <span className="text-sm">Tax{defaultTaxRate !== null ? ` (${defaultTaxRate}%)` : ''}:</span>
                 <span>{taxAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
             <div className="flex justify-between items-center">
                <label htmlFor="discount" className="text-sm">Discount:</label>
                <Input id="discount" type="number" step="0.01" min="0" value={discountAmount} onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)} className="h-8 w-24 text-right" placeholder="0.00" disabled={isSavingSale} />
            </div>
             <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{finalTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
            <Button className="w-full mt-auto" disabled={currentOrderItems.length === 0 || isSavingSale} onClick={handleRecordSale}>
                {isSavingSale ? "Recording Sale..." : <><ShoppingCart className="mr-2 h-4 w-4" /> Process Payment / Record Sale</>}
            </Button>
        </div>
      </div>
    </div>
  );
}
