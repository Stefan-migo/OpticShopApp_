"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from 'next/navigation'; // Import useParams

import { PurchaseOrderForm } from "../purchase-order-form"; // Import the form component

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams(); // Get params from URL
  const lang = params.lang as string; // Extract locale
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Placeholder for the form submission logic
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create purchase order');
      }

      const result = await response.json();
      toast({
        title: "Purchase order created successfully.",
      });
      router.push('/purchase-orders'); // Navigate back to the list

    } catch (error: any) {
      console.error("Error creating purchase order:", error);
      toast({
        title: "Error creating purchase order",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/${lang}/purchase-orders`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Add New Purchase Order</h1>
      </div>

      <PurchaseOrderForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
