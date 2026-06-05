import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let db: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      db = getCloudflareContext().env.DB;
    } catch (e) {
      db = (globalThis as any).DB || (process.env as any).DB || (process.env as any).propiedadesyparcelas_db;
    }
    if (!db) {
      return NextResponse.json({ error: 'Base de datos no disponible' }, { status: 500 });
    }
    const propiedad = await db.prepare(`SELECT * FROM propiedades WHERE id = ?`).bind(id).first();
    if (!propiedad) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }
    if (propiedad.documentos && typeof propiedad.documentos === 'string') {
      try { propiedad.documentos = JSON.parse(propiedad.documentos); } catch (e) { propiedad.documentos = []; }
    }
    return NextResponse.json({ success: true, propiedad });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const { id } = await params;

    let db: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      db = getCloudflareContext().env.DB;
    } catch (e) {
      db = (globalThis as any).DB || (process.env as any).DB || (process.env as any).propiedadesyparcelas_db;
    }

    if (!db) {
      return NextResponse.json({ error: 'Base de datos no disponible' }, { status: 500 });
    }

    const existing = await db.prepare(`SELECT * FROM propiedades WHERE id = ?`).bind(id).first();
    if (!existing) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    const isAdmin = user.emailAddresses.some(e =>
      e.emailAddress === 'b.alarconatenas@gmail.com' ||
      e.emailAddress === 'basklian@gmail.com' ||
      e.emailAddress === 'b.alarcontenas@gmail.com'
    );

    if (existing.usuario_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'No tienes permiso para modificar esta propiedad' }, { status: 403 });
    }

    const body = await request.json();

    let finalSlug = existing.slug;

    if (body.titulo !== undefined) {
      let baseSlug = slugify(body.titulo);
      if (!baseSlug) baseSlug = 'propiedad';
      finalSlug = baseSlug;

      let slugExists = await db.prepare(`SELECT id FROM propiedades WHERE slug = ? AND id != ?`).bind(finalSlug, id).first();
      let counter = 1;
      while (slugExists) {
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        finalSlug = `${baseSlug}-${randomSuffix}`;
        slugExists = await db.prepare(`SELECT id FROM propiedades WHERE slug = ? AND id != ?`).bind(finalSlug, id).first();
        counter++;
        if (counter > 10) break;
      }
    }

    let documentosFinal = existing.documentos;
    if (body.documentos !== undefined) {
      documentosFinal = JSON.stringify(body.documentos);
    }

    const fieldMap: Record<string, string> = {
      titulo: 'titulo',
      descripcion: 'descripcion',
      precio_pesos: 'precio_pesos',
      precio_uf: 'precio_uf',
      region: 'region',
      comuna: 'comuna',
      habitaciones: 'habitaciones',
      banos: 'banos',
      superficie_total: 'superficie_total',
      contacto_nombre: 'contacto_nombre',
      contacto_telefono: 'contacto_telefono',
      contacto_email: 'contacto_email',
      observaciones: 'observaciones',
      tipo_operacion: 'tipo_operacion',
      tipo_propiedad: 'tipo_propiedad',
    };

    const setClauses: string[] = [];
    const values: any[] = [];

    setClauses.push('slug = ?');
    values.push(finalSlug);

    setClauses.push('documentos = ?');
    values.push(documentosFinal);

    for (const [key, column] of Object.entries(fieldMap)) {
      if (body[key] !== undefined) {
        setClauses.push(`${column} = ?`);
        if (key === 'precio_pesos') {
          values.push(body[key] ? parseInt(body[key]) : null);
        } else if (key === 'precio_uf') {
          values.push(body[key] ? parseFloat(body[key]) : null);
        } else if (key === 'habitaciones' || key === 'banos' || key === 'superficie_total') {
          values.push(body[key] ? parseInt(body[key]) : 0);
        } else {
          values.push(body[key]);
        }
      }
    }

    if (setClauses.length > 2) {
      values.push(id);
      await db.prepare(
        `UPDATE propiedades SET ${setClauses.join(', ')} WHERE id = ?`
      ).bind(...values).run();
    }

    // Sincronizar FTS
    try {
      const updated = await db.prepare(`SELECT titulo, descripcion, comuna, region FROM propiedades WHERE id = ?`).bind(id).first();
      if (updated) {
        await db.prepare(`CREATE VIRTUAL TABLE IF NOT EXISTS propiedades_fts USING fts5(titulo, descripcion, comuna, region, propiedades_id UNINDEXED, tokenize='porter unicode61')`).run();
        await db.prepare(`DELETE FROM propiedades_fts WHERE propiedades_id = ?`).bind(id).run();
        await db.prepare(`INSERT INTO propiedades_fts (titulo, descripcion, comuna, region, propiedades_id) VALUES (?, ?, ?, ?, ?)`).bind(updated.titulo, updated.descripcion, updated.comuna, updated.region, id).run();
      }
    } catch (e) {
      console.error('Error sincronizando FTS:', e);
    }

    return NextResponse.json({ success: true, slug: finalSlug });
  } catch (error: any) {
    console.error('Error al actualizar propiedad:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
