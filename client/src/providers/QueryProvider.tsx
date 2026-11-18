"use client";

import * as React from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Lazy dynamic import ensures devtools code and package are stripped from production bundles
const Devtools =
  process.env.NODE_ENV === "development"
    ? React.lazy(() =>
        import("@tanstack/react-query-devtools").then((m) => ({
          default: m.ReactQueryDevtools,
        }))
      )
    : null;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          // Never retry 4xx client errors
          if (error && typeof error === "object" && "status" in error) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) {
              return false;
            }
          }
          // Retry once for network or 5xx server errors
          return failureCount < 1;
        },
      },
    },
  });
}

/**
 * QueryProvider (Client Component)
 * Mounts TanStack QueryClientProvider only for routes that actually execute queries/mutations
 * (e.g. app/(app) and app/(admin)). Keeps the ~39 kB query client out of public pages.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {Devtools && (
        <React.Suspense fallback={null}>
          <Devtools initialIsOpen={false} />
        </React.Suspense>
      )}
    </QueryClientProvider>
  );
}

