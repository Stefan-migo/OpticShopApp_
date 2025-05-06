"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface

interface ComboboxProps {
  options: { value: string; label: string }[];
  selectedValue: string | null;
  onSelectValue: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  triggerClassName?: string;
  disabled?: boolean;
  dictionary?: Dictionary | null | undefined; // Add optional dictionary prop
}

export function Combobox({
  options,
  selectedValue,
  onSelectValue,
  placeholder = "Select option...",
  searchPlaceholder = "Search options...",
  noResultsText = "No results found.",
  triggerClassName,
  disabled = false,
  dictionary, // Accept dictionary prop
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  // Use dictionary for localization with fallback to default strings for search and no results
  const localizedSearchPlaceholder = dictionary?.sales?.searchCustomersPlaceholder || dictionary?.sales?.searchItemsPlaceholder || searchPlaceholder;
  const localizedNoResultsText = dictionary?.sales?.noCustomerFound || dictionary?.sales?.noStockFound || noResultsText;


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", triggerClassName)}
          disabled={disabled}
        >
          {selectedValue
            ? options.find((option) => option.value === selectedValue)?.label
            : placeholder} {/* Use the placeholder prop directly */}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0"> {/* Use trigger width */}
        <Command>
          <CommandInput placeholder={localizedSearchPlaceholder} /> {/* Use localized search placeholder */}
          <CommandList>
             <CommandEmpty>{localizedNoResultsText}</CommandEmpty> {/* Use localized no results text */}
             <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Search/filter based on label
                  onSelect={(currentLabel: string) => { // Add type annotation
                    // Find the option by label (case-insensitive might be better)
                    const selectedOption = options.find(opt => opt.label.toLowerCase() === currentLabel.toLowerCase());
                    onSelectValue(selectedOption ? selectedOption.value : null)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValue === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
