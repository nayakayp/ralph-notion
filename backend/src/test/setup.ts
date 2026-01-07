import { beforeAll, afterAll, vi } from "vitest";

// Set test environment
process.env.NODE_ENV = "test";
process.env.PORT = "3099";
process.env.CORS_ORIGIN = "http://localhost:3000";

// Mock the database connection for testing
vi.mock("../db", () => ({
  db: {},
  checkDatabaseConnection: vi.fn().mockResolvedValue(true),
  getMigrationClient: vi.fn(),
}));

// Mock console.error to prevent cluttering test output
beforeAll(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});
