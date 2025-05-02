"use client"; // Needs state for fetching/display

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Use Card for display
import { subDays, format } from 'date-fns'; // For date calculations

// TODO: Add more reports (inventory, appointments)
// TODO: Add date range selection
// TODO: Consider using charts (e.g., Recharts)

export default function ReportsPage() {
  const supabase = createClient();
  const [salesSummary, setSalesSummary] = React.useState<{ period: string; total: number } | null>(null);
  const [customerCount, setCustomerCount] = React.useState<number | null>(null);
  const [inventorySummary, setInventorySummary] = React.useState<Record<string, number> | null>(null); // State for inventory counts
  const [isLoadingSales, setIsLoadingSales] = React.useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = React.useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = React.useState(true); // Loading state for inventory
  const [error, setError] = React.useState<string | null>(null);

  // Fetch report data
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingSales(true);
      setIsLoadingCustomers(true);
      setIsLoadingInventory(true); // Set inventory loading
      setError(null);

      try {
        // Fetch Sales Summary (Last 30 Days)
        const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        const { data: salesData, error: salesError } = await supabase
          .from('sales_orders')
          .select('final_amount')
          .gte('order_date', thirtyDaysAgo)
          .eq('status', 'completed');

        if (salesError) throw new Error(`Sales Summary Error: ${salesError.message}`);
        const totalSales = salesData?.reduce((sum, order) => sum + (order.final_amount || 0), 0) || 0;
        setSalesSummary({ period: "Last 30 Days", total: totalSales });
        setIsLoadingSales(false);

        // Fetch Customer Count
        const { count: custCount, error: customerError } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true }); // Only get the count

        if (customerError) throw new Error(`Customer Count Error: ${customerError.message}`);
        setCustomerCount(custCount ?? 0);
        setIsLoadingCustomers(false);

        // Fetch Inventory Summary (Grouped by Status)
        // This requires fetching all items and grouping client-side, or a DB function.
        // Client-side grouping for simplicity now, but inefficient for large datasets.
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory_items')
          .select('status');

        if (inventoryError) throw new Error(`Inventory Summary Error: ${inventoryError.message}`);

        const summary: Record<string, number> = {};
        inventoryData?.forEach(item => {
            if (item.status) {
                summary[item.status] = (summary[item.status] || 0) + 1;
            }
        });
        setInventorySummary(summary);
        setIsLoadingInventory(false);


      } catch (fetchError: any) {
         console.error("Error fetching report data:", fetchError);
         setError(fetchError.message || "Failed to load report data.");
         // Ensure all loading states are false even on error
         setIsLoadingSales(false);
         setIsLoadingCustomers(false);
         setIsLoadingInventory(false);
         setSalesSummary(null);
         setCustomerCount(null);
         setInventorySummary(null);
      }
    };

    fetchData();
  }, [supabase]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Reports</h1>
       {error && <p className="text-red-600">Error loading reports: {error}</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         {/* Sales Summary Card */}
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total Sales
                </CardTitle>
                {/* <DollarSign className="h-4 w-4 text-muted-foreground" /> */}
            </CardHeader>
            <CardContent>
                {isLoadingSales ? (
                    <p className="text-xs text-muted-foreground">Loading...</p>
                ) : salesSummary ? (
                    <>
                        <div className="text-2xl font-bold">
                            {salesSummary.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {salesSummary.period}
                        </p>
                    </>
                ) : (
                      <p className="text-xs text-muted-foreground">No sales data.</p>
                )}
            </CardContent>
         </Card>

         {/* Customer Count Card */}
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total Customers
                </CardTitle>
                 {/* <Users className="h-4 w-4 text-muted-foreground" /> */}
            </CardHeader>
            <CardContent>
                 {isLoadingCustomers ? (
                    <p className="text-xs text-muted-foreground">Loading...</p>
                ) : customerCount !== null ? (
                    <>
                        <div className="text-2xl font-bold">{customerCount}</div>
                        {/* <p className="text-xs text-muted-foreground">All time</p> */}
                    </>
                ) : (
                     <p className="text-xs text-muted-foreground">No customer data.</p>
                )}
            </CardContent>
         </Card>

         {/* Inventory Summary Card */}
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Inventory Status
                </CardTitle>
                 {/* <Package className="h-4 w-4 text-muted-foreground" /> */}
            </CardHeader>
            <CardContent>
                 {isLoadingInventory ? (
                    <p className="text-xs text-muted-foreground">Loading...</p>
                ) : inventorySummary ? (
                    <div className="text-xs space-y-1">
                       {Object.entries(inventorySummary).map(([status, count]) => (
                           <div key={status} className="flex justify-between">
                               <span className="capitalize text-muted-foreground">{status}:</span>
                               <span>{count}</span>
                           </div>
                       ))}
                    </div>
                ) : (
                     <p className="text-xs text-muted-foreground">No inventory data.</p>
                )}
            </CardContent>
         </Card>

         {/* Placeholder for other report cards */}
         <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Appointments Overview</CardTitle></CardHeader>
             <CardContent><p className="text-xs text-muted-foreground">Coming soon...</p></CardContent>
         </Card>
      </div>
    </div>
  );
}
