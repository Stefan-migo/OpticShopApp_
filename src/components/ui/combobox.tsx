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

interface ComboboxProps {
  options: { value: string; label: string }[];
  selectedValue: string | null;
  onSelectValue: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  triggerClassName?: string;
  disabled?: boolean;
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
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

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
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0"> {/* Use trigger width */}
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
             <CommandEmpty>{noResultsText}</CommandEmpty>
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
