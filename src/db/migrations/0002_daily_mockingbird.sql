CREATE TABLE IF NOT EXISTS "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"createTs" timestamp DEFAULT now() NOT NULL,
	"amount" integer NOT NULL,
	"description" text NOT NULL,
	"userId" text NOT NULL,
	"status" "status" NOT NULL
);
