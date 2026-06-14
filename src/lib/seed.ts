import 'dotenv/config';
import { db } from './db';
import { tenants, users, imoveis, leads, transacoes } from './schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Iniciando Seed do Banco de Dados...');

  // 1. Verificar se já existe um tenant (para não quebrar logins existentes)
  let [tenant] = await db.select().from(tenants).limit(1);

  if (!tenant) {
    console.log('🏢 Nenhum tenant encontrado. Criando tenant de demonstração...');
    const tenantId = crypto.randomUUID();
    await db.insert(tenants).values({
      id: tenantId,
      nome_empresa: 'Imobiliária Demo Pro',
      email: 'contato@demoimob.com.br',
      whatsapp: '11999999999',
      ativo: true,
      cor_primaria: '#0d6efd',
      cor_primaria_dark: '#0056b3',
    });
    [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));

    console.log('👤 Criando usuário admin...');
    const senhaHash = await bcrypt.hash('123456', 10);
    await db.insert(users).values({
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      nome: 'Admin Demo',
      email: 'admin@demo.com',
      password_hash: senhaHash,
      role: 'admin'
    });
    console.log('✅ Usuário admin criado (admin@demo.com / 123456)');
  } else {
    console.log(`🏢 Utilizando tenant existente: ${tenant.nome_empresa} (${tenant.id})`);
  }

  // 2. Criar Imóveis
  console.log('🏠 Inserindo imóveis...');
  const imoveisIds: string[] = [];
  const categorias = ['apartamento', 'casa', 'casa', 'terreno', 'comercial', 'apartamento', 'chacara'];
  const tipos = ['venda', 'venda', 'aluguel', 'venda', 'aluguel', 'venda', 'venda'];

  for (let i = 1; i <= 15; i++) {
    const cat = categorias[i % categorias.length];
    const tipo = tipos[i % tipos.length];
    const imovelId = crypto.randomUUID();
    await db.insert(imoveis).values({
      id: imovelId,
      tenant_id: tenant.id,
      titulo: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Modelo Premium ${i}`,
      slug: `${cat}-modelo-premium-${i}-${Date.now()}`,
      tipo: tipo,
      status: i % 5 === 0 ? 'vendido' : (i % 7 === 0 ? 'alugado' : 'disponivel'),
      preco: (tipo === 'venda' ? (150000 + i * 50000) : (1500 + i * 200)).toString(),
      categoria: cat,
      area: 50 + i * 15,
      quartos: (i % 4) + 1,
      banheiros: (i % 3) + 1,
      vagas: (i % 3),
      bairro: ['Centro', 'Jardins', 'Vila Nova', 'Pinheiros', 'Moema'][i % 5],
      cidade: 'São Paulo',
      estado: 'SP',
      descricao: 'Imóvel excelente, recém reformado, ótima localização. Perto de supermercados e farmácias. Venha conferir essa oportunidade única!',
      capa: `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80`,
      galeria: [
        `https://images.unsplash.com/photo-1600607687931-cebf0046b4e1?w=800&q=80`,
        `https://images.unsplash.com/photo-1600566753086-00f18efc2291?w=800&q=80`
      ],
      destaque: i <= 3,
    });
    imoveisIds.push(imovelId);
  }

  // Buscar imóveis inseridos para usar nos leads/transações
  const imoveisInseridos = await db.select().from(imoveis).where(eq(imoveis.tenant_id, tenant.id));

  // 3. Criar Leads
  console.log('📞 Inserindo leads...');
  const origens = ['whatsapp', 'imovel', 'contato', 'financie'];
  const statusLead = ['novo', 'em_atendimento', 'convertido', 'novo'];

  for (let i = 1; i <= 20; i++) {
    const imovelSorteado = imoveisInseridos[i % imoveisInseridos.length];
    await db.insert(leads).values({
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      origem: origens[i % origens.length],
      nome: `Cliente Interessado ${i}`,
      email: `cliente${i}@email.com`,
      whatsapp: `119${Math.floor(10000000 + Math.random() * 90000000)}`,
      mensagem: `Olá, tenho interesse no imóvel ${imovelSorteado.titulo}. Podemos agendar uma visita?`,
      imovel_id: i % 2 === 0 ? imovelSorteado.id : null,
      status: statusLead[i % statusLead.length],
    });
  }

  // 4. Criar Transações Financeiras
  console.log('💰 Inserindo histórico financeiro...');
  for (let i = 1; i <= 12; i++) {
    const imovelSorteado = imoveisInseridos[i % imoveisInseridos.length];
    const valorNum = parseInt(imovelSorteado.preco);
    const comissao = 5;

    // Distribuir datas nos últimos 6 meses
    const d = new Date();
    d.setMonth(d.getMonth() - (i % 6));
    d.setDate(Math.floor(Math.random() * 28) + 1);

    await db.insert(transacoes).values({
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      imovel_id: imovelSorteado.id,
      tipo: imovelSorteado.tipo,
      valor: valorNum.toString(),
      comissao_percent: comissao.toString(),
      comissao_valor: ((valorNum * comissao) / 100).toString(),
      cliente_nome: `Comprador ${i}`,
      corretor: i % 2 === 0 ? 'Carlos Silva' : 'Ana Costa',
      status: 'concluida',
      data: d,
    });
  }

  console.log('🚀 Seed concluído com sucesso! Verifique o painel administrativo.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
