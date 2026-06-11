import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const propiedadId = formData.get('propiedadId') as string;

    if (!file || !propiedadId) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Usamos el contentType enviado desde el cliente, o detectamos del archivo
    const originalType = (formData.get('contentType') as string) || file.type || 'image/jpeg';
    const ext = originalType === 'image/png' ? 'png' : 'jpg';

    // Convertimos el archivo a un ArrayBuffer para manipularlo
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Generamos un nombre único para la imagen
    const uniqueId = crypto.randomUUID();
    const fileName = `${propiedadId}/${uniqueId}.${ext}`;

    // 1. Guardamos el archivo directamente en el Bucket R2 de Cloudflare
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

    await bucket.put(fileName, buffer, {
      httpMetadata: { contentType: originalType }
    });

    const urlPublica = `https://propiedadesyparcelas.cl/fotos/${fileName}`;

    // 2. Registramos la URL de la foto en la base de datos D1
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
      `INSERT INTO fotos (id, propiedad_id, url_r2, es_principal) VALUES (?, ?, ?, ?)`
    ).bind(crypto.randomUUID(), propiedadId, urlPublica, 0).run();

    return NextResponse.json({ success: true, url: urlPublica });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
