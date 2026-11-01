"use client";

import * as React from "react";
import { useQueryStates } from "nuqs";
import { SlidersHorizontal, X, FunnelSimple } from "@phosphor-icons/react";
import { requestsParsers } from "@/lib/search-params/requests";
import { DistrictCombobox } from "@/components/features/shared/DistrictCombobox";
import { BLOOD_GROUPS, type BloodGroup } from "@/lib/constants/bloodGroups";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { District } from "@/lib/constants/districts";

type Urgency = "NORMAL" | "URGENT" | "CRITICAL";
type Status = "OPEN" | "MATCHED" | "FULFILLED" | "EXPIRED" | "CANCELLED";

const URGENCY_LABELS: Record<Urgency, string> = {
  NORMAL: "Normal",
  URGENT: "Urgent",
  CRITICAL: "Critical",
};

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "MATCHED", label: "Matched" },
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

function FilterChip({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex min-h-[36px] items-center rounded-[4px] border px-3 font-mono text-xs font-medium tracking-wide transition-colors select-none",
        "focus-visible:outline-2 focus-visible:outline-blood",
        active
          ? "border-blood bg-blood-deep/20 text-fg"
          : "border-line bg-surface-2 text-fg-muted hover:border-line-strong hover:text-fg",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {label}
    </button>
  );
}

