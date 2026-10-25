import { useId } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "mark" | "compact";
  showWordmark?: boolean;
  className?: string;
  href?: string;
}

const sizeConfig = {
  sm: {
    iconSize: "size-4.5",
    textClass: "text-base tracking-tight",
    gap: "gap-2",
  },
  md: {
    iconSize: "size-6",
    textClass: "text-xl tracking-tight",
    gap: "gap-2.5",
  },
  lg: {
    iconSize: "size-8",
    textClass: "text-2xl tracking-tight",
    gap: "gap-3",
  },
};

/**
 * Brand Logo component (Server Component).
 * Renders the custom blood drop with a pulse notch cut into it and the Fraunces display wordmark.
 */
export function Logo({
  size = "md",
  variant = "full",
  showWordmark,
  className,
  href,
}: LogoProps) {
  const maskId = useId();
  const config = sizeConfig[size];
  const shouldShowWordmark = showWordmark ?? (variant !== "mark");

  const content = (
    <span
      className={cn(
        "inline-flex items-center select-none font-display",
        config.gap,
        className
      )}
    >
      {/* SVG Drop mark with pulse notch cut */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0 text-blood", config.iconSize)}
        aria-hidden="true"
      >
        <defs>
          <mask id={maskId}>
            <rect width="24" height="24" fill="white" />
            <path
              d="M3 15.5 H7.5 L9 13 L10.5 18 L12.5 10.5 L14.5 17 L16 15.5 H21"
              stroke="black"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </mask>
        </defs>
        <path
          d="M12 2.5 C10.5 4.5 5 11.5 5 16 A7 7 0 0 0 19 16 C19 11.5 13.5 4.5 12 2.5 Z"
          fill="currentColor"
          mask={`url(#${maskId})`}
        />
      </svg>

      {shouldShowWordmark && (
        <span
          className={cn(
            "font-display font-semibold text-fg tracking-tight",
            config.textClass
          )}
        >
          Blood<span className="text-blood font-display">Sync</span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blood rounded-[4px]"
      >
        {content}
      </Link>
    );
  }

  return content;
}
