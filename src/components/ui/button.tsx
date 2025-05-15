import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", // Added rounded-lg and transition-all
  {
    variants: {
      variant: {
        default: "bg-muted border border-border text-muted-foreground shadow-neumorphic hover:shadow-neumorphic-sm active:shadow-neumorphic-inset", // Neumorphic default button
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90", // Keep destructive as is for now
        outline:
          "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground", // Adjusted border and background
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80", // Adjusted background and text
        ghost: "text-card-foreground hover:bg-accent hover:text-accent-foreground", // Added default text color
        link: "text-primary underline-offset-4 hover:underline", // Keep link as is for now
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3", // Keep rounded-md for smaller size
        lg: "h-11 rounded-md px-8", // Keep rounded-md for larger size
        icon: "h-10 w-10 rounded-full text-muted-foreground", // Added rounded-full for icon size
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
