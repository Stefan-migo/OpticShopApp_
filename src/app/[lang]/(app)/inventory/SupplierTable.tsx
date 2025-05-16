"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table"; // Assuming DataTable component exists
import { type Supplier } from "@/lib/supabase/types/database.types"; // Assuming types are generated
import { type Dictionary } from "@/lib/i18n/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface SupplierTableProps {
  dictionary: Dictionary;
  data: Supplier[];
  onEdit: (supplier: Supplier) => void; // Add onEdit prop
  onDelete: (supplierId: string) => void; // Add onDelete prop
}

export function SupplierTable({ dictionary, data, onEdit, onDelete }: SupplierTableProps) {
  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: dictionary.inventory?.supplierTable?.nameHeader || "Name",
    },
    {
      accessorKey: "contact_person",
      header: dictionary.inventory?.supplierTable?.contactPersonHeader || "Contact Person",
    },
    {
      accessorKey: "email",
      header: dictionary.inventory?.supplierTable?.emailHeader || "Email",
    },
    {
      accessorKey: "phone",
      header: dictionary.inventory?.supplierTable?.phoneHeader || "Phone",
    },
    {
      accessorKey: "address",
      header: dictionary.inventory?.supplierTable?.addressHeader || "Address",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const supplier = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{dictionary.common?.actions}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(supplier.id)}>
                {dictionary.common?.copyId}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(supplier)}>
                {dictionary.common?.edit}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(supplier.id)} className="text-red-500 focus:text-red-600"> {/* Add destructive styling */}
                {dictionary.common?.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      filterColumnKey="name" // Assuming filtering by name
      filterPlaceholder={dictionary.inventory?.supplierTable?.filterPlaceholder || "Filter suppliers..."}
    />
  );
}
