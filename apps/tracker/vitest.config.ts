import { defineConfig } from "vitest/config";

export default defineConfig({
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
