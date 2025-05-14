"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Import Button
import { subDays, format } from 'date-fns';
import Link from 'next/link'; // Import Link
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface
import { Locale } from '@/lib/i18n/config'; // Import Locale type

interface DashboardContentProps {
  userName: string | null;
  dictionary: Dictionary; // Use the imported Dictionary interface
  lang: Locale; // Add lang prop
  isSuperuser: boolean; // Add isSuperuser prop
  userTenantId: string | null; // Add userTenantId prop
  selectedTenantId?: string; // Add selectedTenantId prop for superusers
  tenantName?: string | null; // Add tenantName prop
  currentWeekSales: number;
  lastWeekSales: number;
  appointmentsThisWeek: number;
  lowStockItemsCount: number;
}

export default function DashboardContent({ userName, dictionary, lang, isSuperuser, userTenantId, selectedTenantId, tenantName, currentWeekSales, lastWeekSales, appointmentsThisWeek, lowStockItemsCount }: DashboardContentProps) {
  const supabase = createClient();

  return (
    // Apply background and text color to the main container
    // min-h-screen is important to ensure the background covers the full viewport height
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background text-foreground min-h-screen transition-colors duration-300">
        {/* Tenant Logo Placeholder */}
        {tenantName && (
          <div className="flex items-center gap-4">
            {/* Replace with actual logo when implemented */}
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              {tenantName.charAt(0).toUpperCase()}
            </div>
            {userName && (
                // Apply text color to the greeting
                <h1 className="text-2xl font-semibold text-foreground">
                  {tenantName
                    ? (dictionary.dashboard.greetingWithTenant?.replace('{{name}}', userName).replace('{{tenantName}}', tenantName) || `Welcome, ${userName} to ${tenantName}!`)
                    : (dictionary.dashboard.greeting?.replace('{{name}}', userName) || dictionary.dashboard.greetingFallback?.replace('{{name}}', userName) || `Good morning, ${userName}!`)
                  }
                </h1>
            )}
          </div>
        )}
         {!tenantName && userName && (
             <h1 className="text-2xl font-semibold text-foreground">
               {dictionary.dashboard.greeting?.replace('{{name}}', userName) || dictionary.dashboard.greetingFallback?.replace('{{name}}', userName) || `Good morning, ${userName}!`}
             </h1>
         )}
        {/* Quick Action Buttons */}
        <div className="flex gap-4">
          <Link href={`/${lang}/sales`}>
            <Button>{dictionary.dashboard.newSaleButton || "New Sale"}</Button>
          </Link>
          <Link href={`/${lang}/appointments`}>
            <Button>{dictionary.dashboard.scheduleAppointmentButton || "Schedule Appointment"}</Button>
          </Link>
        </div>
        {/* Apply background and gap to the grid container */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              {/* Sales This Week Card */}
              <Card className="rounded-xl shadow-neumorphic">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-foreground text-sm font-medium">
                    {dictionary.dashboard.salesThisWeek || "Sales This Week"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {currentWeekSales.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </div>
                  {lastWeekSales > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {((currentWeekSales - lastWeekSales) / lastWeekSales * 100).toFixed(2)}% {dictionary.dashboard.salesChangePercentage || "vs. Last Week"}
                    </p>
                  )}
                   {lastWeekSales === 0 && currentWeekSales > 0 && (
                    <p className="text-xs text-muted-foreground">
                      +100% {dictionary.dashboard.salesChangePercentage || "vs. Last Week"}
                    </p>
                  )}
                   {lastWeekSales === 0 && currentWeekSales === 0 && (
                    <p className="text-xs text-muted-foreground">
                      0% {dictionary.dashboard.salesChangePercentage || "vs. Last Week"}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Appointments This Week Card */}
              <Card className="rounded-xl shadow-neumorphic">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-foreground text-sm font-medium">
                    {dictionary.dashboard.appointmentsThisWeek || "Appointments This Week"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {appointmentsThisWeek}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Items Card */}
              <Card className="rounded-xl shadow-neumorphic">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-foreground text-sm font-medium">
                    {dictionary.dashboard.lowStockItemsCount || "Low Stock Items"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {lowStockItemsCount}
                  </div>
                </CardContent>
              </Card>
        </div>
        {/* Add other dashboard sections like recent activity, charts, etc. later */}
    </main>
  );
}
