import Link from "next/link";
import {
  CheckCircle,
  ClockCountdown,
  XCircle,
  ArrowClockwise,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types/api";

interface TerminalBannerProps {
  status: RequestStatus;
  requestId?: string;
  isOwner?: boolean;
  className?: string;
}

export function TerminalBanner({
  status,
  requestId,
  isOwner = false,
  className,
}: TerminalBannerProps) {
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

  const showPostAgain =
    isOwner && (status === "EXPIRED" || status === "CANCELLED") && !!requestId;

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col gap-3 rounded-[6px] border p-4 font-sans text-sm sm:flex-row sm:items-center sm:justify-between",
        borderClass,
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon}
        <div className="space-y-0.5">
          <p className="font-semibold text-fg">{title}</p>
          <p className="text-xs leading-relaxed text-fg-muted">{message}</p>
        </div>
      </div>

      {showPostAgain && (
        <Link
          href={`/requests/new?from=${requestId}`}
          className="inline-flex min-h-[34px] shrink-0 items-center justify-center gap-1.5 rounded-[4px] bg-blood px-3.5 font-sans text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blood-hover self-start sm:self-auto"
        >
          <ArrowClockwise className="size-3.5" weight="bold" />
          <span>Post again</span>
        </Link>
      )}
    </div>
  );
}
