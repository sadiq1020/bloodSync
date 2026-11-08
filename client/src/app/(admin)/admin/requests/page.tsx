import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdminRequestsFilters } from "@/components/features/admin/requests/AdminRequestsFilters";
import { AdminRequestsList } from "@/components/features/admin/requests/AdminRequestsList";
import { adminRequestsCache } from "@/lib/search-params/admin-requests";
import { serverFetch } from "@/lib/api/server";
import type { AdminRequestItem, PaginatedResponse } from "@/types/api";

export const metadata: Metadata = {
  title: "Admin Requests — BloodSync",
  description: "Monitor and moderate emergency blood requests across Bangladesh.",
};

interface AdminRequestsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminRequestsPage({
  searchParams,
}: AdminRequestsPageProps) {
  const parsedParams = await adminRequestsCache.parse(await searchParams);

  const qs = new URLSearchParams();
  if (parsedParams.status) qs.set("status", parsedParams.status);
  if (parsedParams.district) qs.set("district", parsedParams.district);
  if (parsedParams.bloodGroup) qs.set("bloodGroup", parsedParams.bloodGroup);
  qs.set("page", String(parsedParams.page));
  qs.set("limit", "10");

  const initialData = await serverFetch<PaginatedResponse<AdminRequestItem>>(
    `/api/admin/requests?${qs.toString()}`
  ).catch(() => undefined);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ADMIN"
        title="Requests"
        description="Monitor active emergencies, review request lifecycles, and handle administrative closures or deletions."
      />

      <div className="space-y-4">
        <AdminRequestsFilters />
        <AdminRequestsList
          initialData={initialData}
          initialParams={parsedParams}
        />
      </div>
    </div>
  );
}
