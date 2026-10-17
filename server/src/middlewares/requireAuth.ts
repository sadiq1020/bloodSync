import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

// Authenticated User interface matching Better Auth User schema
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: "USER" | "ADMIN";
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Extend Express Request type with authenticated user and session
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      session?: any;
    }
  }
}

// Middleware requiring active session cookie and checking if account is blocked
export const requireAuth = catchAsync(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      throw new AppError("Authentication required. Please log in to proceed.", 401);
    }

    const user = session.user as unknown as AuthUser;

    if (user.isBlocked) {
      throw new AppError("Your account has been suspended. Please contact support.", 403);
    }

    req.user = user;
    req.session = session.session;
    next();
  }
);
