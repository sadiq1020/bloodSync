import type { BloodGroup } from "./bloodCompatibility.js";
import { canDonateTo } from "./bloodCompatibility.js";
import { isEligible } from "./eligibility.js";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface DonorCandidate {
  id?: string;
  userId?: string;
  bloodGroup: BloodGroup;
  district: string;
  area: string;
  phone?: string;
  isAvailable: boolean;
  lastDonatedAt: Date | null;
  [key: string]: any;
}

export interface BloodRequestTarget {
  bloodGroup: BloodGroup;
  district: string;
  area: string;
}

export interface RankedDonor<T extends DonorCandidate = DonorCandidate> {
  donor: T;
  score: number;
  reasons: string[];
}

// Filters and ranks donors by relevance, location, blood compatibility, and tenure
export const rankDonors = <T extends DonorCandidate>(
  donors: T[],
  request: BloodRequestTarget,
  now = new Date()
): RankedDonor<T>[] => {
  // 1. Filter out unavailable, ineligible, or incompatible donors
  const eligibleCandidates = donors.filter((donor) => {
    if (!donor.isAvailable) return false;
    if (!isEligible(donor.lastDonatedAt, now)) return false;
    if (!canDonateTo(donor.bloodGroup, request.bloodGroup)) return false;
    return true;
  });

  // 2. Score eligible candidates
  const scored = eligibleCandidates.map((donor) => {
    let score = 0;
    const reasons: string[] = [];

    // District bonus (+50)
    const donorDistrict = donor.district.trim().toLowerCase();
    const requestDistrict = request.district.trim().toLowerCase();
    if (donorDistrict === requestDistrict) {
      score += 50;
      reasons.push("Same district");
    }

    // Area bonus (+20, case-insensitive substring match)
    const donorArea = donor.area.trim().toLowerCase();
    const requestArea = request.area.trim().toLowerCase();
    if (
      donorArea.length > 0 &&
      requestArea.length > 0 &&
      (donorArea.includes(requestArea) || requestArea.includes(donorArea))
    ) {
      score += 20;
      reasons.push("Same area");
    }

    // Exact blood group match (+15)
    if (donor.bloodGroup === request.bloodGroup) {
      score += 15;
      reasons.push("Exact blood group match");
    }

    // Donation history bonus (+10 for first-timers, or +1 per 10 days up to +10)
    if (!donor.lastDonatedAt) {
      score += 10;
      reasons.push("First-time donor");
    } else {
      const diffMs = now.getTime() - donor.lastDonatedAt.getTime();
      const daysSince = Math.floor(diffMs / MS_PER_DAY);
      const tenurePoints = Math.min(10, Math.floor(daysSince / 10));
      score += tenurePoints;
      reasons.push(`Eligible since ${daysSince} days`);
    }

    return {
      donor,
      score,
      reasons,
    };
  });

  // 3. Sort by score descending (highest score first)
  scored.sort((a, b) => b.score - a.score);

  return scored;
};
