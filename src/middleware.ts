import { defineMiddleware } from 'astro:middleware';
import { getAuthFromCookie } from './lib/auth';
import { db } from './lib/db';
import { tenants } from './lib/schema';

export const onRequest = defineMiddleware(async ({ request, locals, url, redirect }, next) => {
  const pathname = url.pathname;

  // ── Rotas de API e assets não precisam de tenant ──
  if (
    pathname.startsWith('/_') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/uploads/') ||
    pathname.startsWith('/images/') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.svg')
  ) {
    return next();
  }

  // ── Carregar tenant único (configuração da imobiliária) ──
  const [tenant] = await db.select().from(tenants).limit(1);
  (locals as any).tenant = tenant ?? null;

  // ── Auth (para rotas do dashboard) ──
  const auth = getAuthFromCookie(request);
  (locals as any).auth = auth;

  // ── Proteger rotas do dashboard ──
  if (pathname.startsWith('/dashboard')) {
    if (!auth) {
      return redirect('/auth/login');
    }
  }

  return next();
});
