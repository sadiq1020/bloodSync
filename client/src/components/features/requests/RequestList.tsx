"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { m } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowClockwise,
  SpinnerGap,
} from "@phosphor-icons/react";
import { requestsParsers } from "@/lib/search-params/requests";
import { RequestCard } from "./RequestCard";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import type { BloodRequest, PaginatedResponse } from "@/types/api";

interface RequestListProps {
  /** SSR initial data from the server page. Only used when the query key matches. */
  initialData?: PaginatedResponse<BloodRequest>;
  initialParams: {
    district: string | null;
    bloodGroup: string | null;
    urgency: string | null;
    status: string;
    page: number;
  };
  currentUserId: string;
}

function buildQueryString(params: RequestListProps["initialParams"]): string {
  const qs = new URLSearchParams();
  if (params.district) qs.set("district", params.district);
  if (params.bloodGroup) qs.set("bloodGroup", params.bloodGroup);
  if (params.urgency) qs.set("urgency", params.urgency);
  if (params.status) qs.set("status", params.status);
  qs.set("page", String(params.page));
  return qs.toString();
}

function CardSkeleton() {
  return (
    <div className="h-[132px] animate-pulse rounded-[6px] border border-line bg-surface" />
  );
}

function EmptyWithFilters({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[6px] border border-line bg-surface-2 py-16 text-center">
      <p className="font-sans text-sm text-fg-muted">
        No requests match these filters.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="flex min-h-[36px] items-center rounded-[4px] border border-line px-4 font-sans text-xs text-fg-muted transition-colors hover:border-blood hover:text-blood"
      >
        Clear filters
      </button>
    </div>
  );
}

function EmptyNoFilters() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[6px] border border-line bg-surface-2 py-16 text-center">
      <p className="font-sans text-sm text-fg-muted">
        No open requests right now.
      </p>
      <p className="font-sans text-xs text-fg-dim">
        Be the first to post — someone may need your blood group.
      </p>
      <Link
        href="/requests/new"
        className="mt-1 flex min-h-[36px] items-center rounded-[4px] bg-blood px-4 font-sans text-xs font-medium text-fg transition-colors hover:bg-blood-hover"
      >
        Request blood
      </Link>
    </div>
  );
}

export function RequestList({
  initialData,
  initialParams,
  currentUserId,
}: RequestListProps) {
  const [params, setParams] = useQueryStates(requestsParsers, { shallow: true });
  const listTopRef = React.useRef<HTMLDivElement>(null);
  const isInitialMount = React.useRef(true);
  const [lastFetchTime, setLastFetchTime] = React.useState<Date>(() => new Date());
  const [initialMountTime] = React.useState(() => Date.now());

  const activeParams = {
    district: params.district,
    bloodGroup: params.bloodGroup,
    urgency: params.urgency,
    status: params.status,
    page: params.page,
  };

  // Determine if initial params match current URL params (no duplicate fetch)
  const initialParamsKey = JSON.stringify(initialParams);
  const currentParamsKey = JSON.stringify(activeParams);
  const isInitialKey = initialParamsKey === currentParamsKey;

  const { data, isFetching, isError, error, refetch } = useQuery<
    PaginatedResponse<BloodRequest>
  >({
    queryKey: ["requests", activeParams],
    queryFn: async () => {
      const qs = buildQueryString(activeParams);
      const result = await apiFetch<PaginatedResponse<BloodRequest>>(
        `/api/requests?${qs}`
      );
      setLastFetchTime(new Date());
      return result;
    },
    // Only seed initialData when the URL params match the server-rendered data
    initialData: isInitialKey ? initialData : undefined,
    // With initialData, don't refetch immediately — it's already fresh
    initialDataUpdatedAt: isInitialKey ? initialMountTime : undefined,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    // Poll every 30 s, but not when the tab is in the background
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const hasFilters =
    !!params.district ||
    !!params.bloodGroup ||
    !!params.urgency ||
    params.status !== "OPEN";

  // When page changes, scroll to the top of the list
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [params.page]);

  const clearFilters = () =>
    setParams({
      district: null,
      bloodGroup: null,
      urgency: null,
      status: "OPEN",
      page: 1,
    });

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

      {/* Meta bar: count + updated time + refresh */}
      <div ref={listTopRef} className="flex items-center justify-between gap-3 flex-wrap">
        <div className="font-mono text-xs text-fg-dim">
          {meta ? (
            <>
              Showing{" "}
              <span className="text-fg">
                {(meta.page - 1) * meta.limit + 1}–
                {Math.min(meta.page * meta.limit, meta.total)}
              </span>{" "}
              of <span className="text-fg">{meta.total}</span>
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
            aria-label="Refresh requests"
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

      {/* Aria live region for filter change announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {meta ? `${meta.total} requests found` : ""}
      </div>

      {/* Error banner (show over stale data when error occurs) */}
      {isError && (
        <div className="flex items-center justify-between rounded-[6px] border border-blood/30 bg-blood-deep/20 px-4 py-3">
          <p className="font-sans text-sm text-blood-light">
            {(error as Error)?.message || "Failed to load requests."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-mono text-xs text-blood-light underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Cards grid */}
      {isFirstFetch ? (
        // Skeleton on first load
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        hasFilters ? (
          <EmptyWithFilters onClear={clearFilters} />
        ) : (
          <EmptyNoFilters />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {items.map((request, i) => (
            <m.div
              key={request.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                delay: i * 0.04,
              }}
            >
              <RequestCard request={request} currentUserId={currentUserId} />
            </m.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <nav
          aria-label="Requests pagination"
          className="flex items-center justify-center gap-3 pt-2"
        >
          <button
            type="button"
            disabled={params.page <= 1}
            onClick={() => setParams({ page: params.page - 1 })}
            className={cn(
              "flex min-h-[40px] items-center gap-1.5 rounded-[4px] border border-line px-4 font-sans text-sm transition-colors",
              "hover:border-line-strong hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Previous
          </button>

          <span className="font-mono text-xs text-fg-muted">
            Page {meta.page} of {meta.totalPages}
          </span>

          <button
            type="button"
            disabled={params.page >= totalPages}
            onClick={() => setParams({ page: params.page + 1 })}
            className={cn(
              "flex min-h-[40px] items-center gap-1.5 rounded-[4px] border border-line px-4 font-sans text-sm transition-colors",
              "hover:border-line-strong hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            Next
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
}
