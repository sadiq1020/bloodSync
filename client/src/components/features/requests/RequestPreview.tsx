"use client";

import { useWatch, type Control } from "react-hook-form";
import { SpecimenCard } from "@/components/brand/SpecimenCard";
import { BloodTypeBadge } from "@/components/brand/BloodTypeBadge";
import { UrgencyBadge } from "@/components/brand/UrgencyBadge";
import { VialProgress } from "@/components/brand/VialProgress";
import { formatRelativeTime } from "@/lib/format";
import type { RequestFormData } from "@/lib/validation/request";
import { cn } from "@/lib/utils";

interface RequestPreviewProps {
  control: Control<RequestFormData>;
  className?: string;
}

export function RequestPreview({ control, className }: RequestPreviewProps) {
  const values = useWatch({ control });

  const district = values.district || "BANGLADESH";
  const bloodGroup = values.bloodGroup || "—";
  const hospital = values.hospital || "Hospital / Medical Center";
  const area = values.area || "Area / Thana";
  const unitsNeeded = values.unitsNeeded || 1;
  const urgency = values.urgency || "NORMAL";
  const patientName = values.patientName || "Patient name";

  const neededByRelative = values.neededBy
    ? formatRelativeTime(values.neededBy)
    : "Timeline pending";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-medium uppercase tracking-wider text-fg-dim">
          Live request card
        </span>
        <span className="font-mono text-[10px] uppercase text-blood tracking-wider">
          Preview
        </span>
      </div>

      <SpecimenCard
        header={`NEW REQUEST / ${district.toUpperCase()}`}
        accent="blood"
        className="shadow-sm"
      >
        <div className="space-y-5">
          {/* Top section: Monogram Badge & Core Identity */}
          <div className="flex items-start justify-between gap-4">
            <BloodTypeBadge
              bloodGroup={bloodGroup}
              size="xl"
              variant="tag"
              className={cn(!values.bloodGroup && "opacity-40")}
            />

            <div className="flex flex-col items-end gap-2 text-right">
              <UrgencyBadge urgency={urgency} />
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-fg-dim block">
                  Needed by
                </span>
                <span className="font-sans text-xs font-semibold text-fg">
                  {neededByRelative}
                </span>
              </div>
            </div>
          </div>

          {/* Location & Patient details */}
          <div className="space-y-1 border-t border-dashed border-line pt-3">
            <h3 className="font-display text-lg font-semibold text-fg truncate">
              {hospital}
            </h3>
            <p className="font-sans text-xs text-fg-muted truncate">
              {area}, {district}
            </p>
            <p className="font-sans text-xs text-fg-dim pt-1">
              Patient: <span className="text-fg-muted">{patientName}</span>
            </p>
          </div>

          {/* Vial Progress: 0 of N units */}
          <div className="border-t border-dashed border-line pt-3 flex items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-fg-dim block">
                Required Units
              </span>
              <span className="font-display text-xl font-semibold text-fg">
                0 <span className="font-sans text-xs text-fg-dim">/ {unitsNeeded} units</span>
              </span>
            </div>

            <VialProgress
              filled={0}
              total={unitsNeeded}
              size="sm"
              label={false}
              className="shrink-0"
            />
          </div>
        </div>
      </SpecimenCard>

      <p className="font-sans text-xs text-fg-dim text-center">
        This is how donors will see your request.
      </p>
    </div>
  );
}