function FilterBody() {
  const [params, setParams] = useQueryStates(requestsParsers, {
    shallow: true,
    history: "push",
  });

  const resetPage = () => setParams((p) => ({ ...p, page: 1 }));

  return (
    <div className="space-y-5">
      {/* District */}
      <div className="space-y-1.5">
        <span className="font-mono text-[11px] uppercase tracking-widest text-fg-dim">
          District
        </span>
        <DistrictCombobox
          id="filter-district"
          value={(params.district as District) ?? undefined}
          onChange={(v) => {
            setParams({ district: v ?? null, page: 1 });
          }}
          clearable
        />
      </div>

      {/* Blood group chips */}
      <div className="space-y-1.5">
        <span className="font-mono text-[11px] uppercase tracking-widest text-fg-dim">
          Blood group
        </span>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label="All"
            active={params.bloodGroup === null}
            onClick={() => setParams({ bloodGroup: null, page: 1 })}
          />
          {BLOOD_GROUPS.map((bg) => (
            <FilterChip
              key={bg}
              label={bg}
              active={params.bloodGroup === bg}
              onClick={() => {
                setParams({ bloodGroup: bg as BloodGroup, page: 1 });
                resetPage();
              }}
            />
          ))}
        </div>
      </div>

      {/* Urgency chips */}
      <div className="space-y-1.5">
        <span className="font-mono text-[11px] uppercase tracking-widest text-fg-dim">
          Urgency
        </span>
        <div role="radiogroup" aria-label="Filter by urgency" className="flex flex-wrap gap-1.5">
          <FilterChip
            label="All"
            active={params.urgency === null}
            onClick={() => setParams({ urgency: null, page: 1 })}
          />
          {(["NORMAL", "URGENT", "CRITICAL"] as Urgency[]).map((u) => (
            <FilterChip
              key={u}
              label={URGENCY_LABELS[u]}
              active={params.urgency === u}
              onClick={() => setParams({ urgency: u, page: 1 })}
            />
          ))}
        </div>
      </div>

      {/* Status select */}
      <div className="space-y-1.5">
        <label
          htmlFor="filter-status"
          className="font-mono text-[11px] uppercase tracking-widest text-fg-dim"
        >
          Status
        </label>
        <select
          id="filter-status"
          value={params.status}
          onChange={(e) =>
            setParams({ status: e.target.value as Status, page: 1 })
          }
          className={cn(
            "flex h-10 w-full max-w-[200px] rounded-[6px] border border-line bg-surface-2 px-3 font-sans text-sm text-fg",
            "transition-colors outline-none hover:border-line-strong",
            "focus-visible:border-blood focus-visible:ring-1 focus-visible:ring-blood"
          )}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/** Counts active non-default filters to show in the mobile badge. */
function useActiveFilterCount() {
  const [params] = useQueryStates(requestsParsers);
  let count = 0;
  if (params.district) count++;
  if (params.bloodGroup) count++;
  if (params.urgency) count++;
  if (params.status !== "OPEN") count++;
  return count;
}

function ClearFiltersButton({ className }: { className?: string }) {
  const [, setParams] = useQueryStates(requestsParsers);
  const count = useActiveFilterCount();
  if (count === 0) return null;
  return (
    <button
      type="button"
      onClick={() =>
        setParams({ district: null, bloodGroup: null, urgency: null, status: "OPEN", page: 1 })
      }
      className={cn(
        "flex min-h-[36px] items-center gap-1.5 rounded-[4px] border border-line px-3 font-sans text-xs text-fg-muted transition-colors hover:border-blood hover:text-blood",
        className
      )}
    >
      <X weight="bold" className="size-3" aria-hidden="true" />
      Clear filters
      <span className="ml-0.5 rounded-full bg-blood px-1.5 py-0.5 font-mono text-[10px] font-bold text-fg">
        {count}
      </span>
    </button>
  );
}

/**
 * RequestFilters — inline on desktop, bottom Sheet on mobile (< lg).
 * Keeps the client bundle small by only mounting the Sheet on mobile.
 */
export function RequestFilters() {
  const count = useActiveFilterCount();

  return (
    <>
      {/* Desktop: inline filter bar (hidden on mobile) */}
      <div className="hidden lg:block">
        <div className="rounded-[6px] border border-line bg-surface p-4">
          <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
            {/* District */}
            <div className="space-y-1.5 min-w-[200px]">
              <span className="font-mono text-[11px] uppercase tracking-widest text-fg-dim">
                District
              </span>
              <DesktopDistrictFilter />
            </div>

            {/* Blood group */}
            <div className="space-y-1.5">
              <span className="font-mono text-[11px] uppercase tracking-widest text-fg-dim">
                Blood group
              </span>
              <DesktopBloodGroupFilter />
            </div>

            {/* Urgency */}
            <div className="space-y-1.5">
              <span className="font-mono text-[11px] uppercase tracking-widest text-fg-dim">
                Urgency
              </span>
              <DesktopUrgencyFilter />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <DesktopStatusFilter />
            </div>

            {/* Clear button */}
            <div className="flex items-end pb-0.5">
              <ClearFiltersButton />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Sheet trigger button (hidden on desktop) */}
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger
            type="button"
            className={cn(
              "flex min-h-[40px] items-center gap-2 rounded-[4px] border border-line bg-surface px-4 font-sans text-sm text-fg transition-colors hover:border-line-strong",
              count > 0 && "border-blood"
            )}
          >
            <FunnelSimple className="size-4" aria-hidden="true" />
            Filters
            {count > 0 && (
              <span className="rounded-full bg-blood px-1.5 py-0.5 font-mono text-[10px] font-bold text-fg">
                {count}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90svh] overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle className="font-mono text-xs uppercase tracking-widest text-fg-dim">
                <SlidersHorizontal className="mr-2 inline size-4" aria-hidden="true" />
                Filters
              </SheetTitle>
            </SheetHeader>
            <FilterBody />
            <div className="mt-6">
              <ClearFiltersButton />
            </div>
          </SheetContent>
        </Sheet>
        <ClearFiltersButton />
      </div>
    </>
  );
}

/* ── narrow desktop sub-filters (avoid re-defining parsers) ── */

function DesktopDistrictFilter() {
  const [params, setParams] = useQueryStates(requestsParsers, { shallow: true });
  return (
    <DistrictCombobox
      id="filter-district-desktop"
      value={(params.district as District) ?? undefined}
      onChange={(v) => setParams({ district: v ?? null, page: 1 })}
      clearable
    />
  );
}

function DesktopBloodGroupFilter() {
  const [params, setParams] = useQueryStates(requestsParsers, { shallow: true });
  return (
    <div className="flex flex-wrap gap-1.5">
      <FilterChip
        label="All"
        active={params.bloodGroup === null}
        onClick={() => setParams({ bloodGroup: null, page: 1 })}
      />
      {BLOOD_GROUPS.map((bg) => (
        <FilterChip
          key={bg}
          label={bg}
          active={params.bloodGroup === bg}
          onClick={() => setParams({ bloodGroup: bg as BloodGroup, page: 1 })}
        />
      ))}
    </div>
  );
}

function DesktopUrgencyFilter() {
  const [params, setParams] = useQueryStates(requestsParsers, { shallow: true });
  return (
    <div role="radiogroup" aria-label="Filter by urgency" className="flex flex-wrap gap-1.5">
      <FilterChip
        label="All"
        active={params.urgency === null}
        onClick={() => setParams({ urgency: null, page: 1 })}
      />
      {(["NORMAL", "URGENT", "CRITICAL"] as Urgency[]).map((u) => (
        <FilterChip
          key={u}
          label={URGENCY_LABELS[u]}
          active={params.urgency === u}
          onClick={() => setParams({ urgency: u, page: 1 })}
        />
      ))}
    </div>
  );
}

function DesktopStatusFilter() {
  const [params, setParams] = useQueryStates(requestsParsers, { shallow: true });
  return (
    <>
      <label
        htmlFor="filter-status-desktop"
        className="font-mono text-[11px] uppercase tracking-widest text-fg-dim"
      >
        Status
      </label>
      <select
        id="filter-status-desktop"
        value={params.status}
        onChange={(e) => setParams({ status: e.target.value as Status, page: 1 })}
        className={cn(
          "mt-1.5 flex h-10 w-full max-w-[160px] rounded-[6px] border border-line bg-surface-2 px-3 font-sans text-sm text-fg",
          "transition-colors outline-none hover:border-line-strong",
          "focus-visible:border-blood focus-visible:ring-1 focus-visible:ring-blood"
        )}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </>
  );
}
