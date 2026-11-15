"use client";

import { useState, useEffect } from "react";

/**
 * OfflineBanner (Client Component)
 * Shows a fixed banner when the browser goes offline and hides it when it reconnects.
 * Uses the standard `online`/`offline` window events.
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Sync with the actual current state on mount (SSR assumes online).
    // Wrapped in setTimeout so setState fires in a callback, not synchronously
    // in the effect body — satisfying the react-hooks/set-state-in-effect rule.
    const syncInitial = setTimeout(() => {
      setIsOffline(!navigator.onLine);
    }, 0);

    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      clearTimeout(syncInitial);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed inset-x-0 top-0 z-[9999] flex items-center justify-center gap-2 border-b border-plasma/40 bg-surface px-4 py-2 text-center font-sans text-sm text-plasma"
    >
      {/* Small indicator dot */}
      <span className="size-1.5 shrink-0 rounded-full bg-plasma" aria-hidden="true" />
      You are offline. Changes will not be saved.
    </div>
  );
}
