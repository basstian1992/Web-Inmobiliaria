import { NextResponse } from 'next/server';

// Forzamos a Next.js a que no guarde esta página en caché vieja, sino que la calcule al instante
export const dynamic = 'force-dynamic';


export async function GET() {
  // En el entorno de Cloudflare, la base de datos se inyecta globalmente
  // Aquí simulamos la llamada a tu base de datos D1 propiedadesyparcelas-db
  const baseUrl = 'https://propiedadesyparcelas.cl';

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

    // 1. Landing pages estáticas por operación
    const operaciones = ['venta', 'arriendo', 'compra'];
    const tipos = ['terrenos', 'casas', 'locales-comerciales'];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${baseUrl}/buscar</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>`;

    // Landing pages por operación (ej: /venta, /arriendo)
    for (const op of operaciones) {
      sitemap += `
      <url>
        <loc>${baseUrl}/${op}</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>`;
      // Landing pages por tipo (ej: /venta/casas, /arriendo/terrenos)
      for (const t of tipos) {
        sitemap += `
      <url>
        <loc>${baseUrl}/${op}/${t}</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>`;
      }
    }

    // 2. Consultamos las propiedades
    const { results } = await db.prepare(
      `SELECT slug, comuna, tipo_operacion FROM propiedades ORDER BY prioridad_score DESC`
    ).all();

    // 3. Inyectamos dinámicamente cada propiedad publicada
    results.forEach((propiedad: any) => {
      sitemap += `
      <url>
        <loc>${baseUrl}/${propiedad.tipo_operacion}/${propiedad.comuna}/${propiedad.slug}</loc>
        <changefreq>weekly</changefreq>
        <priority>${propiedad.prioridad_score > 0 ? '0.9' : '0.7'}</priority>
      </url>`;
    });

    sitemap += `</urlset>`;

    // 4. Retornamos la respuesta con el formato XML correcto para SEO
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    return new NextResponse('Error generando el sitemap', { status: 500 });
  }
}
