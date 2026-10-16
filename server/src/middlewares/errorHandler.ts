import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

interface FormattedError {
  field: string;
  message: string;
}

interface ErrorResponseBody {
  success: false;
  message: string;
  errors?: FormattedError[];
  stack?: string;
}

// Global centralized error handling middleware
export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Something went wrong on the server";
  let errors: FormattedError[] | undefined;

  // 1. AppError (trusted operational errors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // 2. Zod validation errors
  else if (err instanceof ZodError || err.name === "ZodError") {
    statusCode = 400;
    message = "Validation failed";
    errors = err.issues.map((issue: any) => ({
      field: Array.isArray(issue.path) ? issue.path.join(".") || "request" : "request",
      message: issue.message,
    }));
  }
  // 3. Prisma known database errors
  else if (
    err.name === "PrismaClientKnownRequestError" ||
    (typeof err.code === "string" && err.code.startsWith("P"))
  ) {
    if (err.code === "P2002") {
      statusCode = 409;
      const target = Array.isArray(err.meta?.target)
        ? err.meta.target.join(", ")
        : "field";
      message = `A record with this ${target} already exists.`;
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = (err.meta?.cause as string) || "Requested record was not found.";
    } else {
      statusCode = 400;
      message = "Database operation failed.";
    }
  }
  // 4. Other standard or unexpected errors
  else if (err instanceof Error) {
    if (env.NODE_ENV === "development") {
      message = err.message || message;
    }
  }

  const responseBody: ErrorResponseBody = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(env.NODE_ENV === "development" && err.stack && { stack: err.stack }),
  };

  res.status(statusCode).json(responseBody);
};
