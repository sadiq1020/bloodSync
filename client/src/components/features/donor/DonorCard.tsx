import { SpecimenCard } from "@/components/brand/SpecimenCard";
import { BloodTypeBadge } from "@/components/brand/BloodTypeBadge";
import { CooldownMeter } from "./CooldownMeter";
import { AvailabilityToggle } from "./AvailabilityToggle";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { ENUM_TO_BLOOD_GROUP_MAP } from "@/lib/constants/bloodGroups";
import type { MyDonorProfile } from "@/types";
import { cn } from "@/lib/utils";

interface DonorCardProps {
  profile: MyDonorProfile;
  userName: string;
  className?: string;
}

/**
 * DonorCard (Server Component)
 * Built on SpecimenCard: specimen label header, BloodTypeBadge xl in tag variant,
 * donor name, location, eligibility status indicator, CooldownMeter, and AvailabilityToggle.
 */
export function DonorCard({ profile, userName, className }: DonorCardProps) {
  // Convert server Prisma enum (e.g. O_POSITIVE) to standard group string ("O+")
  const displayGroup =
    (profile.bloodGroup in ENUM_TO_BLOOD_GROUP_MAP
      ? ENUM_TO_BLOOD_GROUP_MAP[
          profile.bloodGroup as keyof typeof ENUM_TO_BLOOD_GROUP_MAP
        ]
      : profile.bloodGroup) || "O+";

  const nextDateFormatted = profile.nextEligibleDate
    ? formatDate(
        profile.nextEligibleDate,
        { day: "numeric", month: "short", year: "numeric" },
        "en-GB"
      )
    : "";

  const relativeTime = profile.nextEligibleDate
    ? formatRelativeTime(profile.nextEligibleDate)
    : "";

  return (
    <div className={cn("space-y-4", className)}>
      <SpecimenCard
        header={`DONOR / ${profile.district.toUpperCase()}`}
        accent={profile.isEligible ? "blood" : "plasma"}
        className="shadow-sm"
      >
        <div className="flex flex-col items-center text-center space-y-4 py-2">
          {/* Blood Type Badge xl in tag variant */}
          <BloodTypeBadge bloodGroup={displayGroup} size="xl" variant="tag" />

          {/* Donor identity */}
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-fg">
              {userName}
            </h2>
            <p className="font-sans text-sm text-fg-muted">
              {profile.area}, {profile.district}
            </p>
          </div>

          {/* Status Line */}
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1 font-sans text-xs">
            {profile.isEligible ? (
              <>
                <span
                  className="size-2 rounded-full bg-sage inline-block shrink-0"
                  aria-hidden="true"
                />
                <span className="font-medium text-fg">Eligible to donate</span>
              </>
            ) : (
              <>
                <span
                  className="size-2 rounded-full bg-plasma inline-block shrink-0"
                  aria-hidden="true"
                />
                <span className="font-medium text-fg">
                  Resting. Eligible again on {nextDateFormatted} ({relativeTime})
                </span>
              </>
            )}
          </div>
        </div>

        {/* Cooldown meter separator */}
        <div className="mt-4 pt-4 border-t border-dashed border-line">
          <CooldownMeter
            lastDonatedAt={profile.lastDonatedAt}
            nextEligibleDate={profile.nextEligibleDate}
            isEligible={profile.isEligible}
          />
        </div>
      </SpecimenCard>

      {/* Availability toggle */}
      <AvailabilityToggle initialAvailable={profile.isAvailable} />
    </div>
  );
}
