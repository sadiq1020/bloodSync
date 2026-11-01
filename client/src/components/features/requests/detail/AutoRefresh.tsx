"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { RequestStatus } from "@/types/api";

interface AutoRefreshProps {
  status: RequestStatus;
}

export function AutoRefresh({ status }: AutoRefreshProps) {
  const router = useRouter();

  const isTerminal =
    status === "FULFILLED" || status === "EXPIRED" || status === "CANCELLED";

  React.useEffect(() => {
    if (isTerminal) return;

    const isDialogOpen = () => {
      if (typeof document === "undefined") return false;
      return Boolean(
        document.querySelector('[role="dialog"]') ||
          document.querySelector('[role="alertdialog"]') ||
          document.querySelector('[data-slot="dialog"]') ||
          document.querySelector('[data-slot="alert-dialog"]')
      );
    };

    const refreshIfEligible = () => {
      if (typeof document === "undefined") return;
      if (document.visibilityState !== "visible") return;
      if (isDialogOpen()) return;
      router.refresh();
    };

    // 1. Visibility change listener (once when tab becomes visible again)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshIfEligible();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 2. 30-second interval polling while tab is visible
    const intervalId = setInterval(refreshIfEligible, 30_000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [router, isTerminal]);

  const prevStatus = React.useRef(status);
  const [announcement, setAnnouncement] = React.useState("");

  React.useEffect(() => {
    if (prevStatus.current !== status) {
      const formatted =
        status.charAt(0) + status.slice(1).toLowerCase();
      setAnnouncement(`Status changed to ${formatted}`);
      prevStatus.current = status;
    }
  }, [status]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
}
