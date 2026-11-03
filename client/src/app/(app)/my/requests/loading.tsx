import { PageHeaderSkeleton } from "@/components/layout/PageHeader";

export default function MyRequestsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading my requests">
      <PageHeaderSkeleton />

      {/* ActivityTabs skeleton */}
      <div className="flex border-b border-line">
        <div className="h-10 w-28 animate-pulse border-b-2 border-blood bg-surface-2" />
        <div className="h-10 w-28 animate-pulse bg-surface-2/40" />
      </div>

      {/* Filter chips skeleton */}
      <div className="flex flex-wrap gap-1.5">
        <div className="h-9 w-14 animate-pulse rounded-[4px] bg-surface-2" />
        <div className="h-9 w-16 animate-pulse rounded-[4px] bg-surface-2" />
        <div className="h-9 w-20 animate-pulse rounded-[4px] bg-surface-2" />
        <div className="h-9 w-20 animate-pulse rounded-[4px] bg-surface-2" />
      </div>

      {/* List items skeleton */}
      <div className="space-y-3 pt-2">
        <div className="h-[156px] animate-pulse rounded-[6px] border border-line bg-surface" />
        <div className="h-[156px] animate-pulse rounded-[6px] border border-line bg-surface" />
        <div className="h-[156px] animate-pulse rounded-[6px] border border-line bg-surface" />
      </div>
    </div>
  );
}
