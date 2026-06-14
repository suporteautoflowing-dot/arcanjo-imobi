import type { APIRoute } from 'astro';
import { getAuthFromCookie } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { tenants } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  const auth = getAuthFromCookie(request);
  if (!auth) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const body = await request.json() as { tipo: string; url: string };
    const { tipo, url } = body;

    const allowedTypes = ['logo', 'favicon', 'hero_imagem'];
    if (!allowedTypes.includes(tipo)) {
      return Response.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    const updateData: Record<string, any> = { updated_at: new Date() };

    if (tipo === 'logo') updateData.logo_url = url;
    if (tipo === 'favicon') updateData.favicon_url = url;
    if (tipo === 'hero_imagem') updateData.hero_imagem = url;

    await db.update(tenants).set(updateData).where(eq(tenants.id, auth.tenantId));

    return Response.json({ ok: true, url });
  } catch (err) {
    console.error('[update-brand]', err);
    return Response.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
};
