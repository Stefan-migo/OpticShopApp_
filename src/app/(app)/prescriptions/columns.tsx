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

// Define the shape of our prescription data (joining with customers)
export type Prescription = {
  id: string;
  medical_record_id: string | null; // Add medical_record_id
  customer_id: string;
  prescriber_id: string | null; // Add prescriber_id
  prescriber_name: string | null;
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
};

// Define props for the columns function
interface PrescriptionColumnsProps {
  onEdit: (prescription: Prescription) => void;
  onDelete: (prescriptionId: string) => void;
  onViewDetails: (prescription: Prescription) => void; // Add onViewDetails prop
}

// Helper function to format date
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
        // Assuming date string is in 'YYYY-MM-DD' format from DB
        return new Date(dateString + 'T00:00:00').toLocaleDateString(); // Add time part to avoid timezone issues
    } catch (e) {
        return "Invalid Date";
    }
};

// Export a function that generates the columns array
export const getPrescriptionColumns = ({ onEdit, onDelete, onViewDetails }: PrescriptionColumnsProps): ColumnDef<Prescription>[] => [
  // Optional: Select column
  // { id: "select", ... },
  {
    accessorKey: "customers.last_name", // Access nested customer name
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Customer Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
        const firstName = row.original.customers?.first_name;
        const lastName = row.original.customers?.last_name;
        return <div className="font-medium">{lastName ? `${lastName}, ${firstName || ''}` : (firstName || 'N/A')}</div>;
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
    header: ({ column }) => (
       <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Prescription Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => <div>{formatDate(row.getValue("prescription_date"))}</div>,
  },
  {
    accessorKey: "expiry_date",
     header: ({ column }) => (
       <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Expiry Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => <div>{formatDate(row.getValue("expiry_date"))}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
        const type = row.getValue("type");
        return <Badge variant="secondary" className="capitalize">{type === 'contact_lens' ? 'Contacts' : 'Glasses'}</Badge>;
    },
     filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
   {
    accessorKey: "prescriber_name",
    header: "Prescriber",
    cell: ({ row }) => <div>{row.getValue("prescriber_name") || "-"}</div>,
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
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetails(prescription)}>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(prescription)}>Edit Prescription</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700 focus:bg-red-100"
              onClick={() => onDelete(prescription.id)}
            >
              Delete Prescription
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
