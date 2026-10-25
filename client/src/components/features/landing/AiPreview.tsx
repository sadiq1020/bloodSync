"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import { BloodTypeBadge } from "@/components/brand/BloodTypeBadge";
import { UrgencyBadge } from "@/components/brand/UrgencyBadge";
import { cn } from "@/lib/utils";

/**
 * AiPreview (Client Component)
 * Scripted non-interactive demo illustrating automated message extraction.
 * Triggers once when scrolled into view.
 * Instantly renders final state if prefers-reduced-motion is enabled.
 */
export function AiPreview() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = React.useState(0);
  const [hasStarted, setHasStarted] = React.useState(false);

  // If reduced motion is preferred, immediately show the final state
  const effectiveStep = shouldReduceMotion ? 4 : step;

  React.useEffect(() => {
    if (shouldReduceMotion) return;

    const currentEl = containerRef.current;
    if (!currentEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.disconnect();

          // Timeline progression
          const t1 = setTimeout(() => setStep(1), 500);
          const t2 = setTimeout(() => setStep(2), 1100);
          const t3 = setTimeout(() => setStep(3), 1700);
          const t4 = setTimeout(() => setStep(4), 2300);

          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
          };
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(currentEl);
    return () => observer.disconnect();
  }, [hasStarted, shouldReduceMotion]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-[6px] border border-line bg-surface p-6 shadow-xl"
    >
      {/* Top Header / Specimen Header Strip */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <span className="text-fg-dim font-mono text-xs uppercase tracking-widest">
          EXAMPLE / PARSER SIMULATION
        </span>
        <span className="rounded-[3px] border border-line bg-surface-raised px-2 py-0.5 font-mono text-[10px] text-fg-dim">
          NON-INTERACTIVE
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-5">
        {/* Step 0: Raw pasted text */}
        <div>
          <label className="text-fg-dim font-mono text-[11px] uppercase tracking-wider">
            Incoming distress text
          </label>
          <div className="mt-1.5 rounded-[4px] border border-line bg-bg p-3.5 font-mono text-sm text-fg">
            &ldquo;Need B+ at Rajshahi Medical urgently&rdquo;
          </div>
        </div>

        {/* Extracted structured fields */}
        <div>
          <label className="text-fg-dim font-mono text-[11px] uppercase tracking-wider">
            Extracted attributes
          </label>
          <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {/* Field 1: Blood Group */}
            <div
              className={cn(
                "flex flex-col rounded-[4px] border border-line bg-surface-raised p-2.5 transition-all duration-300",
                effectiveStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              )}
            >
              <span className="text-fg-dim font-mono text-[10px] uppercase">
                Blood Group
              </span>
              <div className="mt-1 flex items-center">
                <BloodTypeBadge bloodGroup="B+" size="sm" />
              </div>
            </div>

            {/* Field 2: District */}
            <div
              className={cn(
                "flex flex-col rounded-[4px] border border-line bg-surface-raised p-2.5 transition-all duration-300",
                effectiveStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              )}
            >
              <span className="text-fg-dim font-mono text-[10px] uppercase">
                District
              </span>
              <span className="mt-1 font-sans text-sm font-semibold text-fg">
                Rajshahi
              </span>
            </div>

            {/* Field 3: Urgency */}
            <div
              className={cn(
                "flex flex-col rounded-[4px] border border-line bg-surface-raised p-2.5 transition-all duration-300",
                effectiveStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              )}
            >
              <span className="text-fg-dim font-mono text-[10px] uppercase">
                Urgency
              </span>
              <div className="mt-1 flex items-center">
                <UrgencyBadge urgency="URGENT" />
              </div>
            </div>
          </div>
        </div>

        {/* Final Ranking Note */}
        <div
          className={cn(
            "rounded-[4px] border border-blood/20 bg-blood/5 p-3 font-sans text-xs text-fg-muted transition-all duration-500",
            effectiveStep >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          Then donors are ranked by district, area and last donation.
        </div>
      </div>
    </div>
  );
}
