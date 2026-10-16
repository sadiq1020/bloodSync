import type { Request, Response } from "express";
import * as healthService from "./health.service.js";

// Handler for GET /api/health
export const checkHealth = (_req: Request, res: Response): void => {
  const healthData = healthService.getHealthStatus();
  res.status(200).json({
    success: true,
    data: healthData,
  });
};
