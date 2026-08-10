// Integration-test DB harness. Applies the real drizzle-kit migrations into a
// disposable schema (tracker_test, set by vitest.config.ts) and resets it
// between tests, so tests exercise real Postgres persistence — never mocks.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "../src/server/tracker/db/client";
import { TRACKER_SCHEMA } from "../src/server/tracker/db/env";

const schemaName = TRACKER_SCHEMA;
const migrationsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../drizzle",
);

// The generated migrations are schema-qualified for the default `tracker`
// schema. Rewrite only the schema declaration (CREATE/DROP/ALTER SCHEMA
// "tracker") and schema-qualified references ("tracker".) so the same DDL
// builds the test schema — keeping the migration files the single source of
// truth without corrupting any future column/value that happens to read
// "tracker" for an unrelated reason.
function retargetSchema(sqlText: string): string {
  return sqlText
    .replaceAll('SCHEMA "tracker"', `SCHEMA "${schemaName}"`)
    .replaceAll('"tracker".', `"${schemaName}".`);
}

/** Drop and rebuild the test schema from the committed migrations. */
export async function migrateTestSchema(): Promise<void> {
  await sql.unsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const raw = readFileSync(resolve(migrationsDir, file), "utf8");
    const statements = retargetSchema(raw)
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const statement of statements) {
      await sql.unsafe(statement);
    }
  }
}

/** Empty every table in the test schema between tests. */
export async function resetTestSchema(): Promise<void> {
  const rows = await sql<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = ${schemaName}
  `;
  if (rows.length === 0) return;
  const targets = rows
    .map((r) => `"${schemaName}"."${r.tablename}"`)
    .join(", ");
  await sql.unsafe(`TRUNCATE ${targets} RESTART IDENTITY CASCADE`);
}

/** Close the shared connection pool once the suite finishes. */
export async function closeTestDb(): Promise<void> {
  await sql.end();
}
