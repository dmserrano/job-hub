import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Mirror the tsconfig `@/*` path so tests import UI code (server actions)
      // the same way the app does.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    // Injected before any module import, so the schema/client resolve to the
    // disposable tracker_test schema. dotenv (in env.ts) won't override it.
    env: {
      TRACKER_DB_SCHEMA: "tracker_test",
    },
    // Integration tests share one Postgres schema; keep files serial.
    fileParallelism: false,
  },
});
