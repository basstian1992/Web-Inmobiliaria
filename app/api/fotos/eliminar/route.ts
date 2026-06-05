import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let fotoId = searchParams.get('fotoId');

    if (!fotoId) {
      try {
        const body = await request.json();
        fotoId = body.fotoId;
      } catch (e) {}
    }

    if (!fotoId) {
      return NextResponse.json({ error: 'Falta el parámetro fotoId' }, { status: 400 });
    }

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

    const foto = await db.prepare(
      `SELECT id, propiedad_id, url_r2 FROM fotos WHERE id = ?`
    ).bind(fotoId).first();

    if (!foto) {
      return NextResponse.json({ error: 'Foto no encontrada' }, { status: 404 });
    }

    const propiedad = await db.prepare(
      `SELECT usuario_id FROM propiedades WHERE id = ?`
    ).bind(foto.propiedad_id).first();

    if (!propiedad) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    const isAdmin = user.emailAddresses.some(e => e.emailAddress === 'b.alarconatenas@gmail.com' || e.emailAddress === 'basklian@gmail.com' || e.emailAddress === 'b.alarcontenas@gmail.com');
    if (propiedad.usuario_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'No tienes permisos para eliminar esta foto' }, { status: 403 });
    }

    if (foto.url_r2) {
      let bucket: any = null;
      try {
        const { getCloudflareContext } = await import("@opennextjs/cloudflare");
        bucket = getCloudflareContext().env.BUCKET_FOTOS;
      } catch (e) {
        bucket = (globalThis as any).BUCKET_FOTOS || (process.env as any).BUCKET_FOTOS;
      }

      if (bucket) {
        const baseUrl = 'https://fotos.propiedadesyparcelas.cl/';
        const fileName = foto.url_r2.startsWith(baseUrl) ? foto.url_r2.slice(baseUrl.length) : foto.url_r2;
        try {
          await bucket.delete(fileName);
        } catch (e) {
          console.error('Error al eliminar archivo del bucket:', e);
        }
      }
    }

    await db.prepare(`DELETE FROM fotos WHERE id = ?`).bind(fotoId).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al eliminar foto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
