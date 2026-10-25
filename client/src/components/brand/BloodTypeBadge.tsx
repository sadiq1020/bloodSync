import { formatBloodGroup } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface BloodTypeBadgeProps {
  group: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "plain" | "tag";
  className?: string;
}

const sizeConfig = {
  sm: {
    container: "px-2 py-1 min-w-[34px]",
    letterClass: "text-lg",
    signClass: "text-[11px] -translate-y-[5px]",
    captionClass: "text-[8px] mb-0.5",
    tickOffset: "top-0.5 left-0.5 right-0.5 bottom-0.5",
  },
  md: {
    container: "px-3 py-1.5 min-w-[48px]",
    letterClass: "text-2xl",
    signClass: "text-sm -translate-y-[7px]",
    captionClass: "text-[9px] mb-0.5",
    tickOffset: "top-1 left-1 right-1 bottom-1",
  },
  lg: {
    container: "px-4 py-2.5 min-w-[68px]",
    letterClass: "text-4xl",
    signClass: "text-xl -translate-y-[11px]",
    captionClass: "text-[10px] mb-1",
    tickOffset: "top-1.5 left-1.5 right-1.5 bottom-1.5",
  },
  xl: {
    container: "px-5 py-3.5 min-w-[92px]",
    letterClass: "text-6xl",
    signClass: "text-3xl -translate-y-[16px]",
    captionClass: "text-xs mb-1.5",
    tickOffset: "top-2 left-2 right-2 bottom-2",
  },
};

/**
 * BloodTypeBadge (Server Component).
 * Renders the blood group as a prominent Fraunces monogram with a typographic raised sign.
 * The 'tag' variant includes a specimen frame, a mono 'TYPE' header, and corner tick marks.
 */
export function BloodTypeBadge({
  group,
  size = "md",
  variant = "plain",
  className,
}: BloodTypeBadgeProps) {
  const formatted = formatBloodGroup(group);
  const signMatch = formatted.match(/[+−]$/);
  const sign = signMatch ? signMatch[0] : "";
  const letter = signMatch ? formatted.slice(0, -1) : formatted;

  const config = sizeConfig[size];

  const typography = (
    <span className="inline-flex items-baseline font-display font-semibold tracking-tight leading-none text-fg select-none">
      <span className={cn("font-display", config.letterClass)}>{letter}</span>
      {sign && (
        <span
          className={cn(
            "inline-block font-sans font-bold text-blood leading-none",
            config.signClass
          )}
          aria-hidden="true"
        >
          {sign}
        </span>
      )}
    </span>
  );

  if (variant === "plain") {
    return (
      <span
        className={cn("inline-flex items-center justify-center", className)}
        title={`Blood Type ${formatted}`}
      >
        {typography}
      </span>
    );
  }

  // "tag" variant
  return (
    <div
      className={cn(
        "relative inline-flex flex-col items-center justify-center rounded-[6px] border border-line bg-surface/80 text-center select-none shadow-sm",
        config.container,
        className
      )}
      title={`Blood Type ${formatted}`}
    >
      {/* Corner tick marks */}
      <span className="pointer-events-none absolute top-1 left-1 size-1.5 border-t border-l border-line-strong" />
      <span className="pointer-events-none absolute top-1 right-1 size-1.5 border-t border-r border-line-strong" />
      <span className="pointer-events-none absolute bottom-1 left-1 size-1.5 border-b border-l border-line-strong" />
      <span className="pointer-events-none absolute bottom-1 right-1 size-1.5 border-b border-r border-line-strong" />

      {/* Caption */}
      <span
        className={cn(
          "font-mono uppercase tracking-widest text-fg-dim font-medium leading-none select-none",
          config.captionClass
        )}
      >
        TYPE
      </span>

      {/* Monogram */}
      {typography}
    </div>
  );
}
