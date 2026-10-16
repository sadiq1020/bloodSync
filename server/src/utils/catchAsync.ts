import type { Request, Response, NextFunction, RequestHandler } from "express";

// Wraps async route handlers and forwards errors to the next middleware
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
