import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

// Middleware authorizing access based on required user role (USER or ADMIN)
export const requireRole = (role: "USER" | "ADMIN") => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    if (req.user.role !== role) {
      throw new AppError(`Access forbidden: ${role} privileges required.`, 403);
    }

    next();
  };
};
