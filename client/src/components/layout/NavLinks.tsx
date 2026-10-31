"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  /** If true, only exact match marks as active (default: prefix match) */
  exact?: boolean;
}

interface NavLinksProps {
  items: NavItem[];
  className?: string;
  linkClassName?: string;
  activeLinkClassName?: string;
}

/**
 * NavLinks (Client Component)
 * Renders navigation links with CSS-only active underline indicator.
 * Active state is detected via usePathname (prefix match by default).
 * No layoutId, no layout animations — CSS underline only.
 */
export function NavLinks({
  items,
  className,
  linkClassName,
  activeLinkClassName,
}: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-1", className)} aria-label="App navigation">
      {items.map(({ href, label, exact }) => {
        const isActive = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(href + "/");

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              // Base
              "relative flex min-h-[44px] items-center px-3 font-sans text-sm transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-blood rounded-[4px]",
              // Inactive
              "text-fg-muted hover:text-fg",
              // Active
              isActive && [
                "text-fg font-medium",
                // 2px blood-colored underline via pseudo-element (no layout anim)
                "after:absolute after:inset-x-3 after:bottom-2 after:h-0.5 after:rounded-full after:bg-blood after:content-['']",
              ],
              linkClassName,
              isActive && activeLinkClassName,
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
