CREATE TABLE "event_store" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stream_id" varchar(255) NOT NULL,
	"version" integer NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"previous_hash" varchar(64) NOT NULL,
	"signature" varchar(512),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_drive_auth" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guru_id" uuid NOT NULL,
	"refresh_token_encrypted" text NOT NULL,
	"google_email" varchar(255),
	"drive_folder_id" varchar(255),
	"status" varchar(20) DEFAULT 'AKTIF' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "google_drive_auth_guru_id_unique" UNIQUE("guru_id")
);
--> statement-breakpoint
CREATE TABLE "teacher_readiness_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guru_id" uuid NOT NULL,
	"tri_score" real NOT NULL,
	"komponen" jsonb NOT NULL,
	"snapshot_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "google_drive_auth" ADD CONSTRAINT "google_drive_auth_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_readiness_snapshot" ADD CONSTRAINT "teacher_readiness_snapshot_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_store_stream_idx" ON "event_store" USING btree ("stream_id","version");--> statement-breakpoint
CREATE INDEX "event_store_event_type_idx" ON "event_store" USING btree ("event_type","created_at");--> statement-breakpoint
CREATE INDEX "tri_guru_date_idx" ON "teacher_readiness_snapshot" USING btree ("guru_id","snapshot_date");
