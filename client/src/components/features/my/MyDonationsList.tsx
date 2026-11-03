"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { useQuery } from "@tanstack/react-query";
import { m } from "motion/react";
import {
  ArrowClockwise,
  SpinnerGap,
  MagnifyingGlass,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import {
  myDonationsParsers,
  type MyDonationStatus,
} from "@/lib/search-params/my-donations";
import { DonationCard, type MyDonationItem } from "./DonationCard";
import { Pagination } from "@/components/features/shared/Pagination";
import { ListErrorBanner } from "@/components/features/shared/ListErrorBanner";
import { apiFetch } from "@/lib/api/client";

interface MyDonationsListProps {
  initialData?: MyDonationItem[];
  initialParams: {
    status: MyDonationStatus | null;
    page: number;
  };
}

const PAGE_SIZE = 10;

function CardSkeleton() {
  return (
    <div className="h-[128px] animate-pulse rounded-[6px] border border-line bg-surface" />
  );
}

export function MyDonationsList({
  initialData,
}: MyDonationsListProps) {
  const [params, setParams] = useQueryStates(myDonationsParsers, {
    shallow: true,
  });

  const {
    data: allDonations = initialData ?? [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<MyDonationItem[]>({
    queryKey: ["my-donations"],
    queryFn: async () => {
      const res = await apiFetch<MyDonationItem[]>("/api/donations/mine");
      return res ?? [];
    },
    initialData,
    staleTime: 30_000,
  });

  // In-memory status filtering
  const filteredDonations = React.useMemo(() => {
    if (!params.status) return allDonations;
    return allDonations.filter((item) => item.status === params.status);
  }, [allDonations, params.status]);

  const total = filteredDonations.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, params.page), totalPages);

  // In-memory pagination
  const paginatedDonations = React.useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredDonations.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredDonations, currentPage]);

  const startCount = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endCount = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="space-y-4">
      {/* Meta bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <p className="font-mono text-xs text-fg-muted">
            {isLoading ? (
              <span className="inline-block h-3.5 w-28 animate-pulse rounded bg-surface-2" />
            ) : total === 0 ? (
              "0 donations"
            ) : (
              <>
                Showing <span className="font-semibold text-fg">{startCount}</span>
                –<span className="font-semibold text-fg">{endCount}</span> of{" "}
                <span className="font-semibold text-fg">{total}</span>{" "}
                {total === 1 ? "donation" : "donations"}
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh donations"
          title="Refresh donations"
          className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-line bg-surface px-2.5 font-sans text-xs font-medium text-fg-muted transition-colors hover:border-line-strong hover:bg-surface-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetching ? (
            <SpinnerGap
              className="h-3.5 w-3.5 animate-spin text-blood"
              aria-hidden="true"
            />
          ) : (
            <ArrowClockwise className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>Refresh</span>
        </button>
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <ListErrorBanner
          message="Failed to load your donations. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3" aria-busy="true" aria-label="Loading donations">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Empty states */}
      {!isLoading && !error && filteredDonations.length === 0 && (
        <div className="rounded-[6px] border border-dashed border-line bg-surface/50 p-8 text-center sm:p-12">
          {allDonations.length === 0 ? (
            <div className="mx-auto max-w-sm space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blood/10 text-blood">
                <MagnifyingGlass className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-sans text-sm font-semibold text-fg">
                No volunteer activity yet
              </h3>
              <p className="font-sans text-xs leading-relaxed text-fg-muted">
                You haven&apos;t volunteered for any blood requests yet. Check the
                feed for urgent requests in your district.
              </p>
              <div className="pt-2">
                <Link
                  href="/requests"
                  className="inline-flex items-center justify-center rounded-[4px] bg-blood px-4 py-2 font-sans text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blood/90"
                >
                  Find requests to help
                </Link>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-sm space-y-3">
              <h3 className="font-sans text-sm font-semibold text-fg">
                No {params.status?.toLowerCase()} donations found
              </h3>
              <p className="font-sans text-xs text-fg-muted">
                Try switching the status filter to view all your volunteer activity.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setParams({ status: null, page: 1 });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-[4px] border border-line bg-surface px-3 py-1.5 font-sans text-xs font-medium text-fg hover:border-line-strong hover:bg-surface-2"
                >
                  <ArrowCounterClockwise className="h-3.5 w-3.5 text-fg-muted" />
                  Show all donations
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List items */}
      {!isLoading && paginatedDonations.length > 0 && (
        <div className="space-y-3">
          {paginatedDonations.map((donation, index) => (
            <m.div
              key={donation.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: index * 0.02 }}
            >
              <DonationCard donation={donation} />
            </m.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="pt-2">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(nextPage) => {
              setParams({ page: nextPage });
            }}
            ariaLabel="My donations pagination"
          />
        </div>
      )}
    </div>
  );
}
