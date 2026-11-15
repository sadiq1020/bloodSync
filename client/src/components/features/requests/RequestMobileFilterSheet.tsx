"use client";

import * as React from "react";
import { SlidersHorizontal, FunnelSimple } from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface RequestMobileFilterSheetProps {
  count: number;
  children: React.ReactNode;
  clearButton: React.ReactNode;
}

export function RequestMobileFilterSheet({
  count,
  children,
  clearButton,
}: RequestMobileFilterSheetProps) {
  return (
    <Sheet>
      <SheetTrigger
        type="button"
        className={cn(
          "flex min-h-[40px] items-center gap-2 rounded-[4px] border border-line bg-surface px-4 font-sans text-sm text-fg transition-colors hover:border-line-strong",
          count > 0 && "border-blood"
        )}
      >
        <FunnelSimple className="size-4" aria-hidden="true" />
        Filters
        {count > 0 && (
          <span className="rounded-full bg-blood px-1.5 py-0.5 font-mono text-[10px] font-bold text-fg">
            {count}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90svh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-mono text-xs uppercase tracking-widest text-fg-dim">
            <SlidersHorizontal className="mr-2 inline size-4" aria-hidden="true" />
            Filters
          </SheetTitle>
        </SheetHeader>
        {children}
        <div className="mt-6">{clearButton}</div>
      </SheetContent>
    </Sheet>
  );
}

