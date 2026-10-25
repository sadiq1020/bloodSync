import { z } from "zod";

/**
 * Login validation schema.
 * Requires email and password.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Registration validation schema.
 * - Name: 2 to 60 chars trimmed
 * - Email: valid and lowercased
 * - Password: 8 to 128 chars (matches server's Better Auth minPasswordLength: 8 and max: 128)
 * - ConfirmPassword: must match password
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name cannot exceed 60 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
