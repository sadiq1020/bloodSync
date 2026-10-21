import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import * as donationService from "./donation.service.js";

// POST /api/requests/:id/volunteer
export const volunteerToDonate = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const requestId = req.params.id as string;
  const donation = await donationService.volunteerToDonate(requestId, req.user.id);

  res.status(201).json({
    success: true,
    data: donation,
  });
});

// PATCH /api/donations/:id/accept
export const acceptDonation = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const donationId = req.params.id as string;
  const updated = await donationService.acceptDonation(donationId, req.user.id);

  res.status(200).json({
    success: true,
    data: updated,
  });
});

// PATCH /api/donations/:id/complete
export const completeDonation = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const donationId = req.params.id as string;
  const updated = await donationService.completeDonation(donationId, req.user.id);

  res.status(200).json({
    success: true,
    data: updated,
  });
});

// PATCH /api/donations/:id/cancel
export const cancelDonation = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const donationId = req.params.id as string;
  const updated = await donationService.cancelDonation(donationId, req.user.id);

  res.status(200).json({
    success: true,
    data: updated,
  });
});

// GET /api/requests/:id/donations
export const getRequestDonations = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const requestId = req.params.id as string;
  const volunteers = await donationService.getRequestDonations(requestId, req.user);

  res.status(200).json({
    success: true,
    data: volunteers,
  });
});

// GET /api/donations/mine
export const getMyDonations = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const donations = await donationService.getMyDonations(req.user.id);

  res.status(200).json({
    success: true,
    data: donations,
  });
});
