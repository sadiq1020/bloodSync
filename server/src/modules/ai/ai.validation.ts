import { z } from "zod";

// Input schema for POST /api/ai/parse-request
export const parseRequestSchema = z.object({
  text: z
    .string({ message: "text is required" })
    .trim()
    .min(10, "Text must be at least 10 characters long")
    .max(1000, "Text cannot exceed 1000 characters"),
});

export type ParseRequestInput = z.infer<typeof parseRequestSchema>;

// Sanitized output fields schema (all fields nullable)
export const parsedFieldsSchema = z.object({
  patientName: z.string().nullable().default(null),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .nullable()
    .default(null),
  unitsNeeded: z.number().int().min(1).max(10).nullable().default(null),
  hospital: z.string().nullable().default(null),
  district: z.string().nullable().default(null),
  area: z.string().nullable().default(null),
  urgency: z.enum(["NORMAL", "URGENT", "CRITICAL"]).default("NORMAL"),
  contactPhone: z.string().nullable().default(null),
});

export type ParsedFields = z.infer<typeof parsedFieldsSchema>;
