import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-line bg-surface-dark text-fg flex min-h-20 w-full rounded-[6px] border px-3 py-2 text-sm transition-colors outline-none",
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

export { Textarea };
