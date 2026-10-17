import { describe, it, expect } from "vitest";
import {
  rankDonors,
  type DonorCandidate,
  type BloodRequestTarget,
} from "../lib/donorRanking.js";

describe("Donor Ranking Business Logic", () => {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const now = new Date("2026-10-17T12:00:00.000Z");

  const baseRequest: BloodRequestTarget = {
    bloodGroup: "B+",
    district: "Rajshahi",
    area: "Rajshahi Medical",
  };

  describe("Filtering out unqualified donors", () => {
    it("filters out unavailable donors even if fully compatible and close", () => {
      const donors: DonorCandidate[] = [
        {
          id: "d1",
          bloodGroup: "B+",
          district: "Rajshahi",
          area: "Rajshahi Medical",
          isAvailable: false, // Unavailable
          lastDonatedAt: null,
        },
      ];

      const results = rankDonors(donors, baseRequest, now);
      expect(results).toHaveLength(0);
    });

    it("filters out ineligible donors (donated within 90 days)", () => {
      const donors: DonorCandidate[] = [
        {
          id: "d2",
          bloodGroup: "B+",
          district: "Rajshahi",
          area: "Rajshahi Medical",
          isAvailable: true,
          lastDonatedAt: new Date(now.getTime() - 45 * MS_PER_DAY), // 45 days ago (< 90)
        },
      ];

      const results = rankDonors(donors, baseRequest, now);
      expect(results).toHaveLength(0);
    });

    it("filters out incompatible blood group donors", () => {
      const donors: DonorCandidate[] = [
        {
          id: "d3",
          bloodGroup: "A+", // Incompatible with B+
          district: "Rajshahi",
          area: "Rajshahi Medical",
          isAvailable: true,
          lastDonatedAt: null,
        },
      ];

      const results = rankDonors(donors, baseRequest, now);
      expect(results).toHaveLength(0);
    });
  });

  describe("Scoring and sorting order", () => {
    it("correctly awards points for district, area, exact blood group, and tenure", () => {
      const donors: DonorCandidate[] = [
        // Perfect match: Same district (50), Same area (20), Exact blood group B+ (15), Never donated (10) = 95
        {
          id: "perfect",
          bloodGroup: "B+",
          district: "Rajshahi",
          area: "Near Rajshahi Medical College",
          isAvailable: true,
          lastDonatedAt: null,
        },
        // Compatible O- in same district (50) + exact area (20) + 120 days tenure (10) = 80
        {
          id: "same-district-compatible-o-neg",
          bloodGroup: "O-",
          district: "Rajshahi",
          area: "Rajshahi Medical Hospital Gate",
          isAvailable: true,
          lastDonatedAt: new Date(now.getTime() - 120 * MS_PER_DAY),
        },
        // Same district (50) + exact blood group B+ (15) + different area (0) + 90 days (9) = 74
        {
          id: "same-district-diff-area",
          bloodGroup: "B+",
          district: "Rajshahi",
          area: "Shaheb Bazar",
          isAvailable: true,
          lastDonatedAt: new Date(now.getTime() - 90 * MS_PER_DAY),
        },
        // Different district Dhaka (0) + exact blood group B+ (15) + never donated (10) = 25
        {
          id: "diff-district-donor",
          bloodGroup: "B+",
          district: "Dhaka",
          area: "Dhanmondi",
          isAvailable: true,
          lastDonatedAt: null,
        },
      ];

      const results = rankDonors(donors, baseRequest, now);

      expect(results).toHaveLength(4);

      // Verify descending order
      expect(results[0].donor.id).toBe("perfect");
      expect(results[0].score).toBe(95);
      expect(results[0].reasons).toContain("Same district");
      expect(results[0].reasons).toContain("Same area");
      expect(results[0].reasons).toContain("Exact blood group match");
      expect(results[0].reasons).toContain("First-time donor");

      expect(results[1].donor.id).toBe("same-district-compatible-o-neg");
      expect(results[1].score).toBe(80);

      expect(results[2].donor.id).toBe("same-district-diff-area");
      expect(results[2].score).toBe(74);

      expect(results[3].donor.id).toBe("diff-district-donor");
      expect(results[3].score).toBe(25);
    });

    it("correctly handles area matching with case-insensitivity and substring matching", () => {
      const donors: DonorCandidate[] = [
        {
          id: "d-sub",
          bloodGroup: "B+",
          district: "Rajshahi",
          area: "RAJSHAHI MEDICAL",
          isAvailable: true,
          lastDonatedAt: null,
        },
      ];

      const results = rankDonors(donors, baseRequest, now);
      expect(results[0].reasons).toContain("Same area");
    });
  });
});
