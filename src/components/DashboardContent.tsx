"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subDays, format } from 'date-fns';
import Link from 'next/link'; // Import Link

interface DashboardContentProps {
  userName: string | null;
}

export default function DashboardContent({ userName }: DashboardContentProps) {
  const supabase = createClient();
  const [salesSummary, setSalesSummary] = React.useState<{ period: string; total: number } | null>(null);
  const [customerCount, setCustomerCount] = React.useState<number | null>(null);
  const [inventorySummary, setInventorySummary] = React.useState<Record<string, number> | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = React.useState<any[] | null>(null); // TODO: Define proper type
  const [isLoadingSales, setIsLoadingSales] = React.useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = React.useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = React.useState(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch report data
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingSales(true);
      setIsLoadingCustomers(true);
      setIsLoadingInventory(true);
      setIsLoadingAppointments(true); // Set loading for appointments
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
          .select('*', { count: 'exact', head: true });

        if (customerError) throw new Error(`Customer Count Error: ${customerError.message}`);
        setCustomerCount(custCount ?? 0);
        setIsLoadingCustomers(false);

        // Fetch Inventory Summary (Grouped by Status)
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

        // Fetch Upcoming Appointments (Today and Tomorrow)
        const today = format(new Date(), 'yyyy-MM-dd');
        const tomorrow = format(subDays(new Date(), -1), 'yyyy-MM-dd'); // Use subDays with negative for future date

        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*, customers(first_name, last_name)') // Select appointment fields and customer first_name, last_name
          .gte('appointment_time', today)
          .lt('appointment_time', tomorrow) // Fetch appointments for today
          .order('appointment_time', { ascending: true });

        if (appointmentsError) throw new Error(`Upcoming Appointments Error: ${appointmentsError.message}`);
        setUpcomingAppointments(appointmentsData);
        setIsLoadingAppointments(false);


      } catch (fetchError: any) {
         console.error("Error fetching dashboard data:", fetchError);
         setError(fetchError.message || "Failed to load dashboard data.");
         setIsLoadingSales(false);
         setIsLoadingCustomers(false);
         setIsLoadingInventory(false);
         setIsLoadingAppointments(false);
         setSalesSummary(null);
         setCustomerCount(null);
         setInventorySummary(null);
         setUpcomingAppointments(null);
      }
    };

    fetchData();
  }, [supabase]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {userName && (
            <h1 className="text-2xl font-semibold">Good morning, {userName}!</h1>
        )}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
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

             {/* Upcoming Appointments Card */}
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                    {/* <Calendar className="h-4 w-4 text-muted-foreground" /> */}
                </CardHeader>
                <CardContent>
                    {isLoadingAppointments ? (
                        <p className="text-xs text-muted-foreground">Loading...</p>
                    ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                        <div className="text-xs space-y-1">
                            {upcomingAppointments.map(appointment => (
                                <div key={appointment.id} className="flex justify-between">
                                    <span className="text-muted-foreground">{format(new Date(appointment.appointment_time), 'p')}:</span>
                                    <span>{`${appointment.customers?.first_name || ''} ${appointment.customers?.last_name || ''}`.trim() || 'N/A'}</span>
                                </div>
                            ))}
                            <div className="mt-2 text-right">
                                <Link href="/appointments" className="text-blue-500 hover:underline">View All</Link>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">No upcoming appointments.</p>
                    )}
                </CardContent>
             </Card>
        </div>
        {/* Add other dashboard sections like recent activity, charts, etc. later */}
    </main>
  );
}
