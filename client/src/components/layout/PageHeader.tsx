import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Optional short uppercase mono eyebrow label */
  eyebrow?: string;
  /** Main page title (renders as <h1>) */
  title: string;
  /** Optional subtitle / description */
  description?: string;
  /** Optional slot for action buttons (right-aligned on sm+) */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader (Server Component)
 * Renders an uppercase mono eyebrow, a Fraunces h1 title,
 * optional description, and an optional actions slot.
 * Used at the top of every app page.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-fg-muted">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-semibold text-fg sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="font-sans text-sm text-fg-muted max-w-prose">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
