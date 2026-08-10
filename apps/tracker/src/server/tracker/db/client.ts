import { requireDatabaseUrl } from "./env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = requireDatabaseUrl();

// Reuse one connection pool across Next.js dev hot-reloads and test files.
const globalForDb = globalThis as unknown as {
  __trackerSql?: ReturnType<typeof postgres>;
};

export const sql = globalForDb.__trackerSql ?? postgres(url, { max: 10 });
if (process.env.NODE_ENV !== "production") {
  globalForDb.__trackerSql = sql;
}

export const db = drizzle(sql, { schema });
