import express from "express";
import cors from "cors";
import helmet from "helmet";
import pino from "pino";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { healthRouter } from "./modules/health/health.route.js";

const app = express();

// Secure HTTP response headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Global rate limiting
app.use(generalLimiter);

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  ...(env.NODE_ENV !== "production"
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }
    : {}),
});
app.use(pinoHttp({ logger }));

// API routes
app.use("/api", healthRouter);

// 404 handler for undefined routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export { app };
