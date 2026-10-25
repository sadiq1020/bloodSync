import * as React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/server";
import { Logo } from "@/components/brand/Logo";
import { PulseLine } from "@/components/brand/PulseLine";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If an active session exists, redirect away from auth pages to /requests
  const user = await getCurrentUser();
  if (user) {
    redirect("/requests");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-bg lg:grid-cols-12">
      {/* Left Editorial Panel (lg and up) */}
      <aside className="relative hidden flex-col justify-between border-r border-line bg-surface p-10 lg:col-span-5 lg:flex xl:col-span-4 xl:p-14">
        {/* Top: Brand Logo */}
        <div>
          <Logo variant="compact" size="md" />
        </div>

        {/* Center: Editorial Statement & ECG Trace */}
        <div className="my-auto py-12">
          <p className="font-mono text-xs uppercase tracking-widest text-fg-dim">
            CLINICAL NETWORK
          </p>
          <h2 className="font-display text-fg mt-4 text-3xl font-semibold tracking-tight xl:text-4xl leading-[1.15]">
            Direct blood matching for urgent medical care.
          </h2>
          <div className="mt-8" aria-hidden="true">
            <PulseLine className="h-8 w-56 opacity-75" color="blood" loop={false} />
          </div>
        </div>

        {/* Bottom: Monospace safety note */}
        <div className="border-t border-line pt-6">
          <p className="font-mono text-xs text-fg-dim leading-relaxed">
            Emergency registry. Always verify compatibility with hospital lab technicians.
          </p>
        </div>
      </aside>

      {/* Right Column: Form Area */}
      <main className="flex flex-col justify-center px-4 py-12 sm:px-8 lg:col-span-7 lg:px-12 xl:col-span-8">
        <div className="mx-auto w-full max-w-[420px]">
          {/* Mobile Logo (hidden on lg) */}
          <div className="mb-8 lg:hidden">
            <Logo variant="compact" size="md" />
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
