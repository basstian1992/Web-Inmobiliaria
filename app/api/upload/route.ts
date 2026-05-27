import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Forzamos la ejecución en la red global rápida de Cloudflare

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const propiedadId = formData.get('propiedadId') as string;

    if (!file || !propiedadId) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Convertimos el archivo a un ArrayBuffer para manipularlo
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Generamos un nombre único para la imagen
    const uniqueId = crypto.randomUUID();
    const fileName = `${propiedadId}/${uniqueId}.webp`;

    // 1. Guardamos el archivo directamente en el Bucket R2 de Cloudflare
    // El "binding" BUCKET_FOTOS que configuramos en el wrangler.toml se accede desde el objeto env del contexto de Cloudflare
    const bucket = (process.env as any).BUCKET_FOTOS;
    await bucket.put(fileName, buffer, {
      httpMetadata: { contentType: 'image/webp' }
    });

    // La URL pública base de tu almacenamiento R2
    const urlPublica = `https://fotos.propiedadesyparcelas.cl/${fileName}`;

    // 2. Registramos la URL de la foto en la base de datos D1
    const db = (process.env as any).propiedadesyparcelas_db || (process.env as any).DB;
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
