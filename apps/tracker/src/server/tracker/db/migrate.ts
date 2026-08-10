import { requireDatabaseUrl } from "./env";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const url = requireDatabaseUrl();

const migrationsFolder = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../drizzle",
);

async function main() {
  const migrationClient = postgres(url, { max: 1 });
  try {
    await migrate(drizzle(migrationClient), { migrationsFolder });
    console.log(`Migrations applied from ${migrationsFolder}`);
  } finally {
    await migrationClient.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
