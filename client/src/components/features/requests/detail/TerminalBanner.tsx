import { CheckCircle, ClockCountdown, XCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types/api";

interface TerminalBannerProps {
  status: RequestStatus;
  className?: string;
}

export function TerminalBanner({ status, className }: TerminalBannerProps) {
  if (status === "OPEN" || status === "MATCHED") {
    return null;
  }

  let icon = <CheckCircle className="size-5 shrink-0 text-sage" weight="fill" />;
  let title = "Request Fulfilled";
  let message =
    "This blood request has been fulfilled. All required units were received. Thank you to all donors who volunteered.";
  let borderClass = "border-sage/40 bg-sage/10 text-fg";

  if (status === "EXPIRED") {
    icon = <ClockCountdown className="size-5 shrink-0 text-fg-dim" weight="bold" />;
    title = "Request Expired";
    message =
      "This request has expired because the needed time has passed. It is no longer accepting volunteers.";
    borderClass = "border-line bg-surface-2 text-fg-muted";
  } else if (status === "CANCELLED") {
    icon = <XCircle className="size-5 shrink-0 text-fg-dim" weight="bold" />;
    title = "Request Cancelled";
    message =
      "This request was cancelled by the requester. No further donations are being accepted.";
    borderClass = "border-line bg-surface-2 text-fg-muted";
  }

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-[6px] border p-4 font-sans text-sm",
        borderClass,
        className
      )}
    >
      {icon}
      <div className="space-y-0.5">
        <p className="font-semibold text-fg">{title}</p>
        <p className="text-xs leading-relaxed text-fg-muted">{message}</p>
      </div>
    </div>
  );
}
