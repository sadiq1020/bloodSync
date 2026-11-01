"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-line transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "bg-surface-2 data-[checked]:bg-blood data-[checked]:border-blood",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4.5 rounded-full bg-fg shadow-xs ring-0 transition-transform",
          "translate-x-0.5 data-[checked]:translate-x-5"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
