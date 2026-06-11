import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

const ADMIN_EMAILS = ['b.alarconatenas@gmail.com', 'basklian@gmail.com', 'b.alarcontenas@gmail.com'];

export async function POST() {
  try {
    const user = await currentUser();
    if (!user || !user.emailAddresses.some(e => ADMIN_EMAILS.includes(e.emailAddress))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    let db: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      db = getCloudflareContext().env.DB;
    } catch (e) {
      db = (globalThis as any).DB || (process.env as any).DB;
    }
    if (!db) return NextResponse.json({ error: 'DB no disponible' }, { status: 500 });

    const oldDomain = 'https://fotos.propiedadesyparcelas.cl/';
    const newDomain = 'https://propiedadesyparcelas.cl/fotos/';

    // Migrar fotos
    const { results: fotos } = await db.prepare(`SELECT id, url_r2 FROM fotos WHERE url_r2 LIKE ?`).bind(oldDomain + '%').all();
    let fotosMigradas = 0;
    for (const f of fotos as any[]) {
      const newUrl = f.url_r2.replace(oldDomain, newDomain);
      await db.prepare(`UPDATE fotos SET url_r2 = ? WHERE id = ?`).bind(newUrl, f.id).run();
      fotosMigradas++;
    }

    // Migrar videos
    const { results: videos } = await db.prepare(`SELECT id, url_r2 FROM videos WHERE url_r2 IS NOT NULL AND url_r2 LIKE ?`).bind(oldDomain + '%').all();
    let videosMigrados = 0;
    for (const v of videos as any[]) {
      const newUrl = v.url_r2.replace(oldDomain, newDomain);
      await db.prepare(`UPDATE videos SET url_r2 = ? WHERE id = ?`).bind(newUrl, v.id).run();
      videosMigrados++;
    }

    return NextResponse.json({
      success: true,
      message: `Migradas ${fotosMigradas} fotos y ${videosMigrados} videos a la nueva URL.`,
      fotosMigradas,
      videosMigrados,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
