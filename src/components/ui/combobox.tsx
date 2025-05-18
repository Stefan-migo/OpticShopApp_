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
  specificSearchPlaceholder?: string; // New prop for specific search placeholder
  specificNoResultsText?: string; // New prop for specific no results text
  onSearchChange?: (value: string) => void; // Add onSearchChange prop
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
  specificSearchPlaceholder, // Accept new prop
  specificNoResultsText, // Accept new prop
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  // Use specific props first, then dictionary lookups, then default props
  const localizedSearchPlaceholder = specificSearchPlaceholder || dictionary?.sales?.searchCustomersPlaceholder || dictionary?.sales?.searchItemsPlaceholder || searchPlaceholder;
  const localizedNoResultsText = specificNoResultsText || dictionary?.sales?.noCustomerFound || dictionary?.sales?.noStockFound || noResultsText;


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between bg-input border border-border text-muted-foreground", triggerClassName)}
          disabled={disabled}
        >
          {selectedValue
            ? options.find((option) => option.value === selectedValue)?.label
            : placeholder} {/* Use the placeholder prop directly */}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0"> {/* Use trigger width */}
        <Command className="rounded-lg bg-element-bg text-text-primary"> {/* Applied Neumorphic styles */}
          <CommandInput placeholder={localizedSearchPlaceholder} className="rounded-md bg-element-bg shadow-neumorphic-inset text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 ring-offset-app-bg" /> {/* Applied Neumorphic styles */}
          <CommandList>
             <CommandEmpty className="text-text-secondary">{localizedNoResultsText}</CommandEmpty> {/* Applied text-text-secondary */}
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
                  className="text-text-primary focus:bg-accent focus:text-accent-foreground" // Applied text-text-primary and focus styles
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-accent-primary", // Applied text-accent-primary
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
