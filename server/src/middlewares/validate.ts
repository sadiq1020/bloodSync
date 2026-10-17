import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

export interface RequestValidationSchema {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

// Middleware that validates req.body, req.query, or req.params against Zod schemas
export const validate = (schema: RequestValidationSchema | ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if ("body" in schema || "query" in schema || "params" in schema) {
        const compositeSchema = schema as RequestValidationSchema;
        if (compositeSchema.body) {
          req.body = await compositeSchema.body.parseAsync(req.body);
        }
        if (compositeSchema.query) {
          // Express 5: req.query is a read-only getter; use defineProperty to override it
          const parsed = await compositeSchema.query.parseAsync(req.query);
          Object.defineProperty(req, "query", {
            value: parsed,
            writable: true,
            configurable: true,
          });
        }
        if (compositeSchema.params) {
          req.params = (await compositeSchema.params.parseAsync(req.params)) as any;
        }
      } else {
        // Direct schema provided: validate request body
        req.body = await (schema as ZodSchema).parseAsync(req.body);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
