import type { Metadata } from "next";
import Link from "next/link";
import { Users, Drop } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/layout/PageHeader";
import { serverFetch } from "@/lib/api/server";
import { StatTiles } from "@/components/features/admin/StatTiles";
import { RequestsByStatus } from "@/components/features/admin/RequestsByStatus";
import { DonorsByBloodGroup } from "@/components/features/admin/DonorsByBloodGroup";
import { TopDistricts } from "@/components/features/admin/TopDistricts";
import { AdminQuickLinks } from "@/components/features/admin/AdminQuickLinks";
import type { AdminStats } from "@/types/api";

export const metadata: Metadata = {
  title: "Admin Overview — BloodSync",
  description: "System overview, analytics, and platform health metrics.",
};

// Note: serverFetch dynamically reads incoming cookies, ensuring stats are always fresh.

export default async function AdminOverviewPage() {
  const stats = await serverFetch<AdminStats>("/api/admin/stats", {
    cache: "no-store",
  }).catch(() => null);

  const fallbackStats: AdminStats = {
    totalUsers: 0,
    blockedUsers: 0,
    totalDonors: 0,
    availableEligibleDonors: 0,
    donationsCompleted: 0,
    requestsByStatus: {
      OPEN: 0,
      MATCHED: 0,
      FULFILLED: 0,
      EXPIRED: 0,
      CANCELLED: 0,
    },
    donorsByBloodGroup: {},
    topDistricts: [],
  };

  const data = stats ?? fallbackStats;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ADMIN"
        title="Overview"
        description="Platform statistics, donor inventory, and system activity."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/users"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[4px] border border-line bg-surface px-3 font-sans text-xs font-medium text-fg-muted transition-colors hover:border-line-strong hover:bg-surface-2 hover:text-fg"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Users</span>
            </Link>
            <Link
              href="/admin/requests"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[4px] bg-blood px-3 font-sans text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blood/90"
            >
              <Drop className="h-3.5 w-3.5" weight="bold" />
              <span>Requests</span>
            </Link>
          </div>
        }
      />

      {/* 1. Key Stat Tiles */}
      <StatTiles
        stats={{
          totalUsers: data.totalUsers,
          blockedUsers: data.blockedUsers,
          totalDonors: data.totalDonors,
          availableEligibleDonors: data.availableEligibleDonors,
          donationsCompleted: data.donationsCompleted,
        }}
      />

      {/* 2. Middle Row: Requests by Status & Top Districts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RequestsByStatus counts={data.requestsByStatus} />
        <TopDistricts districts={data.topDistricts} />
      </div>

      {/* 3. Donor Inventory by Blood Group */}
      <DonorsByBloodGroup counts={data.donorsByBloodGroup} />

      {/* 4. Navigation Quick Links */}
      <AdminQuickLinks />
    </div>
  );
}
