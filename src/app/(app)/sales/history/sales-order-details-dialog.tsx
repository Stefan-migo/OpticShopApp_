"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type SalesOrder } from "./columns"; // Import SalesOrder type
import { createClient } from "@/lib/supabase/client";
import { format, parseISO } from 'date-fns';

// Define types for related data
type SalesOrderItem = {
    id: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    products: { // Assuming join with products for name/details
        name: string | null;
        brand: string | null;
        model: string | null;
    } | null;
    inventory_items?: { // Optional join if needed for serial number
        serial_number: string | null;
    } | null;
};

type Payment = {
    id: string;
    payment_date: string;
    amount: number;
    method: string;
    transaction_ref: string | null;
};

interface SalesOrderDetailsDialogProps {
  order: SalesOrder | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to format date/time
const formatDisplayDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), 'PPpp'); // Format like "Sep 21, 2025, 1:00:00 PM"
  } catch (e) {
    return "Invalid Date";
  }
};

// Helper function to format currency
const formatDisplayCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

export function SalesOrderDetailsDialog({
  order,
  isOpen,
  onOpenChange,
}: SalesOrderDetailsDialogProps) {
  const supabase = createClient();
  const [items, setItems] = React.useState<SalesOrderItem[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && order) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch line items (joining with products)
          const { data: itemsData, error: itemsError } = await supabase
            .from('sales_order_items')
            .select(`
                id, quantity, unit_price, line_total,
                products ( name, brand, model ),
                inventory_items ( serial_number )
            `)
            .eq('order_id', order.id);

          if (itemsError) throw itemsError;
           // Explicitly cast, ensuring products/inventory_items are treated as objects or null
          const typedItemsData = itemsData?.map(item => ({
              ...item,
              products: (item.products && typeof item.products === 'object' && !Array.isArray(item.products))
                  ? item.products as { name: string | null; brand: string | null; model: string | null }
                  : null,
              inventory_items: (item.inventory_items && typeof item.inventory_items === 'object' && !Array.isArray(item.inventory_items))
                  ? item.inventory_items as { serial_number: string | null }
                  : null,
          })) || [];
          setItems(typedItemsData as SalesOrderItem[]);


          // Fetch payments
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .eq('order_id', order.id);

          if (paymentsError) throw paymentsError;
          setPayments(paymentsData as Payment[]);

        } catch (err: any) {
          console.error("Error fetching order details:", err);
          setError("Failed to load order details.");
          setItems([]);
          setPayments([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    } else {
      // Reset state when dialog closes or order is null
      setItems([]);
      setPayments([]);
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen, order, supabase]);

  if (!order) return null;

  const customerName = order.customers
    ? `${order.customers.last_name || ''}${order.customers.last_name && order.customers.first_name ? ', ' : ''}${order.customers.first_name || ''}`.trim() || 'N/A'
    : 'Walk-in Customer';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl"> {/* Wider dialog */}
        <DialogHeader>
          <DialogTitle>Order Details: #{order.order_number}</DialogTitle>
          <DialogDescription>
            Details for order placed on {formatDisplayDateTime(order.order_date)}.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1"> {/* Scrollable content */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
                <div><span className="font-medium text-muted-foreground">Customer:</span> {customerName}</div>
                <div><span className="font-medium text-muted-foreground">Status:</span> <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="capitalize">{order.status}</Badge></div>
                <div><span className="font-medium text-muted-foreground">Order Date:</span> {formatDisplayDateTime(order.order_date)}</div>
                {/* Add user/staff who created order if needed */}
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            {/* Items Table */}
            <h4 className="font-medium mb-2">Items</h4>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Line Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading items...</TableCell></TableRow>
                    ) : items.length > 0 ? (
                        items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {item.products?.brand || ''} {item.products?.name || 'N/A'} {item.products?.model || ''}
                                    {item.inventory_items?.serial_number && <span className="text-xs text-muted-foreground ml-1">(SN: {item.inventory_items.serial_number})</span>}
                                </TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatDisplayCurrency(item.unit_price)}</TableCell>
                                <TableCell className="text-right">{formatDisplayCurrency(item.line_total)}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No items found for this order.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>

             {/* Totals Section */}
             <div className="mt-4 pt-2 border-t text-sm space-y-1 text-right mr-2">
                 <div><span className="font-medium text-muted-foreground">Subtotal:</span> {formatDisplayCurrency(order.total_amount)}</div>
                 <div><span className="font-medium text-muted-foreground">Discount:</span> -{formatDisplayCurrency(order.discount_amount)}</div>
                 <div><span className="font-medium text-muted-foreground">Tax:</span> +{formatDisplayCurrency(order.tax_amount)}</div>
                 <div className="font-bold text-base"><span className="font-medium text-muted-foreground">Total:</span> {formatDisplayCurrency(order.final_amount)}</div>
             </div>

             {/* Payments Table */}
             <h4 className="font-medium mt-4 mb-2">Payments</h4>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {isLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading payments...</TableCell></TableRow>
                    ) : payments.length > 0 ? (
                        payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>{formatDisplayDateTime(payment.payment_date)}</TableCell>
                                <TableCell className="capitalize">{payment.method}</TableCell>
                                <TableCell>{payment.transaction_ref || '-'}</TableCell>
                                <TableCell className="text-right">{formatDisplayCurrency(payment.amount)}</TableCell>
                            </TableRow>
                        ))
                     ) : (
                         <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No payments recorded for this order.</TableCell></TableRow>
                    )}
                </TableBody>
             </Table>

             {order.notes && (
                <div className="mt-4">
                <h4 className="font-medium mb-1">Order Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
                </div>
            )}

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
