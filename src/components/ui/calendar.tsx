"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-element-bg shadow-neumorphic rounded-lg", className)} // Applied Neumorphic styles to container
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-text-primary", // Applied text-text-primary
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-element-bg p-0 opacity-50 hover:opacity-100 hover:shadow-neumorphic-sm transition-all" // Applied bg-element-bg and hover shadow
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-text-secondary rounded-md w-9 font-normal text-[0.8rem]", // Applied text-text-secondary
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 focus-within:ring-2 focus-within:ring-accent-primary focus-within:ring-offset-2 focus-within:ring-offset-app-bg", // Adjusted focus ring and offset
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal shadow-neumorphic-sm bg-element-bg transition-all hover:shadow-neumorphic data-[state=selected]:bg-accent-primary data-[state=selected]:text-white data-[state=selected]:shadow-none data-[state=today]:bg-muted data-[state=today]:text-muted-foreground data-[state=today]:shadow-neumorphic-inset data-[state=outside]:text-text-secondary data-[state=outside]:opacity-80 data-[state=outside]:shadow-none data-[state=disabled]:text-text-secondary data-[state=disabled]:opacity-50 data-[state=disabled]:shadow-none data-[state=range_middle]:bg-muted data-[state=range_middle]:text-muted-foreground data-[state=range_middle]:shadow-neumorphic-inset aria-selected:opacity-100" // Applied Neumorphic styles and states
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-accent-primary text-white hover:bg-accent-primary focus:bg-accent-primary focus:text-white", // Ensured selected state uses accent color and white text
        day_today: "bg-muted text-muted-foreground", // Ensured today state uses muted colors
        day_outside:
          "day-outside text-text-secondary opacity-80 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30", // Adjusted outside days text color and opacity
        day_disabled: "text-text-secondary opacity-50", // Adjusted disabled days text color and opacity
        day_range_middle:
          "aria-selected:bg-muted aria-selected:text-muted-foreground", // Ensured range middle uses muted colors
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
