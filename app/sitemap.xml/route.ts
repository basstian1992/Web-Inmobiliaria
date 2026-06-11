import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = 'https://propiedadesyparcelas.cl';
  const today = new Date().toISOString().split('T')[0];

  try {
    let db: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      db = getCloudflareContext().env.DB;
    } catch (e) {
      db = (globalThis as any).DB || (process.env as any).DB || (process.env as any).propiedadesyparcelas_db;
    }
    if (!db) {
      throw new Error('Base de datos D1 no vinculada');
    }

    const operaciones = ['venta', 'arriendo', 'compra'];
    const tipos = ['terrenos', 'casas', 'locales-comerciales'];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:xhtml="http://www.w3.org/1999/xhtml"
            xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
            xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
      <url>
        <loc>${baseUrl}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${baseUrl}/buscar</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>
      <url>
        <loc>${baseUrl}/consejos</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`;

    for (const op of operaciones) {
      sitemap += `
      <url>
        <loc>${baseUrl}/${op}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>`;
      for (const t of tipos) {
        sitemap += `
      <url>
        <loc>${baseUrl}/${op}/${t}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>`;
      }
    }

    // Consultar propiedades con fecha de publicación para lastmod
    const { results } = await db.prepare(
      `SELECT slug, comuna, tipo_operacion, fecha_publicacion, prioridad_score FROM propiedades ORDER BY prioridad_score DESC, fecha_publicacion DESC`
    ).all();

    results.forEach((propiedad: any) => {
      const lastmod = propiedad.fecha_publicacion ? propiedad.fecha_publicacion.split('T')[0] : today;
      sitemap += `
      <url>
        <loc>${baseUrl}/${propiedad.tipo_operacion}/${encodeURIComponent(propiedad.comuna)}/${encodeURIComponent(propiedad.slug)}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${propiedad.prioridad_score > 0 ? '0.9' : '0.7'}</priority>
      </url>`;
    });

    sitemap += `</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600',
        'X-Robots-Tag': 'noindex, follow',
      },
    });
  } catch (error) {
    return new NextResponse('Error generando el sitemap', { status: 500 });
  }
}
