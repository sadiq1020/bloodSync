"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/requests", label: "Requests" },
];

/**
 * AdminNav (Client Component)
 * Desktop (lg+): a horizontal tab strip pinned below the top bar.
 * Mobile: a horizontally scrollable row of tabs.
 * Active tab is indicated by a 2px blood underline (CSS, no layoutId).
 */
export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      aria-label="Admin navigation"
      className="border-b border-line bg-surface sticky top-16 z-30"
    >
      <div className="mx-auto flex max-w-[1200px] items-center gap-1 overflow-x-auto px-4 sm:px-6 scrollbar-none">
        {/* Back to app */}
        <Link
          href="/requests"
          className={cn(
            "flex shrink-0 min-h-[44px] items-center gap-1.5 px-3 font-sans text-sm text-fg-muted",
            "transition-colors hover:text-fg",
            "border-r border-line mr-2 pr-4",
            "focus-visible:outline-2 focus-visible:outline-blood rounded-[4px]",
          )}
        >
          <ArrowLeft weight="bold" className="size-3.5" aria-hidden="true" />
          Back to app
        </Link>

        {adminNavItems.map(({ href, label, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex shrink-0 min-h-[44px] items-center px-3 font-sans text-sm transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-blood rounded-[4px]",
                active
                  ? [
                      "text-fg font-medium",
                      "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-t-full after:bg-blood after:content-['']",
                    ]
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
