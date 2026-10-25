import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-[4px] px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider transition-colors select-none [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border border-blood-deep/60 bg-blood-deep/30 text-blood-text",
        secondary: "border border-line bg-surface-2 text-fg",
        outline: "border border-line bg-transparent text-fg-muted",
        plasma: "border border-plasma/30 bg-plasma/10 text-plasma",
        sage: "border border-sage/30 bg-sage/10 text-sage",
        destructive:
          "border border-blood-deep bg-blood-deep/50 text-blood-light",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
