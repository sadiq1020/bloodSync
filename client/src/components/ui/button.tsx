import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-[6px] text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-1 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-blood text-fg hover:bg-blood-hover active:bg-blood-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] border border-transparent",
        outline:
          "border border-line bg-surface hover:bg-surface-2 text-fg hover:border-line-strong active:bg-surface-dark",
        secondary:
          "border border-line bg-surface-2 hover:bg-[#2e1d21] text-fg hover:border-line-strong",
        ghost: "hover:bg-surface hover:text-fg text-fg-muted",
        destructive:
          "border border-blood-deep bg-blood-deep/40 text-blood-light hover:bg-blood-deep/70 hover:text-fg",
        link: "text-blood-text underline-offset-4 hover:underline hover:text-blood-hover p-0 h-auto font-normal",
      },
      size: {
        default:
          "h-9 gap-2 px-3.5 text-sm [&_svg:not([class*='size-'])]:size-4",
        xs: "h-6 gap-1.5 rounded-[4px] px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-2 rounded-[6px] px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2.5 rounded-[6px] px-5 text-sm font-medium [&_svg:not([class*='size-'])]:size-4",
        icon: "size-9 rounded-[6px] [&_svg:not([class*='size-'])]:size-4",
        "icon-xs": "size-6 rounded-[4px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[6px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg":
          "size-10 rounded-[6px] [&_svg:not([class*='size-'])]:size-4.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
