/**
 * Blood Compatibility Constants & Business Logic
 * Direct mirror of server/src/lib/bloodCompatibility.ts with client extensions
 * for the interactive compatibility matrix and clinical facts.
 */

// Valid standard human blood groups
export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

/**
 * Standard red blood cell compatibility matrix
 * Patient (Recipient) blood group -> Compatible donor groups they can safely receive from.
 */
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
 * Recipient compatibility matrix
 * Donor blood group -> Patient groups that can safely receive this donor's red blood cells.
 */
export const COMPATIBLE_RECIPIENT_MAP: Record<BloodGroup, readonly BloodGroup[]> = {
  "A+": ["A+", "AB+"],
  "A-": ["A+", "A-", "AB+", "AB-"],
  "B+": ["B+", "AB+"],
  "B-": ["B+", "B-", "AB+", "AB-"],
  "AB+": ["AB+"],
  "AB-": ["AB+", "AB-"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "O-": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
} as const;

/**
 * Returns array of compatible donor blood groups for a given patient group.
 */
export const getCompatibleDonorGroups = (
  patientGroup: BloodGroup
): readonly BloodGroup[] => {
  return COMPATIBLE_DONOR_MAP[patientGroup] ?? [];
};

/**
 * Returns array of compatible patient blood groups a donor can safely give to.
 */
export const getCompatibleRecipientGroups = (
  donorGroup: BloodGroup
): readonly BloodGroup[] => {
  return COMPATIBLE_RECIPIENT_MAP[donorGroup] ?? [];
};

/**
 * Returns true if donor blood group can safely donate red blood cells to patient group.
 */
export const canDonateTo = (
  donorGroup: BloodGroup,
  patientGroup: BloodGroup
): boolean => {
  const compatible = getCompatibleDonorGroups(patientGroup);
  return compatible.includes(donorGroup);
};

export interface BloodGroupClinicalProfile {
  group: BloodGroup;
  antigens: string;
  antibodies: string;
  rhFactor: "Positive" | "Negative";
  bdPrevalence: string;
  specialRole?: "Universal Donor" | "Universal Recipient" | "Rare Rh Negative";
  clinicalSummary: string;
}

export const BLOOD_GROUP_PROFILES: Record<BloodGroup, BloodGroupClinicalProfile> = {
  "O-": {
    group: "O-",
    antigens: "None",
    antibodies: "Anti-A and Anti-B",
    rhFactor: "Negative",
    bdPrevalence: "~1.5%",
    specialRole: "Universal Donor",
    clinicalSummary:
      "Universal red blood cell donor. Can donate red blood cells to any recipient in an emergency, but can only safely receive blood from another O- donor.",
  },
  "O+": {
    group: "O+",
    antigens: "Rh (D antigen)",
    antibodies: "Anti-A and Anti-B",
    rhFactor: "Positive",
    bdPrevalence: "~31.0%",
    clinicalSummary:
      "Second most prevalent blood type in Bangladesh. Can donate to all Rh-positive blood types (O+, A+, B+, AB+), and can receive from O+ and O-.",
  },
  "A-": {
    group: "A-",
    antigens: "A antigen",
    antibodies: "Anti-B",
    rhFactor: "Negative",
    bdPrevalence: "~0.8%",
    specialRole: "Rare Rh Negative",
    clinicalSummary:
      "Extremely rare in Bangladesh. Can donate red blood cells to A+, A-, AB+, and AB- patients. Can only receive from A- and O-.",
  },
  "A+": {
    group: "A+",
    antigens: "A antigen, Rh (D antigen)",
    antibodies: "Anti-B",
    rhFactor: "Positive",
    bdPrevalence: "~23.5%",
    clinicalSummary:
      "Common blood type across Bangladesh. Can donate to A+ and AB+ recipients, and can receive blood from A+, A-, O+, and O- donors.",
  },
  "B-": {
    group: "B-",
    antigens: "B antigen",
    antibodies: "Anti-A",
    rhFactor: "Negative",
    bdPrevalence: "~1.2%",
    specialRole: "Rare Rh Negative",
    clinicalSummary:
      "Rare Rh-negative type. Can donate to B+, B-, AB+, and AB- patients. Can receive red blood cells only from B- and O- donors.",
  },
  "B+": {
    group: "B+",
    antigens: "B antigen, Rh (D antigen)",
    antibodies: "Anti-A",
    rhFactor: "Positive",
    bdPrevalence: "~34.5%",
    clinicalSummary:
      "The most common blood group in Bangladesh (approx. 1 in 3 people). Can donate to B+ and AB+ patients, and receive from B+, B-, O+, and O-.",
  },
  "AB-": {
    group: "AB-",
    antigens: "A and B antigens",
    antibodies: "None",
    rhFactor: "Negative",
    bdPrevalence: "~0.4%",
    specialRole: "Rare Rh Negative",
    clinicalSummary:
      "The rarest blood group in Bangladesh (<1% of the population). Can donate to AB- and AB+ patients, and can receive from any Rh-negative group (AB-, A-, B-, O-).",
  },
  "AB+": {
    group: "AB+",
    antigens: "A, B, and Rh (D antigen)",
    antibodies: "None",
    rhFactor: "Positive",
    bdPrevalence: "~8.6%",
    specialRole: "Universal Recipient",
    clinicalSummary:
      "Universal red blood cell recipient. Individuals with AB+ blood can safely receive red blood cells from any human blood group.",
  },
};

