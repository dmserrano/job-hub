// Loads the repo-root .env regardless of cwd, so the same DB config serves the
// Next.js runtime, drizzle-kit, the migrate script, and the test harness.
// dotenv does not override variables already present in process.env, so values
// injected earlier (e.g. TRACKER_DB_SCHEMA=tracker_test in tests) win.
import { config } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function findEnvFile(start: string): string | undefined {
  let dir = start;
  for (;;) {
    const candidate = resolve(dir, ".env");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}

const envPath = findEnvFile(dirname(fileURLToPath(import.meta.url)));
if (envPath) config({ path: envPath, quiet: true });

// The schema the tracker service owns (ADR-0003). Defaults to `tracker`;
// integration tests inject TRACKER_DB_SCHEMA=tracker_test before import.
// Single source of this fact — read it here, don't re-inline the default.
export const TRACKER_SCHEMA = process.env.TRACKER_DB_SCHEMA ?? "tracker";

export function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set — copy .env.example to .env");
  }
  return url;
}
