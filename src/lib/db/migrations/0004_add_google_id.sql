ALTER TABLE "users" ADD COLUMN "google_id" varchar(255);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_google_id_unique" ON "users" ("google_id") WHERE "google_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_google_id_idx" ON "users" ("google_id");
