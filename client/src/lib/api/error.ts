import type { ApiFieldError } from "@/types";

export class ApiError extends Error {
  status: number;
  errors?: ApiFieldError[];

  constructor(status: number, message: string, errors?: ApiFieldError[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
