import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { env } from "../config/env.js";

// Global error handling middleware
export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const message = err.message || "Internal Server Error";

  // Development: include stack trace and complete error object
  if (env.NODE_ENV === "development") {
    res.status(statusCode).json({
      status,
      message,
      stack: err.stack,
      error: err,
    });
    return;
  }

  // Production: send clean message for operational errors
  if (err.isOperational) {
    res.status(statusCode).json({
      status,
      message,
    });
    return;
  }

  // Production: do not leak unhandled technical errors
  console.error("ERROR 💥", err);
  res.status(500).json({
    status: "error",
    message: "Something went wrong on the server",
  });
};
