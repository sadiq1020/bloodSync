import { describe, it, expect } from "vitest";
import {
  BLOOD_GROUPS,
  canDonateTo,
  getCompatibleDonorGroups,
  type BloodGroup,
} from "../lib/bloodCompatibility.js";

describe("Blood Compatibility Business Logic", () => {
  const allGroups: BloodGroup[] = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
  ];

  const expectedMatrix: Record<BloodGroup, BloodGroup[]> = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"],
  };

  describe("getCompatibleDonorGroups", () => {
    for (const [patientGroup, expectedDonors] of Object.entries(expectedMatrix)) {
      it(`patient ${patientGroup} accepts exactly [${expectedDonors.join(", ")}]`, () => {
        const donors = getCompatibleDonorGroups(patientGroup as BloodGroup);
        expect([...donors].sort()).toEqual([...expectedDonors].sort());
      });
    }
  });

  describe("canDonateTo - comprehensive matrix verification", () => {
    for (const patientGroup of allGroups) {
      const allowedDonors = expectedMatrix[patientGroup];

      for (const donorGroup of allGroups) {
        const expectedResult = allowedDonors.includes(donorGroup);

        it(`donor ${donorGroup} -> patient ${patientGroup} should be ${expectedResult}`, () => {
          expect(canDonateTo(donorGroup, patientGroup)).toBe(expectedResult);
        });
      }
    }
  });

  describe("Edge cases", () => {
    it("O- is universal donor (can donate to all 8 groups)", () => {
      for (const recipient of allGroups) {
        expect(canDonateTo("O-", recipient)).toBe(true);
      }
    });

    it("AB+ is universal recipient (can receive from all 8 groups)", () => {
      for (const donor of allGroups) {
        expect(canDonateTo(donor, "AB+")).toBe(true);
      }
    });

    it("O- can only receive from O-", () => {
      for (const donor of allGroups) {
        if (donor === "O-") {
          expect(canDonateTo(donor, "O-")).toBe(true);
        } else {
          expect(canDonateTo(donor, "O-")).toBe(false);
        }
      }
    });
  });
});
