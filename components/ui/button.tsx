import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-normal break-words text-center rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-[--brand-navy] text-white shadow-sm hover:bg-[--brand-navy-light] hover:shadow-md",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-[--brand-navy]/30 bg-transparent text-[--brand-navy] shadow-xs hover:bg-[--brand-sky] hover:border-[--brand-navy]/50",
        secondary: "bg-[--brand-sky] text-[--brand-navy] hover:bg-[--brand-sky]/80",
        ghost: "text-[--brand-navy] hover:bg-[--brand-sky] hover:text-[--brand-navy]",
        link: "text-[--brand-navy] underline-offset-4 hover:underline",
        ctaPrimary: "bg-[--brand-navy] text-white shadow-md hover:bg-[--brand-navy-light] hover:shadow-lg",
        ctaSecondary: "bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 hover:border-white/50",
      },
      size: {
        default: "min-h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "min-h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "min-h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        cta: "min-h-14 px-8 py-4 text-base leading-snug rounded-lg",
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
