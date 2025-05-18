"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from 'next/navigation'; // Import useParams
import { useDictionary } from '@/lib/i18n/dictionary-context'; // Import useDictionary

import { PurchaseOrderForm } from "../purchase-order-form"; // Import the form component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const dictionary = useDictionary(); // Get the dictionary
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
      <div className="flex items-center justify-between mb-6"> 
        <h1 className="text-2xl font-semibold">{dictionary.purchaseOrders.newTitle}</h1> 
        <Button asChild>
          <Link href={`/${lang}/purchase-orders`} className="inline-flex items-center"> {/* Added inline-flex and items-center for layout */}
            <ChevronLeft className="mr-2 h-4 w-4" />
            {dictionary.purchaseOrders.returnButton}
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.purchaseOrders.detailsCardTitle}</CardTitle> {/* Translated card title */}
        </CardHeader>
        <CardContent>
          <PurchaseOrderForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
