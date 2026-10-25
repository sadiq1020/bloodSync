"use client";

import * as React from "react";
import Link from "next/link";
import { ListIcon } from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/brand/Logo";

export function MobileNavSheet() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open navigation menu"
        className="flex h-11 w-11 items-center justify-center rounded-[4px] border border-line bg-surface text-fg hover:border-line-dim focus-visible:outline-2 focus-visible:outline-blood md:hidden"
      >
        <ListIcon className="h-5 w-5" weight="bold" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] border-l border-line bg-surface p-6 text-fg sm:w-[360px]"
      >
        <SheetHeader className="mb-6 flex flex-row items-center justify-between border-b border-line pb-4 text-left">
          <SheetTitle>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center"
            >
              <Logo variant="compact" size="sm" />
            </Link>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
          <Link
            href="/#how-it-works"
            onClick={() => setOpen(false)}
            className="flex min-h-[44px] items-center rounded-[4px] px-3 font-sans text-sm text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg"
          >
            How it works
          </Link>
          <Link
            href="/compatibility"
            onClick={() => setOpen(false)}
            className="flex min-h-[44px] items-center rounded-[4px] px-3 font-sans text-sm text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg"
          >
            Compatibility
          </Link>

          <div className="my-4 border-t border-line" />

          <div className="flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] items-center justify-center rounded-[4px] border border-line bg-transparent px-4 font-sans text-sm font-medium text-fg transition-colors hover:border-line-dim hover:bg-surface-raised"
            >
              Log in
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] items-center justify-center rounded-[4px] bg-blood px-4 font-sans text-sm font-medium text-fg shadow-sm transition-colors hover:bg-blood-hover"
            >
              Register
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
