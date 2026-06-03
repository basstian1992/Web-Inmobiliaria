import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { propiedadId, urlR2, urlExterno, esPrincipal } = body;

    if (!propiedadId || (!urlR2 && !urlExterno)) {
      return NextResponse.json({ error: 'Faltan datos requeridos (propiedadId y al menos una URL)' }, { status: 400 });
    }

    // 1. Conectar con la base de datos D1
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

    // 2. Verificar que la propiedad pertenece al usuario (o es admin)
    const propiedad = await db.prepare(
      `SELECT usuario_id FROM propiedades WHERE id = ?`
    ).bind(propiedadId).first();

    if (!propiedad) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    const isAdmin = user.emailAddresses.some(e => e.emailAddress === 'b.alarconatenas@gmail.com' || e.emailAddress === 'basklian@gmail.com');
    if (propiedad.usuario_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'No tienes permisos para modificar esta propiedad' }, { status: 403 });
    }

    // 3. Registrar el video en la tabla de videos
    const videoId = crypto.randomUUID();
    await db.prepare(
      `INSERT INTO videos (id, propiedad_id, url_r2, url_externo, es_principal) 
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      videoId,
      propiedadId,
      urlR2 || null,
      urlExterno || null,
      esPrincipal ? 1 : 0
    ).run();

    console.log(`Video registrado exitosamente con ID: ${videoId} para la propiedad ${propiedadId}`);
    return NextResponse.json({ success: true, videoId });
  } catch (error: any) {
    console.error('Error al registrar video:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
