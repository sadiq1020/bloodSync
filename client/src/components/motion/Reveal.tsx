"use client";

import { useRef, useEffect, useState, type ElementType } from "react";
import { m, LazyMotion, domAnimation } from "motion/react";
import { EASE, DURATION } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}

/**
 * Reveal (Client Component — needs IntersectionObserver + framer-motion).
 * Fades and lifts children up by 16px when they enter the viewport (once).
 * Respects prefers-reduced-motion via the MotionConfig in the root providers.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Motion component for the requested HTML element
  const MotionComponent = ((m as Record<string, any>)[Tag as string] || m.div) as any;

  return (
    <LazyMotion features={domAnimation}>
      <MotionComponent
        ref={ref}
        className={cn(className)}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{
          duration: DURATION.base,
          ease: EASE as [number, number, number, number],
          delay,
        }}
      >
        {children}
      </MotionComponent>
    </LazyMotion>
  );
}
