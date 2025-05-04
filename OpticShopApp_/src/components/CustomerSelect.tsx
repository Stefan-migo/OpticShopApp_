"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Assuming client-side Supabase client
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Import Input component
// import {
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
// } from "@/components/ui/form"; // Assuming FormField is used for integration
import { useToast } from "@/components/ui/use-toast";

// Define simple type for fetched customer dropdown data
type DropdownOption = { id: string; name: string };

interface CustomerSelectProps {
  onCustomerSelect: (customerId: string | null) => void;
  initialCustomerId ? : string | null;
  // Add form control prop if integrating directly with react-hook-form
  // control: any;
}

export function CustomerSelect({
  onCustomerSelect,
  initialCustomerId
}: CustomerSelectProps) {
  const [customers, setCustomers] = useState < DropdownOption[] > ([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  // Fetch customers for dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const {
          data,
          error
        } = await supabase
          .from("customers")
          .select("id, first_name, last_name")
          .order("last_name");
        if (error) throw error;
        setCustomers(data ? .map(c => ({
          id: c.id,
          name: `${c.last_name || ''}${c.last_name && c.first_name ? ', ' : ''}${c.first_name || ''}` || 'Unnamed Customer'
        })) || []);
      } catch (error: any) {
        console.error("Error fetching customers for dropdown:", error);
        toast({
          title: "Error loading customers",
          description: "Could not load customer list.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, [supabase, toast]);

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => {
    const searchTerm = searchQuery.toLowerCase();
    const customerName = customer.name.toLowerCase();

    // Check if the full name includes the search term
    if (customerName.includes(searchTerm)) {
      return true;
    }

    // Split the name into parts (assuming "Last Name, First Name" format)
    const nameParts = customerName.split(',').map(part => part.trim());

    // Check if any part of the name includes the search term
    if (nameParts.some(part => part.includes(searchTerm))) {
      return true;
    }

    // If no match
    return false;
  });

  return (
    <div> {/* Wrap in a div if not using FormField directly */}
      {/* If integrating with react-hook-form, use FormField */}
      {/* <FormField
        control={control} // Pass control from parent form
        name="customer_id" // Name of the form field
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer *</FormLabel>
            <FormControl>
              <Select onValueChange={(value) => { field.onChange(value); onCustomerSelect(value); }} defaultValue={field.value ? ? undefined} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCustomers.map((cust) => (
                    <SelectItem key={cust.id} value={cust.id}>
                      {cust.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      /> */}

      {/* Simple Select if not using react-hook-form */}
      <div className="space-y-2"> {/* Use a div for consistent spacing */}
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Select Customer</label> {/* Use a standard label */}
        <Input
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading}
          className="mb-2" // Add some bottom margin
        />
        <Select onValueChange={onCustomerSelect} defaultValue={initialCustomerId ? ? undefined} disabled={isLoading}>
          {/* Removed FormControl */}
          <SelectTrigger>
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {/* Render filtered customers */}
            {filteredCustomers.map((cust) => (
              <SelectItem key={cust.id} value={cust.id}>
                {cust.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Removed FormMessage */}
      </div>

    </div>
  );
}