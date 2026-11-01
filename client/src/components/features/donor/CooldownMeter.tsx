import { cn } from "@/lib/utils";

interface CooldownMeterProps {
  lastDonatedAt?: string | Date | null;
  nextEligibleDate?: string | Date | null;
  isEligible?: boolean;
  className?: string;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * CooldownMeter (Server Component, CSS only)
 * Renders days elapsed since the donor's last donation against the server's recovery window.
 * If the donor has never donated, renders "No donation recorded" without a bar.
 */
export function CooldownMeter({
  lastDonatedAt,
  nextEligibleDate,
  isEligible = false,
  className,
}: CooldownMeterProps) {
  if (!lastDonatedAt) {
    return (
      <div className={cn("space-y-1 py-1", className)}>
        <p className="font-mono text-[11px] uppercase tracking-wider text-fg-dim">
          Donation history
        </p>
        <p className="font-sans text-xs text-fg-muted">
          No donation recorded yet
        </p>
      </div>
    );
  }

  const lastDate = new Date(lastDonatedAt);
  const nextDate = nextEligibleDate ? new Date(nextEligibleDate) : null;

  // Calculate dynamic total recovery days from server dates (no hardcoded 90)
  const totalDays = nextDate
    ? Math.max(1, Math.round((nextDate.getTime() - lastDate.getTime()) / MS_PER_DAY))
    : 90;

  const now = new Date();
  const elapsedDays = Math.max(
    0,
    Math.floor((now.getTime() - lastDate.getTime()) / MS_PER_DAY)
  );

  const percentage = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  return (
    <div className={cn("space-y-2 py-1 select-none", className)}>
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider">
        <span className="text-fg-dim">Days since last donation</span>
        <span className="font-semibold text-fg">
          {elapsedDays} <span className="text-fg-dim">/</span> {totalDays}
        </span>
      </div>

      {/* Slim progress bar with subtle tick marks */}
      <div className="relative h-2 w-full overflow-hidden rounded-[2px] border border-line bg-surface-2">
        {/* Tick marks at 25%, 50%, 75% */}
        <span
          className="absolute inset-y-0 left-1/4 w-px bg-line-strong z-10"
          aria-hidden="true"
        />
        <span
          className="absolute inset-y-0 left-2/4 w-px bg-line-strong z-10"
          aria-hidden="true"
        />
        <span
          className="absolute inset-y-0 left-3/4 w-px bg-line-strong z-10"
          aria-hidden="true"
        />

        {/* Fill bar */}
        <div
          className={cn(
            "h-full transition-all duration-300",
            isEligible ? "bg-sage" : "bg-plasma"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
