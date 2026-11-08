import { PageHeaderSkeleton } from "@/components/layout/PageHeader";

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading admin users">
      <PageHeaderSkeleton />

      {/* Filter box skeleton */}
      <div className="h-28 animate-pulse rounded-[6px] border border-line bg-surface" />

      {/* Table rows skeleton */}
      <div className="space-y-3 pt-2">
        <div className="h-12 animate-pulse rounded-[4px] bg-surface-2" />
        <div className="h-12 animate-pulse rounded-[4px] bg-surface-2" />
        <div className="h-12 animate-pulse rounded-[4px] bg-surface-2" />
        <div className="h-12 animate-pulse rounded-[4px] bg-surface-2" />
        <div className="h-12 animate-pulse rounded-[4px] bg-surface-2" />
      </div>
    </div>
  );
}
