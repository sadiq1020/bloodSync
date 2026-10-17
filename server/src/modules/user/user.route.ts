import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { getMe } from "./user.controller.js";

const router = Router();

// GET /api/me - Retrieve authenticated user info
router.get("/me", requireAuth, getMe);

export const userRouter = router;
