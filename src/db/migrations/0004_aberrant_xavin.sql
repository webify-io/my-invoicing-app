ALTER TABLE "customers" RENAME COLUMN "description" TO "name";--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "email" text NOT NULL;