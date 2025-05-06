"use client"; // Needs client-side hooks

import * as React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSalesHistoryColumns, type SalesOrder } from "./columns"; // Import columns and type
import { DataTable } from "@/components/ui/data-table";
import { createClient } from "@/lib/supabase/client";
import { Dialog } from "@/components/ui/dialog"; // Import Dialog for details
import { SalesOrderDetailsDialog } from "./sales-order-details-dialog"; // Import the details dialog component
import { useParams } from 'next/navigation'; // Import useParams
import { useDictionary } from '@/lib/i18n/dictionary-context'; // Import useDictionary hook
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface


export default function SalesHistoryPage() {
  const supabase = createClient();
  const [data, setData] = React.useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false); // State for details dialog
  const [selectedOrder, setSelectedOrder] = React.useState<SalesOrder | null>(null); // State for selected order
  const params = useParams(); // Get params from URL
  const lang = params.lang as string; // Extract locale as string

  const dictionary = useDictionary(); // Get dictionary from context

  // Add conditional rendering check for dictionary
  if (!dictionary) {
    return <div>{dictionary?.common?.loading || "Loading..."}</div>; // Show loading until dictionary is fetched
  }

  // Fetch sales orders
  React.useEffect(() => {
    // No need to check for dictionary here, useDictionary hook handles it
    const fetchSalesOrders = async () => {
      setIsLoading(true);
      setError(null);
      const { data: orders, error: fetchError } = await supabase
        .from("sales_orders")
        .select(`
            id, order_number, customer_id, user_id, order_date,
            total_amount, discount_amount, tax_amount, final_amount,
            status, notes, created_at,
            customers ( first_name, last_name )
        `)
        .order("order_date", { ascending: false }); // Show most recent first

      if (fetchError) {
        console.error("Error fetching sales orders:", fetchError);
        // Use optional chaining for dictionary access in case of initial render before context is fully ready (though useDictionary should prevent this)
        setError(`${dictionary.sales.history.fetchError || "Failed to load sales history"}: ${fetchError.message}`); // Use dictionary directly after guard clause
        setData([]);
      } else {
        setData(orders as any); // Cast needed due to joined data
      }
      setIsLoading(false);
    };

    fetchSalesOrders();
  }, [supabase, dictionary]); // Add dictionary to dependencies


  // Handler to open details view
  const handleViewDetails = (order: SalesOrder) => {
      setSelectedOrder(order);
      setIsDetailsOpen(true);
  };

  // Generate columns
  const columns = React.useMemo(
    () => getSalesHistoryColumns({ onViewDetails: handleViewDetails, dictionary }), // Pass dictionary
    [dictionary] // Add dictionary to dependencies
  );

  // No need for loading state based on dictionary, useDictionary hook handles it


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{dictionary.sales.history.title || "Sales History"}</h1> {/* Use dictionary directly */}
        <Button asChild variant="outline">
            <Link href={`/${lang}/sales`}>{dictionary.sales.history.backToPosButton || "Back to POS"}</Link> {/* Use dictionary directly and locale */}
        </Button>
      </div>

      {/* Data Table Area */}
       {isLoading ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-muted-foreground">
          {dictionary.sales.history.loading || "Loading..."} {/* Use dictionary directly */}
        </div>
      ) : error ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-red-600">
          {error}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          filterColumnKey="order_number" // Filter by order number
          filterPlaceholder={dictionary.sales.history.filterPlaceholder || "Filter orders..."} // Use dictionary directly
        />
      )}

      {/* Sales Order Details Dialog */}
      <SalesOrderDetailsDialog
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onOpenChange={(open) => {
            setIsDetailsOpen(open);
            if (!open) setSelectedOrder(null); // Clear selected order on close
        }}
        // Removed dictionary prop as it's now accessed via context in the dialog component
      />
    </div>
  );
}
