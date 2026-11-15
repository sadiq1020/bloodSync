"use client";

import { useState, useEffect } from "react";
import { formatRelativeTime, formatDate, formatDateTimeISO } from "@/lib/format";

interface RelativeTimeProps {
  /** The date/time value to display. */
  date: Date | string | number | null | undefined;
  /** Class applied to the <time> element. */
  className?: string;
}

/**
 * RelativeTime (Client Component)
 *
 * Renders a <time dateTime="..."> that:
 * - Shows the absolute date on the server and on first hydration (avoids mismatch).
 * - Switches to relative text ("2 hours ago") after the component mounts via
 *   a setTimeout callback (lint-rule-safe: no synchronous setState in effect body).
 * - Updates every 60 seconds, but only while the tab is visible (Page Visibility API).
 */
export function RelativeTime({ date, className }: RelativeTimeProps) {
  const [relText, setRelText] = useState<string | null>(null);

  const absoluteText = formatDate(date);
  const isoString = formatDateTimeISO(date);

  useEffect(() => {
    // Use setTimeout so setState fires in a callback, not synchronously in the
    // effect body — satisfying the react-hooks/set-state-in-effect lint rule.
    const init = setTimeout(() => {
      setRelText(formatRelativeTime(date));
    }, 0);

    // Refresh every 60 s while the tab is visible
    const tick = () => {
      if (document.visibilityState === "visible") {
        setRelText(formatRelativeTime(date));
      }
    };

    const interval = setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearTimeout(init);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [date]);

  return (
    <time
      dateTime={isoString}
      className={className}
      // Show absolute date as a tooltip on hover
      title={absoluteText}
    >
      {/* relText is null until mounted — renders absolute date to match server HTML */}
      {relText ?? absoluteText}
    </time>
  );
}
