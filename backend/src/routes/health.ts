import { Hono } from "hono";
import { checkDatabaseConnection } from "../db";

export const healthRouter = new Hono();

healthRouter.get("/", async (c) => {
  const dbHealthy = await checkDatabaseConnection();

  const status = {
    status: dbHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    services: {
      api: "healthy",
      database: dbHealthy ? "healthy" : "unhealthy",
    },
  };

  return c.json(status, dbHealthy ? 200 : 503);
});

healthRouter.get("/live", (c) => {
  return c.json({
    status: "alive",
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get("/ready", async (c) => {
  const dbHealthy = await checkDatabaseConnection();

  if (!dbHealthy) {
    return c.json(
      {
        status: "not ready",
        reason: "Database connection failed",
      },
      503
    );
  }

  return c.json({
    status: "ready",
    timestamp: new Date().toISOString(),
  });
});
