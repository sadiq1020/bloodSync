"use client";

import { useQueryStates } from "nuqs";
import {
  adminRequestsParsers,
  type RequestStatus,
  type BloodGroup,
} from "@/lib/search-params/admin-requests";
import { BLOOD_GROUPS } from "@/lib/constants/bloodGroups";
import { DistrictCombobox } from "@/components/features/shared/DistrictCombobox";
import { cn } from "@/lib/utils";

const STATUS_CHIPS: Array<{ label: string; value: RequestStatus | null }> = [
  { label: "All status", value: null },
  { label: "Open", value: "OPEN" },
  { label: "Matched", value: "MATCHED" },
  { label: "Fulfilled", value: "FULFILLED" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function AdminRequestsFilters() {
  const [params, setParams] = useQueryStates(adminRequestsParsers, {
    shallow: true,
  });

  return (
    <div className="space-y-4 rounded-[6px] border border-line bg-surface p-4">
      {/* Top Row: Status Chips & District Combobox */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status chips */}
        <div
          role="group"
          aria-label="Filter requests by status"
          className="flex flex-wrap items-center gap-1.5"
        >
          {STATUS_CHIPS.map((chip) => {
            const isSelected =
              chip.value === null ? !params.status : params.status === chip.value;

            return (
              <button
                key={chip.label}
                type="button"
                role="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setParams({ status: chip.value, page: 1 });
                }}
                className={cn(
                  "min-h-[32px] rounded-[4px] px-2.5 font-sans text-xs font-medium transition-colors select-none",
                  isSelected
                    ? "bg-blood text-fg shadow-xs"
                    : "border border-line bg-surface-2 text-fg-muted hover:border-line-strong hover:text-fg"
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* District Combobox */}
        <div className="w-full sm:w-60">
          <DistrictCombobox
            value={params.district ?? undefined}
            onChange={(district) => {
              setParams({ district: district ?? null, page: 1 });
            }}
            clearable
          />
        </div>
      </div>

      {/* Bottom Row: Blood Group Chips */}
      <div
        role="group"
        aria-label="Filter requests by blood group"
        className="flex flex-wrap items-center gap-1.5 border-t border-line/60 pt-3"
      >
        <span className="font-mono text-[11px] text-fg-dim mr-1">
          Blood group:
        </span>
        <button
          type="button"
          role="button"
          aria-pressed={!params.bloodGroup}
          onClick={() => {
            setParams({ bloodGroup: null, page: 1 });
          }}
          className={cn(
            "min-h-[28px] rounded-[3px] px-2 font-mono text-xs transition-colors select-none",
            !params.bloodGroup
              ? "bg-blood text-fg font-semibold"
              : "border border-line bg-surface-2 text-fg-muted hover:border-line-strong hover:text-fg"
          )}
        >
          All
        </button>

        {BLOOD_GROUPS.map((bg: BloodGroup) => {
          const isSelected = params.bloodGroup === bg;

          return (
            <button
              key={bg}
              type="button"
              role="button"
              aria-pressed={isSelected}
              onClick={() => {
                setParams({ bloodGroup: isSelected ? null : bg, page: 1 });
              }}
              className={cn(
                "min-h-[28px] rounded-[3px] px-2 font-mono text-xs transition-colors select-none",
                isSelected
                  ? "bg-blood text-fg font-semibold"
                  : "border border-line bg-surface-2 text-fg-muted hover:border-line-strong hover:text-fg"
              )}
            >
              {bg}
            </button>
          );
        })}
      </div>
    </div>
  );
}
