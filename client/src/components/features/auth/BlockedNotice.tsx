"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { PulseLine } from "@/components/brand/PulseLine";

export function BlockedNotice() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
    } catch {
      router.replace("/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12 text-fg">
      <div className="w-full max-w-md rounded-[6px] border border-line bg-surface p-8 shadow-2xl">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <Logo variant="compact" size="sm" />
          <span className="rounded-[2px] border border-blood/40 bg-blood/10 px-2 py-0.5 font-mono text-[11px] font-medium text-blood">
            STATUS / 403
          </span>
        </div>

        <div className="mt-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Account blocked
          </h1>
          <p className="text-fg-muted mt-3 font-sans text-sm leading-relaxed">
            Your account has been suspended by hospital administration. If you
            believe this action was taken in error, please contact the registry
            administrator directly.
          </p>
        </div>

        <div className="my-6" aria-hidden="true">
          <PulseLine className="h-6 w-full" color="blood" loop={false} />
        </div>

        <div className="mt-6 border-t border-line pt-4">
          <Button
            variant="outline"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="h-11 w-full font-sans text-sm"
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </div>
    </div>
  );
}
