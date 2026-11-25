import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// General API rate limiter (600 requests per 15 minutes window)
// Generous limit to accommodate proxied traffic from Vercel -> Render
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
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
    return req.user?.id || (req.ip ? ipKeyGenerator(req.ip) : "anonymous");
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
