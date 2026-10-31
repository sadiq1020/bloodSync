/**
 * (app) loading.tsx
 * Skeleton shown while the app layout's async server components resolve.
 * Matches the AppShell structure (top bar skeleton + content area skeleton).
 */
export default function AppLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading">
      {/* Top bar skeleton */}
      <div className="sticky top-0 z-40 h-16 w-full border-b border-line bg-surface" />

      {/* Content skeleton */}
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Page header skeleton */}
        <div className="space-y-3">
          <div className="h-3 w-24 rounded bg-surface-2" />
          <div className="h-8 w-72 rounded bg-surface-2" />
          <div className="h-4 w-96 rounded bg-surface-2" />
        </div>

        {/* Cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-[6px] border border-line bg-surface-2"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
