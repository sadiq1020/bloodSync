"use client";

import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface PulseLineProps {
  className?: string;
  color?: "blood" | "plasma" | "sage" | "fg-muted";
  loop?: boolean;
}

const colorMap = {
  blood: "#D92D43",
  plasma: "#E9B872",
  sage: "#7FB89A",
  "fg-muted": "#A8958F",
};

/**
 * PulseLine (Client Component – needs useReducedMotion to decide on animation).
 * Renders an ECG/heartbeat SVG line that draws itself once (or loops) using
 * stroke-dasharray + stroke-dashoffset CSS animation.
 * With reduced motion the static line is shown immediately.
 * aria-hidden — purely decorative.
 */
export function PulseLine({ className, color = "blood", loop = false }: PulseLineProps) {
  const prefersReducedMotion = useReducedMotion();
  const strokeColor = colorMap[color] ?? colorMap.blood;

  // ECG path (normalized within a 200×40 viewBox)
  const ecgPath =
    "M0 22 L30 22 L36 22 L40 14 L44 32 L48 4 L52 38 L56 22 L62 22 L200 22";

  return (
    <svg
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("overflow-visible", className)}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {prefersReducedMotion ? (
        // Static line — no animation
        <path
          d={ecgPath}
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d={ecgPath}
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          // pathLength="1" lets us animate from 0 to 1 in stroke-dashoffset
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="1"
          className={loop ? "pulse-line-loop" : "pulse-line-once"}
        />
      )}
    </svg>
  );
}
