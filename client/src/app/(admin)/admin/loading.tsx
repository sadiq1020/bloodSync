import { PageHeaderSkeleton } from "@/components/layout/PageHeader";

export default function AdminOverviewLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading admin overview">
      <PageHeaderSkeleton />

      {/* Stat tiles skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-28 animate-pulse rounded-[6px] border border-line bg-surface ${
              i === 4 ? "col-span-2 sm:col-span-1" : ""
            }`}
          />
        ))}
      </div>

      {/* Middle row skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-[6px] border border-line bg-surface" />
        <div className="h-64 animate-pulse rounded-[6px] border border-line bg-surface" />
      </div>

      {/* Blood group grid skeleton */}
      <div className="h-44 animate-pulse rounded-[6px] border border-line bg-surface" />

      {/* Quick links skeleton */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="h-16 animate-pulse rounded-[6px] border border-line bg-surface" />
        <div className="h-16 animate-pulse rounded-[6px] border border-line bg-surface" />
      </div>
    </div>
  );
}
