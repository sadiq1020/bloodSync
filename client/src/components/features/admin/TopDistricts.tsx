interface TopDistrictsProps {
  districts: Array<{
    district: string;
    count: number;
  }>;
}

export function TopDistricts({ districts }: TopDistrictsProps) {
  const maxCount = Math.max(1, ...(districts.map((d) => d.count) || [0]));

  const screenReaderSummary =
    districts.length > 0
      ? `Top districts with open blood requests: ${districts
          .map((d, i) => `#${i + 1} ${d.district}: ${d.count}`)
          .join(", ")}.`
      : "No open requests currently in any district.";

  return (
    <div className="rounded-[6px] border border-line bg-surface p-5">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="font-display text-base font-semibold text-fg">
            Top Districts by Need
          </h2>
          <p className="font-mono text-xs text-fg-dim">
            Locations with highest volume of open emergency requests
          </p>
        </div>
      </div>

      {/* Screen reader summary */}
      <p className="sr-only">{screenReaderSummary}</p>

      {districts.length === 0 ? (
        <div className="rounded-[4px] border border-dashed border-line p-6 text-center">
          <p className="font-sans text-xs text-fg-muted">No open requests.</p>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {districts.map((item, index) => {
            const percentage = (item.count / maxCount) * 100;

            return (
              <div key={item.district} className="space-y-1">
                <div className="flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-fg-dim">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-fg">{item.district}</span>
                  </div>
                  <span className="text-fg-muted">
                    <strong className="text-blood">{item.count}</strong>{" "}
                    {item.count === 1 ? "open request" : "open requests"}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-[2px] bg-surface-2">
                  <div
                    className="h-full rounded-[2px] bg-plasma transition-all duration-700 ease-out motion-reduce:transition-none"
                    style={{
                      width: `${Math.max(percentage, item.count > 0 ? 4 : 0)}%`,
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
