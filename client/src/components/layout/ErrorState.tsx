"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Warning } from "@phosphor-icons/react";

export interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function ErrorState({
  error,
  reset,
  title = "Something went wrong",
  description = "An unexpected error occurred. You can try again or return to safety.",
  backHref = "/requests",
  backLabel = "Go back",
}: ErrorStateProps) {
  useEffect(() => {
    console.error("[BoundaryError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-[6px] border border-line bg-surface-2">
        <Warning weight="duotone" className="size-6 text-blood" aria-hidden="true" />
      </span>

      <h1 className="font-display text-xl font-semibold text-fg">
        {title}
      </h1>
      <p className="mt-2 max-w-sm font-sans text-sm text-fg-muted">
        {description}
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs text-fg-dim">
          Error ID: {error.digest}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="flex min-h-[38px] items-center rounded-[4px] bg-blood px-4 font-sans text-sm font-medium text-fg transition-colors hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood"
        >
          Try again
        </button>
        <Link
          href={backHref}
          className="flex min-h-[38px] items-center rounded-[4px] border border-line px-4 font-sans text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-blood"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}

