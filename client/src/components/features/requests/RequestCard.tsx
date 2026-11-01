import Link from "next/link";
import { SpecimenCard } from "@/components/brand/SpecimenCard";
import { BloodTypeBadge } from "@/components/brand/BloodTypeBadge";
import { UrgencyBadge } from "@/components/brand/UrgencyBadge";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { formatBloodGroup, formatRelativeTime, formatRequestCode } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BloodRequest } from "@/types/api";

interface RequestCardProps {
  request: BloodRequest & { requester?: { id: string; name: string } };
  currentUserId?: string;
}

function getAccent(urgency: string): "blood" | "plasma" | "none" {
  if (urgency === "CRITICAL") return "blood";
  if (urgency === "URGENT") return "plasma";
  return "none";
}


/** Pure presentational card — no hooks, renders anywhere (server or client). */
export function RequestCard({ request, currentUserId }: RequestCardProps) {
  const {
    id,
    requesterId,
    bloodGroup,
    unitsNeeded,
    hospital,
    district,
    area,
    urgency,
    status,
    neededBy,
    createdAt,
  } = request;

  const displayBloodGroup = formatBloodGroup(bloodGroup);
  const accent = getAccent(urgency);
  const isOwn = currentUserId ? currentUserId === requesterId : false;
  const isOverdue = status === "EXPIRED";
  const relativeNeeded = formatRelativeTime(neededBy);
  const isNewCard = status === "OPEN" && formatRelativeTime(createdAt).includes("minute");
  const neededByText = isOverdue
    ? "overdue"
    : `needed ${relativeNeeded}`;

  const ariaLabel = `${displayBloodGroup} blood needed at ${hospital}, ${district}${urgency !== "NORMAL" ? `, ${urgency.toLowerCase()}` : ""}`;

  return (
    <SpecimenCard
      header={`${formatRequestCode(id)} / ${district.toUpperCase()}`}
      accent={accent}
      className="h-full"
    >
      {/* Whole-card link */}
      <Link
        href={`/requests/${id}`}
        className={cn(
          "group block outline-none",
          "focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-[4px]",
        )}
        aria-label={ariaLabel}
      >
        {/* Main body */}
        <div className="flex gap-4">
          {/* Blood type badge on the left */}
          <div className="shrink-0">
            <BloodTypeBadge bloodGroup={bloodGroup} size="lg" variant="tag" />
          </div>

          {/* Right content */}
          <div className="flex flex-col gap-1.5 min-w-0">
            {/* Hospital name */}
            <p
              className="font-display text-base font-semibold text-fg leading-tight truncate group-hover:text-blood transition-colors"
              title={hospital}
            >
              {hospital}
            </p>
            {/* Area */}
            <p className="font-sans text-xs text-fg-muted truncate">{area}</p>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <UrgencyBadge urgency={urgency as "NORMAL" | "URGENT" | "CRITICAL"} />
              {status !== "OPEN" && <StatusBadge status={status} />}

              {/* Needed by */}
              <span
                className={cn(
                  "font-mono text-[11px] tracking-wide",
                  isOverdue ? "text-fg-dim" : "text-fg-muted"
                )}
              >
                {neededByText}
              </span>

              {/* Units — no donation counts on public feed */}
              <span className="font-mono text-[11px] font-medium text-fg-dim tracking-wider uppercase">
                {unitsNeeded} {unitsNeeded === 1 ? "unit" : "units"}
              </span>
            </div>

            {/* Small tags */}
            <div className="flex flex-wrap gap-1 mt-0.5">
              {isOwn && (
                <span className="rounded-[3px] bg-blood-deep/40 px-1 py-0.5 font-mono text-[10px] font-bold text-blood-light uppercase tracking-wide select-none">
                  YOURS
                </span>
              )}
              {isNewCard && (
                <span className="rounded-[3px] bg-plasma/20 px-1 py-0.5 font-mono text-[10px] font-bold text-plasma uppercase tracking-wide select-none">
                  NEW
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </SpecimenCard>
  );
}
