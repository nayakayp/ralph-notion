import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules",
        "dist",
        "src/test/**",
        "**/*.d.ts",
        "**/*.config.*",
      ],
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/db": resolve(__dirname, "./src/db"),
      "@/routes": resolve(__dirname, "./src/routes"),
      "@/middleware": resolve(__dirname, "./src/middleware"),
      "@/validators": resolve(__dirname, "./src/validators"),
      "@/services": resolve(__dirname, "./src/services"),
      "@/utils": resolve(__dirname, "./src/utils"),
      "@/storage": resolve(__dirname, "./src/storage"),
      "@/types": resolve(__dirname, "./src/types"),
    },
  },
});
