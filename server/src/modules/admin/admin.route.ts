import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validate } from "../../middlewares/validate.js";
import {
  idParamSchema,
  listUsersQuerySchema,
  blockUserBodySchema,
  listAdminRequestsQuerySchema,
} from "./admin.validation.js";
import {
  listUsers,
  blockUser,
  listAdminRequests,
  closeAdminRequest,
  deleteAdminRequest,
  getAdminStats,
} from "./admin.controller.js";

const router = Router();

// Apply requireAuth and requireRole("ADMIN") once at the router level for all admin endpoints
router.use(requireAuth, requireRole("ADMIN"));

// 1. GET /api/admin/users?search&role&isBlocked&page&limit
router.get("/admin/users", validate({ query: listUsersQuerySchema }), listUsers);

// 2. PATCH /api/admin/users/:id/block with body { isBlocked: boolean }
router.patch(
  "/admin/users/:id/block",
  validate({ params: idParamSchema, body: blockUserBodySchema }),
  blockUser
);

// 3. GET /api/admin/requests?status&district&bloodGroup&page&limit
router.get(
  "/admin/requests",
  validate({ query: listAdminRequestsQuerySchema }),
  listAdminRequests
);

// 4. PATCH /api/admin/requests/:id/close
router.patch(
  "/admin/requests/:id/close",
  validate({ params: idParamSchema }),
  closeAdminRequest
);

// 5. DELETE /api/admin/requests/:id
router.delete(
  "/admin/requests/:id",
  validate({ params: idParamSchema }),
  deleteAdminRequest
);

// 6. GET /api/admin/stats
router.get("/admin/stats", getAdminStats);

export const adminRouter = router;
