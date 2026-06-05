import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propiedadId = searchParams.get('propiedadId');

    let db: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      db = getCloudflareContext().env.DB;
    } catch (e) {
      db = (globalThis as any).DB || (process.env as any).DB || (process.env as any).propiedadesyparcelas_db;
    }

    if (!db) {
      return NextResponse.json({ success: false, error: 'Base de datos no disponible' }, { status: 500 });
    }

    if (propiedadId) {
      const row = await db.prepare(
        `SELECT SUM(contador) as total FROM visitas WHERE propiedad_id = ?`
      ).bind(propiedadId).first();
      return NextResponse.json({ success: true, total: row?.total || 0, visitas: [] });
    }

    const { results } = await db.prepare(
      `SELECT propiedad_id, SUM(contador) as total FROM visitas GROUP BY propiedad_id ORDER BY total DESC LIMIT 50`
    ).all();

    const total = results?.reduce((acc: number, r: any) => acc + (r.total || 0), 0) || 0;

    return NextResponse.json({ success: true, total, visitas: results || [] });
  } catch (error: any) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
