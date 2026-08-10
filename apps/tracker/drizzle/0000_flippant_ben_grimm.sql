CREATE SCHEMA "tracker";
--> statement-breakpoint
CREATE TABLE "tracker"."connection_probe" (
	"id" serial PRIMARY KEY NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
