import Link from "next/link";
import { SpecimenCard } from "@/components/brand/SpecimenCard";
import { BloodTypeBadge } from "@/components/brand/BloodTypeBadge";
import { UrgencyBadge } from "@/components/brand/UrgencyBadge";
import { StatusBadge } from "@/components/brand/StatusBadge";
import {
  formatBloodGroup,
  formatDate,
  formatRequestCode,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DonationStatus, RequestStatus, Urgency } from "@/types/api";

export interface MyDonationItem {
  id: string;
  requestId: string;
  donorId: string;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
  request: {
    id: string;
    patientName: string;
    bloodGroup: string;
    unitsNeeded: number;
    hospital: string;
    district: string;
    area: string;
    urgency: Urgency;
    neededBy: string;
    status: RequestStatus;
    requester: {
      id: string;
      name: string;
    };
  };
}

interface DonationCardProps {
  donation: MyDonationItem;
}

function DonationStatusPill({ status }: { status: DonationStatus }) {
  if (status === "ACCEPTED") {
    return (
      <span className="inline-flex items-center rounded-[3px] bg-blood-deep/40 px-2 py-0.5 font-mono text-[10px] font-bold text-blood-light uppercase tracking-wider select-none">
        ACCEPTED
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center rounded-[3px] bg-plasma/20 px-2 py-0.5 font-mono text-[10px] font-bold text-plasma uppercase tracking-wider select-none">
        PENDING
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center rounded-[3px] bg-sage/20 px-2 py-0.5 font-mono text-[10px] font-bold text-sage uppercase tracking-wider select-none">
        COMPLETED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-[3px] bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-medium text-fg-dim uppercase tracking-wider select-none">
      CANCELLED
    </span>
  );
}

function getStatusSentence(status: DonationStatus, dateStr: string): string {
  switch (status) {
    case "PENDING":
      return "Waiting for the requester to confirm.";
    case "ACCEPTED":
      return "You were chosen. Open the request to see the contact number.";
    case "COMPLETED":
      return `Donation recorded on ${formatDate(dateStr)}.`;
    case "CANCELLED":
      return "This response was cancelled.";
    default:
      return "";
  }
}

/**
 * DonationCard (Pure presentational, no hooks):
 * Built on SpecimenCard, links as a single accessible anchor to /requests/{requestId}.
 */
export function DonationCard({ donation }: DonationCardProps) {
  const { status: donationStatus, createdAt, request } = donation;
  const {
    id: reqId,
    hospital,
    district,
    area,
    bloodGroup,
    urgency,
    status: reqStatus,
  } = request;

  const displayGroup = formatBloodGroup(bloodGroup);
  const sentence = getStatusSentence(donationStatus, createdAt);
  const showRequestStatus =
    reqStatus === "EXPIRED" ||
    reqStatus === "CANCELLED" ||
    reqStatus === "FULFILLED";

  const ariaLabel = `Donation ${donationStatus.toLowerCase()} for ${displayGroup} blood at ${hospital}, ${district}. ${sentence}`;

  return (
    <SpecimenCard
      header={`${formatRequestCode(reqId)} / ${district.toUpperCase()}`}
      accent={donationStatus === "ACCEPTED" ? "blood" : "none"}
      className="h-full"
    >
      <Link
        href={`/requests/${reqId}`}
        aria-label={ariaLabel}
        className={cn(
          "group block outline-none p-0.5",
          "focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-[4px]"
        )}
      >
        <div className="flex gap-4">
          {/* Blood group badge */}
          <div className="shrink-0">
            <BloodTypeBadge bloodGroup={bloodGroup} size="lg" variant="tag" />
          </div>

          {/* Right content */}
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            {/* Hospital name */}
            <p
              className="font-display text-base font-semibold text-fg leading-tight truncate group-hover:text-blood transition-colors"
              title={hospital}
            >
              {hospital}
            </p>

            {/* Location */}
            <p className="font-sans text-xs text-fg-muted truncate">
              {area}, {district}
            </p>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <UrgencyBadge urgency={urgency} />
              <DonationStatusPill status={donationStatus} />
              {showRequestStatus && <StatusBadge status={reqStatus} />}
            </div>

            {/* Status sentence */}
            <p className="font-sans text-xs text-fg-muted leading-relaxed mt-1">
              {sentence}
            </p>
          </div>
        </div>
      </Link>
    </SpecimenCard>
  );
}
