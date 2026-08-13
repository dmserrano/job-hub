import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig sets `jsx: preserve` for Next to handle; tests need it compiled.
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      // Mirror the tsconfig `@/*` path so tests import UI code (server actions)
      // the same way the app does.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // Unit tests (`*.test.ts`) and integration tests (`*.integration.test.ts`);
    // only the latter need a running Postgres.
    include: ["src/**/*.test.ts"],
    // Injected before any module import, so the schema/client resolve to the
    // disposable tracker_test schema. dotenv (in env.ts) won't override it.
    env: {
      TRACKER_DB_SCHEMA: "tracker_test",
    },
    // Integration tests share one Postgres schema; keep files serial.
    fileParallelism: false,
  },
});
