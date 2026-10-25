import { cn } from "@/lib/utils";

export interface SpecimenCardProps {
  header?: string;
  footer?: string;
  children: React.ReactNode;
  className?: string;
  accent?: "none" | "blood" | "plasma";
}

const accentStyles: Record<string, string> = {
  none: "",
  blood: "shadow-[inset_0_2px_0_#D92D43]",
  plasma: "shadow-[inset_0_2px_0_#E9B872]",
};

/**
 * SpecimenCard (Server Component).
 * Styled like a laboratory specimen label — hairline border, small radius,
 * corner tick marks, optional mono header/footer strips, and a dashed divider.
 * An "accent" option adds a thin colored top inset shadow instead of a heavy border.
 */
export function SpecimenCard({
  header,
  footer,
  children,
  className,
  accent = "none",
}: SpecimenCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[6px] border border-line bg-surface",
        accentStyles[accent],
        className
      )}
    >
      {/* Corner tick marks */}
      <span className="pointer-events-none absolute top-2 left-2 size-2 border-t border-l border-line-strong" aria-hidden="true" />
      <span className="pointer-events-none absolute top-2 right-2 size-2 border-t border-r border-line-strong" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-2 left-2 size-2 border-b border-l border-line-strong" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-2 right-2 size-2 border-b border-r border-line-strong" aria-hidden="true" />

      {/* Header strip */}
      {header && (
        <>
          <div className="px-4 pt-4 pb-2.5">
            <span className="font-mono text-[11px] uppercase tracking-widest text-fg-dim leading-none select-none">
              {header}
            </span>
          </div>
          {/* Dashed divider */}
          <div
            className="mx-4 border-t border-dashed border-line-strong"
            aria-hidden="true"
          />
        </>
      )}

      {/* Main body */}
      <div className="flex-1 px-4 py-4">{children}</div>

      {/* Footer strip */}
      {footer && (
        <>
          <div
            className="mx-4 border-t border-dashed border-line"
            aria-hidden="true"
          />
          <div className="px-4 pt-2 pb-3.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-fg-dim leading-none select-none">
              {footer}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
