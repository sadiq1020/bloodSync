import { defineConfig } from "vitest/config";

// Vitest config: runs tests in src/tests/, uses Node environment, no globals
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/tests/**/*.test.ts"],
  },
});
