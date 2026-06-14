import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { users, tenants } from './schema';
import { eq, and } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const TOKEN_EXPIRY = '30d';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// ── Hash de senha ──
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT ──
export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// ── Verifica se é o primeiro acesso (nenhum usuário cadastrado) ──
export async function isFirstAccess(): Promise<boolean> {
  const [user] = await db.select().from(users).limit(1);
  return !user;
}

// ── Registro (apenas no primeiro acesso) ──
export async function registrar(data: {
  nome: string;
  email: string;
  password: string;
  nome_empresa: string;
}) {
  // Garantir que só pode registrar se não houver usuário
  const primeiroAcesso = await isFirstAccess();
  if (!primeiroAcesso) {
    throw new Error('Já existe um administrador cadastrado.');
  }

  // Criar ou recuperar o tenant único (configuração da imobiliária)
  let [tenant] = await db.select().from(tenants).limit(1);
  if (!tenant) {
    const tenantId = crypto.randomUUID();
    await db.insert(tenants).values({
      id: tenantId,
      nome_empresa: data.nome_empresa,
    });
    [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  } else {
    // Atualizar nome da empresa se já existir o tenant
    await db.update(tenants).set({ nome_empresa: data.nome_empresa });
  }

  // Criar usuário admin
  const hash = await hashPassword(data.password);
  const userId = crypto.randomUUID();
  await db.insert(users).values({
    id: userId,
    nome: data.nome,
    email: data.email,
    password_hash: hash,
    role: 'admin',
  });
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  const token = createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, tenant, token };
}

// ── Login ──
export async function login(email: string, password: string) {
  const [user] = await db.select().from(users).where(
    and(eq(users.email, email), eq(users.ativo, true))
  ).limit(1);

  if (!user) throw new Error('Credenciais inválidas.');

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) throw new Error('Credenciais inválidas.');

  // Buscar tenant (configuração única)
  const [tenant] = await db.select().from(tenants).limit(1);

  const token = createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, tenant, token };
}

// ── Extrair auth do request ──
export function getAuthFromCookie(request: Request): JwtPayload | null {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(/vitrine_token=([^;]+)/);
  if (!match) return null;
  return verifyToken(match[1]);
}
