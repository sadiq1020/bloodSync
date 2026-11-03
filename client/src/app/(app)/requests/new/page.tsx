import { getCurrentUser, serverFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/error";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreateRequestView } from "@/components/features/requests";
import type { BloodRequest, MyDonorProfile } from "@/types";
import type { BloodGroup } from "@/lib/constants/bloodGroups";
import type { District } from "@/lib/constants/districts";
import type { RequestFormData } from "@/lib/validation/request";

export const metadata = {
  title: "Request Blood — BloodSync",
  description: "Create an emergency blood request to reach compatible donors quickly across Bangladesh.",
};

interface NewRequestPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function NewRequestPage({
  searchParams,
}: NewRequestPageProps) {
  const resolvedParams = await searchParams;
  const fromId =
    typeof resolvedParams.from === "string" ? resolvedParams.from : undefined;

  // Parallel fetch: current user, donor profile, and optional source request for "Post again"
  const [user, donorProfile, sourceRequest] = await Promise.all([
    getCurrentUser(),
    serverFetch<MyDonorProfile>("/api/donors/me").catch((err) => {
      if (err instanceof ApiError && err.status === 404) {
        return null;
      }
      return null;
    }),
    fromId
      ? serverFetch<BloodRequest>(`/api/requests/${fromId}`).catch(() => null)
      : Promise.resolve(null),
  ]);

  let initialValues: Partial<RequestFormData> | undefined = undefined;
  let isCopied = false;

  // Only copy if request exists and belongs to current user
  if (sourceRequest && user && sourceRequest.requesterId === user.id) {
    initialValues = {
      forSelf: sourceRequest.forSelf,
      patientName: sourceRequest.patientName,
      bloodGroup: sourceRequest.bloodGroup as BloodGroup,
      unitsNeeded: sourceRequest.unitsNeeded,
      hospital: sourceRequest.hospital,
      district: sourceRequest.district as District,
      area: sourceRequest.area,
      urgency: sourceRequest.urgency,
      contactPhone: sourceRequest.contactPhone || donorProfile?.phone || "",
      note: sourceRequest.note || "",
      // DO NOT prefill neededBy
    };
    isCopied = true;
  }

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
        initialValues={initialValues}
        isCopied={isCopied}
      />
    </div>
  );
}
