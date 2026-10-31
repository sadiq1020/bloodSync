import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { NavLinks } from "./NavLinks";
import { UserMenu } from "./UserMenu";
import { type CurrentUser } from "@/types";

interface AppTopBarProps {
  user: Pick<CurrentUser, "id" | "name" | "email" | "role" | "image">;
}

const mainNavItems = [
  { href: "/requests", label: "Requests" },
  { href: "/donors", label: "Find donors" },
  { href: "/my/requests", label: "My requests" },
  { href: "/my/donations", label: "My donations" },
  { href: "/donor", label: "Donor profile" },
];

/**
 * AppTopBar (Server Component)
 * Sticky 64px top bar with solid background and hairline bottom border.
 * Left: Logo → /requests. Middle (lg+): main nav links. Right: "Request blood" CTA + UserMenu.
 * Active-link underline is pure CSS via NavLinks (client boundary).
 */
export function AppTopBar({ user }: AppTopBarProps) {
  const navItems =
    user.role === "ADMIN"
      ? [...mainNavItems, { href: "/admin", label: "Admin" }]
      : mainNavItems;

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-line bg-surface">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
        {/* Left: Logo */}
        <div className="flex shrink-0 items-center">
          <Link
            href="/requests"
            aria-label="BloodSync — go to requests"
            className="flex min-h-[44px] items-center py-2 focus-visible:outline-2 focus-visible:outline-blood rounded-[4px]"
          >
            <Logo variant="compact" size="md" />
          </Link>
        </div>

        {/* Centre: Desktop nav (lg+) */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center">
          <NavLinks items={navItems} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/requests/new"
            className="hidden sm:flex min-h-[38px] items-center justify-center rounded-[4px] bg-blood px-4 font-sans text-sm font-medium text-fg transition-colors hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood"
          >
            Request blood
          </Link>

          <UserMenu
            name={user.name}
            email={user.email}
            role={user.role}
            image={user.image}
          />
        </div>
      </div>
    </header>
  );
}
