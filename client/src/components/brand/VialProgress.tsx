"use client";

import { useRef, useEffect, useState } from "react";
import { m, LazyMotion, domAnimation, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

export interface VialProgressProps {
  filled: number;
  total: number;
  size?: "sm" | "md" | "lg";
  label?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { vialW: 32, vialH: 80, fontSize: "text-[9px]" },
  md: { vialW: 48, vialH: 120, fontSize: "text-[10px]" },
  lg: { vialW: 64, vialH: 160, fontSize: "text-xs" },
};

function useIntersectionOnce(ref: React.RefObject<Element | null>) {
  const [triggered, setTriggered] = useState(false);

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
  }, [ref, triggered]);

  return triggered;
}

/**
 * VialProgress (Client Component – needs IntersectionObserver + framer-motion animation).
 * Renders an SVG blood bag/vial that animates its liquid fill on first viewport entry.
 * The top of the liquid has a slow two-path wave; tick marks delineate each unit.
 * Fully accessible via role="img" and aria-label.
 */
export function VialProgress({
  filled,
  total,
  size = "md",
  label = true,
  className,
}: VialProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggered = useIntersectionOnce(containerRef);
  const prefersReducedMotion = useReducedMotion();

  const clampedFilled = Math.max(0, Math.min(filled, total));
  const clampedTotal = Math.max(1, total);
  const fillRatio = clampedFilled / clampedTotal;

  const { vialW, vialH, fontSize } = sizeConfig[size];

  // Vial geometry
  const padding = 4;
  const innerW = vialW - padding * 2;
  const innerH = vialH - padding * 2;
  const fillHeight = innerH * fillRatio;
  const fillY = padding + innerH - fillHeight;

  // Tick marks (right side of vial interior)
  const tickCount = clampedTotal;
  const ticks = Array.from({ length: tickCount - 1 }, (_, i) => {
    const ratio = (i + 1) / tickCount;
    return padding + innerH - innerH * ratio;
  });

  // Wave animation paths (two overlapping wavy lines at liquid surface)
  const buildWavePath = (phase: number) => {
    const amplitude = 1.5;
    const segments = 4;
    const segW = innerW / segments;
    const baseY = fillHeight > 0 ? fillY : fillY;
    let d = `M ${padding} ${baseY + amplitude * Math.sin(phase)}`;
    for (let i = 1; i <= segments; i++) {
      const x = padding + i * segW;
      const y = baseY + amplitude * Math.sin(phase + (i * Math.PI) / 2);
      const cpX = padding + (i - 0.5) * segW;
      const cpY = baseY + amplitude * Math.sin(phase + ((i - 0.5) * Math.PI) / 2);
      d += ` Q ${cpX} ${cpY} ${x} ${y}`;
    }
    d += ` L ${padding + innerW} ${padding + innerH} L ${padding} ${padding + innerH} Z`;
    return d;
  };

  const shouldAnimate = triggered && !prefersReducedMotion;
  const targetFillY = shouldAnimate ? fillY : padding + innerH - fillHeight;
  const staticFillY = padding + innerH - fillHeight;

  return (
    <LazyMotion features={domAnimation}>
      <div
        ref={containerRef}
        className={cn("inline-flex flex-col items-center gap-2", className)}
      >
        <svg
          width={vialW}
          height={vialH}
          viewBox={`0 0 ${vialW} ${vialH}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={`${clampedFilled} of ${clampedTotal} unit${clampedTotal !== 1 ? "s" : ""} donated`}
        >
          {/* Vial outer shape */}
          <rect
            x={padding}
            y={padding}
            width={innerW}
            height={innerH}
            rx={3}
            stroke="rgba(242,231,225,0.16)"
            strokeWidth={1}
          />

          {/* Blood fill (no wave) */}
          {fillRatio > 0 && (
            <m.rect
              x={padding + 1}
              width={innerW - 2}
              height={fillHeight > 0 ? fillHeight - 1 : 0}
              rx={fillRatio >= 0.99 ? 2 : 0}
              fill="#D92D43"
              fillOpacity={0.85}
              initial={{ y: padding + innerH, height: 0 }}
              animate={
                shouldAnimate || (!prefersReducedMotion && triggered === false)
                  ? {
                      y: targetFillY + 1,
                      height: Math.max(0, fillHeight - 1),
                    }
                  : { y: staticFillY + 1, height: Math.max(0, fillHeight - 1) }
              }
              transition={
                shouldAnimate
                  ? { duration: 1.2, ease: EASE as [number, number, number, number] }
                  : { duration: 0 }
              }
            />
          )}

          {/* Wave overlay on top of fill (CSS animation, reduced-motion disabled by globals.css) */}
          {fillRatio > 0 && fillRatio < 1 && (
            <>
              <path
                d={buildWavePath(0)}
                fill="#D92D43"
                fillOpacity={0.4}
                className="wave-1"
                style={{ transformOrigin: "center" }}
              />
              <path
                d={buildWavePath(Math.PI / 3)}
                fill="#D92D43"
                fillOpacity={0.25}
                className="wave-2"
                style={{ transformOrigin: "center" }}
              />
            </>
          )}

          {/* Tick marks on right side */}
          {ticks.map((y, i) => (
            <line
              key={i}
              x1={padding + innerW - 6}
              y1={y}
              x2={padding + innerW - 1}
              y2={y}
              stroke="rgba(242,231,225,0.22)"
              strokeWidth={0.75}
            />
          ))}

          {/* Cap top */}
          <rect
            x={vialW / 2 - 4}
            y={0}
            width={8}
            height={padding}
            rx={2}
            fill="rgba(242,231,225,0.12)"
          />
          <rect
            x={vialW / 2 - 2}
            y={0}
            width={4}
            height={padding + 2}
            rx={1}
            fill="rgba(242,231,225,0.08)"
          />
        </svg>

        {label && (
          <span
            className={cn(
              "font-mono uppercase tracking-wider text-fg-dim select-none",
              fontSize
            )}
          >
            {clampedFilled} / {clampedTotal} UNIT{clampedTotal !== 1 ? "S" : ""}
          </span>
        )}
      </div>
    </LazyMotion>
  );
}
