import { configDefaults, defineConfig } from "vitest/config";
import * as path from "path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    exclude: [...configDefaults.exclude, "**/tests/**"],
    clearMocks: true,
  },
});
