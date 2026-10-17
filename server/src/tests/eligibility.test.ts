import { describe, it, expect } from "vitest";
import {
  ELIGIBILITY_DAYS,
  isEligible,
  getNextEligibleDate,
} from "../lib/eligibility.js";

describe("Donor Eligibility Business Logic (90-day rule)", () => {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const fixedNow = new Date("2026-10-17T12:00:00.000Z");

  it("returns true when lastDonatedAt is null (never donated)", () => {
    expect(isEligible(null, fixedNow)).toBe(true);
    expect(getNextEligibleDate(null)).toBeNull();
  });

  it("returns false at exactly 89 days after donation (1 day short)", () => {
    const donatedAt = new Date(fixedNow.getTime() - 89 * MS_PER_DAY);
    expect(isEligible(donatedAt, fixedNow)).toBe(false);

    const nextDate = getNextEligibleDate(donatedAt);
    expect(nextDate).not.toBeNull();
    // Next eligible date is donatedAt + 90 days
    expect(nextDate!.getTime()).toBe(donatedAt.getTime() + 90 * MS_PER_DAY);
  });

  it("returns true at exactly 90 days after donation (boundary condition)", () => {
    const donatedAt = new Date(fixedNow.getTime() - 90 * MS_PER_DAY);
    expect(isEligible(donatedAt, fixedNow)).toBe(true);
  });

  it("returns true at 91 days after donation", () => {
    const donatedAt = new Date(fixedNow.getTime() - 91 * MS_PER_DAY);
    expect(isEligible(donatedAt, fixedNow)).toBe(true);
  });

  it("returns false for a very recent donation (e.g. 5 days ago)", () => {
    const donatedAt = new Date(fixedNow.getTime() - 5 * MS_PER_DAY);
    expect(isEligible(donatedAt, fixedNow)).toBe(false);
  });

  it("returns true for a donation from a year ago (365 days)", () => {
    const donatedAt = new Date(fixedNow.getTime() - 365 * MS_PER_DAY);
    expect(isEligible(donatedAt, fixedNow)).toBe(true);
  });
});
