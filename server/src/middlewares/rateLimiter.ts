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

// Stricter rate limiter for AI parser route (20 requests per 15 minutes window)
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many AI parsing requests. Please wait a few minutes before trying again.",
    });
  },
});
