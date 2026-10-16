import { app } from "./app.js";
import { env } from "./config/env.js";

// Start Express server
const server = app.listen(env.PORT, () => {
  console.log(`🚀 BloodSync server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
  console.log(`🩺 Health check available at: http://localhost:${env.PORT}/api/health`);
});

// Graceful shutdown listeners
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("💥 HTTP server closed");
  });
});

process.on("SIGINT", () => {
  console.log("👋 SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("💥 HTTP server closed");
  });
});
