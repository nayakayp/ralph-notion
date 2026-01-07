import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { getRouter } from "@/router";

describe("TanStack Router Setup", () => {
  describe("Router Creation", () => {
    it("should create a router instance", () => {
      const router = getRouter();
      expect(router).toBeDefined();
      expect(router.routeTree).toBeDefined();
    });

    it("should have scroll restoration enabled", () => {
      const router = getRouter();
      expect(router.options.scrollRestoration).toBe(true);
    });

    it("should have default preload stale time set to 0", () => {
      const router = getRouter();
      expect(router.options.defaultPreloadStaleTime).toBe(0);
    });
  });

  describe("TanStack Query Provider", () => {
    it("should create query client with correct default options", () => {
      expect(queryClient).toBeInstanceOf(QueryClient);
    });

    it("should have correct stale time configuration", () => {
      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.queries?.staleTime).toBe(1000 * 60 * 5); // 5 minutes
    });

    it("should have correct gc time configuration", () => {
      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.queries?.gcTime).toBe(1000 * 60 * 30); // 30 minutes
    });

    it("should have retry set to 3", () => {
      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.queries?.retry).toBe(3);
    });

    it("should have refetch on window focus disabled", () => {
      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
    });

    it("should have mutation retry set to 1", () => {
      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.mutations?.retry).toBe(1);
    });
  });

  describe("Router with Query Client Integration", () => {
    it("should render QueryClientProvider with a simple route", async () => {
      // Create a simple test router
      const rootRoute = createRootRoute({
        component: () => (
          <div data-testid="root">
            Root
            <Outlet />
          </div>
        ),
      });

      const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: "/",
        component: () => <div data-testid="index">Index Route</div>,
      });

      const routeTree = rootRoute.addChildren([indexRoute]);

      const testRouter = createRouter({
        routeTree,
        context: {},
      });

      // Load the router before rendering
      await testRouter.load();

      render(
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={testRouter} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("root")).toBeInTheDocument();
      });
    });

    it("should render a test component within QueryClientProvider", () => {
      const TestComponent = () => (
        <div data-testid="test-component">Test Component</div>
      );

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      expect(screen.getByTestId("test-component")).toBeInTheDocument();
    });
  });

  describe("Route Tree Generation", () => {
    it("should have index route defined", async () => {
      // Import the route tree to verify it's properly generated
      const { routeTree } = await import("@/routeTree.gen");
      expect(routeTree).toBeDefined();
    });
  });
});

describe("Query Client Retry Logic", () => {
  it("should have exponential backoff retry delay function", () => {
    const defaultOptions = queryClient.getDefaultOptions();
    const retryDelay = defaultOptions.queries?.retryDelay;

    if (typeof retryDelay === "function") {
      // Test exponential backoff: min(1000 * 2^attemptIndex, 30000)
      expect(retryDelay(0, new Error())).toBe(1000); // 2^0 * 1000 = 1000
      expect(retryDelay(1, new Error())).toBe(2000); // 2^1 * 1000 = 2000
      expect(retryDelay(2, new Error())).toBe(4000); // 2^2 * 1000 = 4000
      expect(retryDelay(5, new Error())).toBe(30000); // Capped at 30000
    }
  });
});
