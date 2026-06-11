import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  try {
    const { slug } = await params;
    const filePath = slug.join('/');

    let bucket: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      bucket = getCloudflareContext().env.BUCKET_FOTOS;
    } catch (e) {
      bucket = (globalThis as any).BUCKET_FOTOS || (process.env as any).BUCKET_FOTOS;
    }

    if (!bucket) {
      return new NextResponse('Storage no disponible', { status: 500 });
    }

    const object = await bucket.get(filePath);
    if (!object) {
      return new NextResponse('Imagen no encontrada', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/webp');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');

    const arrayBuffer = await object.arrayBuffer();
    return new NextResponse(arrayBuffer, { status: 200, headers });
  } catch (error: any) {
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
