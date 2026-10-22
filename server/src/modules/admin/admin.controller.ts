import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/AppError.js";
import * as adminService from "./admin.service.js";
import type {
  ListUsersQuery,
  BlockUserBody,
  ListAdminRequestsQuery,
} from "./admin.validation.js";

// GET /api/admin/users: List users with search, filtering, and pagination
export const listUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.listUsers(
    req.query as unknown as ListUsersQuery
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

// PATCH /api/admin/users/:id/block: Block or unblock a user
export const blockUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized.", 401);

  const { id } = req.params as { id: string };
  const { isBlocked } = req.body as BlockUserBody;

  const user = await adminService.blockUser(req.user.id, id, isBlocked);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// GET /api/admin/requests: List blood requests with requester details and donation counts
export const listAdminRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.listAdminRequests(
    req.query as unknown as ListAdminRequestsQuery
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

// PATCH /api/admin/requests/:id/close: Administratively close an open/matched request
export const closeAdminRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const updatedRequest = await adminService.closeAdminRequest(id);

  res.status(200).json({
    success: true,
    data: updatedRequest,
  });
});

// DELETE /api/admin/requests/:id: Hard delete request and its donations
export const deleteAdminRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await adminService.deleteAdminRequest(id);

  res.status(200).json({
    success: true,
    ...result,
  });
});

// GET /api/admin/stats: Return dashboard analytics and statistics
export const getAdminStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await adminService.getAdminStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});
