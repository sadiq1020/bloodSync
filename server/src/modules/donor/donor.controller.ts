import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import * as donorService from "./donor.service.js";
import type { CreateDonorInput, UpdateDonorInput, SearchDonorQuery } from "./donor.validation.js";

// POST /api/donors/me – create donor profile for the logged-in user
export const createMyDonorProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const profile = await donorService.createDonorProfile(req.user.id, req.body as CreateDonorInput);

  res.status(201).json({ success: true, data: profile });
});

// GET /api/donors/me – return my donor profile with eligibility info
export const getMyDonorProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const profile = await donorService.getMyDonorProfile(req.user.id);

  res.status(200).json({ success: true, data: profile });
});

// PATCH /api/donors/me – partial update of my donor profile
export const updateMyDonorProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const updated = await donorService.updateDonorProfile(req.user.id, req.body as UpdateDonorInput);

  res.status(200).json({ success: true, data: updated });
});

// GET /api/donors/search – search available + eligible donors (no phone/email)
export const searchDonors = catchAsync(async (req: Request, res: Response) => {
  const result = await donorService.searchDonors(req.query as unknown as SearchDonorQuery);

  res.status(200).json({ success: true, ...result });
});
