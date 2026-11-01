"use client";

import * as React from "react";
import { useQueryStates } from "nuqs";
import { X } from "@phosphor-icons/react";
import { donorsParsers } from "@/lib/search-params/donors";
import { BloodGroupPicker } from "@/components/features/shared/BloodGroupPicker";
import { DistrictCombobox } from "@/components/features/shared/DistrictCombobox";
import { cn } from "@/lib/utils";
import type { BloodGroup } from "@/lib/constants/bloodGroups";
import type { District } from "@/lib/constants/districts";

export function DonorFilters() {
  const [params, setParams] = useQueryStates(donorsParsers, { shallow: true });

  const [prevArea, setPrevArea] = React.useState(params.area);
  const [areaInput, setAreaInput] = React.useState(params.area ?? "");

  // Sync from URL (e.g. on back navigation) during render
  if (params.area !== prevArea) {
    setPrevArea(params.area);
    setAreaInput(params.area ?? "");
  }

  // Debounce area → URL by 400 ms
  React.useEffect(() => {
    const id = setTimeout(() => {
      const trimmed = areaInput.trim();
      setParams({ area: trimmed || null, page: 1 });
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaInput]);

  const hasFilters =
    !!params.bloodGroup || !!params.district || !!params.area;

  return (
    <div className="rounded-[6px] border border-line bg-surface p-4 space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* Blood group — compact chip picker */}
        <div className="space-y-1.5 min-w-[280px]">
          <span className="font-mono text-[11px] uppercase tracking-widest text-fg-dim">
            Blood group
          </span>
          <BloodGroupPicker
            value={(params.bloodGroup as BloodGroup) ?? undefined}
            onChange={(v) => setParams({ bloodGroup: v ?? null, page: 1 })}
            clearable
          />
        </div>

        {/* District */}
        <div className="space-y-1.5 min-w-[200px]">
          <span className="font-mono text-[11px] uppercase tracking-widest text-fg-dim">
            District
          </span>
          <DistrictCombobox
            id="donor-filter-district"
            value={(params.district as District) ?? undefined}
            onChange={(v) => setParams({ district: v ?? null, page: 1 })}
            clearable
          />
        </div>

        {/* Area — debounced text input */}
        <div className="space-y-1.5 min-w-[160px]">
          <label
            htmlFor="donor-filter-area"
            className="font-mono text-[11px] uppercase tracking-widest text-fg-dim"
          >
            Area / Thana
          </label>
          <div className="relative">
            <input
              id="donor-filter-area"
              type="text"
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              placeholder="e.g. Mirpur"
              className={cn(
                "flex h-10 w-full rounded-[6px] border bg-surface-2 px-3.5 pr-8 font-sans text-sm text-fg placeholder:text-fg-dim transition-colors outline-none",
                "border-line hover:border-line-strong focus-visible:border-blood focus-visible:ring-1 focus-visible:ring-blood"
              )}
            />
            {areaInput && (
              <button
                type="button"
                aria-label="Clear area filter"
                onClick={() => {
                  setAreaInput("");
                  setParams({ area: null, page: 1 });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-fg-dim hover:text-fg"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Clear all */}
        {hasFilters && (
          <button
            type="button"
            onClick={() =>
              setParams({ bloodGroup: null, district: null, area: null, page: 1 })
            }
            className="flex min-h-[40px] items-center gap-1.5 self-end rounded-[4px] border border-line px-3 font-sans text-xs text-fg-muted transition-colors hover:border-blood hover:text-blood"
          >
            <X weight="bold" className="size-3" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
