"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Drop,
  MagnifyingGlass,
  Plus,
  Heartbeat,
  User,
  SignOut,
  Gear,
  Heart,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useSignOut } from "@/hooks/useSignOut";

interface AppBottomNavProps {
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

const navItems = [
  { href: "/requests", label: "Requests", Icon: Drop },
  { href: "/donors", label: "Donors", Icon: MagnifyingGlass },
  // Center slot is the "Request blood" action — rendered separately
  { href: "/my/requests", label: "Activity", Icon: Heartbeat },
  // "Me" tab is rendered separately (opens sheet)
];

/**
 * AppBottomNav (Client Component)
 * Mobile-only bottom bar (below lg breakpoint).
 * 5 slots: Requests | Donors | [+Request center button] | Activity | Me (→ sheet)
 */
export function AppBottomNav({ name, email, role }: AppBottomNavProps) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const { signOut } = useSignOut();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleSignOut = async () => {
    setSheetOpen(false);
    await signOut();
  };

  return (
    <>
      {/* Bottom bar */}
      <nav
        aria-label="Mobile navigation"
        className={cn(
          "fixed bottom-0 inset-x-0 z-40 lg:hidden",
          "border-t border-line bg-surface",
          "flex h-16 items-stretch",
          // Safe area for devices with home bar
          "pb-[env(safe-area-inset-bottom)]",
        )}
      >
        {/* Requests */}
        <BottomNavItem
          href="/requests"
          label="Requests"
          Icon={Drop}
          active={isActive("/requests")}
        />

        {/* Donors */}
        <BottomNavItem
          href="/donors"
          label="Donors"
          Icon={MagnifyingGlass}
          active={isActive("/donors")}
        />

        {/* Center: Request blood CTA */}
        <div className="flex flex-1 items-center justify-center">
          <Link
            href="/requests/new"
            aria-label="Request blood"
            className={cn(
              "flex size-12 items-center justify-center rounded-[8px]",
              "bg-blood text-fg shadow-md",
              "transition-colors hover:bg-blood-hover",
              "focus-visible:outline-2 focus-visible:outline-blood",
            )}
          >
            <Plus weight="bold" className="size-5" aria-hidden="true" />
          </Link>
        </div>

        {/* Activity */}
        <BottomNavItem
          href="/my/requests"
          label="Activity"
          Icon={Heartbeat}
          active={isActive("/my/requests") || isActive("/my/donations")}
        />

        {/* Me → opens bottom sheet */}
        <button
          type="button"
          aria-label="Account"
          aria-expanded={sheetOpen}
          onClick={() => setSheetOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
            "focus-visible:outline-none",
            sheetOpen ? "text-fg" : "text-fg-muted hover:text-fg",
          )}
        >
          <User weight={sheetOpen ? "fill" : "regular"} className="size-5" aria-hidden="true" />
          <span className="font-sans text-[10px] font-medium leading-none">Me</span>
        </button>
      </nav>

      {/* Account sheet overlay */}
      {sheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Account"
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 lg:hidden",
              "rounded-t-[12px] border-t border-line bg-surface",
              "pb-[env(safe-area-inset-bottom)]",
            )}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <span className="h-1 w-10 rounded-full bg-line-strong" aria-hidden="true" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <p className="font-sans text-sm font-medium text-fg">{name}</p>
                <p className="font-mono text-xs text-fg-muted mt-0.5">{email}</p>
              </div>
              <button
                type="button"
                aria-label="Close account menu"
                onClick={() => setSheetOpen(false)}
                className="flex size-8 items-center justify-center rounded-[4px] text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-blood"
              >
                <X weight="bold" className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* Menu items */}
            <div className="p-2">
              <SheetItem href="/my/profile" label="My profile" Icon={User} onClick={() => setSheetOpen(false)} />
              <SheetItem href="/my/requests" label="My requests" Icon={Heart} onClick={() => setSheetOpen(false)} />
              <SheetItem href="/my/donations" label="My donations" Icon={Drop} onClick={() => setSheetOpen(false)} />
              <SheetItem href="/donor" label="Donor profile" Icon={Gear} onClick={() => setSheetOpen(false)} />
              {role === "ADMIN" && (
                <SheetItem href="/admin" label="Admin dashboard" Icon={Heartbeat} onClick={() => setSheetOpen(false)} className="text-blood-text" />
              )}
            </div>

            <div className="border-t border-line p-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-[6px] px-4 py-3 font-sans text-sm text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-blood"
              >
                <SignOut weight="regular" className="size-5 shrink-0" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface BottomNavItemProps {
  href: string;
  label: string;
  Icon: React.ElementType;
  active: boolean;
}

function BottomNavItem({ href, label, Icon, active }: BottomNavItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
        "focus-visible:outline-none",
        active ? "text-fg" : "text-fg-muted hover:text-fg",
      )}
    >
      <Icon
        weight={active ? "fill" : "regular"}
        className={cn("size-5", active && "text-blood")}
        aria-hidden="true"
      />
      <span
        className={cn(
          "font-sans text-[10px] font-medium leading-none",
          active ? "text-fg" : "text-fg-muted",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

interface SheetItemProps {
  href: string;
  label: string;
  Icon: React.ElementType;
  onClick: () => void;
  className?: string;
}

function SheetItem({ href, label, Icon, onClick, className }: SheetItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-[6px] px-4 py-3 font-sans text-sm text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-blood",
        className,
      )}
    >
      <Icon weight="regular" className="size-5 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  );
}
