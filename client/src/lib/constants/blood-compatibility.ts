import { BLOOD_GROUPS, type BloodGroup } from "./bloodGroups";

export { BLOOD_GROUPS, type BloodGroup };

// Copied from the server, which is the source of truth. Keep in sync.
export const COMPATIBLE_DONOR_MAP: Record<BloodGroup, readonly BloodGroup[]> = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"],
} as const;

/**
 * Returns which donor groups a given patient group can receive from.
 */
export const getCanReceiveFrom = (group: BloodGroup): readonly BloodGroup[] => {
  return COMPATIBLE_DONOR_MAP[group] ?? [];
};

/**
 * Derives which recipient groups a given donor group can donate to.
 * Pure function computed dynamically from COMPATIBLE_DONOR_MAP.
 */
export const getCanGiveTo = (donorGroup: BloodGroup): readonly BloodGroup[] => {
  return BLOOD_GROUPS.filter((recipientGroup) =>
    COMPATIBLE_DONOR_MAP[recipientGroup].includes(donorGroup)
  );
};

/**
 * Returns true if donorGroup can donate red blood cells to patientGroup.
 */
export const canDonateTo = (
  donorGroup: BloodGroup,
  patientGroup: BloodGroup
): boolean => {
  return COMPATIBLE_DONOR_MAP[patientGroup]?.includes(donorGroup) ?? false;
};

/**
 * Converts a blood group code (e.g. 'B+') to its natural spoken words (e.g. 'B positive').
 */
export function bloodGroupToWords(group: BloodGroup): string {
  switch (group) {
    case "A+":
      return "A positive";
    case "A-":
      return "A negative";
    case "B+":
      return "B positive";
    case "B-":
      return "B negative";
    case "AB+":
      return "AB positive";
    case "AB-":
      return "AB negative";
    case "O+":
      return "O positive";
    case "O-":
      return "O negative";
  }
}

/**
 * Formats a list of blood groups into natural spoken words joined with commas and 'and'.
 * E.g. 'B positive, B negative, O positive and O negative.'
 */
export function formatGroupListWords(groups: readonly BloodGroup[]): string {
  const words = groups.map(bloodGroupToWords);
  if (words.length === 0) return "no groups";
  if (words.length === 1) return words[0];
  if (words.length === 2) return `${words[0]} and ${words[1]}`;
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}
