import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { MobileNavSheet } from "./MobileNavSheet";

/**
 * MarketingNav (Server Component)
 * Sticky, solid background with hairline bottom border (no glass/blur).
 * Static server component with mobile drawer delegated to MobileNavSheet.
 */
export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            aria-label="BloodSync Home"
            className="flex min-h-[44px] items-center py-2 focus-visible:outline-2 focus-visible:outline-blood"
          >
            <Logo variant="compact" size="md" />
          </Link>

          {/* Desktop Nav Links */}
          <nav
            className="hidden items-center gap-6 md:flex"
            aria-label="Main Navigation"
          >
            <Link
              href="/#how-it-works"
              className="flex min-h-[44px] items-center font-sans text-sm text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-blood"
            >
              How it works
            </Link>
            <Link
              href="/compatibility"
              className="flex min-h-[44px] items-center font-sans text-sm text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-blood"
            >
              Compatibility
            </Link>
          </nav>
        </div>

        {/* Right: Auth actions (desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="flex min-h-[44px] items-center justify-center rounded-[4px] px-4 font-sans text-sm font-medium text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg focus-visible:outline-2 focus-visible:outline-blood"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="flex min-h-[44px] items-center justify-center rounded-[4px] bg-blood px-4.5 font-sans text-sm font-medium text-fg shadow-sm transition-colors hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood"
          >
            Register
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <MobileNavSheet />
        </div>
      </div>
    </header>
  );
}
