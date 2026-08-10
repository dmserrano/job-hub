import { requireDatabaseUrl, TRACKER_SCHEMA } from "./src/server/tracker/db/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/tracker/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: requireDatabaseUrl() },
  schemaFilter: [TRACKER_SCHEMA],
});
