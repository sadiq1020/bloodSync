import { SpecimenCard } from "@/components/brand/SpecimenCard";
import { BloodTypeBadge } from "@/components/brand/BloodTypeBadge";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import type { PublicDonor } from "@/types/api";

interface DonorSearchCardProps {
  donor: PublicDonor;
}

/**
 * DonorSearchCard — pure presentational card; no hooks, no contact info.
 * Shows: blood group, name, location, eligibility dot, last donation time.
 */
export function DonorSearchCard({ donor }: DonorSearchCardProps) {
  const { bloodGroup, district, area, lastDonatedAt, user } = donor;

  return (
    <SpecimenCard className="h-full">
      <div className="flex items-start gap-3">
        {/* Blood type badge */}
        <div className="shrink-0">
          <BloodTypeBadge bloodGroup={bloodGroup} size="md" variant="tag" />
        </div>

        {/* Right content */}
        <div className="flex flex-col gap-1.5 min-w-0">
          {/* Name */}
          <p className="font-display text-base font-semibold text-fg truncate">
            {user.name}
          </p>

          {/* Location */}
          <p className="font-mono text-[11px] text-fg-muted tracking-wide">
            {district} · {area}
          </p>

          {/* Eligibility + last donation */}
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            {/* Eligibility dot */}
            <span className="inline-flex items-center gap-1.5">
              <span
                className="size-1.5 rounded-full bg-sage shrink-0"
                aria-hidden="true"
              />
              <span className="font-mono text-[11px] font-medium text-sage tracking-wide uppercase">
                Eligible
              </span>
            </span>

            {/* Last donated */}
            <span className={cn("font-mono text-[11px] text-fg-dim")}>
              {lastDonatedAt
                ? `Last donated ${formatRelativeTime(lastDonatedAt)}`
                : "Has not donated before"}
            </span>
          </div>
        </div>
      </div>
    </SpecimenCard>
  );
}
