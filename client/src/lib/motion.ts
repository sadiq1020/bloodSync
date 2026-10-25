// Shared animation curves and duration tokens
// Adheres to the wine-and-ink design aesthetic: no overshoot, crisp deceleration

export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  fast: 0.2, // 200ms
  base: 0.35, // 350ms
  slow: 0.6, // 600ms
  vial: 1.2, // 1200ms for atmospheric liquid fill
} as const;

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.base,
      ease: EASE,
    },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: {
      duration: DURATION.fast,
      ease: EASE,
    },
  },
} as const;

export const fadeIn = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: DURATION.base,
      ease: EASE,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: DURATION.fast,
      ease: EASE,
    },
  },
} as const;

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
} as const;

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.base,
      ease: EASE,
    },
  },
} as const;
