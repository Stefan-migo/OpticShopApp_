"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subDays, format } from 'date-fns';
import Link from 'next/link'; // Import Link
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface
import { Locale } from '@/lib/i18n/config'; // Import Locale type

interface DashboardContentProps {
  userName: string | null;
  dictionary: Dictionary; // Use the imported Dictionary interface
  lang: Locale; // Add lang prop
}

export default function DashboardContent({ userName, dictionary, lang }: DashboardContentProps) {
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
        setSalesSummary({ period: dictionary.dashboard.last30DaysPeriod || "Last 30 Days", total: totalSales }); // Use dictionary
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
         setError(fetchError.message || dictionary.common.failedToLoadData || "Failed to load dashboard data."); // Use dictionary
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
  }, [supabase, dictionary]); // Add dictionary to dependency array

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {userName && (
            <h1 className="text-2xl font-semibold">{dictionary.dashboard.greeting?.replace('{{name}}', userName) || dictionary.dashboard.greetingFallback?.replace('{{name}}', userName) || `Good morning, ${userName}!`}</h1>
        )}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
             {/* Sales Summary Card */}
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    {dictionary.dashboard.totalSales || "Total Sales"} {/* Use dictionary */}
                    </CardTitle>
                    {/* <DollarSign className="h-4 w-4 text-muted-foreground" /> */}
                </CardHeader>
                <CardContent>
                    {isLoadingSales ? (
                        <p className="text-xs text-muted-foreground">{dictionary.common.loading || "Loading..."}</p> // Use dictionary
                    ) : salesSummary ? (
                        <>
                            <div className="text-2xl font-bold">
                                {salesSummary.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} {/* Currency formatting needs localization */}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {salesSummary.period}
                            </p>
                        </>
                    ) : (
                        <p className="text-xs text-muted-foreground">{dictionary.dashboard.noSalesData || "No sales data."}</p> // Use dictionary
                    )}
                </CardContent>
             </Card>

             {/* Customer Count Card */}
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    {dictionary.dashboard.totalCustomers || "Total Customers"} {/* Use dictionary */}
                    </CardTitle>
                    {/* <Users className="h-4 w-4 text-muted-foreground" /> */}
                </CardHeader>
                <CardContent>
                    {isLoadingCustomers ? (
                        <p className="text-xs text-muted-foreground">{dictionary.common.loading || "Loading..."}</p> // Use dictionary
                    ) : customerCount !== null ? (
                        <>
                            <div className="text-2xl font-bold">{customerCount}</div>
                            {/* <p className="text-xs text-muted-foreground">All time</p> */}
                        </>
                    ) : (
                        <p className="text-xs text-muted-foreground">{dictionary.dashboard.noCustomerData || "No customer data."}</p> // Use dictionary
                    )}
                </CardContent>
             </Card>

             {/* Inventory Summary Card */}
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    {dictionary.dashboard.inventoryStatus || "Inventory Status"} {/* Use dictionary */}
                    </CardTitle>
                    {/* <Package className="h-4 w-4 text-muted-foreground" /> */}
                </CardHeader>
                <CardContent>
                    {isLoadingInventory ? (
                        <p className="text-xs text-muted-foreground">{dictionary.common.loading || "Loading..."}</p> // Use dictionary
                    ) : inventorySummary ? (
                        <div className="text-xs space-y-1">
                        {Object.entries(inventorySummary).map(([status, count]) => (
                            <div key={status} className="flex justify-between">
                                <span className="capitalize text-muted-foreground">{dictionary.common.status[status as keyof typeof dictionary.common.status] || status}:</span> {/* Status might need localization */}
                                <span>{count}</span>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">{dictionary.dashboard.noInventoryData || "No inventory data."}</p> // Use dictionary
                    )}
                </CardContent>
             </Card>

             {/* Upcoming Appointments Card */}
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{dictionary.dashboard.upcomingAppointments || "Upcoming Appointments"}</CardTitle> {/* Use dictionary */}
                    {/* <Calendar className="h-4 w-4 text-muted-foreground" /> */}
                </CardHeader>
                <CardContent>
                    {isLoadingAppointments ? (
                        <p className="text-xs text-muted-foreground">{dictionary.common.loading || "Loading..."}</p> // Use dictionary
                    ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                        <div className="text-xs space-y-1">
                            {upcomingAppointments.map(appointment => (
                                <div key={appointment.id} className="flex justify-between">
                                    <span className="text-muted-foreground">{format(new Date(appointment.appointment_time), 'p')}:</span> {/* Time formatting needs localization */}
                                    <span>{`${appointment.customers?.first_name || ''} ${appointment.customers?.last_name || ''}`.trim() || dictionary.common.notAvailable}</span> {/* Use dictionary for fallback */}
                                </div>
                            ))}
                            <div className="mt-2 text-right">
                                <Link href={`/${lang}/appointments`} className="text-blue-500 hover:underline">{dictionary.common.viewAll || "View All"}</Link> {/* Use dictionary and lang prop */}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">{dictionary.dashboard.noUpcomingAppointments || "No upcoming appointments."}</p> // Use dictionary
                    )}
                </CardContent>
             </Card>
        </div>
        {/* Add other dashboard sections like recent activity, charts, etc. later */}
    </main>
  );
}
