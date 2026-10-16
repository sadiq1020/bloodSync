import type { Request, Response } from "express";

// 404 handler for unmatched routes with consistent error shape
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.method} ${req.originalUrl} on this server`,
  });
};
