CREATE TYPE "tracker"."application_status" AS ENUM('Saved', 'Applied', 'Screen', 'Interview', 'Offer', 'Closed');--> statement-breakpoint
CREATE TABLE "tracker"."applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"company_name" text NOT NULL,
	"company_link" text,
	"role_title" text NOT NULL,
	"role_posting_link" text,
	"role_location" text,
	"role_comp" text,
	"status" "tracker"."application_status" DEFAULT 'Saved' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
