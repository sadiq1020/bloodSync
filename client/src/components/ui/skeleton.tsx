import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-surface-2/60 border-line/40 animate-pulse rounded-[6px] border",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
