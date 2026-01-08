import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-normal break-words text-center rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/50",
        outline:
          "border border-primary/30 bg-transparent text-primary shadow-xs hover:bg-primary/5 hover:border-primary/50 dark:border-primary/40 dark:hover:bg-primary/10",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-primary hover:bg-primary/5 dark:hover:bg-primary/10",
        link: "text-primary underline-offset-4 hover:underline",
        ctaPrimary: "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg",
        ctaSecondary: "bg-[#3F5F8C] text-white shadow-md hover:bg-[#4A6F9C] hover:shadow-lg dark:bg-[#4A6F9C] dark:hover:bg-[#5A7FAC]",
        ctaOutline: "border-2 border-white bg-transparent text-white hover:bg-white/10 hover:border-white focus-visible:ring-white/50",
        inverted: "bg-background text-foreground shadow-sm hover:bg-muted",
      },
      size: {
        default: "min-h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "min-h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "min-h-10 rounded-md px-6 has-[>svg]:px-4",
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
