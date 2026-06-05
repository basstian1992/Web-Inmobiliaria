import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const propiedadId = formData.get('propiedadId') as string;
    const esPrincipal = formData.get('esPrincipal') === '1' ? 1 : 0;

    if (!file || !propiedadId) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const uniqueId = crypto.randomUUID();
    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'webm';
    const fileName = `${propiedadId}/videos/${uniqueId}.${ext}`;

    let bucket: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      bucket = getCloudflareContext().env.BUCKET_FOTOS;
    } catch (e) {
      bucket = (globalThis as any).BUCKET_FOTOS || (process.env as any).BUCKET_FOTOS;
    }
    if (!bucket) {
      return NextResponse.json({ error: 'Bucket R2 no disponible' }, { status: 500 });
    }

    const contentType = file.type || 'video/webm';
    await bucket.put(fileName, buffer, {
      httpMetadata: { contentType }
    });

    const urlPublica = `https://fotos.propiedadesyparcelas.cl/${fileName}`;

    let db: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      db = getCloudflareContext().env.DB;
    } catch (e) {
      db = (globalThis as any).DB || (process.env as any).DB || (process.env as any).propiedadesyparcelas_db;
    }
    if (!db) {
      return NextResponse.json({ error: 'Base de datos D1 no vinculada' }, { status: 500 });
    }

    await db.prepare(
      `INSERT INTO videos (id, propiedad_id, url_r2, es_principal) VALUES (?, ?, ?, ?)`
    ).bind(crypto.randomUUID(), propiedadId, urlPublica, esPrincipal).run();

    return NextResponse.json({ success: true, url: urlPublica });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
