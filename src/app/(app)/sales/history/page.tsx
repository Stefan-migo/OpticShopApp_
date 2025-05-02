"use client"; // Needs client-side hooks

import * as React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSalesHistoryColumns, type SalesOrder } from "./columns"; // Import columns and type
import { DataTable } from "@/components/ui/data-table";
import { createClient } from "@/lib/supabase/client";
import { Dialog } from "@/components/ui/dialog"; // Import Dialog for details
import { SalesOrderDetailsDialog } from "./sales-order-details-dialog"; // Import the details dialog component

export default function SalesHistoryPage() {
  const supabase = createClient();
  const [data, setData] = React.useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false); // State for details dialog
  const [selectedOrder, setSelectedOrder] = React.useState<SalesOrder | null>(null); // State for selected order

  // Fetch sales orders
  React.useEffect(() => {
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
        setError(`Failed to load sales history: ${fetchError.message}`);
        setData([]);
      } else {
        setData(orders as any); // Cast needed due to joined data
      }
      setIsLoading(false);
    };

    fetchSalesOrders();
  }, [supabase]);

  // Handler to open details view
  const handleViewDetails = (order: SalesOrder) => {
      setSelectedOrder(order);
      setIsDetailsOpen(true);
  };

  // Generate columns
  const columns = React.useMemo(
    () => getSalesHistoryColumns({ onViewDetails: handleViewDetails }),
    []
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sales History</h1>
        <Button asChild variant="outline">
            <Link href="/sales">Back to POS</Link>
        </Button>
      </div>

      {/* Data Table Area */}
       {isLoading ? (
        <div className="border shadow-sm rounded-lg p-4 text-center text-muted-foreground">
          Loading sales history...
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
          filterPlaceholder="Filter by order #..."
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
      />
    </div>
  );
}
