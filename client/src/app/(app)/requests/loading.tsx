export default function RequestsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* PageHeader skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-surface-2" />
        <div className="h-7 w-48 rounded bg-surface-2" />
      </div>

      {/* Filter bar skeleton */}
      <div className="h-[68px] rounded-[6px] border border-line bg-surface" />

      {/* Meta bar skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-40 rounded bg-surface-2" />
        <div className="h-7 w-28 rounded bg-surface-2" />
      </div>

      {/* Card skeletons */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[132px] rounded-[6px] border border-line bg-surface"
          />
        ))}
      </div>
    </div>
  );
}
