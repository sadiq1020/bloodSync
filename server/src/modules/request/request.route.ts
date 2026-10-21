import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { validate } from "../../middlewares/validate.js";
import {
  createRequestSchema,
  listRequestsQuerySchema,
  mineRequestsQuerySchema,
} from "./request.validation.js";
import {
  createRequest,
  listRequests,
  getMyRequests,
  getRequestById,
  cancelRequest,
  getRankedDonors,
} from "./request.controller.js";

const router = Router();

// All request endpoints require an authenticated user
router.post(
  "/requests",
  requireAuth,
  validate({ body: createRequestSchema }),
  createRequest
);

router.get(
  "/requests",
  requireAuth,
  validate({ query: listRequestsQuerySchema }),
  listRequests
);

// Note: /requests/mine MUST be declared before /requests/:id so "mine" is not treated as an id
router.get(
  "/requests/mine",
  requireAuth,
  validate({ query: mineRequestsQuerySchema }),
  getMyRequests
);

router.get("/requests/:id", requireAuth, getRequestById);

router.get("/requests/:id/donors", requireAuth, getRankedDonors);

router.patch("/requests/:id/cancel", requireAuth, cancelRequest);

export const requestRouter = router;
