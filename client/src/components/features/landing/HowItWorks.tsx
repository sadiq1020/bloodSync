"use client";

import * as React from "react";
import { m, useScroll, useTransform, useReducedMotion, LazyMotion, domAnimation } from "motion/react";
import { Reveal } from "@/components/motion/Reveal";

const steps = [
  {
    num: "01",
    title: "Post a request",
    desc: "Submit hospital details, or paste a raw message and let the parser fill the form automatically.",
  },
  {
    num: "02",
    title: "Eligible donors in the district volunteer",
    desc: "Active donors matching the required blood group in your district receive the request and volunteer.",
  },
  {
    num: "03",
    title: "You pick a donor and confirm after the donation",
    desc: "Contact the donor, coordinate the hospital arrival, and mark the donation completed once the bag is filled.",
  },
  {
    num: "04",
    title: "The donor is marked as resting for 90 days",
    desc: "The donor enters a mandatory 90-day cooldown period to safeguard their health and maintain clean records.",
  },
];

/**
 * HowItWorks (Client Component for scroll-driven timeline line)
 * Four steps in a vertical timeline with big Fraunces numerals and drawing connector.
 * Left-aligned, not cards.
 */
export function HowItWorks() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"],
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      aria-labelledby="how-it-works-heading"
      className="border-t border-line bg-surface/30 py-16 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-fg-dim font-mono text-xs uppercase tracking-widest">
            WORKFLOW
          </p>
          <h2
            id="how-it-works-heading"
            className="font-display text-fg mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
          >
            How it works
          </h2>
          <p className="text-fg-muted mt-4 max-w-xl font-sans text-base leading-relaxed">
            Four disciplined steps from the initial distress message to a completed donation.
          </p>
        </Reveal>

        {/* Timeline wrapper */}
        <div className="relative mt-16 max-w-4xl pl-2 sm:pl-4">
          <LazyMotion features={domAnimation}>
            {/* Background static hairline */}
            <div
              className="absolute left-[40px] sm:left-[56px] top-6 bottom-10 w-[1px] bg-line z-0"
              aria-hidden="true"
            />

            {/* Active drawing line */}
            {!shouldReduceMotion ? (
              <m.div
                style={{ scaleY, transformOrigin: "top" }}
                className="absolute left-[40px] sm:left-[56px] top-6 bottom-10 w-[1px] bg-blood z-0"
                aria-hidden="true"
              />
            ) : (
              <div
                className="absolute left-[40px] sm:left-[56px] top-6 bottom-10 w-[1px] bg-blood z-0"
                aria-hidden="true"
              />
            )}
          </LazyMotion>

          {/* Steps List */}
          <div className="flex flex-col gap-12 sm:gap-16">
            {steps.map((step) => (
              <div
                key={step.num}
                className="relative flex items-start gap-5 sm:gap-10"
              >
                {/* Big Fraunces Numeral */}
                <div className="relative z-10 flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-[4px] border border-line bg-surface font-display text-2xl sm:text-3xl font-semibold text-blood shadow-sm">
                  {step.num}
                </div>

                {/* Step Content */}
                <div className="pt-2 sm:pt-3">
                  <h3 className="font-display text-fg text-xl sm:text-2xl font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-fg-muted mt-2 max-w-xl font-sans text-sm sm:text-base leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
