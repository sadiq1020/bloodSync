"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="border-line bg-surface w-full max-w-md rounded-[10px] border p-8 shadow-sm">
        <span className="text-blood font-mono text-xs tracking-widest uppercase">
          Error
        </span>
        <h2 className="font-display text-fg mt-2 text-2xl font-semibold">
          Something went wrong
        </h2>
        <p className="text-fg-muted mt-2 text-sm">
          {error.message ||
            "An unexpected error occurred while rendering this page."}
        </p>
        <div className="mt-6">
          <Button onClick={reset} variant="default" size="sm">
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
