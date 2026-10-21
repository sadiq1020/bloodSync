import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import * as requestService from "./request.service.js";
import type {
  CreateRequestInput,
  ListRequestsQuery,
  MineRequestsQuery,
} from "./request.validation.js";

// POST /api/requests – create a new blood request
export const createRequest = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const bloodRequest = await requestService.createRequest(
    req.user.id,
    req.body as CreateRequestInput
  );

  res.status(201).json({
    success: true,
    data: bloodRequest,
  });
});

// GET /api/requests – feed of blood requests with filters & pagination
export const listRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await requestService.listRequests(
    req.query as unknown as ListRequestsQuery
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

// GET /api/requests/mine – user's own requests with donation status counts
export const getMyRequests = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const result = await requestService.getMyRequests(
    req.user.id,
    req.query as unknown as MineRequestsQuery
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

// GET /api/requests/:id – detailed request view (contactPhone conditionally visible)
export const getRequestById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const id = req.params.id as string;
  const bloodRequest = await requestService.getRequestById(id, req.user);

  res.status(200).json({
    success: true,
    data: bloodRequest,
  });
});

// PATCH /api/requests/:id/cancel – cancel an open/matched request and its donations
export const cancelRequest = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const id = req.params.id as string;
  const cancelled = await requestService.cancelRequest(id, req.user.id);

  res.status(200).json({
    success: true,
    data: cancelled,
  });
});

// GET /api/requests/:id/donors – get ranked donors for request (owner only)
export const getRankedDonors = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const id = req.params.id as string;
  const rankedDonors = await requestService.getRankedDonorsForRequest(id, req.user);

  res.status(200).json({
    success: true,
    data: rankedDonors,
  });
});
