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

// Standard red blood cell compatibility matrix (Patient needs -> Compatible donor groups)
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

// Returns array of compatible donor blood groups for a given patient group
export const getCompatibleDonorGroups = (
  patientGroup: BloodGroup
): readonly BloodGroup[] => {
  return COMPATIBLE_DONOR_MAP[patientGroup] ?? [];
};

// Returns true if donor blood group can safely donate to patient blood group
export const canDonateTo = (
  donorGroup: BloodGroup,
  patientGroup: BloodGroup
): boolean => {
  const compatible = getCompatibleDonorGroups(patientGroup);
  return compatible.includes(donorGroup);
};
