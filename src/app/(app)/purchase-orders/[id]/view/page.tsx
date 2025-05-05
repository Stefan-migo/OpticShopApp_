"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { type PurchaseOrder, type PurchaseOrderItem } from "../../columns"; // Import types
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming Card components exist
import { Separator } from "@/components/ui/separator"; // Assuming Separator component exists

export default function ViewPurchaseOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { toast } = useToast();
  const { id } = React.use(params); // Unwrap params with React.use()

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPurchaseOrder() {
      try {
        setLoading(true);
        const response = await fetch(`/api/purchase-orders/${id}`);
        if (!response.ok) {
          throw new Error(`Error fetching purchase order: ${response.statusText}`);
        }
        const data: PurchaseOrder = await response.json();
        setPurchaseOrder(data);
      } catch (err: any) {
        console.error("Failed to fetch purchase order:", err);
        setError(err.message || "Failed to fetch purchase order.");
      } finally {
        setLoading(false);
      }
    }
    fetchPurchaseOrder();
  }, [id]); // Refetch if ID changes

  if (loading) {
    return <div>Loading purchase order details...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!purchaseOrder) {
      return <div>Purchase order not found.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/purchase-orders">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Purchase Order Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Order #{purchaseOrder.id.substring(0, 8)}...</CardTitle> {/* Display truncated ID */}
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Supplier:</strong> {purchaseOrder.suppliers?.name || 'N/A'}</p> {/* Display supplier name if joined */}
          <p><strong>Order Date:</strong> {new Date(purchaseOrder.order_date).toLocaleDateString()}</p>
          {purchaseOrder.expected_delivery_date && (
            <p><strong>Expected Delivery Date:</strong> {new Date(purchaseOrder.expected_delivery_date).toLocaleDateString()}</p>
          )}
          <p><strong>Status:</strong> {purchaseOrder.status}</p>
          <p><strong>Total Amount:</strong> {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(purchaseOrder.total_amount || 0)}</p>

          <Separator />

          <h3 className="text-lg font-semibold">Items</h3>
          {purchaseOrder.purchase_order_items.length > 0 ? (
            <ul className="space-y-2">
              {purchaseOrder.purchase_order_items.map(item => (
                <li key={item.id} className="border-b pb-2">
                  <p><strong>Product:</strong> {item.products?.name || 'N/A'}</p> {/* Display product name if joined */}
                  <p><strong>Quantity:</strong> {item.quantity_ordered}</p>
                  <p><strong>Unit Price:</strong> {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.unit_price)}</p>
                  <p><strong>Line Total:</strong> {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.line_total)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No items in this purchase order.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
