import { TRACKER_SCHEMA } from "./env";
import { pgSchema, serial, text, timestamp } from "drizzle-orm/pg-core";

// The tracker service owns a dedicated schema (ADR-0003). The name is
// configurable so integration tests can target a disposable tracker_test schema.
export const trackerSchema = pgSchema(TRACKER_SCHEMA);

// Minimal infrastructure table that proves connection + schema + migration
// wiring end-to-end (issue #2). The real domain tables (Application and its
// Activity log) arrive in #3; this is intentionally not a domain concept.
export const connectionProbe = trackerSchema.table("connection_probe", {
  id: serial("id").primaryKey(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type ConnectionProbe = typeof connectionProbe.$inferSelect;
