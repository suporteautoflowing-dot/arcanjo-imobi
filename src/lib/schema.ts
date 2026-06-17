import { mysqlTable, varchar, text, boolean, int, timestamp, json, decimal } from 'drizzle-orm/mysql-core';

// ══════════════════════════════════════════
// CONFIGURAÇÃO DA IMOBILIÁRIA (single-tenant)
// ══════════════════════════════════════════
export const tenants = mysqlTable('tenants', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  nome_empresa: varchar('nome_empresa', { length: 200 }).notNull(),
  creci: varchar('creci', { length: 50 }),
  whatsapp: varchar('whatsapp', { length: 20 }),
  email: varchar('email', { length: 200 }),
  instagram: varchar('instagram', { length: 300 }),
  facebook: varchar('facebook', { length: 300 }),
  endereco: text('endereco'),
  horario: varchar('horario', { length: 200 }),

  // Personalização visual
  cor_primaria: varchar('cor_primaria', { length: 9 }).default('#0d6efd'),
  cor_primaria_dark: varchar('cor_primaria_dark', { length: 9 }).default('#0056b3'),
  cor_escura: varchar('cor_escura', { length: 9 }).default('#0f172a'),
  cor_texto: varchar('cor_texto', { length: 9 }).default('#1f2937'),
  cor_muted: varchar('cor_muted', { length: 9 }).default('#6b7280'),
  logo_url: text('logo_url'),
  favicon_url: text('favicon_url'),
  hero_imagem: text('hero_imagem'),

  // Banner / Hero
  hero_titulo: varchar('hero_titulo', { length: 300 }).default('Encontre o imóvel dos seus sonhos'),
  hero_subtitulo: text('hero_subtitulo'),
  hero_cta_venda: varchar('hero_cta_venda', { length: 100 }).default('Ver imóveis à venda'),
  hero_cta_aluguel: varchar('hero_cta_aluguel', { length: 100 }).default('Para alugar'),
  stat_imoveis: varchar('stat_imoveis', { length: 20 }).default('500+'),
  stat_anos: varchar('stat_anos', { length: 20 }).default('10+'),
  stat_clientes: varchar('stat_clientes', { length: 20 }).default('1.200+'),

  // Sobre
  sobre_json: json('sobre_json'),

  ativo: boolean('ativo').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});


// ══════════════════════════════════════════
// USUÁRIOS
// ══════════════════════════════════════════
export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  nome: varchar('nome', { length: 200 }).notNull(),
  email: varchar('email', { length: 200 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('admin'),
  ativo: boolean('ativo').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// ══════════════════════════════════════════
// IMÓVEIS
// ══════════════════════════════════════════
export const imoveis = mysqlTable('imoveis', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  titulo: varchar('titulo', { length: 300 }).notNull(),
  slug: varchar('slug', { length: 300 }).notNull(),
  tipo: varchar('tipo', { length: 20 }).notNull(), // venda, aluguel
  categoria: varchar('categoria', { length: 50 }), // casa, apartamento, terreno, etc.
  preco: decimal('preco', { precision: 12, scale: 2 }).notNull(),
  area: int('area'),
  quartos: int('quartos'),
  banheiros: int('banheiros'),
  vagas: int('vagas'),
  bairro: varchar('bairro', { length: 200 }),
  cidade: varchar('cidade', { length: 200 }),
  estado: varchar('estado', { length: 2 }),
  endereco: text('endereco'),
  descricao: text('descricao'),
  capa: text('capa'),
  galeria: json('galeria'),
  destaque: boolean('destaque').notNull().default(false),
  status: varchar('status', { length: 20 }).notNull().default('disponivel'), // disponivel, vendido, alugado, inativo
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// ══════════════════════════════════════════
// LEADS
// ══════════════════════════════════════════
export const leads = mysqlTable('leads', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  nome: varchar('nome', { length: 200 }).notNull(),
  email: varchar('email', { length: 200 }),
  whatsapp: varchar('whatsapp', { length: 20 }),
  mensagem: text('mensagem'),
  origem: varchar('origem', { length: 100 }), // contato, imovel, whatsapp, financie
  imovel_id: varchar('imovel_id', { length: 36 }).references(() => imoveis.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 20 }).notNull().default('novo'), // novo, em_atendimento, convertido, descartado
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// ══════════════════════════════════════════
// TRANSAÇÕES FINANCEIRAS
// ══════════════════════════════════════════
export const transacoes = mysqlTable('transacoes', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  tipo: varchar('tipo', { length: 20 }).notNull(), // venda, aluguel
  imovel_id: varchar('imovel_id', { length: 36 }).references(() => imoveis.id, { onDelete: 'set null' }),
  valor: decimal('valor', { precision: 12, scale: 2 }).notNull(),
  comissao_percent: decimal('comissao_percent', { precision: 5, scale: 2 }),
  comissao_valor: decimal('comissao_valor', { precision: 12, scale: 2 }),
  cliente_nome: varchar('cliente_nome', { length: 200 }),
  corretor: varchar('corretor', { length: 200 }),
  status: varchar('status', { length: 20 }).notNull().default('pendente'), // pendente, concluida, cancelada
  data: timestamp('data').notNull().defaultNow(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// ══════════════════════════════════════════
// BANCOS FINANCIAMENTO (por tenant)
// ══════════════════════════════════════════
export const bancos_financiamento = mysqlTable('bancos_financiamento', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  nome: varchar('nome', { length: 200 }).notNull(),
  logo_url: text('logo_url'),
  link: text('link').notNull(),
  ordem: int('ordem').notNull().default(0),
});
