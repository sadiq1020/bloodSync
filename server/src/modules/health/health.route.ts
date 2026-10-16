import { Router } from "express";
import { checkHealth } from "./health.controller.js";

const router = Router();

// GET /api/health
router.get("/health", checkHealth);

export const healthRouter = router;
