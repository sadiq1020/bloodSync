import * as React from "react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  ariaLabel?: string;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  ariaLabel = "Pagination",
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("flex items-center justify-center gap-3 pt-2", className)}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(
          "flex min-h-[40px] items-center gap-1.5 rounded-[4px] border border-line px-4 font-sans text-sm transition-colors",
          "hover:border-line-strong hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
        )}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Previous
      </button>

      <span className="font-mono text-xs text-fg-muted">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(
          "flex min-h-[40px] items-center gap-1.5 rounded-[4px] border border-line px-4 font-sans text-sm transition-colors",
          "hover:border-line-strong hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
        )}
      >
        Next
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
