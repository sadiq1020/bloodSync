import { z } from "zod";
import { BLOOD_GROUPS } from "../../constants/bloodGroups.js";
import { BANGLADESH_DISTRICTS } from "../../constants/districts.js";

// Reusable field schemas
const bloodGroupSchema = z.enum(BLOOD_GROUPS, {
  message: "Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-",
});

const districtSchema = z.enum(BANGLADESH_DISTRICTS, {
  message: "Must be a valid Bangladesh district",
});

const areaSchema = z
  .string()
  .trim()
  .min(2, "Area must be at least 2 characters")
  .max(80, "Area must be at most 80 characters");

// Bangladesh mobile: +8801X-XXXXXXXX or 01X-XXXXXXXX (X is 3-9)
const phoneSchema = z
  .string()
  .regex(/^(?:\+8801|01)[3-9]\d{8}$/, "Must be a valid Bangladesh mobile number");

// lastDonatedAt: optional ISO string that must not be in the future
const lastDonatedAtSchema = z
  .string()
  .datetime({ message: "Must be a valid ISO date-time string" })
  .refine((val) => new Date(val) <= new Date(), {
    message: "lastDonatedAt must not be in the future",
  })
  .transform((val) => new Date(val))
  .optional();

// POST /api/donors/me – all fields required
export const createDonorSchema = z.object({
  bloodGroup: bloodGroupSchema,
  district: districtSchema,
  area: areaSchema,
  phone: phoneSchema,
  lastDonatedAt: lastDonatedAtSchema,
});

// PATCH /api/donors/me – all fields optional, but at least one sent
export const updateDonorSchema = z
  .object({
    bloodGroup: bloodGroupSchema.optional(),
    district: districtSchema.optional(),
    area: areaSchema.optional(),
    phone: phoneSchema.optional(),
    isAvailable: z.boolean().optional(),
    lastDonatedAt: lastDonatedAtSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });

// GET /api/donors/search query params
export const searchDonorSchema = z.object({
  bloodGroup: bloodGroupSchema.optional(),
  district: districtSchema.optional(),
  area: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateDonorInput = z.infer<typeof createDonorSchema>;
export type UpdateDonorInput = z.infer<typeof updateDonorSchema>;
export type SearchDonorQuery = z.infer<typeof searchDonorSchema>;
