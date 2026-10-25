import { cn } from "@/lib/utils";
import type { Urgency } from "@/types";

export interface UrgencyBadgeProps {
  urgency: Urgency | string;
  className?: string;
}

interface UrgencyTheme {
  label: string;
  badgeClass: string;
  dotClass: string;
  pulse: boolean;
}

const urgencyMap: Record<string, UrgencyTheme> = {
  NORMAL: {
    label: "Normal",
    badgeClass: "border-line bg-surface-2 text-fg-muted",
    dotClass: "bg-fg-dim",
    pulse: false,
  },
  URGENT: {
    label: "Urgent",
    badgeClass: "border-plasma/30 bg-plasma/10 text-plasma",
    dotClass: "bg-plasma urgency-pulse",
    pulse: true,
  },
  CRITICAL: {
    label: "Critical",
    badgeClass: "border-blood-deep/60 bg-blood-deep/20 text-blood-text",
    dotClass: "bg-blood urgency-pulse",
    pulse: true,
  },
};

/**
 * UrgencyBadge (Server Component).
 * CRITICAL has a CSS-only keyframe pulse on the indicator dot.
 * The pulse is disabled via @media (prefers-reduced-motion: reduce).
 */
export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  const normalizedKey = urgency?.toUpperCase() || "NORMAL";
  const theme = urgencyMap[normalizedKey] || urgencyMap.NORMAL;

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
