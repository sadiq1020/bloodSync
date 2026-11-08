"use client";

import { ErrorState } from "@/components/layout";

export default function AppError({
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
      title="Something went wrong"
      description="An unexpected error occurred. You can try again or go back to the requests page."
      backHref="/requests"
      backLabel="Go to requests"
    />
  );
}
