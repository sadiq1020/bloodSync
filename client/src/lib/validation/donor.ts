import { z } from "zod";
import { BLOOD_GROUPS } from "@/lib/constants/bloodGroups";
import { BANGLADESH_DISTRICTS } from "@/lib/constants/districts";
import { normalizeDigits } from "@/lib/normalize-digits";

// Reusable field schemas matching server/src/modules/donor/donor.validation.ts
export const bloodGroupSchema = z.enum(BLOOD_GROUPS, {
  message: "Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-",
});

export const districtSchema = z.enum(BANGLADESH_DISTRICTS, {
  message: "Must be a valid Bangladesh district",
});

export const areaSchema = z
  .string()
  .trim()
  .min(2, "Area must be at least 2 characters")
  .max(80, "Area must be at most 80 characters");

export const phoneSchema = z
  .string()
  .transform((val) => normalizeDigits(val.trim()))
  .pipe(
    z
      .string()
      .regex(
        /^(?:\+8801|01)[3-9]\d{8}$/,
        "Must be a valid Bangladesh mobile number (e.g. 01XXXXXXXXX or +8801XXXXXXXXX)"
      )
  );

export const lastDonatedAtSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const date = new Date(val);
      return !isNaN(date.getTime()) && date <= new Date();
    },
    { message: "Last donation date cannot be in the future" }
  );

// Unified donor form schema
export const donorProfileFormSchema = z.object({
  bloodGroup: bloodGroupSchema,
  district: districtSchema,
  area: areaSchema,
  phone: phoneSchema,
  lastDonatedAt: lastDonatedAtSchema,
  consent: z.boolean().optional(),
});

export const getDonorFormSchema = (mode: "create" | "edit") =>
  donorProfileFormSchema.superRefine((data, ctx) => {
    if (mode === "create" && !data.consent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["consent"],
        message:
          "You must agree to allow people with matching requests to view your contact number",
      });
    }
  });

export type DonorProfileFormData = z.infer<typeof donorProfileFormSchema>;
