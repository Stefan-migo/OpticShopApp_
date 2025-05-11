"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { type PurchaseOrder } from "./columns";
import { getColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table"; // Assuming a generic DataTable component exists
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation"; // Import useRouter, useParams, and useSearchParams
import { useToast } from "@/components/ui/use-toast"; // Import useToast
import { createClient } from "@/lib/supabase/client"; // Import createClient

export default function PurchaseOrdersPage() {
  const router = useRouter(); // Initialize useRouter
  const { toast } = useToast(); // Initialize useToast
  const params = useParams(); // Get params from URL
  const lang = params.lang as string; // Extract locale
  const searchParams = useSearchParams(); // Get search params from URL
  const tenantId = searchParams.get('tenantId'); // Get tenantId from search params

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperuser, setIsSuperuser] = useState(false);

  useEffect(() => {
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


  useEffect(() => {
    async function fetchPurchaseOrders() {
      try {
        setLoading(true);
        setError(null); // Clear previous errors

        const supabase = createClient();
        let query = supabase.from('purchase_orders').select('*');

        if (isSuperuser && tenantId) {
          query = query.eq('tenant_id', tenantId);
        } else if (!isSuperuser) {
           // Assuming non-superusers should only see their tenant's data
           // This part might need adjustment based on how non-superusers are handled
           // For now, assuming tenant_id is automatically handled by RLS for non-superusers
        }


        const { data, error } = await query;

        if (error) {
          throw new Error(error.message);
        }

        setPurchaseOrders(data || []);
      } catch (err: any) {
        console.error("Failed to fetch purchase orders:", err);
        setError(err.message || "Failed to fetch purchase orders.");
      } finally {
        setLoading(false);
      }
    }
    // Fetch data only if isSuperuser status is determined
    if (isSuperuser !== undefined) {
      fetchPurchaseOrders();
    }
  }, [isSuperuser, tenantId]); // Add isSuperuser and tenantId to dependency array


  // Define handlers for actions (edit, delete) - will be passed to columns
  const handleEdit = (purchaseOrder: PurchaseOrder) => {
    // Implement navigation to edit page
    router.push(`/purchase-orders/${purchaseOrder.id}/edit`);
  };

  const handleView = (purchaseOrderId: string) => {
    router.push(`/purchase-orders/${purchaseOrderId}/view`);
  };

  const handleDelete = async (purchaseOrderId: string) => {
    if (confirm("Are you sure you want to delete this purchase order?")) {
      try {
        const response = await fetch(`/api/purchase-orders/${purchaseOrderId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete purchase order');
        }
        // Remove deleted item from state
        setPurchaseOrders(purchaseOrders.filter(po => po.id !== purchaseOrderId));
        // Show a success toast
        toast({
          title: "Purchase order deleted successfully.",
        });
      } catch (err: any) {
        console.error("Failed to delete purchase order:", err);
        // Show an error toast
        toast({
          title: "Error deleting purchase order",
          description: err.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    }
  };

  const columns = getColumns({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete });

  if (loading) {
    return <div>Loading purchase orders...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Purchase Orders</h1>
        <Link href={`/${lang}/purchase-orders/new`}>
          <Button>Add New Purchase Order</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={purchaseOrders} />
    </div>
  );
}
