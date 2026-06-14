CREATE TABLE "bancos_financiamento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"nome" varchar(200) NOT NULL,
	"logo_url" text,
	"link" text NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dominios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"dominio" varchar(300) NOT NULL,
	"verificado" boolean DEFAULT false NOT NULL,
	"ssl_ativo" boolean DEFAULT false NOT NULL,
	"txt_record" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dominios_dominio_unique" UNIQUE("dominio")
);
--> statement-breakpoint
CREATE TABLE "imoveis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"titulo" varchar(300) NOT NULL,
	"slug" varchar(300) NOT NULL,
	"tipo" varchar(20) NOT NULL,
	"categoria" varchar(50),
	"preco" numeric(12, 2) NOT NULL,
	"area" integer,
	"quartos" integer,
	"banheiros" integer,
	"vagas" integer,
	"bairro" varchar(200),
	"cidade" varchar(200),
	"estado" varchar(2),
	"endereco" text,
	"descricao" text,
	"capa" text,
	"galeria" jsonb DEFAULT '[]'::jsonb,
	"destaque" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'disponivel' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"nome" varchar(200) NOT NULL,
	"email" varchar(200),
	"whatsapp" varchar(20),
	"mensagem" text,
	"origem" varchar(100),
	"imovel_id" uuid,
	"status" varchar(20) DEFAULT 'novo' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome_empresa" varchar(200) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"creci" varchar(50),
	"whatsapp" varchar(20),
	"email" varchar(200),
	"instagram" varchar(300),
	"facebook" varchar(300),
	"endereco" text,
	"horario" varchar(200),
	"cor_primaria" varchar(9) DEFAULT '#0d6efd',
	"cor_primaria_dark" varchar(9) DEFAULT '#0056b3',
	"cor_escura" varchar(9) DEFAULT '#0f172a',
	"cor_texto" varchar(9) DEFAULT '#1f2937',
	"cor_muted" varchar(9) DEFAULT '#6b7280',
	"logo_url" text,
	"favicon_url" text,
	"hero_imagem" text,
	"hero_titulo" varchar(300) DEFAULT 'Encontre o imóvel dos seus sonhos',
	"hero_subtitulo" text,
	"hero_cta_venda" varchar(100) DEFAULT 'Ver imóveis à venda',
	"hero_cta_aluguel" varchar(100) DEFAULT 'Para alugar',
	"stat_imoveis" varchar(20) DEFAULT '500+',
	"stat_anos" varchar(20) DEFAULT '10+',
	"stat_clientes" varchar(20) DEFAULT '1.200+',
	"sobre_json" jsonb DEFAULT '{}'::jsonb,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "transacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tipo" varchar(20) NOT NULL,
	"imovel_id" uuid,
	"valor" numeric(12, 2) NOT NULL,
	"comissao_percent" numeric(5, 2),
	"comissao_valor" numeric(12, 2),
	"cliente_nome" varchar(200),
	"corretor" varchar(200),
	"status" varchar(20) DEFAULT 'pendente' NOT NULL,
	"data" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"nome" varchar(200) NOT NULL,
	"email" varchar(200) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(20) DEFAULT 'owner' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bancos_financiamento" ADD CONSTRAINT "bancos_financiamento_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dominios" ADD CONSTRAINT "dominios_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "imoveis" ADD CONSTRAINT "imoveis_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_imovel_id_imoveis_id_fk" FOREIGN KEY ("imovel_id") REFERENCES "public"."imoveis"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_imovel_id_imoveis_id_fk" FOREIGN KEY ("imovel_id") REFERENCES "public"."imoveis"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;