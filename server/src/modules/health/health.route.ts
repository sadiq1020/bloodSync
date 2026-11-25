import { Router } from "express";
import { checkHealth, ping } from "./health.controller.js";

const router = Router();

// GET /api/ping
router.get("/ping", ping);

// GET /api/health
router.get("/health", checkHealth);

export const healthRouter = router;
