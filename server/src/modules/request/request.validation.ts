import { z } from "zod";
import { BLOOD_GROUPS } from "../../constants/bloodGroups.js";
import { BANGLADESH_DISTRICTS } from "../../constants/districts.js";

// Reusable blood group validation
const bloodGroupSchema = z.enum(BLOOD_GROUPS, {
  message: "Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-",
});

// Query-friendly blood group (restores '+' from space when URL-decoded)
const bloodGroupQuerySchema = z
  .string()
  .transform((val) => val.replace(/ /g, "+"))
  .pipe(bloodGroupSchema);

// 64 Bangladesh districts validation
const districtSchema = z.enum(BANGLADESH_DISTRICTS, {
  message: "Must be a valid Bangladesh district",
});

// Query-friendly district (capitalizes first letter)
const districtQuerySchema = z
  .string()
  .transform((val) => val.charAt(0).toUpperCase() + val.slice(1))
  .pipe(districtSchema);

// Bangladesh mobile number regex
const phoneSchema = z
  .string()
  .regex(/^(?:\+8801|01)[3-9]\d{8}$/, "Must be a valid Bangladesh mobile number");

// Urgency enum
const urgencyEnum = z.enum(["NORMAL", "URGENT", "CRITICAL"], {
  message: "Urgency must be NORMAL, URGENT, or CRITICAL",
});

const urgencyQuerySchema = z
  .string()
  .transform((val) => val.toUpperCase())
  .pipe(urgencyEnum);

// Request status enum
const requestStatusEnum = z.enum(["OPEN", "MATCHED", "FULFILLED", "EXPIRED", "CANCELLED"], {
  message: "Status must be OPEN, MATCHED, FULFILLED, EXPIRED, or CANCELLED",
});

const requestStatusQuerySchema = z
  .string()
  .transform((val) => val.toUpperCase())
  .pipe(requestStatusEnum);

// neededBy: must be a valid date in the future
const neededBySchema = z
  .string({ message: "neededBy is required" })
  .refine((val) => !isNaN(Date.parse(val)), {
    message: "Must be a valid date or date-time string",
  })
  .refine((val) => new Date(val) > new Date(), {
    message: "neededBy must be a date in the future",
  })
  .transform((val) => new Date(val));

// POST /api/requests body schema
export const createRequestSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, "Patient name must be at least 2 characters")
    .max(80, "Patient name must be at most 80 characters"),
  bloodGroup: bloodGroupSchema,
  unitsNeeded: z
    .number()
    .int("Units needed must be an integer")
    .min(1, "Must request at least 1 unit")
    .max(10, "Cannot request more than 10 units"),
  hospital: z
    .string()
    .trim()
    .min(2, "Hospital name must be at least 2 characters")
    .max(120, "Hospital name must be at most 120 characters"),
  district: districtSchema,
  area: z
    .string()
    .trim()
    .min(2, "Area must be at least 2 characters")
    .max(80, "Area must be at most 80 characters"),
  urgency: urgencyEnum,
  neededBy: neededBySchema,
  contactPhone: phoneSchema,
  note: z
    .string()
    .trim()
    .max(500, "Note must be at most 500 characters")
    .optional()
    .nullable(),
  forSelf: z.boolean({ message: "forSelf is required and must be a boolean" }),
});

// GET /api/requests query schema
export const listRequestsQuerySchema = z.object({
  district: districtQuerySchema.optional(),
  bloodGroup: bloodGroupQuerySchema.optional(),
  urgency: urgencyQuerySchema.optional(),
  status: requestStatusQuerySchema.default("OPEN"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// GET /api/requests/mine query schema
export const mineRequestsQuerySchema = z.object({
  status: requestStatusQuerySchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>;
export type MineRequestsQuery = z.infer<typeof mineRequestsQuerySchema>;
