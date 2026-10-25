"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  const handleSignOut = async () => {
    setIsPending(true);
    try {
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      router.replace("/login");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="inline-flex h-9 items-center justify-center rounded-[4px] border border-line bg-surface px-3 font-sans text-xs font-medium text-fg hover:border-line-dim hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-blood disabled:opacity-50"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
