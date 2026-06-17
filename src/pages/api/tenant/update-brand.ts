import type { APIRoute } from 'astro';
import { getAuthFromCookie } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { tenants } from '../../../lib/schema';

export const POST: APIRoute = async ({ request }) => {
  const auth = getAuthFromCookie(request);
  if (!auth) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const body = await request.json() as { tipo: string; url: string };
    const { tipo, url } = body;

    const allowedTypes = ['logo', 'favicon', 'hero_imagem', 'diferencial_imagem'];
    if (!allowedTypes.includes(tipo)) {
      return Response.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    // Single-tenant: busca sempre o primeiro tenant
    const [tenant] = await db.select().from(tenants).limit(1);
    if (!tenant) return Response.json({ error: 'Tenant não encontrado' }, { status: 404 });

    const updateData: Record<string, any> = { updated_at: new Date() };
    if (tipo === 'logo')               updateData.logo_url           = url;
    if (tipo === 'favicon')            updateData.favicon_url        = url;
    if (tipo === 'hero_imagem')        updateData.hero_imagem        = url;
    if (tipo === 'diferencial_imagem') updateData.diferencial_imagem = url;

    // Atualiza sem WHERE problemático (auth.tenantId era undefined)
    await db.update(tenants).set(updateData);

    return Response.json({ ok: true, url });
  } catch (err) {
    console.error('[update-brand]', err);
    return Response.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
};
