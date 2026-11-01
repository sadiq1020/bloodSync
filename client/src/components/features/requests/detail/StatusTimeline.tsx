import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types/api";

interface StatusTimelineProps {
  status: RequestStatus;
  className?: string;
}

type StepState = "completed" | "current" | "upcoming" | "terminal";

interface TimelineStep {
  label: string;
  state: StepState;
}

function computeSteps(status: RequestStatus): TimelineStep[] {
  if (status === "EXPIRED" || status === "CANCELLED") {
    const endLabel = status === "EXPIRED" ? "Expired" : "Cancelled";
    return [
      { label: "Posted", state: "completed" },
      { label: "Volunteering", state: "completed" },
      { label: endLabel, state: "terminal" },
    ];
  }

  return [
    {
      label: "Posted",
      state: "completed",
    },
    {
      label: "Volunteering",
      state:
        status === "OPEN"
          ? "current"
          : status === "MATCHED" || status === "FULFILLED"
            ? "completed"
            : "upcoming",
    },
    {
      label: "Matched",
      state:
        status === "MATCHED"
          ? "current"
          : status === "FULFILLED"
            ? "completed"
            : "upcoming",
    },
    {
      label: "Fulfilled",
      state: status === "FULFILLED" ? "current" : "upcoming",
    },
  ];
}

/**
 * StatusTimeline (Server Component, pure CSS):
 * Displays lifecycle stages with horizontal layout on desktop and vertical on mobile.
 * Uses text states for screen readers as well as color/visual cues.
 */
export function StatusTimeline({ status, className }: StatusTimelineProps) {
  const steps = computeSteps(status);

  return (
    <nav
      aria-label="Request progress timeline"
      className={cn(
        "rounded-[6px] border border-line bg-surface p-4 sm:p-5",
        className
      )}
    >
      <h2 className="sr-only">Request Status Progression</h2>

      {/* Desktop (sm and up): Horizontal timeline */}
      <ol className="hidden sm:flex sm:items-center sm:justify-between sm:gap-2">
        {steps.map((step, index) => {
          const isCompleted = step.state === "completed";
          const isCurrent = step.state === "current";
          const isTerminal = step.state === "terminal";
          const isUpcoming = step.state === "upcoming";

          return (
            <li
              key={step.label}
              className="relative flex flex-1 flex-col items-center gap-2 text-center"
            >
              {/* Connector line (before item, except first) */}
              {index > 0 && (
                <div
                  className={cn(
                    "absolute right-[50%] top-3.5 -z-0 h-0.5 w-full -translate-y-1/2",
                    isCompleted || isCurrent
                      ? "bg-blood/70"
                      : isTerminal
                        ? "bg-line-strong"
                        : "bg-line"
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Step indicator node */}
              <div
                className={cn(
                  "relative z-10 flex size-7 items-center justify-center rounded-full font-mono text-xs font-bold transition-colors select-none",
                  isCompleted && "bg-blood text-fg",
                  isCurrent &&
                    "border-2 border-blood bg-surface text-blood ring-4 ring-blood/20",
                  isTerminal && "border-2 border-line-strong bg-surface-2 text-fg-dim",
                  isUpcoming && "border border-line bg-surface-2 text-fg-dim"
                )}
                aria-hidden="true"
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              {/* Label & Accessible State */}
              <div className="space-y-0.5">
                <span
                  className={cn(
                    "block font-sans text-xs",
                    isCurrent
                      ? "font-semibold text-fg"
                      : isCompleted
                        ? "font-medium text-fg-muted"
                        : "text-fg-dim"
                  )}
                >
                  {step.label}
                </span>
                <span className="sr-only">({step.state})</span>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobile: Vertical timeline */}
      <ol className="flex flex-col gap-3 sm:hidden">
        {steps.map((step, index) => {
          const isCompleted = step.state === "completed";
          const isCurrent = step.state === "current";
          const isTerminal = step.state === "terminal";
          const isUpcoming = step.state === "upcoming";

          return (
            <li key={step.label} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold select-none",
                  isCompleted && "bg-blood text-fg",
                  isCurrent &&
                    "border-2 border-blood bg-surface text-blood ring-2 ring-blood/20",
                  isTerminal && "border border-line-strong bg-surface-2 text-fg-dim",
                  isUpcoming && "border border-line bg-surface-2 text-fg-dim"
                )}
                aria-hidden="true"
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-sans text-xs",
                    isCurrent
                      ? "font-semibold text-fg"
                      : isCompleted
                        ? "font-medium text-fg-muted"
                        : "text-fg-dim"
                  )}
                >
                  {step.label}
                </span>
                <span className="font-mono text-[10px] uppercase text-fg-dim">
                  ({step.state})
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
