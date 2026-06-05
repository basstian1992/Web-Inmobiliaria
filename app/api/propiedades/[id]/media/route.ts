import { NextRequest, NextResponse } from 'next/server';

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

    const { results: fotos } = await db.prepare(
      `SELECT id, url_r2, es_principal FROM fotos WHERE propiedad_id = ? ORDER BY es_principal DESC`
    ).bind(id).all();

    const { results: videos } = await db.prepare(
      `SELECT id, url_r2, url_externo, es_principal FROM videos WHERE propiedad_id = ? ORDER BY es_principal DESC`
    ).bind(id).all();

    return NextResponse.json({ fotos: fotos || [], videos: videos || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
