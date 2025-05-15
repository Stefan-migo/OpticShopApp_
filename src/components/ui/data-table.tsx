"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useDictionary } from "@/lib/i18n/dictionary-context";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // Optional: Add a filter column key if needed
  filterColumnKey?: string;
  filterPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumnKey, // Key of the column to filter by (e.g., 'email')
  filterPlaceholder = "Filter...", // Default placeholder
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const dictionary = useDictionary();

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        {/* Optional Filter Input */}
        {filterColumnKey && (
           <Input
             placeholder={filterPlaceholder}
             value={(table.getColumn(filterColumnKey)?.getFilterValue() as string) ?? ""}
             onChange={(event) =>
               table.getColumn(filterColumnKey)?.setFilterValue(event.target.value)
             }
             className="max-w-sm"
           />
        )}
        {/* Column Visibility Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              {dictionary.common.columns} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                // Map column.id to the correct dictionary path and provide fallback
                let translatedColumnName = column.id;
                switch (column.id) {
                  case 'first_name':
                    translatedColumnName = dictionary.customers.form.firstNameLabel ?? column.id;
                    break;
                  case 'last_name':
                    translatedColumnName = dictionary.customers.form.lastNameLabel ?? column.id;
                    break;
                  case 'email':
                    translatedColumnName = dictionary.customers.form.emailLabel ?? column.id;
                    break;
                  case 'phone':
                    translatedColumnName = dictionary.customers.form.phone ?? column.id;
                    break;
                  case 'created_at':
                    translatedColumnName = dictionary.inventory.productColumns.createdAtHeader ?? column.id; // Use inventory key for created_at
                    break;
                  // Inventory Product Table Columns
                  case 'name':
                    translatedColumnName = dictionary.inventory.productColumns.nameHeader ?? column.id;
                    break;
                  case 'product_categories_name':
                    translatedColumnName = dictionary.inventory.productColumns.categoryHeader ?? column.id;
                    break;
                  case 'brand':
                    translatedColumnName = dictionary.inventory.productColumns.brandHeader ?? column.id;
                    break;
                  case 'base_price':
                    translatedColumnName = dictionary.inventory.productColumns.priceHeader ?? column.id;
                    break;
                  // Inventory Stock Table Columns
                  case 'products_name':
                    translatedColumnName = dictionary.inventory.stockColumns.productNameHeader ?? column.id;
                    break;
                  case 'serial_number':
                    translatedColumnName = dictionary.inventory.stockColumns.serialNumberHeader ?? column.id;
                    break;
                  case 'quantity':
                    translatedColumnName = dictionary.inventory.stockColumns.quantityHeader ?? column.id;
                    break;
                  case 'status':
                    translatedColumnName = dictionary.inventory.stockColumns.statusHeader ?? column.id;
                    break;
                  case 'location':
                    translatedColumnName = dictionary.inventory.stockColumns.locationHeader ?? column.id;
                    break;
                  case 'cost_price':
                    translatedColumnName = dictionary.inventory.stockColumns.costPriceHeader ?? column.id;
                    break;
                  case 'purchase_date':
                    translatedColumnName = dictionary.inventory.stockColumns.purchaseDateHeader ?? column.id;
                    break;
                  default:
                    // Fallback to column.id if no translation is found
                    translatedColumnName = column.id;
                }

                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {translatedColumnName}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Table */}
      <div className="border border-border"> {/* Adjusted rounded corners, removed border */}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground"> {/* Applied text-text-secondary */}
          {table.getFilteredSelectedRowModel().rows.length} {dictionary.common.of}{" "}
          {table.getFilteredRowModel().rows.length} {dictionary.common.rowsSelected}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {dictionary.common.previous}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {dictionary.common.next}
          </Button>
        </div>
      </div>
    </div>
  );
}
