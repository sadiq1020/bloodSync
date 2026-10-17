// Required recovery gap between blood donations (in days)
export const ELIGIBILITY_DAYS = 90;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Checks whether a donor is eligible based on their last donation date
export const isEligible = (
  lastDonatedAt: Date | null,
  now = new Date()
): boolean => {
  if (!lastDonatedAt) return true;

  const diffMs = now.getTime() - lastDonatedAt.getTime();
  const diffDays = Math.floor(diffMs / MS_PER_DAY);

  return diffDays >= ELIGIBILITY_DAYS;
};

// Calculates the earliest date a donor is allowed to donate again
export const getNextEligibleDate = (
  lastDonatedAt: Date | null
): Date | null => {
  if (!lastDonatedAt) return null;

  return new Date(lastDonatedAt.getTime() + ELIGIBILITY_DAYS * MS_PER_DAY);
};
