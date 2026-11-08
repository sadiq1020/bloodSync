interface RequestsByStatusProps {
  counts: {
    OPEN: number;
    MATCHED: number;
    FULFILLED: number;
    EXPIRED: number;
    CANCELLED: number;
  };
}

const STATUS_CONFIG: Array<{
  key: keyof RequestsByStatusProps["counts"];
  label: string;
  barColor: string;
  textColor: string;
}> = [
  {
    key: "OPEN",
    label: "Open",
    barColor: "bg-blood",
    textColor: "text-blood-light",
  },
  {
    key: "MATCHED",
    label: "Matched",
    barColor: "bg-plasma",
    textColor: "text-plasma",
  },
  {
    key: "FULFILLED",
    label: "Fulfilled",
    barColor: "bg-sage",
    textColor: "text-sage",
  },
  {
    key: "EXPIRED",
    label: "Expired",
    barColor: "bg-fg-dim",
    textColor: "text-fg-dim",
  },
  {
    key: "CANCELLED",
    label: "Cancelled",
    barColor: "bg-line-strong",
    textColor: "text-fg-muted",
  },
];

export function RequestsByStatus({ counts }: RequestsByStatusProps) {
  const total =
    counts.OPEN +
    counts.MATCHED +
    counts.FULFILLED +
    counts.EXPIRED +
    counts.CANCELLED;

  const maxCount = Math.max(
    1,
    counts.OPEN,
    counts.MATCHED,
    counts.FULFILLED,
    counts.EXPIRED,
    counts.CANCELLED
  );

  const screenReaderSummary = `Blood requests by status: ${STATUS_CONFIG.map(
    (s) => `${s.label} ${counts[s.key]}`
  ).join(", ")}. Total requests: ${total}.`;

  return (
    <div className="rounded-[6px] border border-line bg-surface p-5">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="font-display text-base font-semibold text-fg">
            Requests by Status
          </h2>
          <p className="font-mono text-xs text-fg-dim">
            Distribution across lifecycle phases
          </p>
        </div>
        <span className="font-mono text-xs text-fg-muted">
          Total: <strong className="text-fg">{total}</strong>
        </span>
      </div>

      {/* Screen reader summary */}
      <p className="sr-only">{screenReaderSummary}</p>

      <div className="space-y-3 pt-1">
        {STATUS_CONFIG.map((status) => {
          const count = counts[status.key];
          const percentage = total > 0 ? (count / maxCount) * 100 : 0;
          const shareOfTotal =
            total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={status.key} className="space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-medium text-fg">{status.label}</span>
                <span className="text-fg-muted">
                  <strong className={status.textColor}>{count}</strong>
                  <span className="text-fg-dim ml-1">({shareOfTotal}%)</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-[2px] bg-surface-2">
                <div
                  className={`h-full rounded-[2px] transition-all duration-700 ease-out motion-reduce:transition-none ${status.barColor}`}
                  style={{ width: `${Math.max(percentage, count > 0 ? 3 : 0)}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
