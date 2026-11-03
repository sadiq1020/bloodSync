import Link from "next/link";
import { cn } from "@/lib/utils";

interface ActivityTabsProps {
  active: "requests" | "donations";
  className?: string;
}

/**
 * ActivityTabs (Server Component): Segmented navigation links between
 * "My requests" and "My donations" with proper aria-current.
 */
export function ActivityTabs({ active, className }: ActivityTabsProps) {
  return (
    <nav
      aria-label="Activity navigation"
      className={cn("flex items-center", className)}
    >
      <div className="inline-flex rounded-[6px] border border-line bg-surface-2 p-1">
        <Link
          href="/my/requests"
          aria-current={active === "requests" ? "page" : undefined}
          className={cn(
            "flex min-h-[36px] items-center justify-center rounded-[4px] px-4 font-sans text-xs font-medium transition-colors select-none",
            active === "requests"
              ? "bg-surface text-fg shadow-xs border border-line/60"
              : "text-fg-muted hover:text-fg hover:bg-surface/50"
          )}
        >
          My requests
        </Link>
        <Link
          href="/my/donations"
          aria-current={active === "donations" ? "page" : undefined}
          className={cn(
            "flex min-h-[36px] items-center justify-center rounded-[4px] px-4 font-sans text-xs font-medium transition-colors select-none",
            active === "donations"
              ? "bg-surface text-fg shadow-xs border border-line/60"
              : "text-fg-muted hover:text-fg hover:bg-surface/50"
          )}
        >
          My donations
        </Link>
      </div>
    </nav>
  );
}
