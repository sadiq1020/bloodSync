export default function RequestDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-28 rounded bg-surface-2" />

      {/* Desktop 2-column skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left Column (8 / 12) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header block skeleton */}
          <div className="space-y-4 rounded-[6px] border border-line bg-surface p-6">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 rounded bg-surface-2" />
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded bg-surface-2" />
                <div className="h-5 w-14 rounded bg-surface-2" />
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="size-16 rounded-[4px] bg-surface-2 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-7 w-3/4 rounded bg-surface-2" />
                <div className="h-4 w-1/2 rounded bg-surface-2" />
                <div className="h-4 w-1/3 rounded bg-surface-2" />
              </div>
            </div>

            <div className="border-t border-line pt-3 flex gap-4">
              <div className="h-3 w-36 rounded bg-surface-2" />
              <div className="h-3 w-28 rounded bg-surface-2" />
            </div>
          </div>

          {/* Timeline skeleton */}
          <div className="h-20 rounded-[6px] border border-line bg-surface p-4" />

          {/* Details list skeleton */}
          <div className="h-56 rounded-[6px] border border-line bg-surface p-6 space-y-4">
            <div className="h-4 w-32 rounded bg-surface-2" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 rounded bg-surface-2" />
              <div className="h-10 rounded bg-surface-2" />
              <div className="col-span-2 h-10 rounded bg-surface-2" />
            </div>
          </div>
        </div>

        {/* Right Column (4 / 12) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Vial Progress skeleton */}
          <div className="h-64 rounded-[6px] border border-line bg-surface p-6 flex flex-col items-center justify-center gap-3">
            <div className="h-3 w-28 rounded bg-surface-2" />
            <div className="h-40 w-16 rounded bg-surface-2" />
            <div className="h-3 w-36 rounded bg-surface-2" />
          </div>

          {/* Action card skeleton */}
          <div className="h-44 rounded-[6px] border border-line bg-surface p-6 space-y-3">
            <div className="h-3 w-20 rounded bg-surface-2" />
            <div className="h-5 w-3/4 rounded bg-surface-2" />
            <div className="h-10 w-full rounded bg-surface-2 mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
