import type { Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import * as healthService from "./health.service.js";

// Handler for GET /api/ping - Instant health check (no DB, no auth, no logging)
export const ping = (_req: Request, res: Response): void => {
  res.status(200).json({ success: true });
};

// Handler for GET /api/health
export const checkHealth = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Verify database connectivity with a lightweight probe
    await prisma.$queryRawUnsafe("SELECT 1");

    const healthData = healthService.getHealthStatus();
    res.status(200).json({
      success: true,
      data: {
        ...healthData,
        database: "connected",
      },
    });
  } catch {
    // Return 503 without leaking connection strings, stack traces, or credentials
    res.status(503).json({
      success: false,
      message: "Database unavailable",
    });
  }
};
