"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { X, CheckCircle } from "@phosphor-icons/react";
import { ShareButton } from "./ShareButton";

interface CreatedBannerProps {
  bloodGroup: string;
  hospital: string;
  district: string;
}

export function CreatedBanner({
  bloodGroup,
  hospital,
  district,
}: CreatedBannerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [wasCreated] = React.useState(() => searchParams.get("created") === "1");
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (wasCreated) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("created");
      const nextUrl = nextParams.toString()
        ? `${pathname}?${nextParams.toString()}`
        : pathname;
      router.replace(nextUrl, { scroll: false });
    }
  }, [wasCreated, pathname, router, searchParams]);

  if (!wasCreated || dismissed) return null;

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-[6px] border border-sage/40 bg-sage/10 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <CheckCircle className="size-5 shrink-0 text-sage mt-0.5" weight="fill" />
        <div className="space-y-0.5">
          <p className="font-semibold text-fg">Your request is live.</p>
          <p className="text-xs text-fg-muted">
            Share the link so donors can find it quickly.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <ShareButton
          bloodGroup={bloodGroup}
          hospital={hospital}
          district={district}
          variant="primary"
        />
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="flex size-9 items-center justify-center rounded-[4px] border border-line bg-surface text-fg-dim transition-colors hover:text-fg"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
