"use client";

import * as React from "react";
import { MotionConfig, LazyMotion } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

// Asynchronous feature loader splits domAnimation into a lazy chunk
// so it is not in the initial bundle payload of public pages.
const loadMotionFeatures = () =>
  import("motion/react").then((res) => res.domAnimation);

/**
 * Root Providers
 * Keeps only globally necessary wrappers:
 * 1. NuqsAdapter (URL query state)
 * 2. MotionConfig (prefers-reduced-motion user override)
 * 3. LazyMotion (asynchronous dynamic feature loader)
 *
 * QueryClientProvider is scoped specifically to (app) and (admin) layouts
 * to keep public static pages lightweight.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <MotionConfig reducedMotion="user">
        <LazyMotion features={loadMotionFeatures} strict>
          {children}
        </LazyMotion>
      </MotionConfig>
    </NuqsAdapter>
  );
}
