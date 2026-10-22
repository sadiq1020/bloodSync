import { z } from "zod";
import { BLOOD_GROUPS } from "../../constants/bloodGroups.js";
import { BANGLADESH_DISTRICTS } from "../../constants/districts.js";

// Reusable ID param validation
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// Reusable blood group validation for query
const bloodGroupQuerySchema = z
  .string()
  .transform((val) => val.replace(/ /g, "+"))
  .pipe(
    z.enum(BLOOD_GROUPS, {
      message: "Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-",
    })
  );

// Reusable district validation for query
const districtQuerySchema = z
  .string()
  .transform((val) => val.charAt(0).toUpperCase() + val.slice(1))
  .pipe(
    z.enum(BANGLADESH_DISTRICTS, {
      message: "Must be a valid Bangladesh district",
    })
  );

// Request status enum validation for query
const requestStatusQuerySchema = z
  .string()
  .transform((val) => val.toUpperCase())
  .pipe(
    z.enum(["OPEN", "MATCHED", "FULFILLED", "EXPIRED", "CANCELLED"], {
      message: "Status must be OPEN, MATCHED, FULFILLED, EXPIRED, or CANCELLED",
    })
  );

// GET /api/admin/users query validation
export const listUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  isBlocked: z
    .preprocess((val) => {
      if (val === "true" || val === true) return true;
      if (val === "false" || val === false) return false;
      return undefined;
    }, z.boolean().optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// PATCH /api/admin/users/:id/block body validation
export const blockUserBodySchema = z.object({
  isBlocked: z.boolean({
    message: "isBlocked is required and must be a boolean",
  }),
});

// GET /api/admin/requests query validation
export const listAdminRequestsQuerySchema = z.object({
  status: requestStatusQuerySchema.optional(),
  district: districtQuerySchema.optional(),
  bloodGroup: bloodGroupQuerySchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type BlockUserBody = z.infer<typeof blockUserBodySchema>;
export type ListAdminRequestsQuery = z.infer<typeof listAdminRequestsQuerySchema>;
