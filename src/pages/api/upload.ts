import type { APIRoute } from 'astro';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const UPLOAD_DIR = resolve('./public/uploads');

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();
    const file = form.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return Response.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: 'Tipo inválido. Use JPG, PNG, WebP ou SVG.' },
        { status: 400 }
      );
    }

    // Validar tamanho
    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: 'Arquivo muito grande. Máximo 2MB.', tooBig: true, size: file.size, max: MAX_SIZE },
        { status: 413 }
      );
    }

    // Garantir que o diretório existe
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Gerar nome único
    const ext = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const slug = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/, '')
      .slice(0, 40);
    const filename = `${Date.now()}-${slug}.${ext}`;
    const filepath = join(UPLOAD_DIR, filename);

    // Salvar
    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(filepath, buffer);

    const url = `/uploads/${filename}`;
    return Response.json({ url, filename, size: file.size });

  } catch (err) {
    console.error('[upload]', err);
    return Response.json({ error: 'Erro interno ao fazer upload.' }, { status: 500 });
  }
};
