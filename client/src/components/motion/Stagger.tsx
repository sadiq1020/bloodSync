"use client";

import { useRef, useEffect, useState } from "react";
import { m, LazyMotion, domAnimation } from "motion/react";
import { EASE, DURATION } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerMs?: number;
}

export interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

function useInView(threshold = 0.1): [React.RefObject<HTMLDivElement | null>, boolean] {
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
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

/**
 * Stagger (Client Component — needs framer-motion staggerChildren).
 * Container that staggers its StaggerItem children as they enter the viewport.
 */
export function Stagger({ children, className, staggerMs = 60 }: StaggerProps) {
  const [ref, inView] = useInView(0.1);
  const staggerSeconds = staggerMs / 1000;

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        ref={ref}
        className={cn(className)}
        initial="initial"
        animate={inView ? "animate" : "initial"}
        variants={{
          initial: {},
          animate: {
            transition: {
              staggerChildren: staggerSeconds,
              delayChildren: 0.02,
            },
          },
        }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

const staggerItemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.base,
      ease: EASE as [number, number, number, number],
    },
  },
};

/**
 * StaggerItem — must be a direct child of Stagger.
 */
export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <m.div className={cn(className)} variants={staggerItemVariants}>
      {children}
    </m.div>
  );
}
