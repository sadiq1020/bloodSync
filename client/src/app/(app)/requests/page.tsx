import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { RequestFilters } from "@/components/features/requests/RequestFilters";
import { RequestList } from "@/components/features/requests/RequestList";
import { requestsCache } from "@/lib/search-params/requests";
import { serverFetch } from "@/lib/api/server";
import { getCurrentUser } from "@/lib/api/server";
import type { PaginatedResponse, BloodRequest } from "@/types/api";

export const metadata: Metadata = {
  title: "Blood Requests — BloodSync",
  description: "Browse and respond to active emergency blood requests across Bangladesh.",
};


interface RequestsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const parsedParams = await requestsCache.parse(await searchParams);

  const qs = new URLSearchParams();
  if (parsedParams.district) qs.set("district", parsedParams.district);
  if (parsedParams.bloodGroup) qs.set("bloodGroup", parsedParams.bloodGroup);
  if (parsedParams.urgency) qs.set("urgency", parsedParams.urgency);
  if (parsedParams.status) qs.set("status", parsedParams.status);
  qs.set("page", String(parsedParams.page));

  const [user, initialData] = await Promise.all([
    getCurrentUser(),
    serverFetch<PaginatedResponse<BloodRequest>>(
      `/api/requests?${qs.toString()}`
    ).catch(() => undefined),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="REQUESTS"
        title="Blood requests"
        actions={
          <Link
            href="/requests/new"
            className="flex min-h-[38px] items-center justify-center rounded-[4px] bg-blood px-4 font-sans text-sm font-medium text-fg transition-colors hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood"
          >
            Request blood
          </Link>
        }
      />

      <div className="space-y-4">
        <RequestFilters />
        <RequestList
          initialData={initialData}
          initialParams={parsedParams}
          currentUserId={user?.id ?? ""}
        />
      </div>
    </>
  );
}
