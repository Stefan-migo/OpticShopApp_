"use client"; // Needs client-side hooks

import * as React from "react";
import { useEffect, useState } from "react"; // Import useEffect and useState
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSalesHistoryColumns, type SalesOrder } from "./columns"; // Import columns and type
import { DataTable } from "@/components/ui/data-table";
import { createClient } from "@/lib/supabase/client";
import { Dialog } from "@/components/ui/dialog"; // Import Dialog for details
import { SalesOrderDetailsDialog } from "./sales-order-details-dialog"; // Import the details dialog component
import { useParams, useSearchParams } from 'next/navigation'; // Import useParams and useSearchParams
import { useDictionary } from '@/lib/i18n/dictionary-context'; // Import useDictionary hook
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface
// Remove js-cookie import: import Cookies from 'js-cookie'; // Import js-cookie


export default function SalesHistoryPage() {
  const supabase = createClient();
  const [data, setData] = React.useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false); // State for details dialog
  const [selectedOrder, setSelectedOrder] = React.useState<SalesOrder | null>(null); // State for selected order
  const [isSuperuser, setIsSuperuser] = React.useState(false); // State for isSuperuser flag
  const params = useParams(); // Get params from URL
  const lang = params.lang as string; // Extract locale as string
  const searchParams = useSearchParams(); // Get search parameters
  const tenantId = searchParams.get('tenantId'); // Get tenantId from search parameters


  const dictionary = useDictionary(); // Get dictionary from context

  // Fetch user and superuser status
  React.useEffect(() => {
    const checkSuperuser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_superuser')
          .eq('id', user.id)
          .single();
        if (profileData && profileData.is_superuser !== null) {
          setIsSuperuser(profileData.is_superuser);
        } else {
          setIsSuperuser(false);
        }
      } else {
        setIsSuperuser(false);
      }
    };
    checkSuperuser();
  }, [supabase]);


  // Function to fetch data client-side
  const fetchData = async () => {
    setIsLoading(true); // Corrected typo
    setError(null);

    // Remove cookie reads:
    // const isSuperuser = Cookies.get('is_superuser') === 'true';
    // const selectedTenantId = Cookies.get('selected_tenant_id');

    let query = supabase
      .from("sales_orders")
      .select(`
          id, order_number, customer_id, user_id, order_date,
          total_amount, discount_amount, tax_amount, final_amount,
          status, notes, created_at,
          customers ( first_name, last_name )
      `);

    // Apply tenant filter if superuser and a tenant is selected
    if (isSuperuser && tenantId) { // Use state variables
      query = query.eq('tenant_id', tenantId);
    }
    // Note: For non-superusers, RLS policies will automatically filter by their tenant_id

    const { data: orders, error: fetchError } = await query
      .order("order_date", { ascending: false }); // Show most recent first

    if (fetchError) {
      console.error("Error fetching sales orders:", fetchError);
      // Use optional chaining for dictionary access in case of initial render before context is fully ready (though useDictionary should prevent this)
      setError(`${dictionary.sales.history.fetchError || "Failed to load sales history"}: ${fetchError.message}`); // Use dictionary directly after guard clause
      setData([]);
    } else {
      setData(orders as any); // Cast needed due to joined data
    }
    setIsLoading(false); // Corrected typo
  };

  // Effect to fetch data when tenantId or isSuperuser changes
  React.useEffect(() => {
    fetchData();
  }, [supabase, dictionary, isSuperuser, tenantId]); // Add isSuperuser and tenantId to dependencies


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
        <h1 className="text-2xl font-semibold">{dictionary.sales.history.title || "Sales History"}</h1>
        <Link href={`/${lang}/sales`} passHref>
          <Button variant="outline">
              {dictionary.sales.history.backToPosButton || "Back to POS"}
          </Button>
        </Link>
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
