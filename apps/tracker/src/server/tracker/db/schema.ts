import { TRACKER_SCHEMA } from "./env";
import { pgSchema, serial, text, timestamp } from "drizzle-orm/pg-core";

// The tracker service owns a dedicated schema (ADR-0003). The name is
// configurable so integration tests can target a disposable tracker_test schema.
export const trackerSchema = pgSchema(TRACKER_SCHEMA);

// Where an Application sits in the pipeline (CONTEXT.md glossary). Kept in the
// tracker schema alongside the table that uses it.
export const APPLICATION_STATUSES = [
  "Saved",
  "Applied",
  "Screen",
  "Interview",
  "Offer",
  "Closed",
] as const;

export const applicationStatus = trackerSchema.enum(
  "application_status",
  APPLICATION_STATUSES,
);

// The central entity: one row per role being pursued (CONTEXT.md glossary).
// Owner-scoped from day one (ADR-0001). Company and Role are lightweight
// embedded fields for now rather than their own tables.
export const applications = trackerSchema.table("applications", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull(),

  // Company (embedded, lightweight — CONTEXT.md).
  companyName: text("company_name").notNull(),
  companyLink: text("company_link"),

  // Role (embedded, lightweight — CONTEXT.md).
  roleTitle: text("role_title").notNull(),
  rolePostingLink: text("role_posting_link"),
  roleLocation: text("role_location"),
  roleComp: text("role_comp"),

  status: applicationStatus("status").notNull().default("Saved"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type ApplicationRow = typeof applications.$inferSelect;
export type NewApplicationRow = typeof applications.$inferInsert;
