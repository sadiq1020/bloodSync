import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdminUsersFilters } from "@/components/features/admin/users/AdminUsersFilters";
import { AdminUsersList } from "@/components/features/admin/users/AdminUsersList";
import { adminUsersCache } from "@/lib/search-params/admin-users";
import { serverFetch, getCurrentUser } from "@/lib/api/server";
import type { AdminUserItem, PaginatedResponse } from "@/types/api";

export const metadata: Metadata = {
  title: "Admin Users — BloodSync",
  description: "Manage registered users, administrative roles, and access status.",
};

interface AdminUsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const parsedParams = await adminUsersCache.parse(await searchParams);

  const qs = new URLSearchParams();
  if (parsedParams.search) qs.set("search", parsedParams.search);
  if (parsedParams.role) qs.set("role", parsedParams.role);
  if (parsedParams.status === "ACTIVE") qs.set("isBlocked", "false");
  if (parsedParams.status === "BLOCKED") qs.set("isBlocked", "true");
  qs.set("page", String(parsedParams.page));
  qs.set("limit", "10");

  const [currentUser, initialData] = await Promise.all([
    getCurrentUser(),
    serverFetch<PaginatedResponse<AdminUserItem>>(
      `/api/admin/users?${qs.toString()}`
    ).catch(() => undefined),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ADMIN"
        title="Users"
        description="Search user directory, manage administrator privileges, and control account access."
      />

      <div className="space-y-4">
        <AdminUsersFilters />
        <AdminUsersList
          initialData={initialData}
          initialParams={parsedParams}
          currentAdminId={currentUser?.id ?? ""}
        />
      </div>
    </div>
  );
}
