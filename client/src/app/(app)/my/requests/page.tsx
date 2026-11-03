import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/layout/PageHeader";
import { ActivityTabs } from "@/components/features/my/ActivityTabs";
import { MyRequestsFilters } from "@/components/features/my/MyRequestsFilters";
import { MyRequestsList } from "@/components/features/my/MyRequestsList";
import { myRequestsCache } from "@/lib/search-params/my-requests";
import { serverFetch, getCurrentUser } from "@/lib/api/server";
import type { PaginatedResponse, BloodRequest } from "@/types/api";

type MyRequestItem = BloodRequest & {
  donationCounts: {
    PENDING: number;
    ACCEPTED: number;
    COMPLETED: number;
    CANCELLED: number;
    total: number;
  };
};

export const metadata: Metadata = {
  title: "My Requests — BloodSync",
  description: "Manage and track blood requests you have created.",
};

interface MyRequestsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MyRequestsPage({
  searchParams,
}: MyRequestsPageProps) {
  const parsedParams = await myRequestsCache.parse(await searchParams);

  const qs = new URLSearchParams();
  if (parsedParams.status) qs.set("status", parsedParams.status);
  qs.set("page", String(parsedParams.page));

  const [user, initialData] = await Promise.all([
    getCurrentUser(),
    serverFetch<PaginatedResponse<MyRequestItem>>(
      `/api/requests/mine?${qs.toString()}`
    ).catch(() => undefined),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ACTIVITY"
        title="My requests"
        actions={
          <Link
            href="/requests/new"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[4px] bg-blood px-4 font-sans text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blood/90 focus-visible:outline-2 focus-visible:outline-blood"
          >
            <Plus className="h-4 w-4" weight="bold" />
            <span>Request blood</span>
          </Link>
        }
      />

      <ActivityTabs active="requests" />

      <div className="space-y-4">
        <MyRequestsFilters />
        <MyRequestsList
          initialData={initialData}
          initialParams={parsedParams}
          currentUserId={user?.id ?? ""}
        />
      </div>
    </div>
  );
}
