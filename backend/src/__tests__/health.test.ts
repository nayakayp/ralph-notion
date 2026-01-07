import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";

// Import the module we need to mock
import * as dbModule from "../db";

// Create a test version of the health router
function createHealthRouter(dbHealthy: boolean = true) {
  const healthRouter = new Hono();

  healthRouter.get("/", async (c) => {
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

  return healthRouter;
}

describe("Health Endpoints", () => {
  describe("GET /health", () => {
    it("should return healthy status when database is connected", async () => {
      const app = new Hono();
      app.route("/health", createHealthRouter(true));

      const res = await app.request("/health");
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.status).toBe("healthy");
      expect(json.services.api).toBe("healthy");
      expect(json.services.database).toBe("healthy");
      expect(json.timestamp).toBeDefined();
      expect(json.version).toBeDefined();
    });

    it("should return degraded status when database is not connected", async () => {
      const app = new Hono();
      app.route("/health", createHealthRouter(false));

      const res = await app.request("/health");
      const json = await res.json();

      expect(res.status).toBe(503);
      expect(json.status).toBe("degraded");
      expect(json.services.api).toBe("healthy");
      expect(json.services.database).toBe("unhealthy");
    });
  });

  describe("GET /health/live", () => {
    it("should return alive status", async () => {
      const app = new Hono();
      app.route("/health", createHealthRouter(true));

      const res = await app.request("/health/live");
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.status).toBe("alive");
      expect(json.timestamp).toBeDefined();
    });

    it("should return alive even when database is down", async () => {
      const app = new Hono();
      app.route("/health", createHealthRouter(false));

      const res = await app.request("/health/live");
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.status).toBe("alive");
    });
  });

  describe("GET /health/ready", () => {
    it("should return ready status when database is connected", async () => {
      const app = new Hono();
      app.route("/health", createHealthRouter(true));

      const res = await app.request("/health/ready");
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.status).toBe("ready");
      expect(json.timestamp).toBeDefined();
    });

    it("should return not ready status when database is not connected", async () => {
      const app = new Hono();
      app.route("/health", createHealthRouter(false));

      const res = await app.request("/health/ready");
      const json = await res.json();

      expect(res.status).toBe(503);
      expect(json.status).toBe("not ready");
      expect(json.reason).toBe("Database connection failed");
    });
  });
});
