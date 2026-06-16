import 'dotenv/config';
import { db } from './db';
import { tenants, users, imoveis, leads, transacoes } from './schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

// ══════════════════════════════════════════
// IMÓVEIS FICTÍCIOS — FORTALEZA / CE
// ══════════════════════════════════════════
const imoveisDados = [
  {
    titulo: 'Apartamento Vista Mar no Meireles',
    slug: 'apartamento-vista-mar-meireles',
    tipo: 'venda',
    categoria: 'apartamento',
    preco: '480000',
    area: 98,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    bairro: 'Meireles',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Av. Beira Mar, 2150, Apto 801, Meireles, Fortaleza - CE',
    descricao: 'Apartamento de alto padrão com vista privilegiada para o Mar do Meireles. 98m², 3 quartos sendo 1 suíte, varanda gourmet com vista para a orla. Prédio com piscina, academia e salão de festas. Próximo a restaurantes, bares e ao calçadão da Beira Mar. Uma oportunidade única neste endereço nobre de Fortaleza!',
    capa: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687931-cebf0046b4e1?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18efc2291?w=800&q=80',
    ],
    destaque: true,
    status: 'disponivel',
  },
  {
    titulo: 'Apartamento Mobiliado para Alugar — Aldeota',
    slug: 'apartamento-mobiliado-aldeota',
    tipo: 'aluguel',
    categoria: 'apartamento',
    preco: '2800',
    area: 75,
    quartos: 2,
    banheiros: 2,
    vagas: 1,
    bairro: 'Aldeota',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Rua Tibúrcio Cavalcante, 320, Apto 502, Aldeota, Fortaleza - CE',
    descricao: 'Apartamento totalmente mobiliado e decorado com requinte na Aldeota, um dos bairros mais valorizados de Fortaleza. 75m², 2 quartos com armários planejados, sala ampla, cozinha equipada com fogão e geladeira. Condomínio com portaria 24h, academia e área de lazer. Pronto para morar!',
    capa: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    ],
    destaque: true,
    status: 'disponivel',
  },
  {
    titulo: 'Casa Moderna com Piscina — Cocó',
    slug: 'casa-moderna-piscina-coco',
    tipo: 'venda',
    categoria: 'casa',
    preco: '650000',
    area: 220,
    quartos: 4,
    banheiros: 3,
    vagas: 3,
    bairro: 'Cocó',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Rua Paulo Sarasate, 890, Cocó, Fortaleza - CE',
    descricao: 'Espetacular casa contemporânea no Cocó, a 10 minutos do Parque do Cocó. 220m² de área construída em terreno de 400m², com 4 quartos sendo 2 suítes, piscina privativa, área gourmet com churrasqueira e jardim paisagístico. Acabamentos premium, cozinha americana e automação residencial. Um imóvel de alto padrão para quem busca conforto e sofisticação em Fortaleza!',
    capa: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    ],
    destaque: true,
    status: 'disponivel',
  },
  {
    titulo: 'Casa Espaçosa para Alugar — Benfica',
    slug: 'casa-espacosa-aluguel-benfica',
    tipo: 'aluguel',
    categoria: 'casa',
    preco: '2200',
    area: 160,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    bairro: 'Benfica',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Rua Waldery Uchoa, 145, Benfica, Fortaleza - CE',
    descricao: 'Casa ampla no tradicional bairro do Benfica, próximo à UFC e ao Parque do Povo. 160m², 3 quartos, 2 banheiros, área de serviço, quintal e 2 vagas de garagem. Ideal para famílias ou estudantes universitários. Ótima localização, próximo a mercados, farmácias e transporte público.',
    capa: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    ],
    destaque: false,
    status: 'disponivel',
  },
  {
    titulo: 'Apartamento a 2 Quadras da Praia — Mucuripe',
    slug: 'apartamento-praia-mucuripe',
    tipo: 'venda',
    categoria: 'apartamento',
    preco: '390000',
    area: 82,
    quartos: 2,
    banheiros: 2,
    vagas: 1,
    bairro: 'Mucuripe',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Rua Coronel Linhares, 450, Apto 304, Mucuripe, Fortaleza - CE',
    descricao: 'Ótimo apartamento a apenas 2 quadras da Praia do Futuro e do Clube Náutico! 82m², 2 quartos sendo 1 suíte, varanda, sala de estar e jantar integradas. Prédio com playground, churrasqueira e salão de jogos. Excelente oportunidade para moradia ou investimento no lucrativo mercado de aluguel por temporada de Fortaleza.',
    capa: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    ],
    destaque: false,
    status: 'disponivel',
  },
  {
    titulo: 'Terreno Plano — Cambeba',
    slug: 'terreno-plano-cambeba',
    tipo: 'venda',
    categoria: 'terreno',
    preco: '220000',
    area: 360,
    quartos: 0,
    banheiros: 0,
    vagas: 0,
    bairro: 'Cambeba',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Rua Cel. Euclides Teles, Cambeba, Fortaleza - CE',
    descricao: 'Terreno plano de 360m² no bairro Cambeba, região em crescimento acelerado de Fortaleza. Ideal para construção de casa ou pequeno empreendimento. Toda a infraestrutura no local: asfalto, água, luz, esgoto e internet. Próximo ao Shopping Iguatemi e ao pólo empresarial do Cambeba. Documentação 100% regularizada. Não perca!',
    capa: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    ],
    destaque: false,
    status: 'disponivel',
  },
  {
    titulo: 'Loja Comercial para Alugar — Centro',
    slug: 'loja-comercial-aluguel-centro',
    tipo: 'aluguel',
    categoria: 'comercial',
    preco: '3500',
    area: 85,
    quartos: 0,
    banheiros: 2,
    vagas: 0,
    bairro: 'Centro',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Rua Guilherme Rocha, 1020, Loja 3, Centro, Fortaleza - CE',
    descricao: 'Ampla loja comercial de 85m² no coração do Centro de Fortaleza, ponto de altíssimo fluxo de pessoas. Pé direito alto de 3,5m, fachada de vidro, 2 banheiros, depósito e copa. Energia trifásica disponível. Ideal para comércio, serviços ou franquias. Rua com excelente visibilidade e acesso fácil ao transporte público.',
    capa: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
    ],
    destaque: false,
    status: 'disponivel',
  },
  {
    titulo: 'Casa em Condomínio Fechado — Bairro de Fátima',
    slug: 'casa-condominio-fatima',
    tipo: 'venda',
    categoria: 'casa',
    preco: '520000',
    area: 195,
    quartos: 4,
    banheiros: 3,
    vagas: 2,
    bairro: 'Fátima',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Rua Nunes Valente, 750, Cond. Solar de Fátima, Fátima, Fortaleza - CE',
    descricao: 'Bela casa em condomínio fechado e seguro no Bairro de Fátima. 195m² distribuídos em 4 quartos (2 suítes), sala com pé direito duplo, varanda com vista para área verde, cozinha planejada e área gourmet. Condomínio com portaria 24h, câmeras de segurança e área verde. Rua tranquila, próximo ao colégio Farias Brito e comércio.',
    capa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    ],
    destaque: false,
    status: 'disponivel',
  },
  {
    titulo: 'Apartamento Aconchegante — Parquelândia',
    slug: 'apartamento-parquelandia',
    tipo: 'aluguel',
    categoria: 'apartamento',
    preco: '1800',
    area: 65,
    quartos: 2,
    banheiros: 1,
    vagas: 1,
    bairro: 'Parquelândia',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Rua Eduardo Girão, 88, Apto 203, Parquelândia, Fortaleza - CE',
    descricao: 'Apartamento charmoso e bem localizado na Parquelândia, próximo ao Parque Adahil Barreto, ao Campus da UECE e ao Shopping Lojão do Lar. 65m², 2 quartos, banheiro social, sala com varanda, cozinha e área de serviço. Prédio com interfone e portão automático. Condomínio baixo e IPTU incluído no aluguel.',
    capa: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    ],
    destaque: false,
    status: 'disponivel',
  },
  {
    titulo: 'Casa Familiar — Messejana',
    slug: 'casa-familiar-messejana',
    tipo: 'venda',
    categoria: 'casa',
    preco: '310000',
    area: 140,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    bairro: 'Messejana',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Rua Cabo Mor Luís Moraes, 210, Messejana, Fortaleza - CE',
    descricao: 'Ótima casa no bairro de Messejana, área nobre da zona sul de Fortaleza, próximo ao Lagamar e ao Anel Viário. 140m² com 3 quartos, 2 banheiros, cozinha americana, sala ampla e quintal. Imóvel em excelente estado de conservação, com toda a estrutura para uma família grande. Fácil acesso às avenidas Maestro Lisboa e Bezerra de Menezes.',
    capa: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    ],
    destaque: false,
    status: 'disponivel',
  },
  {
    titulo: 'Apartamento com Brise — Praia de Iracema',
    slug: 'apartamento-brise-iracema',
    tipo: 'venda',
    categoria: 'apartamento',
    preco: '430000',
    area: 90,
    quartos: 2,
    banheiros: 2,
    vagas: 1,
    bairro: 'Praia de Iracema',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Rua dos Tabajaras, 650, Apto 1001, Praia de Iracema, Fortaleza - CE',
    descricao: 'Apartamento moderno com brise arquitetônico na icônica Praia de Iracema, o coração cultural e boêmio de Fortaleza. 90m², 2 quartos com suíte, varanda com vista parcial para o mar, acabamento de primeira linha. Perto do Estoril, Ponte dos Ingleses, Theatro José de Alencar e do Dragão do Mar. Perfeito para quem ama a energia de Fortaleza!',
    capa: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    ],
    destaque: false,
    status: 'disponivel',
  },
  {
    titulo: 'Cobertura Duplex de Luxo — Meireles',
    slug: 'cobertura-duplex-meireles',
    tipo: 'venda',
    categoria: 'apartamento',
    preco: '820000',
    area: 180,
    quartos: 4,
    banheiros: 4,
    vagas: 3,
    bairro: 'Meireles',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Av. Abolição, 3200, Cobertura, Meireles, Fortaleza - CE',
    descricao: 'Cobertura duplex exclusiva com vista panorâmica 360° no Meireles, o bairro mais valorizado de Fortaleza. 180m² distribuídos em 2 andares: 4 suítes, sala de estar, sala de jantar, sala de TV, bar, churrasqueira na varanda e jacuzzi privativo. Prédio ultra-moderno com spa, piscina com raia, coworking e concierge. Para quem busca o máximo em sofisticação!',
    capa: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18efc2291?w=800&q=80',
    ],
    destaque: false,
    status: 'disponivel',
  },
  {
    titulo: 'Casa Alto Padrão para Alugar — Aldeota',
    slug: 'casa-alto-padrao-aldeota',
    tipo: 'aluguel',
    categoria: 'casa',
    preco: '3200',
    area: 250,
    quartos: 4,
    banheiros: 3,
    vagas: 3,
    bairro: 'Aldeota',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Av. Santos Dumont, 4080, Aldeota, Fortaleza - CE',
    descricao: 'Casa de alto padrão para aluguel na exclusiva Aldeota. 250m² com 4 quartos (3 suítes), sala ampla com pé direito alto, piscina aquecida, área gourmet completa com churrasqueira e forno de pizza, jardim tropical e 3 vagas de garagem cobertas. Imóvel impecável, perfeito para executivos ou famílias exigentes. Portão eletrônico e sistema de câmeras.',
    capa: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    ],
    destaque: false,
    status: 'disponivel',
  },
  {
    titulo: 'Terreno Industrial — Eusébio',
    slug: 'terreno-industrial-eusebio',
    tipo: 'venda',
    categoria: 'terreno',
    preco: '180000',
    area: 500,
    quartos: 0,
    banheiros: 0,
    vagas: 0,
    bairro: 'Eusébio',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'CE-040, Km 18, Eusébio - CE',
    descricao: 'Excelente terreno de 500m² em Eusébio, município da Região Metropolitana de Fortaleza, próximo à CE-040 (rodovia do sol). Área em forte valorização, ideal para construção de galpão, depósito ou comércio. Infraestrutura completa, fácil acesso ao Aeroporto Internacional Pinto Martins e ao Porto do Mucuripe. Documentação 100% em ordem.',
    capa: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    ],
    destaque: false,
    status: 'disponivel',
  },
  {
    titulo: 'Apartamento Ensolarado — Cocó',
    slug: 'apartamento-ensolarado-coco',
    tipo: 'aluguel',
    categoria: 'apartamento',
    preco: '2500',
    area: 88,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    bairro: 'Cocó',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Rua Eliseu Uchoa Beco, 300, Apto 704, Cocó, Fortaleza - CE',
    descricao: 'Maravilhoso apartamento no Cocó, com andar alto e vista para a área verde do Parque Ecológico. 88m², 3 quartos sendo 1 suíte, sala de estar e jantar integradas, varanda ampla, cozinha planejada e 2 vagas de garagem. Condomínio com piscina, sauna, academia e playground. Localização excelente, próximo ao Shopping RioMar Fortaleza.',
    capa: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
    ],
    destaque: false,
    status: 'disponivel',
  },
  {
    titulo: 'Sala Comercial Moderna — Bairro de Fátima',
    slug: 'sala-comercial-fatima',
    tipo: 'venda',
    categoria: 'comercial',
    preco: '680000',
    area: 120,
    quartos: 0,
    banheiros: 2,
    vagas: 3,
    bairro: 'Fátima',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Av. Dom Luís, 500, Sala 1201, Bairro de Fátima, Fortaleza - CE',
    descricao: 'Sala comercial premium no 12º andar do imponente Edifício Dom Luís, um dos endereços corporativos mais cobiçados de Fortaleza. 120m² com piso elevado, forro removível e 3 vagas de garagem rotativas. Vista privilegiada para a cidade, ar-condicionado central e sistema de segurança 24h. Ideal para escritórios de advocacia, consultórios médicos ou sedes corporativas.',
    capa: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    ],
    destaque: false,
    status: 'disponivel',
  },
  {
    titulo: 'Casa em Condomínio — Edson Queiroz',
    slug: 'casa-condominio-edson-queiroz',
    tipo: 'venda',
    categoria: 'casa',
    preco: '420000',
    area: 165,
    quartos: 3,
    banheiros: 3,
    vagas: 2,
    bairro: 'Edson Queiroz',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Cond. Village Cocó, Rua Maria Tomásia, Edson Queiroz, Fortaleza - CE',
    descricao: 'Casa em condomínio horizontal fechado no Edson Queiroz, uma das áreas de maior crescimento de Fortaleza. 165m², 3 quartos sendo 2 suítes, sala de 2 ambientes, cozinha americana, varanda, quintal gramado e 2 vagas de garagem. Condomínio com guarita 24h, playground, quadra poliesportiva e área verde. A 5 minutos do Shopping RioMar e do Hospital do Coração.',
    capa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    ],
    destaque: false,
    status: 'vendido',
  },
  {
    titulo: 'Apartamento Sofisticado — Dionísio Torres',
    slug: 'apartamento-dionisio-torres',
    tipo: 'venda',
    categoria: 'apartamento',
    preco: '560000',
    area: 110,
    quartos: 3,
    banheiros: 3,
    vagas: 2,
    bairro: 'Dionísio Torres',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Rua Costa Barros, 1400, Apto 601, Dionísio Torres, Fortaleza - CE',
    descricao: 'Apartamento sofisticado em prédio de alto padrão no charmoso Dionísio Torres. 110m², 3 suítes, living amplo com varanda, cozinha gourmet com ilha central, banheiros com bancada em mármore e piso porcelanato 90x90. Decoração neutra e atemporal. Prédio com piscina aquecida, spa, coworking e pet place. A 10 min da Beira Mar.',
    capa: 'https://images.unsplash.com/photo-1600607687931-cebf0046b4e1?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18efc2291?w=800&q=80',
    ],
    destaque: false,
    status: 'vendido',
  },
  {
    titulo: 'Chácara para Lazer e Descanso — Maracanaú',
    slug: 'chacara-lazer-maracanau',
    tipo: 'venda',
    categoria: 'chacara',
    preco: '280000',
    area: 1200,
    quartos: 3,
    banheiros: 2,
    vagas: 5,
    bairro: 'Maracanaú',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Estr. do Jatobá, Km 3, Maracanaú - CE',
    descricao: 'Encantadora chácara de 1.200m² em Maracanaú, a apenas 20 minutos de Fortaleza. Casa sede com 3 quartos, 2 banheiros, varanda e churrasqueira, piscina grande com cascata, campo de futebol society, área de estacionamento para 5 carros e jardins bem cuidados. Poço artesiano e energia solar. Perfeita para finais de semana e eventos em família. Viva o melhor do interior cearense!',
    capa: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    ],
    destaque: false,
    status: 'disponivel',
  },
  {
    titulo: 'Kitnet Compacta e Confortável — Benfica',
    slug: 'kitnet-benfica',
    tipo: 'aluguel',
    categoria: 'apartamento',
    preco: '1200',
    area: 32,
    quartos: 1,
    banheiros: 1,
    vagas: 0,
    bairro: 'Benfica',
    cidade: 'Fortaleza',
    estado: 'CE',
    endereco: 'Rua Paulino Nogueira, 55, Kitnet 08, Benfica, Fortaleza - CE',
    descricao: 'Kitnet moderna e bem equipada no Benfica, bairro estudantil e boêmio de Fortaleza. 32m² planejados com inteligência: quarto com cama embutida, banheiro renovado, cozinha americana com fogão e microondas. Wi-Fi de alta velocidade incluso, água inclusa. A 5 minutos a pé da Universidade Federal do Ceará (UFC). Ideal para universitários ou profissionais em início de carreira.',
    capa: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
    galeria: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    ],
    destaque: false,
    status: 'alugado',
  },
];

