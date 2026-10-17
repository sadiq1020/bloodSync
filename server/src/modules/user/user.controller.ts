import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import * as userService from "./user.service.js";

// Controller handling GET /api/me
export const getMe = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError("Unauthorized.", 401);
  }

  const profile = await userService.getUserProfile(req.user.id);

  res.status(200).json({
    success: true,
    data: profile ?? req.user,
  });
});
