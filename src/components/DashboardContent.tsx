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
    // Apply background and text color to the main container
    // min-h-screen is important to ensure the background covers the full viewport height
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background text-foreground min-h-screen transition-colors duration-300">
        {userName && (
            // Apply text color to the greeting
            <h1 className="text-2xl font-semibold text-foreground">
              {dictionary.dashboard.greeting?.replace('{{name}}', userName) || dictionary.dashboard.greetingFallback?.replace('{{name}}', userName) || `Good morning, ${userName}!`}
            </h1>
        )}
        {/* Apply background and gap to the grid container */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              {/* Sales Summary Card - Apply neumorphic styles */}
              {/* Assuming Card component from shadcn/ui is already styled with bg-card, text-card-foreground etc. */}
              {/* We add the neumorphic shadow and rounded corners here */}
              <Card className="rounded-xl shadow-neumorphic">
                 {/* Card Header - Apply text color to title */}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-foreground text-sm font-medium"> {/* Use text-foreground for title */}
                    {dictionary.dashboard.totalSales || "Total Sales"} {/* Use dictionary */}
                    </CardTitle>
                    {/* Icon - Use text-muted-foreground for icon color */}
                    {/* <DollarSign className="h-4 w-4 text-muted-foreground" /> */}
                </CardHeader>
                 {/* Card Content - Apply text colors */}
                <CardContent>
                    {isLoadingSales ? (
                        <p className="text-xs text-muted-foreground">{dictionary.common.loading || "Loading..."}</p> // Use text-muted-foreground
                    ) : salesSummary ? (
                        <>
                            {/* Apply text-foreground to the main value */}
                            <div className="text-2xl font-bold text-foreground">
                                {salesSummary.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} {/* Currency formatting needs localization */}
                            </div>
                            {/* Apply text-muted-foreground to the period text */}
                            <p className="text-xs text-muted-foreground">
                                {salesSummary.period}
                            </p>
                        </>
                    ) : (
                        <p className="text-xs text-muted-foreground">{dictionary.dashboard.noSalesData || "No sales data."}</p> // Use text-muted-foreground
                    )}
                </CardContent>
              </Card>

              {/* Customer Count Card - Apply neumorphic styles */}
              <Card className="rounded-xl shadow-neumorphic">
                 {/* Card Header - Apply text color to title */}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-foreground text-sm font-medium"> {/* Use text-foreground for title */}
                    {dictionary.dashboard.totalCustomers || "Total Customers"} {/* Use dictionary */}
                    </CardTitle>
                    {/* Icon - Use text-muted-foreground for icon color */}
                    {/* <Users className="h-4 w-4 text-muted-foreground" /> */}
                </CardHeader>
                 {/* Card Content - Apply text colors */}
                <CardContent>
                    {isLoadingCustomers ? (
                        <p className="text-xs text-muted-foreground">{dictionary.common.loading || "Loading..."}</p> // Use text-muted-foreground
                    ) : customerCount !== null ? (
                        <>
                            {/* Apply text-foreground to the main value */}
                            <div className="text-2xl font-bold text-foreground">{customerCount}</div>
                            {/* <p className="text-xs text-muted-foreground">All time</p> */} {/* Use text-muted-foreground */}
                        </>
                    ) : (
                        <p className="text-xs text-muted-foreground">{dictionary.dashboard.noCustomerData || "No customer data."}</p> // Use text-muted-foreground
                    )}
                </CardContent>
              </Card>

              {/* Inventory Summary Card - Apply neumorphic styles */}
              <Card className="rounded-xl shadow-neumorphic">
                 {/* Card Header - Apply text color to title */}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-foreground text-sm font-medium"> {/* Use text-foreground for title */}
                    {dictionary.dashboard.inventoryStatus || "Inventory Status"} {/* Use dictionary */}
                    </CardTitle>
                    {/* Icon - Use text-muted-foreground for icon color */}
                    {/* <Package className="h-4 w-4 text-muted-foreground" /> */}
                </CardHeader>
                 {/* Card Content - Apply text colors */}
                <CardContent>
                    {isLoadingInventory ? (
                        <p className="text-xs text-muted-foreground">{dictionary.common.loading || "Loading..."}</p> // Use text-muted-foreground
                    ) : inventorySummary ? (
                        <div className="text-xs space-y-1">
                        {Object.entries(inventorySummary).map(([status, count]) => (
                            <div key={status} className="flex justify-between">
                                {/* Apply text-muted-foreground to status labels */}
                                <span className="capitalize text-muted-foreground">{dictionary.common.status[status as keyof typeof dictionary.common.status] || status}:</span>
                                {/* Apply text-foreground to counts */}
                                <span className="text-foreground">{count}</span>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">{dictionary.dashboard.noInventoryData || "No inventory data."}</p> // Use text-muted-foreground
                    )}
                </CardContent>
              </Card>

              {/* Upcoming Appointments Card - Apply neumorphic styles */}
              <Card className="rounded-xl shadow-neumorphic">
                 {/* Card Header - Apply text color to title */}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-foreground text-sm font-medium">{dictionary.dashboard.upcomingAppointments || "Upcoming Appointments"}</CardTitle> {/* Use text-foreground and dictionary */}
                    {/* Icon - Use text-muted-foreground for icon color */}
                    {/* <Calendar className="h-4 w-4 text-muted-foreground" /> */}
                </CardHeader>
                 {/* Card Content - Apply text colors */}
                <CardContent>
                    {isLoadingAppointments ? (
                        <p className="text-xs text-muted-foreground">{dictionary.common.loading || "Loading..."}</p> // Use text-muted-foreground
                    ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                        <div className="text-xs space-y-1">
                            {upcomingAppointments.map(appointment => (
                                <div key={appointment.id} className="flex justify-between">
                                    {/* Apply text-muted-foreground to time */}
                                    <span className="text-muted-foreground">{format(new Date(appointment.appointment_time), 'p')}:</span>
                                    {/* Apply text-foreground to customer name */}
                                    <span className="text-foreground">{`${appointment.customers?.first_name || ''} ${appointment.customers?.last_name || ''}`.trim() || dictionary.common.notAvailable}</span> {/* Use text-foreground and dictionary */}
                                </div>
                            ))}
                            {/* Apply text-primary to the link */}
                            <div className="mt-2 text-right">
                                <Link href={`/${lang}/appointments`} className="text-primary hover:underline">{dictionary.common.viewAll || "View All"}</Link> {/* Use text-primary, dictionary, and lang prop */}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">{dictionary.dashboard.noUpcomingAppointments || "No upcoming appointments."}</p> // Use text-muted-foreground and dictionary
                    )}
                </CardContent>
              </Card>
        </div>
        {/* Add other dashboard sections like recent activity, charts, etc. later */}
    </main>
  );
}