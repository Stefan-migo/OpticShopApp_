"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PurchaseOrderForm } from "../../purchase-order-form"; // Import the form component
import { type PurchaseOrderFormValues } from "../../purchase-order-form"; // Import form values type
import { type PurchaseOrder } from "../../columns"; // Import PurchaseOrder type

export default function EditPurchaseOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { id } = params;

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (values: PurchaseOrderFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/purchase-orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update purchase order');
      }

      const result = await response.json();
      toast({
        title: "Purchase order updated successfully.",
      });
      router.push('/purchase-orders'); // Navigate back to the list

    } catch (error: any) {
      console.error("Error updating purchase order:", error);
      toast({
        title: "Error updating purchase order",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading purchase order...</div>;
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
        <h1 className="text-2xl font-semibold">Edit Purchase Order</h1>
      </div>

      <PurchaseOrderForm
        initialData={purchaseOrder}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
