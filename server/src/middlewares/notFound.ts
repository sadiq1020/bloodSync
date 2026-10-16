import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

// 404 handler for unmatched routes
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
};
