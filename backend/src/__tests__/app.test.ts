import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { ZodError, z } from "zod";
import { errorHandler } from "../middleware/error-handler";
import { AppError, BadRequestError, NotFoundError } from "../utils/errors";

describe("App Integration Tests", () => {
  describe("App Setup", () => {
    it("should create a Hono app instance", () => {
      const app = new Hono();
      expect(app).toBeDefined();
      expect(app.fetch).toBeDefined();
    });

    it("should register routes correctly", async () => {
      const app = new Hono();
      app.get("/test", (c) => c.json({ message: "test" }));

      const res = await app.request("/test");
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.message).toBe("test");
    });
  });

  describe("CORS Middleware", () => {
    it("should add CORS headers to responses", async () => {
      const app = new Hono();
      app.use(
        "*",
        cors({
          origin: ["http://localhost:3000"],
          allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
          allowHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
          exposeHeaders: ["X-Request-ID"],
          credentials: true,
          maxAge: 86400,
        })
      );
      app.get("/test", (c) => c.json({ message: "test" }));

      const res = await app.request("/test", {
        headers: {
          Origin: "http://localhost:3000",
        },
      });

      expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:3000"
      );
      expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    });

    it("should handle OPTIONS preflight requests", async () => {
      const app = new Hono();
      app.use(
        "*",
        cors({
          origin: ["http://localhost:3000"],
          allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
          allowHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
          credentials: true,
          maxAge: 86400,
        })
      );
      app.get("/test", (c) => c.json({ message: "test" }));

      const res = await app.request("/test", {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:3000",
          "Access-Control-Request-Method": "POST",
        },
      });

      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    });

    it("should block requests from unauthorized origins", async () => {
      const app = new Hono();
      app.use(
        "*",
        cors({
          origin: ["http://localhost:3000"],
        })
      );
      app.get("/test", (c) => c.json({ message: "test" }));

      const res = await app.request("/test", {
        headers: {
          Origin: "http://malicious-site.com",
        },
      });

      // CORS doesn't block requests, but won't add the Allow-Origin header
      expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });
  });

  describe("Error Handler Middleware", () => {
    let app: Hono;

    beforeEach(() => {
      app = new Hono();
      app.onError(errorHandler);
    });

    it("should handle ZodError validation errors", async () => {
      app.get("/test", () => {
        const schema = z.object({
          name: z.string().min(3),
        });
        schema.parse({ name: "ab" }); // This will throw ZodError
        throw new Error("Should not reach here");
      });

      const res = await app.request("/test");
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("VALIDATION_ERROR");
      expect(json.error.message).toBe("Validation failed");
      expect(json.error.details).toBeDefined();
      expect(Array.isArray(json.error.details)).toBe(true);
    });

    it("should handle AppError with custom status code", async () => {
      app.get("/test", () => {
        throw new BadRequestError("Invalid input", { field: "email" });
      });

      const res = await app.request("/test");
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("BAD_REQUEST");
      expect(json.error.message).toBe("Invalid input");
      expect(json.error.details).toEqual({ field: "email" });
    });

    it("should handle NotFoundError", async () => {
      app.get("/test", () => {
        throw new NotFoundError("User");
      });

      const res = await app.request("/test");
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("NOT_FOUND");
      expect(json.error.message).toBe("User not found");
    });

    it("should handle HTTPException from Hono", async () => {
      app.get("/test", () => {
        throw new HTTPException(401, { message: "Invalid token" });
      });

      const res = await app.request("/test");
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("HTTP_ERROR");
      expect(json.error.message).toBe("Invalid token");
    });

    it("should handle unknown errors with 500 status", async () => {
      app.get("/test", () => {
        throw new Error("Something went wrong");
      });

      const res = await app.request("/test");
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });

  describe("404 Not Found Handler", () => {
    it("should return 404 for non-existent routes", async () => {
      const app = new Hono();
      app.get("/existing", (c) => c.json({ message: "exists" }));
      app.notFound((c) => {
        return c.json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "The requested resource was not found",
            },
          },
          404
        );
      });

      const res = await app.request("/non-existent");
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("NOT_FOUND");
      expect(json.error.message).toBe("The requested resource was not found");
    });

    it("should return 404 for wrong HTTP methods", async () => {
      const app = new Hono();
      app.get("/test", (c) => c.json({ message: "test" }));
      app.notFound((c) => {
        return c.json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "The requested resource was not found",
            },
          },
          404
        );
      });

      const res = await app.request("/test", { method: "DELETE" });
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error.code).toBe("NOT_FOUND");
    });
  });

  describe("Response Format", () => {
    it("should return JSON responses", async () => {
      const app = new Hono();
      app.get("/test", (c) => c.json({ data: "test" }));

      const res = await app.request("/test");

      expect(res.headers.get("Content-Type")).toContain("application/json");
    });

    it("should support different status codes", async () => {
      const app = new Hono();
      app.post("/created", (c) => c.json({ id: 1 }, 201));
      app.delete("/deleted", (c) => c.body(null, 204));

      const createRes = await app.request("/created", { method: "POST" });
      expect(createRes.status).toBe(201);

      const deleteRes = await app.request("/deleted", { method: "DELETE" });
      expect(deleteRes.status).toBe(204);
    });
  });
});
