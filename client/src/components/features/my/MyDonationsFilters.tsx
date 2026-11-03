"use client";

import * as React from "react";
import { useQueryStates } from "nuqs";
import { cn } from "@/lib/utils";
import {
  myDonationsParsers,
  type MyDonationStatus,
} from "@/lib/search-params/my-donations";

const STATUS_FILTERS: { label: string; value: MyDonationStatus | null }[] = [
  { label: "All", value: null },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function MyDonationsFilters({ className }: { className?: string }) {
  const [params, setParams] = useQueryStates(myDonationsParsers, {
    shallow: true,
  });

  const currentStatus = params.status;

  return (
    <div
      role="group"
      aria-label="Filter donations by status"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {STATUS_FILTERS.map((item) => {
        const isSelected =
          item.value === null ? !currentStatus : currentStatus === item.value;

        return (
          <button
            key={item.label}
            type="button"
            role="button"
            aria-pressed={isSelected}
            onClick={() => {
              setParams({
                status: item.value,
                page: 1,
              });
            }}
            className={cn(
              "flex min-h-[36px] items-center justify-center rounded-[4px] px-3.5 font-sans text-xs font-medium transition-colors select-none",
              isSelected
                ? "bg-blood text-fg shadow-xs"
                : "border border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg hover:bg-surface-2"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
