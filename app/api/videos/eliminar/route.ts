import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let videoId = searchParams.get('videoId');

    if (!videoId) {
      try {
        const body = await request.json();
        videoId = body.videoId;
      } catch (e) {}
    }

    if (!videoId) {
      return NextResponse.json({ error: 'Falta el parámetro videoId' }, { status: 400 });
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

    const video = await db.prepare(
      `SELECT id, propiedad_id, url_r2 FROM videos WHERE id = ?`
    ).bind(videoId).first();

    if (!video) {
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 });
    }

    const propiedad = await db.prepare(
      `SELECT usuario_id FROM propiedades WHERE id = ?`
    ).bind(video.propiedad_id).first();

    if (!propiedad) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    const isAdmin = user.emailAddresses.some(e => e.emailAddress === 'b.alarconatenas@gmail.com' || e.emailAddress === 'basklian@gmail.com' || e.emailAddress === 'b.alarcontenas@gmail.com');
    if (propiedad.usuario_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'No tienes permisos para eliminar este video' }, { status: 403 });
    }

    if (video.url_r2) {
      let bucket: any = null;
      try {
        const { getCloudflareContext } = await import("@opennextjs/cloudflare");
        bucket = getCloudflareContext().env.BUCKET_FOTOS;
      } catch (e) {
        bucket = (globalThis as any).BUCKET_FOTOS || (process.env as any).BUCKET_FOTOS;
      }

      if (bucket) {
        const baseUrl = 'https://fotos.propiedadesyparcelas.cl/';
        const fileName = video.url_r2.startsWith(baseUrl) ? video.url_r2.slice(baseUrl.length) : video.url_r2;
        try {
          await bucket.delete(fileName);
        } catch (e) {
          console.error('Error al eliminar archivo del bucket:', e);
        }
      }
    }

    await db.prepare(`DELETE FROM videos WHERE id = ?`).bind(videoId).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al eliminar video:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
