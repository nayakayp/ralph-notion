import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { compress } from "hono/compress";
import { secureHeaders } from "hono/secure-headers";
import { requestId } from "hono/request-id";

import { errorHandler } from "./middleware/error-handler";
import { healthRouter } from "./routes/health";
import { apiRouter } from "./routes/index";
import { env } from "./utils/env";

const app = new Hono();

// Global middleware
app.use("*", requestId());
app.use("*", logger());
app.use("*", secureHeaders());
app.use("*", compress());
app.use(
  "*",
  cors({
    origin: env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
    exposeHeaders: ["X-Request-ID"],
    credentials: true,
    maxAge: 86400,
  })
);

// Error handler
app.onError(errorHandler);

// Routes
app.route("/health", healthRouter);
app.route("/api", apiRouter);

// 404 handler
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

const port = parseInt(env.PORT || "3001", 10);

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
export type AppType = typeof app;
