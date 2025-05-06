"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface

// Define the shape of our prescription data (joining with customers)
export type Prescription = {
  id: string;
  medical_record_id: string | null; // Add medical_record_id
  customer_id: string;
  prescriber_id: string | null; // Add prescriber_id
  prescription_date: string; // Date as string
  expiry_date: string | null; // Date as string
  type: 'glasses' | 'contact_lens'; // Match enum
  od_params: any | null; // JSONB - Oculus Dexter (Right Eye)
  os_params: any | null; // JSONB - Oculus Sinister (Left Eye)
  notes: string | null;
  created_at: string;
  // Joined data from customers table
  customers?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  // Joined data from profiles table for prescriber
  prescribers?: {
    full_name: string | null;
  } | null;
};

// Define props for the columns function
interface PrescriptionColumnsProps {
  onEdit: (prescription: Prescription) => void;
  onDelete: (prescriptionId: string) => void;
  onViewDetails: (prescription: Prescription) => void; // Add onViewDetails prop
  dictionary: Dictionary; // Add dictionary prop
}

// Helper function to format date
const formatDate = (dateString: string | null | undefined, locale: string = 'en-US', dictionary: Dictionary) => { // Add locale param and dictionary
    if (!dateString) return dictionary.common.notAvailable; // Use dictionary for placeholder
    try {
        // Assuming date string is in 'YYYY-MM-DD' format from DB
        // TODO: Localize date formatting based on locale and dictionary format string
        return new Date(dateString + 'T00:00:00').toLocaleDateString(locale); // Add time part to avoid timezone issues
    } catch (e) {
        return dictionary.common.invalidDate; // Use dictionary for "Invalid Date"
    }
};

// Export a function that generates the columns array
export const getPrescriptionColumns = ({ onEdit, onDelete, onViewDetails, dictionary }: PrescriptionColumnsProps): ColumnDef<Prescription>[] => {

  return [
    // Optional: Select column
    // { id: "select", ... },
    {
      accessorKey: "customers.last_name", // Access nested customer name
      header: ({ column }) => {
        // Explicitly cast dictionary to Dictionary within the header function
        const loadedDictionary = dictionary as Dictionary;
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {loadedDictionary.prescriptions.columns?.customerNameHeader || "Customer Name"} {/* Use dictionary */}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
          const firstName = row.original.customers?.first_name;
          const lastName = row.original.customers?.last_name;
          // TODO: Localize customer name formatting
          return <div className="font-medium">{lastName ? `${lastName}, ${firstName || ''}` : (firstName || (dictionary.common.notAvailable || 'N/A'))}</div>; // Use dictionary
      },
      sortingFn: 'text', // Basic text sorting for combined name
      filterFn: (row, id, value) => { // Custom filter for nested object
          const firstName = row.original.customers?.first_name?.toLowerCase() || '';
          const lastName = row.original.customers?.last_name?.toLowerCase() || '';
          const filterValue = String(value).toLowerCase();
          return lastName.includes(filterValue) || firstName.includes(filterValue);
      },
    },
    {
      accessorKey: "prescription_date",
      header: ({ column }) => {
         return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {dictionary.prescriptions.columns?.prescriptionDateHeader || "Prescription Date"} {/* Use dictionary */}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{formatDate(row.getValue("prescription_date"), 'en-US', dictionary)}</div>, // Use localized formatDate and pass dictionary
    },
    {
      accessorKey: "expiry_date",
       header: ({ column }) => {
         return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {dictionary.prescriptions.columns?.expiryDateHeader || "Expiry Date"} {/* Use dictionary */}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{formatDate(row.getValue("expiry_date"), 'en-US', dictionary)}</div>, // Use localized formatDate and pass dictionary
    },
    {
      accessorKey: "type",
      header: () => {
        return dictionary.prescriptions.columns?.typeHeader || "Type"; // Use dictionary
      },
      cell: ({ row }) => {
          const type = row.getValue("type");
          // TODO: Localize type text
          return <Badge variant="secondary" className="capitalize">{type === 'contact_lens' ? 'Contacts' : 'Glasses'}</Badge>;
      },
       filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
    },
     {
      accessorKey: "prescribers.full_name", // Access nested prescriber name
      id: "prescribers.full_name", // Explicitly set ID for filtering
      header: () => {
        return dictionary.prescriptions.columns?.prescriberHeader || "Prescriber"; // Use dictionary
      },
      cell: ({ row }) => <div>{row.original.prescribers?.full_name || dictionary.common.notAvailable}</div>, // Access nested name and use dictionary
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const prescription = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{dictionary.common.openMenu || "Open menu"}</span> {/* Use dictionary */}
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{dictionary.common.actions || "Actions"}</DropdownMenuLabel> {/* Use dictionary */}
              <DropdownMenuItem onClick={() => onViewDetails(prescription)}>{dictionary.prescriptions.columns?.viewDetails || "View Details"}</DropdownMenuItem> {/* Use dictionary */}
              <DropdownMenuItem onClick={() => onEdit(prescription)}>{dictionary.prescriptions.columns?.editPrescription || "Edit Prescription"}</DropdownMenuItem> {/* Use dictionary */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700 focus:bg-red-100"
                onClick={() => onDelete(prescription.id)}
              >
                {dictionary.prescriptions.columns?.deletePrescription || "Delete Prescription"} {/* Use dictionary */}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
