"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { m } from "motion/react";
import {
  ArrowClockwise,
  SpinnerGap,
  ArrowCounterClockwise,
  Plus,
} from "@phosphor-icons/react";
import { myRequestsParsers } from "@/lib/search-params/my-requests";
import { RequestCard } from "@/components/features/requests/RequestCard";
import { Pagination } from "@/components/features/shared/Pagination";
import { ListErrorBanner } from "@/components/features/shared/ListErrorBanner";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import type { BloodRequest, PaginatedResponse } from "@/types/api";

type MyRequestItem = BloodRequest & {
  donationCounts: {
    PENDING: number;
    ACCEPTED: number;
    COMPLETED: number;
    CANCELLED: number;
    total: number;
  };
};

interface MyRequestsListProps {
  initialData?: PaginatedResponse<MyRequestItem>;
  initialParams: {
    status: string | null;
    page: number;
  };
  currentUserId: string;
}

function buildQueryString(params: {
  status: string | null;
  page: number;
}): string {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  qs.set("page", String(params.page));
  return qs.toString();
}

function CardSkeleton() {
  return (
    <div className="h-[156px] animate-pulse rounded-[6px] border border-line bg-surface" />
  );
}

export function MyRequestsList({
  initialData,
  initialParams,
  currentUserId,
}: MyRequestsListProps) {
  const [params, setParams] = useQueryStates(myRequestsParsers, {
    shallow: true,
  });
  const listTopRef = React.useRef<HTMLDivElement>(null);
  const isInitialMount = React.useRef(true);
  const [lastFetchTime, setLastFetchTime] = React.useState<Date>(
    () => new Date()
  );
  const [initialMountTime] = React.useState(() => Date.now());

  const activeParams = {
    status: params.status,
    page: params.page,
  };

  const isInitialKey =
    JSON.stringify(initialParams) === JSON.stringify(activeParams);

  const { data, isFetching, isError, error, refetch } = useQuery<
    PaginatedResponse<MyRequestItem>
  >({
    queryKey: ["my-requests", activeParams],
    queryFn: async () => {
      const qs = buildQueryString(activeParams);
      const result = await apiFetch<PaginatedResponse<MyRequestItem>>(
        `/api/requests/mine?${qs}`
      );
      setLastFetchTime(new Date());
      return result;
    },
    initialData: isInitialKey ? initialData : undefined,
    initialDataUpdatedAt: isInitialKey ? initialMountTime : undefined,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const hasStatusFilter = Boolean(params.status);

  // Scroll to top on page change
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [params.page]);

  const isShowingPrev = isFetching && !!data;
  const isFirstFetch = isFetching && !data;

  return (
    <div className="space-y-4">
      {/* Subtle top progress bar while refetching with previous data */}
      <div
        className={cn(
          "h-[2px] w-full rounded-full bg-blood/40 transition-opacity duration-300",
          isShowingPrev ? "opacity-100" : "opacity-0"
        )}
        role="progressbar"
        aria-label="Refreshing requests"
        aria-hidden={!isShowingPrev}
      />

      {/* Meta bar */}
      <div
        ref={listTopRef}
        className="flex items-center justify-between gap-3 flex-wrap"
      >
        <div className="font-mono text-xs text-fg-dim">
          {meta && meta.total > 0 ? (
            <>
              Showing{" "}
              <span className="text-fg">
                {(meta.page - 1) * meta.limit + 1}–
                {Math.min(meta.page * meta.limit, meta.total)}
              </span>{" "}
              of <span className="text-fg">{meta.total}</span> requests
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-fg-dim">
            Updated {formatRelativeTime(lastFetchTime)}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh my requests"
            className="flex size-7 items-center justify-center rounded-[4px] border border-line bg-surface text-fg-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-50"
          >
            {isFetching ? (
              <SpinnerGap className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowClockwise className="size-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Aria live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {meta ? `${meta.total} requests found` : ""}
      </div>

      {/* Error banner */}
      {isError && (
        <ListErrorBanner
          message={(error as Error)?.message || "Failed to load requests."}
          onRetry={() => refetch()}
        />
      )}

      {/* List content */}
      {isFirstFetch ? (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        hasStatusFilter ? (
          <div className="flex flex-col items-center gap-3 rounded-[6px] border border-line bg-surface-2 py-16 text-center">
            <p className="font-sans text-sm text-fg-muted">
              No {params.status?.toLowerCase()} requests.
            </p>
            <button
              type="button"
              onClick={() => setParams({ status: null, page: 1 })}
              className="flex min-h-[36px] items-center rounded-[4px] border border-line px-4 font-sans text-xs text-fg-muted transition-colors hover:border-blood hover:text-blood"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-[6px] border border-line bg-surface-2 py-16 text-center">
            <p className="font-sans text-sm text-fg-muted">
              You have not posted a request yet.
            </p>
            <Link
              href="/requests/new"
              className="mt-1 flex min-h-[36px] items-center gap-1.5 rounded-[4px] bg-blood px-4 font-sans text-xs font-semibold text-fg transition-colors hover:bg-blood-hover"
            >
              <Plus className="size-3.5" weight="bold" />
              <span>Request blood</span>
            </Link>
          </div>
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {items.map((request, i) => {
            const counts = request.donationCounts || {
              PENDING: 0,
              ACCEPTED: 0,
              COMPLETED: 0,
              CANCELLED: 0,
            };

            const canPostAgain =
              request.status === "EXPIRED" || request.status === "CANCELLED";

            const footer = (
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono text-[11px] text-fg-dim tracking-wider">
                  <span className="text-plasma font-semibold">
                    {counts.PENDING}
                  </span>{" "}
                  PENDING ·{" "}
                  <span className="text-blood font-semibold">
                    {counts.ACCEPTED}
                  </span>{" "}
                  ACCEPTED ·{" "}
                  <span className="text-sage font-semibold">
                    {counts.COMPLETED}
                  </span>{" "}
                  DONE
                </span>

                {canPostAgain && (
                  <Link
                    href={`/requests/new?from=${request.id}`}
                    className="inline-flex items-center gap-1 font-mono text-xs font-medium text-blood hover:underline select-none"
                  >
                    <ArrowCounterClockwise className="size-3" weight="bold" />
                    <span>Post again</span>
                  </Link>
                )}
              </div>
            );

            return (
              <m.div
                key={request.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: i * 0.04,
                }}
              >
                <RequestCard
                  request={request}
                  currentUserId={currentUserId}
                  footer={footer}
                />
              </m.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && (
        <Pagination
          page={params.page}
          totalPages={totalPages}
          onPageChange={(p) => setParams({ page: p })}
          ariaLabel="My requests pagination"
        />
      )}
    </div>
  );
}
