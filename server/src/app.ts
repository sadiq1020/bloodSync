import express from "express";
import cors from "cors";
import helmet from "helmet";
import pino from "pino";
import { pinoHttp } from "pino-http";
import { toNodeHandler } from "better-auth/node";
import { env } from "./config/env.js";
import { auth } from "./config/auth.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { healthRouter } from "./modules/health/health.route.js";
import { userRouter } from "./modules/user/user.route.js";
import { donorRouter } from "./modules/donor/donor.route.js";
import { requestRouter } from "./modules/request/request.route.js";
import { donationRouter } from "./modules/donation/donation.route.js";

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

// Mount Better Auth handler BEFORE body parsing (Express 5 wildcard syntax)
app.all("/api/auth/*splat", toNodeHandler(auth));

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
app.use("/api", userRouter);
app.use("/api", donorRouter);
app.use("/api", requestRouter);
app.use("/api", donationRouter);

// 404 handler for undefined routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export { app };
