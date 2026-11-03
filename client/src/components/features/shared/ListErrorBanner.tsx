import * as React from "react";
import { cn } from "@/lib/utils";

export interface ListErrorBannerProps {
  message?: string;
  onRetry: () => void;
  className?: string;
}

export function ListErrorBanner({
  message = "Failed to load data.",
  onRetry,
  className,
}: ListErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center justify-between rounded-[6px] border border-blood/30 bg-blood-deep/20 px-4 py-3",
        className
      )}
    >
      <p className="font-sans text-sm text-blood-light">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="font-mono text-xs text-blood-light underline hover:no-underline"
      >
        Try again
      </button>
    </div>
  );
}
