import rateLimit from "express-rate-limit";

// General API rate limiter (100 requests per 15 minutes window)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again after 15 minutes.",
    });
  },
});

// Strict rate limiter for AI parsing (10 requests per 10 minutes per logged-in user)
export const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    return req.user?.id || req.ip || "anonymous";
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many AI requests. You can parse up to 10 messages every 10 minutes.",
    });
  },
});
