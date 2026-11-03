import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ActivityTabs } from "@/components/features/my/ActivityTabs";
import { DonorStatusPanel } from "@/components/features/my/DonorStatusPanel";
import { MyDonationsFilters } from "@/components/features/my/MyDonationsFilters";
import { MyDonationsList } from "@/components/features/my/MyDonationsList";
import { type MyDonationItem } from "@/components/features/my/DonationCard";
import { myDonationsCache } from "@/lib/search-params/my-donations";
import { serverFetch } from "@/lib/api/server";
import type { MyDonorProfile } from "@/types/api";

export const metadata: Metadata = {
  title: "My Donations — BloodSync",
  description: "Track your blood donation commitments and volunteer history.",
};

interface MyDonationsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MyDonationsPage({
  searchParams,
}: MyDonationsPageProps) {
  const parsedParams = await myDonationsCache.parse(await searchParams);

  const [donorProfile, donations] = await Promise.all([
    serverFetch<MyDonorProfile>("/api/donors/me").catch(() => null),
    serverFetch<MyDonationItem[]>("/api/donations/mine").catch(() => []),
  ]);

  const donationsList = donations ?? [];
  const completedCount = donationsList.filter(
    (d) => d.status === "COMPLETED"
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ACTIVITY"
        title="My donations"
        description="Track your commitments and history as a blood donor volunteer."
      />

      <ActivityTabs active="donations" />

      <DonorStatusPanel
        donorProfile={donorProfile}
        completedDonationsCount={completedCount}
      />

      <div className="space-y-4">
        <MyDonationsFilters />
        <MyDonationsList
          initialData={donationsList}
          initialParams={parsedParams}
        />
      </div>
    </div>
  );
}
