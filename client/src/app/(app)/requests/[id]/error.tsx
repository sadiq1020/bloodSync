"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowClockwise, WarningCircle } from "@phosphor-icons/react";

export default function RequestDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Request detail error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="flex size-12 items-center justify-center rounded-full bg-blood-deep/30 border border-blood/30 text-blood-light">
        <WarningCircle className="size-6" weight="fill" />
      </div>

      <div className="space-y-1 max-w-md">
        <h1 className="font-display text-xl font-semibold text-fg">
          Failed to load request
        </h1>
        <p className="font-sans text-xs text-fg-muted leading-relaxed">
          {error.message ||
            "An error occurred while loading this blood request. Please try again."}
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="flex min-h-[38px] items-center gap-2 rounded-[4px] bg-blood px-4 font-sans text-xs font-semibold text-fg transition-colors hover:bg-blood-hover"
        >
          <ArrowClockwise className="size-3.5" aria-hidden="true" />
          <span>Try again</span>
        </button>

        <Link
          href="/requests"
          className="flex min-h-[38px] items-center gap-1.5 rounded-[4px] border border-line bg-surface px-4 font-sans text-xs font-medium text-fg-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Back to requests</span>
        </Link>
      </div>
    </div>
  );
}
