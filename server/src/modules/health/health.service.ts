// Service returning backend health status and uptime
export const getHealthStatus = () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "bloodsync-backend",
  };
};
