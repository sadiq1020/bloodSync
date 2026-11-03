import Link from "next/link";
import { CheckCircle, Clock, Heart, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { MyDonorProfile } from "@/types/api";

interface DonorStatusPanelProps {
  donorProfile: MyDonorProfile | null;
  completedDonationsCount: number;
  className?: string;
}

export function DonorStatusPanel({
  donorProfile,
  completedDonationsCount,
  className,
}: DonorStatusPanelProps) {
  if (!donorProfile) {
    return (
      <div
        className={cn(
          "flex flex-col gap-3 rounded-[6px] border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <Heart className="size-5 shrink-0 text-blood mt-0.5" weight="bold" />
          <div className="space-y-0.5">
            <p className="font-semibold text-fg text-sm">Become a blood donor</p>
            <p className="text-xs text-fg-muted">
              Create a donor profile to volunteer for blood requests in your area.
            </p>
          </div>
        </div>

        <Link
          href="/donor"
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[4px] bg-blood px-3.5 font-sans text-xs font-semibold text-fg transition-colors hover:bg-blood-hover self-start sm:self-auto shrink-0"
        >
          <span>Create profile</span>
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const isEligible = donorProfile.isEligible;
  const nextDate = donorProfile.nextEligibleDate
    ? formatDate(donorProfile.nextEligibleDate)
    : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[6px] border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {isEligible ? (
          <CheckCircle className="size-5 shrink-0 text-sage mt-0.5" weight="fill" />
        ) : (
          <Clock className="size-5 shrink-0 text-plasma mt-0.5" weight="bold" />
        )}

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-[3px] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
                isEligible
                  ? "bg-sage/20 text-sage"
                  : "bg-plasma/20 text-plasma"
              )}
            >
              {isEligible ? "ELIGIBLE TO DONATE" : "RESTING COOLDOWN"}
            </span>

            {completedDonationsCount > 0 && (
              <span className="font-mono text-xs text-fg-dim">
                · <strong className="text-fg">{completedDonationsCount}</strong>{" "}
                completed{" "}
                {completedDonationsCount === 1 ? "donation" : "donations"}
              </span>
            )}
          </div>

          <p className="text-xs text-fg-muted leading-relaxed">
            {isEligible
              ? "You are eligible to donate blood. Browse requests or keep your phone ready."
              : nextDate
                ? `You can donate blood again on ${nextDate}.`
                : "Please observe the 90-day recovery period between donations."}
          </p>
        </div>
      </div>

      <Link
        href="/donor"
        className="inline-flex min-h-[36px] items-center justify-center rounded-[4px] border border-line bg-surface-2 px-3.5 font-sans text-xs font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg self-start sm:self-auto shrink-0"
      >
        Edit donor profile
      </Link>
    </div>
  );
}
