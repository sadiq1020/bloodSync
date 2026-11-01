"use client";

import * as React from "react";
import { useQueryStates } from "nuqs";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { m } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowClockwise, SpinnerGap } from "@phosphor-icons/react";
import { donorsParsers } from "@/lib/search-params/donors";
import { DonorSearchCard } from "./DonorSearchCard";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { PublicDonor, PaginatedResponse } from "@/types/api";

interface DonorListProps {
  initialData?: PaginatedResponse<PublicDonor>;
  initialParams: {
    bloodGroup: string | null;
    district: string | null;
    area: string | null;
    page: number;
  };
}

function buildQs(params: DonorListProps["initialParams"]): string {
  const qs = new URLSearchParams();
  if (params.bloodGroup) qs.set("bloodGroup", params.bloodGroup);
  if (params.district) qs.set("district", params.district);
  if (params.area) qs.set("area", params.area);
  qs.set("page", String(params.page));
  return qs.toString();
}

function CardSkeleton() {
  return (
    <div className="h-[104px] animate-pulse rounded-[6px] border border-line bg-surface" />
  );
}

export function DonorList({ initialData, initialParams }: DonorListProps) {
  const [params, setParams] = useQueryStates(donorsParsers, { shallow: true });
  const listTopRef = React.useRef<HTMLDivElement>(null);
  const isFirstLoad = React.useRef(true);

  const activeParams = {
    bloodGroup: params.bloodGroup,
    district: params.district,
    area: params.area,
    page: params.page,
  };

  const isInitialKey =
    JSON.stringify(initialParams) === JSON.stringify(activeParams);

  const { data, isFetching, isError, error, refetch } = useQuery<
    PaginatedResponse<PublicDonor>
  >({
    queryKey: ["donors", activeParams],
    queryFn: async () => {
      const qs = buildQs(activeParams);
      return apiFetch<PaginatedResponse<PublicDonor>>(`/api/donors/search?${qs}`);
    },
    initialData: isInitialKey ? initialData : undefined,
    initialDataUpdatedAt: isInitialKey ? Date.now() : undefined,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    // No polling for donors — not time-critical
  });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const hasFilters =
    !!params.bloodGroup || !!params.district || !!params.area;
  const isFirstFetch = isFetching && !data;
  const isShowingPrev = isFetching && !!data;

  React.useEffect(() => {
    if (!isFirstLoad.current) {
      listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [params.page]);

  React.useEffect(() => {
    isFirstLoad.current = false;
  }, []);

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div
        className={cn(
          "h-[2px] w-full rounded-full bg-blood/40 transition-opacity duration-300",
          isShowingPrev ? "opacity-100" : "opacity-0"
        )}
        role="progressbar"
        aria-hidden={!isShowingPrev}
      />

      {/* Meta bar */}
      <div ref={listTopRef} className="flex items-center justify-between gap-3 flex-wrap">
        <div className="font-mono text-xs text-fg-dim">
          {meta && meta.total > 0 ? (
            <>
              Showing{" "}
              <span className="text-fg">
                {(meta.page - 1) * meta.limit + 1}–
                {Math.min(meta.page * meta.limit, meta.total)}
              </span>{" "}
              of <span className="text-fg">{meta.total}</span> eligible donors
            </>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh donor list"
          className="flex size-7 items-center justify-center rounded-[4px] border border-line bg-surface text-fg-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-50"
        >
          {isFetching ? (
            <SpinnerGap className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowClockwise className="size-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Aria live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {meta ? `${meta.total} donors found` : ""}
      </div>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center justify-between rounded-[6px] border border-blood/30 bg-blood-deep/20 px-4 py-3">
          <p className="font-sans text-sm text-blood-light">
            {(error as Error)?.message || "Failed to load donors."}
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

      {/* Cards */}
      {isFirstFetch ? (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[6px] border border-line bg-surface-2 py-16 text-center">
          <p className="font-sans text-sm text-fg-muted">
            No eligible donors found.
          </p>
          <p className="font-sans text-xs text-fg-dim max-w-xs">
            {hasFilters
              ? "Try a nearby district or clear the area filter."
              : "Check back later — donors sign up regularly."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {items.map((donor, i) => (
            <m.div
              key={`${donor.user.name}-${donor.district}-${donor.area}-${i}`}
              initial={isFirstLoad.current ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.18,
                delay: isFirstLoad.current ? i * 0.035 : 0,
              }}
            >
              <DonorSearchCard donor={donor} />
            </m.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <nav
          aria-label="Donors pagination"
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
