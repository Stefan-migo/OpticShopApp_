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

import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface
import { useDictionary } from '@/lib/i18n/dictionary-context'; // Import useDictionary hook

interface SalesOrderDetailsDialogProps {
  order: SalesOrder | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // Remove dictionary prop as it will be accessed via context
  // dictionary: Dictionary;
}

// Helper function to format date/time
// Update helper to use useDictionary hook internally or accept dictionary
const formatDisplayDateTime = (dateString: string | null | undefined, dictionary: Dictionary) => { // Keep dictionary param for now, will refactor if needed
  if (!dateString) return dictionary.common.notAvailable; // Use dictionary directly
  try {
    // TODO: Localize date formatting based on locale and dictionary format string
    return format(parseISO(dateString), 'PPpp'); // Format like "Sep 21, 2025, 1:00:00 PM"
  } catch (e) {
    return dictionary.common.invalidDate; // Use dictionary directly
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
  const [isLoading, setIsLoading] = React.useState(false); // Corrected useState usage
  const [error, setError] = React.useState<string | null>(null);

  const dictionary = useDictionary(); // Get dictionary from context

  // Add dictionary check as per planToFixDictionaryErrors.md
  if (!dictionary) {
    console.error("SalesOrderDetailsDialog rendered without a dictionary.");
    return null; // Or a loading/error indicator
  }

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
              inventory_items: (item.inventory_items && typeof item.inventory_items === 'object' && !Array.isArray(item.inventory_items)) // Corrected Array.isArray
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
          // Use optional chaining for dictionary access and correct key
          setError(dictionary?.sales?.history?.detailsDialog?.loadErrorTitle || "Failed to load order details."); // Use dictionary
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
  }, [isOpen, order, supabase, dictionary]); // Add dictionary to dependencies

  // No need for dictionary check here, useDictionary hook handles it

  if (!order) return null;

  const customerName = order.customers
    ? `${order.customers.last_name || ''}${order.customers.last_name && order.customers.first_name ? ', ' : ''}${order.customers.first_name || ''}`.trim() || dictionary.common.notAvailable
    : 'Walk-in Customer'; // Keep hardcoded fallback for walk-in

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl"> {/* Wider dialog */}
        <DialogHeader>
          <DialogTitle>{dictionary.sales.history.detailsDialog.title}: #{order.order_number}</DialogTitle> {/* Use dictionary directly */}
          <DialogDescription>
            {dictionary.sales.history.detailsDialog.description} {customerName}. {/* Use dictionary directly */}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1"> {/* Scrollable content */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
                <div><span className="font-medium text-muted-foreground">{dictionary.sales.history.detailsDialog.customerLabel}:</span> {customerName}</div> {/* Use dictionary directly */}
            <div><span className="font-medium text-muted-foreground">{dictionary.sales.history.detailsDialog.statusLabel}:</span> <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="capitalize">{dictionary.common.status[order.status as keyof typeof dictionary.common.status] || order.status}</Badge></div> {/* Use dictionary for status text */}
                <div><span className="font-medium text-muted-foreground">{dictionary.sales.history.detailsDialog.orderDateLabel}:</span> {formatDisplayDateTime(order.order_date, dictionary)}</div> {/* Use dictionary directly */} {/* Corrected dictionary access */}
                {/* Add user/staff who created order if needed */}
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            {/* Items Table */}
            <h4 className="font-medium mb-2">{dictionary.sales.history.detailsDialog.itemsTitle}</h4> {/* Use dictionary directly */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{dictionary.sales.history.detailsDialog.productHeader}</TableHead> {/* Use dictionary directly */}
                        <TableHead className="text-center">{dictionary.sales.history.detailsDialog.qtyHeader}</TableHead> {/* Use dictionary directly */}
                        <TableHead className="text-right">{dictionary.sales.history.detailsDialog.unitPriceHeader}</TableHead> {/* Use dictionary directly */}
                        <TableHead className="text-right">{dictionary.sales.history.detailsDialog.lineTotalHeader}</TableHead> {/* Use dictionary directly */}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">{dictionary.sales.history.detailsDialog.loadingItems}</TableCell></TableRow>
                    ) : items.length > 0 ? (
                        items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {item.products?.brand || ''} {item.products?.name || dictionary.common.notAvailable} {item.products?.model || ''} {/* Use dictionary directly */}
                                    {item.inventory_items?.serial_number && <span className="text-xs text-muted-foreground ml-1">{dictionary.sales.history.detailsDialog.serialNumberPrefix}{item.inventory_items.serial_number}</span>} {/* Use dictionary for prefix */}
                                </TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatDisplayCurrency(item.unit_price)}</TableCell>
                                <TableCell className="text-right">{formatDisplayCurrency(item.line_total)}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">{dictionary.sales.history.detailsDialog.noItemsFound}</TableCell></TableRow> /* Use dictionary directly */
                    )}
                </TableBody>
            </Table>

             {/* Totals Section */}
             <div className="mt-4 pt-2 border-t text-sm space-y-1 text-right mr-2">
                 <div><span className="font-medium text-muted-foreground">{dictionary.sales.history.detailsDialog.subtotalLabel}:</span> {formatDisplayCurrency(order.total_amount)}</div> {/* Use dictionary directly */}
                 <div><span className="font-medium text-muted-foreground">{dictionary.sales.history.detailsDialog.discountLabel}:</span> -{formatDisplayCurrency(order.discount_amount)}</div> {/* Use dictionary directly */}
                 <div><span className="font-medium text-muted-foreground">{dictionary.sales.history.detailsDialog.taxLabel}:</span> +{formatDisplayCurrency(order.tax_amount)}</div> {/* Use dictionary directly */}
                 <div className="font-bold text-base"><span className="font-medium text-muted-foreground">{dictionary.sales.history.detailsDialog.totalLabel}:</span> {formatDisplayCurrency(order.final_amount)}</div> {/* Use dictionary directly */}
             </div>

             {/* Payments Table */}
             <h4 className="font-medium mt-4 mb-2">{dictionary.sales.history.detailsDialog.paymentsTitle}</h4> {/* Use dictionary directly */}
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{dictionary.sales.history.detailsDialog.dateHeader}</TableHead> {/* Use dictionary directly */}
                        <TableHead>{dictionary.sales.history.detailsDialog.methodHeader}</TableHead> {/* Use dictionary directly */}
                        <TableHead>{dictionary.sales.history.detailsDialog.referenceHeader}</TableHead> {/* Use dictionary directly */}
                        <TableHead className="text-right">{dictionary.sales.history.detailsDialog.amountHeader}</TableHead> {/* Use dictionary directly */}
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {isLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">{dictionary.sales.history.detailsDialog.loadingPayments}</TableCell></TableRow> /* Use dictionary directly */
                    ) : payments.length > 0 ? (
                        payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>{formatDisplayDateTime(payment.payment_date, dictionary)}</TableCell> {/* Pass dictionary */}
                                <TableCell className="capitalize">{payment.method}</TableCell>
                                <TableCell>{payment.transaction_ref || dictionary.common.notAvailable}</TableCell> {/* Use dictionary for placeholder */}
                                <TableCell className="text-right">{formatDisplayCurrency(payment.amount)}</TableCell>
                            </TableRow>
                        ))
                     ) : (
                         <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">{dictionary.sales.history.detailsDialog.noPaymentsRecorded}</TableCell></TableRow> /* Use dictionary directly */
                    )}
                </TableBody>
             </Table>

             {order.notes && (
                <div className="mt-4">
                <h4 className="font-medium mb-1">{dictionary.sales.history.detailsDialog.orderNotesTitle}</h4> {/* Use dictionary directly */}
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
                </div>
            )}

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{dictionary.common.close}</Button> {/* Use dictionary directly */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
