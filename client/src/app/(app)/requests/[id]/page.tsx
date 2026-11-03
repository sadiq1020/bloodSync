import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { serverFetch, getCurrentUser } from "@/lib/api/server";
import { formatBloodGroup } from "@/lib/format";
import { VialProgress } from "@/components/brand/VialProgress";
import {
  RequestHeader,
  StatusTimeline,
  RequestDetails,
  ShareButton,
  DonorActionCard,
  TerminalBanner,
  AutoRefresh,
  CreatedBanner,
  VolunteerPanel,
  CancelRequestButton,
  SuggestedDonors,
} from "@/components/features/requests/detail";
import type {
  BloodRequest,
  MyDonorProfile,
  DonationStatus,
  RequestDonationVolunteer,
} from "@/types/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const request = await serverFetch<BloodRequest>(`/api/requests/${id}`);
    const displayGroup = formatBloodGroup(request.bloodGroup);
    return {
      title: `${displayGroup} blood needed at ${request.hospital} — BloodSync`,
      description: `Emergency blood request for ${displayGroup} blood at ${request.hospital}, ${request.area}, ${request.district}.`,
    };
  } catch {
    return {
      title: "Blood Request Details — BloodSync",
    };
  }
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Fetch request (404 calls notFound())
  const request = await serverFetch<BloodRequest>(`/api/requests/${id}`).catch(
    (err: unknown) => {
      if ((err as { status?: number })?.status === 404) {
        notFound();
      }
      throw err;
    }
  );

  // 2. Fetch current user
  const currentUser = await getCurrentUser();
  const isOwner = request.requesterId === currentUser?.id;
  const isAdmin = currentUser?.role === "ADMIN";

  // 3. Parallel fetch depending on viewer role
  let myDonorProfile: MyDonorProfile | null = null;
  let myDonation: { id: string; status: DonationStatus } | null = null;
  let volunteers: RequestDonationVolunteer[] = [];
  let acceptedCount = 0;
  let completedCount = 0;

  if (isOwner || isAdmin) {
    // Owner or admin: fetch full volunteers list
    volunteers = await serverFetch<RequestDonationVolunteer[]>(
      `/api/requests/${id}/donations`
    ).catch(() => []);

    completedCount = volunteers.filter((d) => d.status === "COMPLETED").length;
    acceptedCount = volunteers.filter((d) => d.status === "ACCEPTED").length;
  } else {
    // Non-owner / donor viewer: fetch profile and my own donation in parallel
    const [profileRes, myDonationsRes] = await Promise.all([
      serverFetch<MyDonorProfile>("/api/donors/me").catch(() => null),
      serverFetch<
        Array<{ id: string; requestId: string; status: DonationStatus }>
      >("/api/donations/mine").catch(() => []),
    ]);

    myDonorProfile = profileRes;
    const found = myDonationsRes.find((d) => d.requestId === id);
    if (found) {
      myDonation = { id: found.id, status: found.status };
    }

    // Best available data for non-owners (public API returns request status but no donor list)
    if (request.status === "FULFILLED") {
      completedCount = request.unitsNeeded;
      acceptedCount = 0;
    } else if (request.status === "MATCHED") {
      acceptedCount = request.unitsNeeded;
      completedCount = 0;
    } else {
      completedCount = myDonation?.status === "COMPLETED" ? 1 : 0;
      acceptedCount = myDonation?.status === "ACCEPTED" ? 1 : 0;
    }
  }

  const volunteerUserIds = volunteers.map((v) => v.donorId);

  const vialCaption = `${acceptedCount} ACCEPTED / ${completedCount} DONE / ${request.unitsNeeded} ${
    request.unitsNeeded === 1 ? "UNIT" : "UNITS"
  }`;

  return (
    <>
      {/* Headless auto-refresh polling */}
      <AutoRefresh status={request.status} />

      <div className="space-y-6">
        {/* Breadcrumb back navigation */}
        <nav aria-label="Breadcrumb">
          <Link
            href="/requests"
            className="inline-flex min-h-[36px] items-center gap-1.5 font-mono text-xs text-fg-dim transition-colors hover:text-fg"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>Back to requests</span>
          </Link>
        </nav>

        {/* Live creation success banner (?created=1) */}
        <CreatedBanner
          bloodGroup={request.bloodGroup}
          hospital={request.hospital}
          district={request.district}
        />

        {/* Terminal status banner (FULFILLED, EXPIRED, CANCELLED) */}
        <TerminalBanner
          status={request.status}
          requestId={request.id}
          isOwner={isOwner}
        />

        {/* ============================================================== */}
        {/* MOBILE STACKED LAYOUT (Hidden on lg and up)                     */}
        {/* Header, vial & status with main buttons, VolunteerPanel,       */}
        {/* SuggestedDonors, details                                       */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-6 lg:hidden">
          {/* 1. Header */}
          <RequestHeader request={request} />

          {/* 2. Vial and status with main buttons */}
          <div className="rounded-[6px] border border-line bg-surface p-5 flex flex-col items-center gap-4">
            <span className="font-mono text-xs uppercase tracking-widest text-fg-dim">
              Blood Units Progress
            </span>
            <VialProgress
              filled={completedCount}
              secondary={acceptedCount}
              total={request.unitsNeeded}
              size="lg"
              caption={vialCaption}
            />
          </div>

          <StatusTimeline status={request.status} />

          {/* Main buttons on mobile */}
          <div className="flex flex-col gap-2">
            <ShareButton
              bloodGroup={request.bloodGroup}
              hospital={request.hospital}
              district={request.district}
              variant="primary"
            />
            {isOwner && (
              <CancelRequestButton
                requestId={request.id}
                status={request.status}
                isOwner={isOwner}
              />
            )}
          </div>

          {/* 3. Volunteer Panel for Owner & Admin */}
          {(isOwner || isAdmin) && (
            <VolunteerPanel
              requestStatus={request.status}
              bloodGroup={request.bloodGroup}
              hospital={request.hospital}
              district={request.district}
              initialDonations={volunteers}
              readOnly={isAdmin}
            />
          )}

          {/* 4. Suggested Donors (Owner only, while OPEN or MATCHED) */}
          {isOwner && (
            <SuggestedDonors
              requestId={request.id}
              requestStatus={request.status}
              isOwner={isOwner}
              volunteerUserIds={volunteerUserIds}
            />
          )}

          {/* Donor Action Card for non-owners */}
          {!isOwner && !isAdmin && (
            <DonorActionCard
              request={request}
              donorProfile={myDonorProfile}
              myDonation={myDonation}
            />
          )}

          {/* 5. Request Details */}
          <RequestDetails request={request} />
        </div>

        {/* ============================================================== */}
        {/* DESKTOP 2-COLUMN LAYOUT (lg and up)                            */}
        {/* Left (~8/12): Header, VolunteerPanel, SuggestedDonors, Details */}
        {/* Right (~4/12, sticky): VialProgress, StatusTimeline, Buttons   */}
        {/* ============================================================== */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* Left Column (8 / 12) */}
          <div className="lg:col-span-8 space-y-6">
            <RequestHeader request={request} />

            {/* Owner or Admin: Volunteer Panel first, then Suggested Donors */}
            {isOwner || isAdmin ? (
              <>
                <VolunteerPanel
                  requestStatus={request.status}
                  bloodGroup={request.bloodGroup}
                  hospital={request.hospital}
                  district={request.district}
                  initialDonations={volunteers}
                  readOnly={isAdmin}
                />

                {isOwner && (
                  <SuggestedDonors
                    requestId={request.id}
                    requestStatus={request.status}
                    isOwner={isOwner}
                    volunteerUserIds={volunteerUserIds}
                  />
                )}
              </>
            ) : (
              <StatusTimeline status={request.status} />
            )}

            <RequestDetails request={request} />
          </div>

          {/* Right Column (4 / 12, Sticky) */}
          <aside
            aria-label="Request action and progress"
            className="lg:col-span-4 lg:sticky lg:top-20 space-y-5"
          >
            {/* Vial Progress Card */}
            <div className="rounded-[6px] border border-line bg-surface p-6 flex flex-col items-center gap-4">
              <span className="font-mono text-xs uppercase tracking-widest text-fg-dim">
                Blood Units Progress
              </span>
              <VialProgress
                filled={completedCount}
                secondary={acceptedCount}
                total={request.unitsNeeded}
                size="lg"
                caption={vialCaption}
              />
            </div>

            {/* Owner/Admin view: Status timeline + Share + Cancel Request */}
            {isOwner || isAdmin ? (
              <div className="space-y-4">
                <StatusTimeline status={request.status} />

                {isOwner && (
                  <CancelRequestButton
                    requestId={request.id}
                    status={request.status}
                    isOwner={isOwner}
                  />
                )}

                <ShareButton
                  bloodGroup={request.bloodGroup}
                  hospital={request.hospital}
                  district={request.district}
                  className="w-full"
                />
              </div>
            ) : (
              /* Donor view: Action Card + Share */
              <div className="space-y-4">
                <DonorActionCard
                  request={request}
                  donorProfile={myDonorProfile}
                  myDonation={myDonation}
                />

                <ShareButton
                  bloodGroup={request.bloodGroup}
                  hospital={request.hospital}
                  district={request.district}
                  className="w-full"
                />
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
