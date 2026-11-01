import { getCurrentUser, serverFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/error";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreateRequestView } from "@/components/features/requests";
import type { MyDonorProfile } from "@/types";

export const metadata = {
  title: "Request Blood — BloodSync",
  description: "Create an emergency blood request to reach compatible donors quickly across Bangladesh.",
};

export default async function NewRequestPage() {
  // Parallel fetch: current user and donor profile (to prefill contact phone if available)
  const [user, donorProfile] = await Promise.all([
    getCurrentUser(),
    serverFetch<MyDonorProfile>("/api/donors/me").catch((err) => {
      if (err instanceof ApiError && err.status === 404) {
        return null;
      }
      return null;
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="New Request"
        title="Request blood"
        description="Fill out the patient details or paste a message below to alert compatible donors in the district."
      />

      <CreateRequestView
        userName={user?.name || ""}
        donorPhone={donorProfile?.phone || ""}
      />
    </div>
  );
}
