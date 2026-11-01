"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkle,
  PhoneCall,
  ArrowClockwise,
  CheckCircle,
} from "@phosphor-icons/react";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { BloodTypeBadge } from "@/components/brand/BloodTypeBadge";
import { CopyPhoneButton } from "./CopyPhoneButton";
import type { RankedDonorResult, RequestStatus } from "@/types/api";

interface SuggestedDonorsProps {
  requestId: string;
  requestStatus: RequestStatus;
  isOwner: boolean;
  volunteerUserIds?: string[];
  className?: string;
}

function DonorSkeleton() {
  return (
    <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="h-6 w-5 rounded bg-surface-2" />
        <div className="size-7 rounded bg-surface-2" />
        <div className="space-y-1.5">
          <div className="h-4 w-32 rounded bg-surface-2" />
          <div className="h-3 w-24 rounded bg-surface-2" />
        </div>
      </div>
      <div className="h-8 w-24 rounded bg-surface-2" />
    </div>
  );
}

export function SuggestedDonors({
  requestId,
  requestStatus,
  isOwner,
  volunteerUserIds = [],
  className,
}: SuggestedDonorsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);

  // Check if section enters viewport so initial paint is instantaneous
  React.useEffect(() => {
    if (!containerRef.current || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [inView]);

  const canShow = isOwner && (requestStatus === "OPEN" || requestStatus === "MATCHED");

  const { data, isLoading, isError, error, refetch } = useQuery<
    RankedDonorResult[]
  >({
    queryKey: ["request-donors", requestId],
    queryFn: async () => {
      return apiFetch<RankedDonorResult[]>(`/api/requests/${requestId}/donors`);
    },
    enabled: canShow && inView,
    staleTime: 60_000,
  });

  if (!canShow) return null;

  const candidateDonors = data ?? [];

  return (
    <section
      ref={containerRef}
      aria-labelledby="suggested-donors-heading"
      className={cn(
        "rounded-[6px] border border-line bg-surface p-5 sm:p-6 space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="space-y-1 border-b border-line pb-4">
        <div className="flex items-center gap-2">
          <Sparkle className="size-4 text-plasma" weight="fill" aria-hidden="true" />
          <h2
            id="suggested-donors-heading"
            className="font-display text-lg font-semibold text-fg"
          >
            Suggested donors
          </h2>
        </div>
        <p className="font-sans text-xs text-fg-muted leading-relaxed">
          These donors have not been asked yet. Contact them and ask them to
          open this request and press{" "}
          <strong className="text-fg font-medium">I can donate</strong>.
        </p>
        <p className="font-mono text-[11px] text-fg-dim pt-1">
          Ranked by district, area, exact blood group match and how long ago the
          donor last gave blood.
        </p>
      </div>

      {/* Content states */}
      {isLoading ? (
        <div className="divide-y divide-line">
          <DonorSkeleton />
          <DonorSkeleton />
          <DonorSkeleton />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-between rounded-[4px] border border-blood/30 bg-blood-deep/20 p-3">
          <p className="font-sans text-xs text-blood-light">
            {(error as Error)?.message || "Failed to load suggested donors."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1 font-mono text-xs text-blood-light underline"
          >
            <ArrowClockwise className="size-3" aria-hidden="true" />
            <span>Retry</span>
          </button>
        </div>
      ) : candidateDonors.length === 0 ? (
        <div className="py-8 text-center">
          <p className="font-sans text-xs text-fg-muted">
            No eligible donors found for this request yet.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line" role="list">
          {candidateDonors.map((item, index) => {
            const donor = item.donor;
            const hasVolunteered = volunteerUserIds.includes(donor.userId);

            return (
              <li
                key={donor.id}
                className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Left: Rank + Meta */}
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className="font-display text-base font-semibold text-fg-dim w-5 shrink-0 pt-0.5 text-center"
                    aria-label={`Rank ${index + 1}`}
                  >
                    {index + 1}
                  </span>

                  <div className="shrink-0 mt-0.5">
                    <BloodTypeBadge
                      bloodGroup={donor.bloodGroup}
                      size="sm"
                      variant="tag"
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-sm font-semibold text-fg truncate">
                        {donor.name}
                      </p>

                      {hasVolunteered && (
                        <span className="inline-flex items-center gap-1 rounded-[3px] bg-blood-deep/40 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blood-light uppercase tracking-wider select-none">
                          <CheckCircle className="size-3" weight="fill" />
                          Volunteered
                        </span>
                      )}
                    </div>

                    <p className="font-mono text-xs text-fg-muted truncate">
                      {donor.district} / {donor.area}
                    </p>

                    {/* Reasons chips (up to 3) */}
                    {item.reasons && item.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {item.reasons.slice(0, 3).map((reason, idx) => (
                          <span
                            key={idx}
                            className="rounded-[3px] border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-dim"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Call & Copy buttons */}
                {donor.phone && (
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <a
                      href={`tel:${donor.phone}`}
                      aria-label={`Call ${donor.name}`}
                      className="inline-flex min-h-[32px] items-center gap-1.5 rounded-[4px] bg-blood px-3 py-1 font-sans text-xs font-semibold text-fg transition-colors hover:bg-blood-hover"
                    >
                      <PhoneCall className="size-3.5" aria-hidden="true" />
                      <span>Call</span>
                    </a>
                    <CopyPhoneButton phone={donor.phone} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
