"use client";

import { ErrorState } from "@/components/layout";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Admin error"
      description="An unexpected error occurred in the admin portal. You can retry or return to the overview."
      backHref="/admin"
      backLabel="Go to overview"
    />
  );
}

