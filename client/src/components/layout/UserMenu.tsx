"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Gear,
  SignOut,
  Drop,
  Heart,
  ChartBar,
  CaretDown,
} from "@phosphor-icons/react";
import { getInitials } from "@/lib/get-initials";
import { useSignOut } from "@/hooks/useSignOut";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  image?: string | null;
}

const menuItems = [
  { href: "/my/profile", label: "My profile", Icon: User },
  { href: "/my/requests", label: "My requests", Icon: Heart },
  { href: "/my/donations", label: "My donations", Icon: Drop },
  { href: "/donor", label: "Donor profile", Icon: Gear },
];

/**
 * UserMenu (Client Component)
 * 40px circle avatar with user initials (or image if provided),
 * dropdown menu with account links + sign-out.
 * Closes on outside-click, Escape, and after navigation.
 */
export function UserMenu({ name, email, role, image }: UserMenuProps) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const { signOut } = useSignOut();
  const router = useRouter();

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const initials = getInitials(name);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar trigger */}
      <button
        id="user-menu-button"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="user-menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group flex h-10 items-center gap-1.5 rounded-[6px] border transition-colors duration-150",
          "border-line hover:border-line-strong focus-visible:outline-2 focus-visible:outline-blood",
          open ? "border-line-strong bg-surface-2" : "bg-surface",
          "pl-1 pr-2",
        )}
      >
        {/* Avatar */}
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-[4px] bg-blood-deep text-xs font-semibold text-fg overflow-hidden"
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="size-full object-cover" />
          ) : (
            <span className="font-mono text-[11px] font-bold tracking-tight">
              {initials}
            </span>
          )}
        </span>
        <CaretDown
          weight="bold"
          className={cn(
            "size-3.5 text-fg-muted transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          id="user-menu"
          role="menu"
          aria-labelledby="user-menu-button"
          className={cn(
            "absolute right-0 top-[calc(100%+6px)] z-50 w-56 rounded-[6px]",
            "border border-line bg-surface shadow-lg",
            "py-1",
          )}
        >
          {/* Identity header */}
          <div className="border-b border-line px-4 py-3">
            <p className="truncate font-sans text-sm font-medium text-fg">
              {name}
            </p>
            <p className="truncate font-mono text-xs text-fg-muted mt-0.5">
              {email}
            </p>
          </div>

          {/* Nav items */}
          <div className="py-1">
            {menuItems.map(({ href, label, Icon }) => (
              <button
                key={href}
                role="menuitem"
                type="button"
                onClick={() => navigate(href)}
                className="flex w-full items-center gap-3 px-4 py-2.5 font-sans text-sm text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:bg-surface-2"
              >
                <Icon weight="regular" className="size-4 shrink-0" aria-hidden="true" />
                {label}
              </button>
            ))}

            {role === "ADMIN" && (
              <button
                role="menuitem"
                type="button"
                onClick={() => navigate("/admin")}
                className="flex w-full items-center gap-3 px-4 py-2.5 font-sans text-sm text-blood-text transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:bg-surface-2"
              >
                <ChartBar weight="regular" className="size-4 shrink-0" aria-hidden="true" />
                Admin dashboard
              </button>
            )}
          </div>

          {/* Sign out */}
          <div className="border-t border-line py-1">
            <button
              role="menuitem"
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2.5 font-sans text-sm text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:bg-surface-2"
            >
              <SignOut weight="regular" className="size-4 shrink-0" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
