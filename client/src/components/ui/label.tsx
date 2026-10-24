"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-fg-muted flex items-center gap-2 font-mono text-xs tracking-wider uppercase select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-40 peer-disabled:cursor-not-allowed peer-disabled:opacity-40",
        className
      )}
      {...props}
    />
  );
}

export { Label };
