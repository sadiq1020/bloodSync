import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { aiLimiter } from "../../middlewares/rateLimiter.js";
import { validate } from "../../middlewares/validate.js";
import { parseRequestSchema } from "./ai.validation.js";
import { parseRequest } from "./ai.controller.js";

const router = Router();

// AI parse-request requires login, strict rate limiting, and body validation
router.post(
  "/ai/parse-request",
  requireAuth,
  aiLimiter,
  validate({ body: parseRequestSchema }),
  parseRequest
);

export const aiRouter = router;
