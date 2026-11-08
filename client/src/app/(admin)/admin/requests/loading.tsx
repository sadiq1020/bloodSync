import { PageHeaderSkeleton } from "@/components/layout/PageHeader";

export default function AdminRequestsLoading() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Loading admin requests"
    >
      <PageHeaderSkeleton />

      {/* Filter box skeleton */}
      <div className="h-32 animate-pulse rounded-[6px] border border-line bg-surface" />

      {/* Table rows skeleton */}
      <div className="space-y-3 pt-2">
        <div className="h-14 animate-pulse rounded-[4px] bg-surface-2" />
        <div className="h-14 animate-pulse rounded-[4px] bg-surface-2" />
        <div className="h-14 animate-pulse rounded-[4px] bg-surface-2" />
        <div className="h-14 animate-pulse rounded-[4px] bg-surface-2" />
        <div className="h-14 animate-pulse rounded-[4px] bg-surface-2" />
      </div>
    </div>
  );
}
