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

import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface
import { useDictionary } from '@/lib/i18n/dictionary-context'; // Import useDictionary hook

interface CustomerSelectProps {
  onCustomerSelect: (customerId: string | null) => void;
  initialCustomerId?: string | null;
  isSuperuser: boolean; // Add isSuperuser prop
  tenantId: string | null; // Add tenantId prop
  // Remove dictionary prop as it will be accessed via context
  // dictionary: Dictionary | null | undefined;
  // Add form control prop if integrating directly with react-hook-form
  // control: any;
}

export function CustomerSelect({ onCustomerSelect, initialCustomerId, isSuperuser, tenantId }: CustomerSelectProps) { // Add isSuperuser and tenantId props
  const [customers, setCustomers] = useState<DropdownOption[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  const dictionary = useDictionary(); // Get dictionary from context

  // Fetch customers for dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("customers")
          .select("id, first_name, last_name")
          .order("last_name");

        // Apply tenant filter if user is superuser AND tenantId search parameter is present
        if (isSuperuser && tenantId) {
          query = query.eq('tenant_id', tenantId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setCustomers(data?.map(c => ({
            id: c.id,
            // TODO: Localize customer name formatting
            name: `${c.last_name || ''}${c.last_name && c.first_name ? ', ' : ''}${c.first_name || ''}`.trim() || dictionary.common.unnamedCustomer || 'N/A' // Add final hardcoded fallback
        })) || []);
      } catch (error: any) {
        console.error("Error fetching customers for dropdown:", error);
        // Use optional chaining for dictionary access
        toast({
          title: dictionary?.medicalActions?.customerSelect?.loadErrorTitle, // Use dictionary directly
          description: dictionary?.medicalActions?.customerSelect?.loadErrorDescription, // Use dictionary directly
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, [supabase, toast, dictionary, isSuperuser, tenantId]); // Add isSuperuser and tenantId to dependencies

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

  // No need for dictionary check here, useDictionary hook handles it

  return (
    <div> {/* Wrap in a div if not using FormField directly */}
      {/* Simple Select if not using react-hook-form */}
       <div className="space-y-2"> {/* Use a div for consistent spacing */}
            <label className="text-text-primary text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{dictionary.medicalActions.customerSelect.label}</label> {/* Applied text-text-primary and use dictionary directly */}
            <Input
              placeholder={dictionary.medicalActions.customerSelect.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
              className="mb-2" // Add some bottom margin
            />
            <Select onValueChange={onCustomerSelect} defaultValue={initialCustomerId ?? undefined} disabled={isLoading}>
                {/* Removed FormControl */}
                    <SelectTrigger>
                        <SelectValue placeholder={dictionary.medicalActions.customerSelect.placeholder} /> {/* Use dictionary directly */}
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
