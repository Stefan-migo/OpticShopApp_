"use client"; // Needs state for fetching/display

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Use Card for display
import { subDays, format } from 'date-fns'; // For date calculations
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation"; // Import useSearchParams


// TODO: Add more reports (inventory, appointments)
// TODO: Add date range selection
// TODO: Add other chart types (bar, pie)
// TODO: Refine DataTable columns and formatting

// Define types for fetched report data
interface SalesOverTimeData {
  sale_day: string;
  daily_sales: number;
}

interface DetailedSalesData {
  order_id: string;
  order_number: string;
  order_date: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  final_amount: number;
  order_status: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface SalesByCategoryData {
  category_name: string;
  category_sales: number;
}

interface LowStockItemData {
  id: string;
  name: string;
  reorder_level: number | null;
  current_stock: number;
}

// Define columns for the Detailed Sales DataTable
const detailedSalesColumns: ColumnDef<DetailedSalesData>[] = [
  {
    accessorKey: "order_number",
    header: "Order #",
  },
  {
    accessorKey: "order_date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.getValue("order_date")), 'yyyy-MM-dd'),
  },
  {
    accessorKey: "customer_first_name",
    header: "Customer First Name",
  },
   {
    accessorKey: "customer_last_name",
    header: "Customer Last Name",
  },
  {
    accessorKey: "product_name",
    header: "Product",
  },
  {
    accessorKey: "quantity",
    header: "Qty",
  },
  {
    accessorKey: "unit_price",
    header: "Unit Price",
    cell: ({ row }) => row.getValue("unit_price").toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
  },
  {
    accessorKey: "line_total",
    header: "Line Total",
     cell: ({ row }) => row.getValue("line_total").toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
  },
  {
    accessorKey: "order_status",
    header: "Status",
  },
   {
    accessorKey: "total_amount",
    header: "Order Total",
     cell: ({ row }) => row.getValue("total_amount").toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
  },
];


export default function ReportsPage() {
  const supabase = createClient();
  const searchParams = useSearchParams(); // Get search params from URL
  const tenantId = searchParams.get('tenantId'); // Get tenantId from search params

  const [salesSummary, setSalesSummary] = React.useState<{ period: string; total: number } | null>(null);
  const [customerCount, setCustomerCount] = React.useState<number | null>(null);
  const [inventorySummary, setInventorySummary] = React.useState<Record<string, number> | null>(null); // State for inventory counts
  const [salesOverTimeData, setSalesOverTimeData] = React.useState<SalesOverTimeData[]>([]); // State for sales over time data
  const [salesByCategoryData, setSalesByCategoryData] = React.useState<SalesByCategoryData[]>([]); // State for sales by category data
  const [lowStockItemsData, setLowStockItemsData] = React.useState<LowStockItemData[]>([]); // State for low stock items data
  const [detailedSalesData, setDetailedSalesData] = React.useState<DetailedSalesData[]>([]); // State for detailed sales data


  const [isLoadingSales, setIsLoadingSales] = React.useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = React.useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = React.useState(true); // Loading state for inventory
  const [isLoadingSalesOverTime, setIsLoadingSalesOverTime] = React.useState(true); // Loading state for sales over time
  const [isLoadingSalesByCategory, setIsLoadingSalesByCategory] = React.useState(true); // Loading state for sales by category
  const [isLoadingLowStockItems, setIsLoadingLowStockItems] = React.useState(true); // Loading state for low stock items
  const [isLoadingDetailedSales, setIsLoadingDetailedSales] = React.useState(true); // Loading state for detailed sales

  const [isSuperuser, setIsSuperuser] = React.useState(false);


  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function checkSuperuser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_superuser')
          .eq('id', user.id)
          .single();
        if (profile) {
          setIsSuperuser(profile.is_superuser);
        }
      }
    }
    checkSuperuser();
  }, []);


  // Fetch report data
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingSales(true);
      setIsLoadingCustomers(true);
      setIsLoadingInventory(true); // Set inventory loading
      setIsLoadingSalesOverTime(true); // Set sales over time loading
      setIsLoadingSalesByCategory(true); // Set sales by category loading
      setIsLoadingLowStockItems(true); // Set low stock items loading
      setIsLoadingDetailedSales(true); // Set detailed sales loading
      setError(null);

      try {
        // Fetch Sales Summary (Last 30 Days)
        const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        let salesSummaryQuery = supabase
          .from('sales_orders')
          .select('final_amount')
          .gte('order_date', thirtyDaysAgo)
          .eq('status', 'completed');

        if (isSuperuser && tenantId) {
          salesSummaryQuery = salesSummaryQuery.eq('tenant_id', tenantId);
        }

        const { data: salesData, error: salesError } = await salesSummaryQuery;

        if (salesError) throw new Error(`Sales Summary Error: ${salesError.message}`);
        const totalSales = salesData?.reduce((sum, order) => sum + (order.final_amount || 0), 0) || 0;
        setSalesSummary({ period: "Last 30 Days", total: totalSales });
        setIsLoadingSales(false);

        // Fetch Customer Count
        let customerCountQuery = supabase
          .from('customers')
          .select('*', { count: 'exact', head: true }); // Only get the count

        if (isSuperuser && tenantId) {
          customerCountQuery = customerCountQuery.eq('tenant_id', tenantId);
        }

        const { count: custCount, error: customerError } = await customerCountQuery;

        if (customerError) throw new Error(`Customer Count Error: ${customerError.message}`);
        setCustomerCount(custCount ?? 0);
        setIsLoadingCustomers(false);

        // Fetch Inventory Summary (Grouped by Status)
        // This requires fetching all items and grouping client-side, or a DB function.
        // Client-side grouping for simplicity now, but inefficient for large datasets.
        interface InventoryItemStatus {
            status: string | null;
        }
        let inventorySummaryQuery = supabase
          .from('inventory_items')
          .select('status');

        if (isSuperuser && tenantId) {
          inventorySummaryQuery = inventorySummaryQuery.eq('tenant_id', tenantId);
        }

        const { data: inventoryData, error: inventoryError } = await inventorySummaryQuery as { data: InventoryItemStatus[] | null, error: any }; // Keep cast for data type

        if (inventoryError) throw new Error(`Inventory Summary Error: ${inventoryError.message}`);

        const summary: Record<string, number> = {};
        inventoryData?.forEach(item => {
            if (item.status) {
                summary[item.status] = (summary[item.status] || 0) + 1;
            }
        });
        setInventorySummary(summary);
        setIsLoadingInventory(false);

        // Fetch Sales Over Time data from API route
        const salesOverTimeApiUrl = new URL('/api/reports/sales-over-time', window.location.origin);
        if (isSuperuser && tenantId) {
          salesOverTimeApiUrl.searchParams.set('is_superuser', 'true');
          salesOverTimeApiUrl.searchParams.set('selected_tenant_id', tenantId);
        }
        const salesOverTimeResponse = await fetch(salesOverTimeApiUrl.toString());
        if (!salesOverTimeResponse.ok) {
          throw new Error(`Error fetching sales over time data: ${salesOverTimeResponse.statusText}`);
        }
        const salesOverTimeJson: SalesOverTimeData[] = await salesOverTimeResponse.json();
        setSalesOverTimeData(salesOverTimeJson);
        setIsLoadingSalesOverTime(false);

        // Fetch Sales by Product Category data from API route
        const salesByCategoryApiUrl = new URL('/api/reports/sales-by-category', window.location.origin);
        if (isSuperuser && tenantId) {
          salesByCategoryApiUrl.searchParams.set('is_superuser', 'true');
          salesByCategoryApiUrl.searchParams.set('selected_tenant_id', tenantId);
        }
        const salesByCategoryResponse = await fetch(salesByCategoryApiUrl.toString());
        if (!salesByCategoryResponse.ok) {
          throw new Error(`Error fetching sales by category data: ${salesByCategoryResponse.statusText}`);
        }
        const salesByCategoryJson: SalesByCategoryData[] = await salesByCategoryResponse.json();
        setSalesByCategoryData(salesByCategoryJson);
        setIsLoadingSalesByCategory(false);

        // Fetch Low Stock Items data from API route
        const lowStockItemsApiUrl = new URL('/api/reports/low-stock-items', window.location.origin);
        if (isSuperuser && tenantId) {
          lowStockItemsApiUrl.searchParams.set('is_superuser', 'true');
          lowStockItemsApiUrl.searchParams.set('selected_tenant_id', tenantId);
        }
        const lowStockItemsResponse = await fetch(lowStockItemsApiUrl.toString());
        if (!lowStockItemsResponse.ok) {
          throw new Error(`Error fetching low stock items data: ${lowStockItemsResponse.statusText}`);
        }
        const lowStockItemsJson: LowStockItemData[] = await lowStockItemsResponse.json();
        setLowStockItemsData(lowStockItemsJson);
        setIsLoadingLowStockItems(false);

        // Fetch Detailed Sales data from API route
        const detailedSalesApiUrl = new URL('/api/reports/detailed-sales', window.location.origin);
        if (isSuperuser && tenantId) {
          detailedSalesApiUrl.searchParams.set('is_superuser', 'true');
          detailedSalesApiUrl.searchParams.set('selected_tenant_id', tenantId);
        }
        const detailedSalesResponse = await fetch(detailedSalesApiUrl.toString());
        if (!detailedSalesResponse.ok) {
          throw new Error(`Error fetching detailed sales data: ${detailedSalesResponse.statusText}`);
        }
        const detailedSalesJson: DetailedSalesData[] = await detailedSalesResponse.json();
        setDetailedSalesData(detailedSalesJson);
        setIsLoadingDetailedSales(false);


      } catch (fetchError: any) { // Explicitly type fetchError as any
         console.error("Error fetching report data:", fetchError);
         setError(fetchError instanceof Error ? fetchError.message : "An unexpected error occurred.");
         // Ensure all loading states are false even on error
         setIsLoadingSales(false);
         setIsLoadingCustomers(false);
         setIsLoadingInventory(false);
         setIsLoadingSalesOverTime(false); // Set sales over time loading to false on error
         setIsLoadingSalesByCategory(false); // Set sales by category loading to false on error
         setIsLoadingLowStockItems(false); // Set low stock items loading to false on error
         setIsLoadingDetailedSales(false); // Set detailed sales loading to false on error
         setSalesSummary(null);
         setCustomerCount(null);
         setInventorySummary(null);
         setSalesOverTimeData([]); // Clear sales over time data on error
         setSalesByCategoryData([]); // Clear sales by category data on error
         setLowStockItemsData([]); // Clear low stock items data on error
         setDetailedSalesData([]); // Clear detailed sales data on error
      }
    };

    // Fetch data only if isSuperuser status is determined
    if (isSuperuser !== undefined) {
      fetchData();
    }
  }, [supabase, isSuperuser, tenantId]); // Add supabase, isSuperuser and tenantId to dependency array

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

      {/* Sales Over Time Report */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Sales Over Time</h2>
        {isLoadingSalesOverTime ? (
          <p>Loading sales over time data...</p>
        ) : salesOverTimeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={salesOverTimeData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sale_day" />
              <YAxis tickFormatter={(value) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
              <Tooltip formatter={(value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
              <Legend />
              <Line type="monotone" dataKey="daily_sales" stroke="#8884d8" activeDot={{ r: 8 }} name="Daily Sales" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No sales over time data available.</p>
        )}
      </div>

      {/* Sales by Product Category Report */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Sales by Product Category</h2>
        {isLoadingSalesByCategory ? (
          <p>Loading sales by category data...</p>
        ) : salesByCategoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={salesByCategoryData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category_name" />
              <YAxis tickFormatter={(value) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
              <Tooltip formatter={(value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
              <Legend />
              <Bar dataKey="category_sales" fill="#8884d8" name="Category Sales" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>No sales by category data available.</p>
        )}
      </div>

      {/* Low Stock Items Report */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Low Stock Items</h2>
        {isLoadingLowStockItems ? (
          <p>Loading low stock items data...</p>
        ) : lowStockItemsData.length > 0 ? (
          <ul>
            {lowStockItemsData.map((item, index) => (
              <li key={index}>{item.name} (Stock: {item.current_stock}, Reorder Level: {item.reorder_level ?? 'N/A'})</li>
            ))}
          </ul>
        ) : (
          <p>No low stock items data available.</p>
        )}
      </div>

      {/* Detailed Sales Report */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Sales List</h2>
        {isLoadingDetailedSales ? (
          <p>Loading detailed sales data...</p>
        ) : detailedSalesData.length > 0 ? (
          <DataTable columns={detailedSalesColumns} data={detailedSalesData} />
        ) : (
          <p>No detailed sales data available.</p>
        )}
      </div>
    </div>
  );
}
