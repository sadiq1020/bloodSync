import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "border-line bg-surface-dark text-fg h-9 w-full min-w-0 rounded-[6px] border px-3 py-1.5 text-sm transition-colors outline-none",
        "placeholder:text-fg-dim",
        "focus-visible:border-blood focus-visible:ring-blood focus-visible:ring-1",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        "aria-invalid:border-blood aria-invalid:ring-blood aria-invalid:ring-1",
        className
      )}
      {...props}
    />
  );
}

export { Input };
