/**
 * (app)/donor/loading.tsx
 * Loading skeleton matching the two-column donor profile layout.
 */
export default function DonorLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading donor profile">
      {/* Header Skeleton */}
      <div className="space-y-2 pb-6 border-b border-line">
        <div className="h-3 w-28 rounded bg-surface-2" />
        <div className="h-8 w-64 rounded bg-surface-2" />
        <div className="h-4 w-96 max-w-full rounded bg-surface-2" />
      </div>

      {/* Two-Column Skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Card Skeleton */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-[6px] border border-line bg-surface p-6 space-y-6">
            <div className="mx-auto size-24 rounded bg-surface-2" />
            <div className="space-y-2 text-center">
              <div className="mx-auto h-5 w-40 rounded bg-surface-2" />
              <div className="mx-auto h-4 w-32 rounded bg-surface-2" />
            </div>
            <div className="h-8 w-full rounded bg-surface-2" />
            <div className="h-6 w-full rounded bg-surface-2" />
          </div>
          <div className="h-16 w-full rounded-[6px] border border-line bg-surface" />
        </div>

        {/* Right Form Skeleton */}
        <div className="lg:col-span-7">
          <div className="rounded-[6px] border border-line bg-surface p-6 sm:p-8 space-y-6">
            <div className="h-5 w-48 rounded bg-surface-2" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 rounded bg-surface-2" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-surface-2" />
              <div className="h-12 w-full rounded bg-surface-2" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-surface-2" />
              <div className="h-12 w-full rounded bg-surface-2" />
            </div>
            <div className="h-10 w-36 rounded bg-surface-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
