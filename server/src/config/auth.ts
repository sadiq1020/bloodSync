import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { env } from "./env.js";

// Better Auth configuration with Prisma PostgreSQL adapter
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.FRONTEND_URL, env.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false, // Prevents client from submitting role during signup
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false, // Prevents client from tampering with block status
      },
    },
  },
  advanced: {
    // Cross-site cookie configuration for production multi-domain hosting
    defaultCookieAttributes:
      env.NODE_ENV === "production"
        ? {
            secure: true,
            sameSite: "none",
          }
        : undefined,
  },
});
