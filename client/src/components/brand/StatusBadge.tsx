import { cn } from "@/lib/utils";
import type { RequestStatus, DonationStatus } from "@/types";

export type StatusValue = RequestStatus | DonationStatus | string;

export interface StatusBadgeProps {
  status: StatusValue;
  className?: string;
}

interface StatusTheme {
  label: string;
  badgeClass: string;
  dotClass: string;
}

const statusMap: Record<string, StatusTheme> = {
  // Request Statuses
  OPEN: {
    label: "Open",
    badgeClass: "border-blood-deep/60 bg-blood-deep/20 text-blood-text",
    dotClass: "bg-blood",
  },
  MATCHED: {
    label: "Matched",
    badgeClass: "border-plasma/30 bg-plasma/10 text-plasma",
    dotClass: "bg-plasma",
  },
  FULFILLED: {
    label: "Fulfilled",
    badgeClass: "border-sage/30 bg-sage/10 text-sage",
    dotClass: "bg-sage",
  },
  EXPIRED: {
    label: "Expired",
    badgeClass: "border-line bg-surface-2 text-fg-dim",
    dotClass: "bg-fg-dim",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "border-line bg-surface-2 text-fg-dim",
    dotClass: "bg-fg-dim",
  },

  // Donation Statuses
  PENDING: {
    label: "Pending",
    badgeClass: "border-plasma/30 bg-plasma/10 text-plasma",
    dotClass: "bg-plasma",
  },
  ACCEPTED: {
    label: "Accepted",
    badgeClass: "border-blood-deep/60 bg-blood-deep/20 text-blood-text",
    dotClass: "bg-blood",
  },
  COMPLETED: {
    label: "Completed",
    badgeClass: "border-sage/30 bg-sage/10 text-sage",
    dotClass: "bg-sage",
  },
};

/**
 * StatusBadge (Server Component).
 * Renders a small mono uppercase label with a color-coded indicator dot.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedKey = status?.toUpperCase() || "UNKNOWN";
  const theme = statusMap[normalizedKey] || {
    label: status || "Unknown",
    badgeClass: "border-line bg-surface-2 text-fg-dim",
    dotClass: "bg-fg-dim",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider select-none leading-none",
        theme.badgeClass,
        className
      )}
    >
      <span
        className={cn("size-1.5 rounded-full shrink-0", theme.dotClass)}
        aria-hidden="true"
      />
      <span>{theme.label}</span>
    </span>
  );
}
