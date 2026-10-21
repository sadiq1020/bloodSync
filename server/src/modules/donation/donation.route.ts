import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import {
  volunteerToDonate,
  acceptDonation,
  completeDonation,
  cancelDonation,
  getRequestDonations,
  getMyDonations,
} from "./donation.controller.js";

const router = Router();

// Requests-related donation routes
router.post("/requests/:id/volunteer", requireAuth, volunteerToDonate);
router.get("/requests/:id/donations", requireAuth, getRequestDonations);

// Personal donations route (declared before :id parameter routes)
router.get("/donations/mine", requireAuth, getMyDonations);

// Donation lifecycle actions
router.patch("/donations/:id/accept", requireAuth, acceptDonation);
router.patch("/donations/:id/complete", requireAuth, completeDonation);
router.patch("/donations/:id/cancel", requireAuth, cancelDonation);

export const donationRouter = router;
