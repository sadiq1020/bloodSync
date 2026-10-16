import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Initialize PostgreSQL connection pool using pooled connection URL (Neon)
const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});

// Configure Prisma Postgres driver adapter
const adapter = new PrismaPg(pool);

// Export singleton PrismaClient instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
