import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { validate } from "../../middlewares/validate.js";
import {
  createDonorSchema,
  updateDonorSchema,
  searchDonorSchema,
} from "./donor.validation.js";
import {
  createMyDonorProfile,
  getMyDonorProfile,
  updateMyDonorProfile,
  searchDonors,
} from "./donor.controller.js";

const router = Router();

// All donor routes require authentication
router.post(
  "/donors/me",
  requireAuth,
  validate({ body: createDonorSchema }),
  createMyDonorProfile,
);

router.get("/donors/me", requireAuth, getMyDonorProfile);

router.patch(
  "/donors/me",
  requireAuth,
  validate({ body: updateDonorSchema }),
  updateMyDonorProfile,
);

// Search is also login-only; query validated separately
router.get(
  "/donors/search",
  requireAuth,
  validate({ query: searchDonorSchema }),
  searchDonors,
);

export const donorRouter = router;
