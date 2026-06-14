ALTER TABLE "dominios" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "dominios" CASCADE;--> statement-breakpoint
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_slug_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'admin';--> statement-breakpoint
ALTER TABLE "tenants" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "tenant_id";