"use client";

import { useRef, useEffect, useState } from "react";
import { m, LazyMotion, domAnimation, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

export interface VialProgressProps {
  filled: number;
  total: number;
  secondary?: number;
  caption?: string;
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
 * Supports a secondary layer for accepted (pending completion) units.
 * Fully accessible via role="img" and aria-label.
 */
export function VialProgress({
  filled,
  total,
  secondary = 0,
  caption,
  size = "md",
  label = true,
  className,
}: VialProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggered = useIntersectionOnce(containerRef);
  const prefersReducedMotion = useReducedMotion();

  const clampedTotal = Math.max(1, total);
  const clampedFilled = Math.max(0, Math.min(filled, clampedTotal));
  const clampedSecondary = Math.max(
    0,
    Math.min(secondary, clampedTotal - clampedFilled)
  );
  const totalLiquid = clampedFilled + clampedSecondary;
  const fillRatio = totalLiquid / clampedTotal;
  const bloodRatio = clampedFilled / clampedTotal;
  const secondaryRatio = clampedSecondary / clampedTotal;

  const { vialW, vialH, fontSize } = sizeConfig[size];

  // Vial geometry
  const padding = 4;
  const innerW = vialW - padding * 2;
  const innerH = vialH - padding * 2;

  const bloodHeight = innerH * bloodRatio;
  const secondaryHeight = innerH * secondaryRatio;
  const totalHeight = innerH * fillRatio;

  const fillY = padding + innerH - totalHeight;
  const bloodY = padding + innerH - bloodHeight;

  // Tick marks (right side of vial interior)
  const tickCount = clampedTotal;
  const ticks = Array.from({ length: tickCount - 1 }, (_, i) => {
    const ratio = (i + 1) / tickCount;
    return padding + innerH - innerH * ratio;
  });

  // Wave animation paths at top of liquid surface
  const buildWavePath = (phase: number) => {
    const amplitude = 1.5;
    const segments = 4;
    const segW = innerW / segments;
    const baseY = fillY;
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
  const waveColor = clampedSecondary > 0 ? "#E89568" : "#D92D43";

  const ariaLabel =
    clampedSecondary > 0
      ? `${clampedFilled} completed, ${clampedSecondary} accepted of ${clampedTotal} unit${clampedTotal !== 1 ? "s" : ""}`
      : `${clampedFilled} of ${clampedTotal} unit${clampedTotal !== 1 ? "s" : ""} donated`;

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
          aria-label={ariaLabel}
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

          {/* Solid blood layer (completed units) */}
          {bloodRatio > 0 && (
            <m.rect
              x={padding + 1}
              width={innerW - 2}
              height={Math.max(0, bloodHeight - 1)}
              rx={bloodRatio >= 0.99 && secondaryRatio === 0 ? 2 : 0}
              fill="#D92D43"
              fillOpacity={0.88}
              initial={{ y: padding + innerH, height: 0 }}
              animate={
                shouldAnimate || (!prefersReducedMotion && triggered === false)
                  ? {
                      y: bloodY + 1,
                      height: Math.max(0, bloodHeight - 1),
                    }
                  : { y: bloodY + 1, height: Math.max(0, bloodHeight - 1) }
              }
              transition={
                shouldAnimate
                  ? { duration: 1.1, ease: EASE as [number, number, number, number] }
                  : { duration: 0 }
              }
            />
          )}

          {/* Plasma secondary layer (accepted units) above blood */}
          {secondaryRatio > 0 && (
            <m.rect
              x={padding + 1}
              width={innerW - 2}
              height={Math.max(0, secondaryHeight - 1)}
              rx={fillRatio >= 0.99 ? 2 : 0}
              fill="#E89568"
              fillOpacity={0.8}
              initial={{ y: bloodY, height: 0 }}
              animate={
                shouldAnimate || (!prefersReducedMotion && triggered === false)
                  ? {
                      y: fillY + 1,
                      height: Math.max(0, secondaryHeight - 1),
                    }
                  : { y: fillY + 1, height: Math.max(0, secondaryHeight - 1) }
              }
              transition={
                shouldAnimate
                  ? {
                      duration: 1.2,
                      delay: 0.15,
                      ease: EASE as [number, number, number, number],
                    }
                  : { duration: 0 }
              }
            />
          )}

          {/* Wave overlay at liquid surface */}
          {fillRatio > 0 && fillRatio < 1 && (
            <>
              <path
                d={buildWavePath(0)}
                fill={waveColor}
                fillOpacity={0.4}
                className="wave-1"
                style={{ transformOrigin: "center" }}
              />
              <path
                d={buildWavePath(Math.PI / 3)}
                fill={waveColor}
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
              "font-mono uppercase tracking-wider text-fg-dim select-none text-center",
              fontSize
            )}
          >
            {caption
              ? caption
              : `${clampedFilled} / ${clampedTotal} UNIT${clampedTotal !== 1 ? "S" : ""}`}
          </span>
        )}
      </div>
    </LazyMotion>
  );
}
