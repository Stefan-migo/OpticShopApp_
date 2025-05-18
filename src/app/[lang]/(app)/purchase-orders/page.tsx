"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { type PurchaseOrder } from "./columns";
import { getColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table"; // Assuming a generic DataTable component exists
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation"; // Import useRouter and useParams
import { useToast } from "@/components/ui/use-toast"; // Import useToast
import Cookies from 'js-cookie'; // Import js-cookie
import { useDictionary } from '@/lib/i18n/dictionary-context'; // Import useDictionary

export default function PurchaseOrdersPage() {
  const router = useRouter(); // Initialize useRouter
  const dictionary = useDictionary(); // Get the dictionary
  const { toast } = useToast(); // Initialize useToast
  const params = useParams(); // Get params from URL
  const lang = params.lang as string; // Extract locale

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPurchaseOrders() {
      try {
        setLoading(true);

        // Read superuser and selected tenant cookies
        const isSuperuser = Cookies.get('is_superuser') === 'true';
        const selectedTenantId = Cookies.get('selected_tenant_id');

        // Construct the API URL with query parameters for superusers
        const apiUrl = new URL('/api/purchase-orders', window.location.origin);
        if (isSuperuser && selectedTenantId) {
          apiUrl.searchParams.set('is_superuser', 'true');
          apiUrl.searchParams.set('selected_tenant_id', selectedTenantId);
        }

        const response = await fetch(apiUrl.toString()); // Call the API route with parameters
        if (!response.ok) {
          throw new Error(`Error fetching purchase orders: ${response.statusText}`);
        }
        const data = await response.json();
        setPurchaseOrders(data);
      } catch (err: any) {
        console.error("Failed to fetch purchase orders:", err);
        setError(err.message || "Failed to fetch purchase orders.");
      } finally {
        setLoading(false);
      }
    }
    fetchPurchaseOrders();
  }, []);


  // Define handlers for actions (edit, delete) - will be passed to columns
  const handleEdit = (purchaseOrder: PurchaseOrder) => {
    // Implement navigation to edit page
    router.push(`/purchase-orders/${purchaseOrder.id}/edit`);
  };

  const handleView = (purchaseOrderId: string) => {
    router.push(`/purchase-orders/${purchaseOrderId}/view`);
  };

  const handleDelete = async (purchaseOrderId: string) => {
    if (confirm(dictionary.purchaseOrders.deleteConfirmDescription)) {
      try {
        const response = await fetch(`/api/purchase-orders/${purchaseOrderId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || dictionary.purchaseOrders.deleteErrorTitle);
        }
        // Remove deleted item from state
        setPurchaseOrders(purchaseOrders.filter(po => po.id !== purchaseOrderId));
        // Show a success toast
        toast({
          title: dictionary.purchaseOrders.deleteSuccess,
        });
      } catch (err: any) {
        console.error("Failed to delete purchase order:", err);
        // Show an error toast
        toast({
          title: dictionary.purchaseOrders.deleteErrorTitle,
          description: err.message || dictionary.common.unexpectedError,
          variant: "destructive",
        });
      }
    }
  };

  if (loading || !dictionary) { // Add check for dictionary loading
    return <div>{dictionary?.common?.loading || 'Loading...'}</div>; {/* Translated loading message with fallback */}
  }

  if (error) {
    return <div className="text-red-500">{dictionary?.common?.failedToLoadData || 'Failed to load data'}: {error}</div>; {/* Translated error message with fallback */}
  }

  const columns = getColumns({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete, dictionary: dictionary }); {/* Pass dictionary */}

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">{dictionary.purchaseOrders.title}</h1> {/* Translated page title */}
        <Link href={`/${lang}/purchase-orders/new`}>
          <Button>{dictionary.purchaseOrders.addNewPurchaseOrderButton}</Button> {/* Translated button text */}
        </Link>
      </div>
      <DataTable columns={columns} data={purchaseOrders} />
    </div>
  );
}
