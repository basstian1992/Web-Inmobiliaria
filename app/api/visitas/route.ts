import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propiedadId } = body;

    if (!propiedadId) {
      return NextResponse.json({ success: false, error: 'propiedadId es requerido' }, { status: 400 });
    }

    const fecha = new Date().toISOString().split('T')[0];
    const id = `${propiedadId}_${fecha}`;

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

    await db.prepare(
      `INSERT INTO visitas (id, propiedad_id, fecha, contador) VALUES (?, ?, ?, 1)
       ON CONFLICT(propiedad_id, fecha) DO UPDATE SET contador = contador + 1`
    ).bind(id, propiedadId, fecha).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error registrando visita:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
