import { z } from "zod";
import { BLOOD_GROUPS } from "@/lib/constants/bloodGroups";
import { BANGLADESH_DISTRICTS } from "@/lib/constants/districts";
import { normalizeDigits } from "@/lib/normalize-digits";

export const urgencyEnum = z.enum(["NORMAL", "URGENT", "CRITICAL"], {
  message: "Urgency must be NORMAL, URGENT, or CRITICAL",
});

export const requestFormSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, "Patient name must be at least 2 characters")
    .max(80, "Patient name must be at most 80 characters"),
  bloodGroup: z.enum(BLOOD_GROUPS, {
    message: "Must select a valid blood group",
  }),
  unitsNeeded: z
    .number({ message: "Units needed is required" })
    .int("Units needed must be an integer")
    .min(1, "Must request at least 1 unit")
    .max(10, "Cannot request more than 10 units"),
  hospital: z
    .string()
    .trim()
    .min(2, "Hospital name must be at least 2 characters")
    .max(120, "Hospital name must be at most 120 characters"),
  district: z.enum(BANGLADESH_DISTRICTS, {
    message: "Must select a valid Bangladesh district",
  }),
  area: z
    .string()
    .trim()
    .min(2, "Area must be at least 2 characters")
    .max(80, "Area must be at most 80 characters"),
  urgency: urgencyEnum,
  neededBy: z
    .string({ message: "Date and time required" })
    .min(1, "Please select when blood is needed")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Must be a valid date or date-time string",
    })
    .refine((val) => new Date(val) > new Date(), {
      message: "Needed time must be in the future",
    }),
  contactPhone: z
    .string()
    .refine(
      (val) => /^(?:\+8801|01)[3-9]\d{8}$/.test(normalizeDigits(val.trim())),
      {
        message:
          "Must be a valid Bangladesh mobile number (e.g. 01XXXXXXXXX or +8801XXXXXXXXX)",
      }
    ),
  note: z
    .string()
    .trim()
    .max(500, "Note must be at most 500 characters")
    .optional()
    .nullable(),
  forSelf: z.boolean(),
});

export type RequestFormData = z.infer<typeof requestFormSchema>;
export type Urgency = z.infer<typeof urgencyEnum>;
