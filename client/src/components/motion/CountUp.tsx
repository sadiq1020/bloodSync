"use client";

import { useRef, useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
  locale?: string;
  formatOptions?: Intl.NumberFormatOptions;
  suffix?: string;
  prefix?: string;
}

function easeOut(t: number, cubicBez: readonly [number, number, number, number]): number {
  // Simple cubic approximation of the cubic-bezier curve for animation
  // For our easing [0.22, 1, 0.36, 1] (ease-out-expo-like), we can approximate with:
  return 1 - Math.pow(1 - t, 3 + cubicBez[1]);
}

/**
 * CountUp (Client Component — needs requestAnimationFrame + IntersectionObserver).
 * Animates a number from 0 to `value` when the element enters the viewport.
 * Formats output with Intl.NumberFormat. Respects prefers-reduced-motion.
 */
export function CountUp({
  value,
  duration = 1200,
  className,
  locale = "en",
  formatOptions,
  suffix = "",
  prefix = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const formatter = new Intl.NumberFormat(locale, formatOptions);

  // Watch for viewport entry
  useEffect(() => {
    if (!ref.current || triggered) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [triggered]);

  // Animate once triggered
  useEffect(() => {
    if (!triggered) return;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const startTime = performance.now();
    const startValue = 0;
    const endValue = value;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress, EASE);
      const current = Math.round(startValue + (endValue - startValue) * easedProgress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setDisplayValue(endValue);
      }
    };

    const frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [triggered, value, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {formatter.format(displayValue)}
      {suffix}
    </span>
  );
}
