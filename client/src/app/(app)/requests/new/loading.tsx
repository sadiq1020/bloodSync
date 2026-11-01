/**
 * (app)/requests/new/loading.tsx
 * Skeleton matching the create request layout (AiPasteBox + Form on left, Preview on right).
 */
export default function NewRequestLoading() {
  return (
    <div
      className="space-y-6 animate-pulse"
      aria-busy="true"
      aria-label="Loading request blood form"
    >
      {/* Page Header Skeleton */}
      <div className="space-y-2 pb-6 border-b border-line">
        <div className="h-3 w-24 rounded bg-surface-2" />
        <div className="h-8 w-56 rounded bg-surface-2" />
        <div className="h-4 w-96 max-w-full rounded bg-surface-2" />
      </div>

      {/* Two-Column Skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Box skeleton */}
          <div className="rounded-[6px] border border-line bg-surface p-6 space-y-4">
            <div className="h-5 w-44 rounded bg-surface-2" />
            <div className="h-20 w-full rounded bg-surface-2" />
            <div className="h-9 w-32 rounded bg-surface-2" />
          </div>

          {/* Form skeleton */}
          <div className="rounded-[6px] border border-line bg-surface p-6 sm:p-8 space-y-6">
            <div className="h-10 w-64 rounded bg-surface-2" />
            <div className="h-12 w-full rounded bg-surface-2" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 rounded bg-surface-2" />
              ))}
            </div>
            <div className="h-12 w-full rounded bg-surface-2" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 rounded bg-surface-2" />
              <div className="h-12 rounded bg-surface-2" />
            </div>
            <div className="h-12 w-48 rounded bg-surface-2" />
          </div>
        </div>

        {/* Right Column (5/12, Desktop only) */}
        <div className="hidden lg:block lg:col-span-5 space-y-3">
          <div className="h-4 w-28 rounded bg-surface-2" />
          <div className="h-72 rounded-[6px] border border-line bg-surface p-6 space-y-4">
            <div className="flex justify-between">
              <div className="size-20 rounded bg-surface-2" />
              <div className="h-6 w-24 rounded bg-surface-2" />
            </div>
            <div className="h-6 w-full rounded bg-surface-2" />
            <div className="h-4 w-3/4 rounded bg-surface-2" />
            <div className="h-8 w-full rounded bg-surface-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
