export default function DonorsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* PageHeader skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-16 rounded bg-surface-2" />
        <div className="h-7 w-36 rounded bg-surface-2" />
        <div className="h-4 w-64 rounded bg-surface-2" />
      </div>

      {/* Note box skeleton */}
      <div className="h-16 rounded-[6px] border border-line bg-surface-2" />

      {/* Filter bar skeleton */}
      <div className="h-[76px] rounded-[6px] border border-line bg-surface" />

      {/* Meta bar */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-40 rounded bg-surface-2" />
        <div className="h-7 w-7 rounded bg-surface-2" />
      </div>

      {/* Card skeletons */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[104px] rounded-[6px] border border-line bg-surface"
          />
        ))}
      </div>
    </div>
  );
}
