import { Hono } from "hono";

// Import route modules
// import { usersRouter } from "./users";
// import { workspacesRouter } from "./workspaces";
// import { pagesRouter } from "./pages";

export const apiRouter = new Hono();

// API version prefix
const v1 = new Hono();

// Mount route modules
// v1.route("/users", usersRouter);
// v1.route("/workspaces", workspacesRouter);
// v1.route("/pages", pagesRouter);

// Root API info
v1.get("/", (c) => {
  return c.json({
    success: true,
    data: {
      name: "NotionV2 Clone API",
      version: "1.0.0",
      documentation: "/api/v1/docs",
    },
  });
});

// Mount v1 routes
apiRouter.route("/v1", v1);

// Default route for /api
apiRouter.get("/", (c) => {
  return c.json({
    success: true,
    data: {
      message: "Welcome to NotionV2 Clone API",
      availableVersions: ["/api/v1"],
    },
  });
});