// ══════════════════════════════════════════
// NOMES NORDESTINOS — LEADS E TRANSAÇÕES
// ══════════════════════════════════════════
const nomesClientes = [
  'Francisco das Chagas', 'Maria Aparecida', 'Antônio Neto', 'Francisca Bezerra',
  'José Raimundo', 'Ana Kátia', 'Raimundo Nonato', 'Cicera Lima',
  'João Batista', 'Edilene Sousa', 'Manoel Filho', 'Luzia Ferreira',
  'Pedro Henrique', 'Rosângela Melo', 'Severino Costa', 'Tereza Cristina',
  'Carlos Eduardo', 'Sandra Farias', 'Clodoaldo Pinto', 'Valdirene Gomes',
];

const nomesCorretores = ['Marcos Aurélio', 'Juliana Vasconcelos', 'Robério Sampaio', 'Gleice Nogueira'];

// ══════════════════════════════════════════
// FUNÇÃO PRINCIPAL
// ══════════════════════════════════════════
async function seed() {
  console.log('🌱 Iniciando Seed do Banco de Dados — Fortaleza/CE...\n');

  // 1. Verificar tenant existente
  let [tenant] = await db.select().from(tenants).limit(1);

  if (!tenant) {
    console.log('🏢 Nenhum tenant encontrado. Criando tenant de demonstração...');
    const tenantId = crypto.randomUUID();
    await db.insert(tenants).values({
      id: tenantId,
      nome_empresa: 'Arcanjo Imóveis',
      email: 'contato@arcanjoimoveis.com.br',
      whatsapp: '85999998888',
      ativo: true,
      cor_primaria: '#0d6efd',
      cor_primaria_dark: '#0056b3',
      endereco: 'Av. Beira Mar, 3000 - Meireles, Fortaleza - CE',
      horario: 'Seg-Sex: 8h às 18h | Sáb: 9h às 13h',
    });
    [tenant] = await db.select().from(tenants).limit(1);

    console.log('👤 Criando usuário admin...');
    const senhaHash = await bcrypt.hash('123456', 10);
    await db.insert(users).values({
      id: crypto.randomUUID(),
      nome: 'Admin Arcanjo',
      email: 'admin@arcanjoimoveis.com.br',
      password_hash: senhaHash,
      role: 'admin',
    });
    console.log('✅ Usuário admin criado: admin@arcanjoimoveis.com.br / 123456\n');
  } else {
    console.log(`🏢 Tenant existente: ${tenant.nome_empresa} (${tenant.id})\n`);
  }

  // ── OPÇÃO A: Limpar dados existentes (mantém tenant e usuário) ──
  console.log('🧹 Limpando dados existentes (transações → leads → imóveis)...');
  await db.delete(transacoes).where(eq(transacoes.tenant_id, tenant.id));
  await db.delete(leads).where(eq(leads.tenant_id, tenant.id));
  await db.delete(imoveis).where(eq(imoveis.tenant_id, tenant.id));
  console.log('✅ Dados limpos com sucesso!\n');

  // 2. Inserir os 20 imóveis de Fortaleza
  console.log('🏠 Inserindo 20 imóveis de Fortaleza/CE...');
  const imoveisInseridos: { id: string; preco: string; tipo: string; titulo: string }[] = [];

  for (const dados of imoveisDados) {
    const imovelId = crypto.randomUUID();
    await db.insert(imoveis).values({
      id: imovelId,
      tenant_id: tenant.id,
      ...dados,
      slug: `${dados.slug}-${Date.now()}`,
    });
    imoveisInseridos.push({ id: imovelId, preco: dados.preco, tipo: dados.tipo, titulo: dados.titulo });
    console.log(`  ✅ ${dados.titulo}`);
  }

  // 3. Inserir Leads realistas
  console.log('\n📞 Inserindo 20 leads...');
  const origens = ['whatsapp', 'imovel', 'contato', 'financie'];
  const statusLead = ['novo', 'novo', 'em_atendimento', 'convertido', 'novo', 'descartado'];

  for (let i = 0; i < 20; i++) {
    const imovelAssoc = imoveisInseridos[i % imoveisInseridos.length];
    const nome = nomesClientes[i];
    await db.insert(leads).values({
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      origem: origens[i % origens.length],
      nome,
      email: `${nome.split(' ')[0].toLowerCase()}${i + 1}@gmail.com`,
      whatsapp: `859${Math.floor(10000000 + Math.random() * 89999999)}`,
      mensagem: `Olá, tenho interesse no imóvel "${imovelAssoc.titulo}". Gostaria de agendar uma visita, por favor.`,
      imovel_id: i % 3 !== 0 ? imovelAssoc.id : null,
      status: statusLead[i % statusLead.length],
    });
  }
  console.log('  ✅ 20 leads inseridos!');

  // 4. Inserir Transações Financeiras (últimos 6 meses)
  console.log('\n💰 Inserindo histórico financeiro (últimos 6 meses)...');
  const imoveisParaTransacao = imoveisInseridos.filter(
    (_, idx) => imoveisDados[idx]?.status === 'vendido' || imoveisDados[idx]?.status === 'alugado' || idx < 10
  );

  for (let i = 1; i <= 12; i++) {
    const imovel = imoveisParaTransacao[i % imoveisParaTransacao.length];
    const valorNum = parseInt(imovel.preco);
    const comissao = 5;

    const d = new Date();
    d.setMonth(d.getMonth() - (i % 6));
    d.setDate(Math.floor(Math.random() * 28) + 1);

    await db.insert(transacoes).values({
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      imovel_id: imovel.id,
      tipo: imovel.tipo,
      valor: valorNum.toString(),
      comissao_percent: comissao.toString(),
      comissao_valor: ((valorNum * comissao) / 100).toString(),
      cliente_nome: nomesClientes[i % nomesClientes.length],
      corretor: nomesCorretores[i % nomesCorretores.length],
      status: 'concluida',
      data: d,
    });
  }
  console.log('  ✅ 12 transações inseridas!\n');

  console.log('🚀 Seed concluído! 20 imóveis de Fortaleza/CE populados com sucesso.');
  console.log('📌 Acesse /dashboard/imoveis para visualizar.\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
