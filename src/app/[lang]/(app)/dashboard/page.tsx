//OpticShopApp_/src/app/[lang]/(app)/dashboard/page.tsx


import { createServerComponentClient } from "@/lib/supabase/server-component-client";
import { cookies } from "next/headers";
import DashboardContent from "@/components/DashboardContent";
import { getDictionary } from "@/lib/i18n";
import { Locale } from "@/lib/i18n/config";
import { Database } from "@/lib/supabase/types/database.types";

interface DashboardPageProps {
  params: { lang: Locale };
  searchParams: { [key: string]: string | string[] | undefined };
  tenantName?: string | null; // Add tenantName prop
}

async function getSalesData(supabase: ReturnType<typeof createServerComponentClient>, tenantId: string | null) {
  if (!tenantId) return { currentWeekSales: 0, lastWeekSales: 0 };

  const today = new Date();
  const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const lastWeekStart = new Date(today.setDate(today.getDate() - 7));
  const lastWeekEnd = new Date(today.setDate(today.getDate() + 6));

  const { data: currentWeekSalesData, error: currentWeekError } = await supabase
    .from('sales_orders')
    .select('total_amount')
    .eq('tenant_id', tenantId)
    .gte('created_at', currentWeekStart.toISOString());

  if (currentWeekError) {
    console.error("Error fetching current week sales:", currentWeekError);
    return { currentWeekSales: 0, lastWeekSales: 0 };
  }

  const currentWeekSales = currentWeekSalesData.reduce((sum, sale) => sum + sale.total_amount, 0);

  const { data: lastWeekSalesData, error: lastWeekError } = await supabase
    .from('sales_orders')
    .select('total_amount')
    .eq('tenant_id', tenantId)
    .gte('created_at', lastWeekStart.toISOString())
    .lte('created_at', lastWeekEnd.toISOString());

  if (lastWeekError) {
    console.error("Error fetching last week sales:", lastWeekError);
    return { currentWeekSales, lastWeekSales: 0 };
  }

  const lastWeekSales = lastWeekSalesData.reduce((sum, sale) => sum + sale.total_amount, 0);

  return { currentWeekSales, lastWeekSales };
}

async function getAppointmentsThisWeek(supabase: ReturnType<typeof createServerComponentClient>, tenantId: string | null) {
  if (!tenantId) return 0;

  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));

  const { data: appointmentsData, error } = await supabase
    .from('appointments')
    .select('id')
    .eq('tenant_id', tenantId)
    .gte('appointment_time', weekStart.toISOString());

  if (error) {
    console.error("Error fetching appointments this week:", error);
    return 0;
  }

  return appointmentsData.length;
}

async function getLowStockItemsCount(supabase: ReturnType<typeof createServerComponentClient>, tenantId: string | null) {
  if (!tenantId) return 0;

  const lowStockThreshold = 10; // Define low stock threshold

  const { data: lowStockItems, error } = await supabase
    .from('inventory_items')
    .select('id')
    .eq('tenant_id', tenantId)
    .lte('quantity', lowStockThreshold);

  if (error) {
    console.error("Error fetching low stock items:", error.message || error);
    return 0;
  }

  return lowStockItems.length;
}


export default async function DashboardPage({
  params,
  searchParams,
  tenantName, // Accept tenantName prop
}: DashboardPageProps) {
  const awaitedParams = await params; // Await params
  const lang = awaitedParams.lang; // Access lang from awaited params
  const awaitedSearchParams = await searchParams; // Await searchParams
  const supabase = createServerComponentClient();
  const dictionary = await getDictionary(lang);

  const { data: { user } } = await supabase.auth.getUser();

  let userName: string | null = null;
  let isSuperuser = false; // Initialize isSuperuser
  let userTenantId: string | null = null; // Initialize userTenantId

  if (user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, is_superuser, tenant_id') // Select full_name, is_superuser, and tenant_id
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
    } else {
      userName = profile?.full_name ?? null;
      if (profile?.is_superuser !== null) { // Check if is_superuser is not null
        isSuperuser = profile?.is_superuser;
      }
      userTenantId = profile?.tenant_id ?? null; // Assign fetched tenant_id
    }
  }

  const selectedTenantId = awaitedSearchParams.tenantId as string | undefined; // Use awaited searchParams
  const tenantIdToFetch = selectedTenantId || userTenantId;

  const { currentWeekSales, lastWeekSales } = await getSalesData(supabase, tenantIdToFetch);
  const appointmentsThisWeek = await getAppointmentsThisWeek(supabase, tenantIdToFetch);
  const lowStockItemsCount = await getLowStockItemsCount(supabase, tenantIdToFetch);


  // The main layout handles redirection for unauthenticated users,
  // so we can assume a user exists here if the page is rendered.
  // However, passing null for userName, isSuperuser, and userTenantId is safe if profile fetching fails.

  return (
    <DashboardContent
      userName={userName}
      dictionary={dictionary}
      lang={lang}
      isSuperuser={isSuperuser} // Pass isSuperuser
      userTenantId={userTenantId} // Pass userTenantId
      selectedTenantId={selectedTenantId} // Pass selectedTenantId from searchParams
      tenantName={tenantName} // Pass tenantName here
      currentWeekSales={currentWeekSales}
      lastWeekSales={lastWeekSales}
      appointmentsThisWeek={appointmentsThisWeek}
      lowStockItemsCount={lowStockItemsCount}
    />
  );
}
