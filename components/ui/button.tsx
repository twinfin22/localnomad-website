import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * LocalNomad Design System - Button Component
 *
 * Three main variants:
 * - primary: Cyan background, dark text (main CTAs)
 * - secondary: Transparent with border (secondary actions)
 * - ghost: Text only with underline on hover (tertiary actions)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-normal break-words text-center rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer",
  {
    variants: {
      variant: {
        // Primary: bg-accent text-inverse (main CTAs)
        default: "bg-primary text-primary-foreground hover:bg-accent-hover",
        primary: "bg-primary text-primary-foreground hover:bg-accent-hover",

        // Secondary: transparent with border (secondary actions)
        secondary: "bg-transparent border border-border text-foreground hover:bg-elevated hover:border-border-hover",
        outline: "bg-transparent border border-border text-foreground hover:bg-elevated hover:border-border-hover",

        // Ghost: text only (tertiary actions)
        ghost: "bg-transparent text-primary hover:text-accent-hover hover:underline",
        link: "bg-transparent text-primary underline-offset-4 hover:underline hover:text-accent-hover",

        // Destructive
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/50",

        // Legacy variants mapped to new system
        ctaPrimary: "bg-primary text-primary-foreground hover:bg-accent-hover",
        ctaSecondary: "bg-transparent border border-border text-foreground hover:bg-elevated hover:border-border-hover",
        ctaOutline: "bg-transparent border border-border text-foreground hover:bg-elevated hover:border-border-hover",
        inverted: "bg-foreground text-background hover:bg-foreground/90",
      },
      size: {
        default: "min-h-9 px-6 py-2.5 has-[>svg]:px-4",
        sm: "min-h-8 rounded-lg gap-1.5 px-4 py-1.5 text-sm has-[>svg]:px-3",
        lg: "min-h-10 rounded-lg px-6 py-3 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        cta: "min-h-12 px-6 py-3 text-base font-semibold leading-tight rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
