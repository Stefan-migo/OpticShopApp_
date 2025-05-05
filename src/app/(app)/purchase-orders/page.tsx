"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { type PurchaseOrder } from "./columns";
import { getColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table"; // Assuming a generic DataTable component exists
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPurchaseOrders() {
      try {
        setLoading(true);
        const response = await fetch('/api/purchase-orders'); // Assuming GET /api/purchase-orders lists all
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
    // TODO: Implement navigation to edit page or open edit dialog
    console.log("Edit purchase order:", purchaseOrder);
  };

  const handleDelete = async (purchaseOrderId: string) => {
    if (confirm("Are you sure you want to delete this purchase order?")) {
      try {
        const response = await fetch(`/api/purchase-orders/${purchaseOrderId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Error deleting purchase order: ${response.statusText}`);
        }
        // Remove deleted item from state
        setPurchaseOrders(purchaseOrders.filter(po => po.id !== purchaseOrderId));
        // TODO: Show a success toast
      } catch (err: any) {
        console.error("Failed to delete purchase order:", err);
        // TODO: Show an error toast
      }
    }
  };

  const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete });

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
        <Link href="/purchase-orders/new">
          <Button>Add New Purchase Order</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={purchaseOrders} />
    </div>
  );
}
