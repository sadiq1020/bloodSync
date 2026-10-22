import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import * as aiService from "./ai.service.js";
import type { ParseRequestInput } from "./ai.validation.js";

// POST /api/ai/parse-request
export const parseRequest = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const { text } = req.body as ParseRequestInput;
  const result = await aiService.parseBloodRequestText(text, req.user.id);

  res.status(200).json({
    success: true,
    data: result,
  });
});
