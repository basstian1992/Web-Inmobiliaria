import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';

export const dynamic = 'force-dynamic';

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const tipoParam = typeof params.tipo === 'string' ? params.tipo : '';
  const regionParam = typeof params.region === 'string' ? params.region : '';

  let db: any = null;
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    db = getCloudflareContext().env.DB;
  } catch (e) {
    db = (globalThis as any).DB || (process.env as any).DB || (process.env as any).propiedadesyparcelas_db;
  }

  let resultados: any[] = [];
  
  if (db) {
    try {
      let query = `
        SELECT p.*, 
               (SELECT url_r2 FROM fotos WHERE propiedad_id = p.id LIMIT 1) as foto_principal 
        FROM propiedades p 
        WHERE 1=1
      `;
      const bindParams: any[] = [];

      if (tipoParam) {
        query += ` AND p.tipo_propiedad = ?`;
        bindParams.push(tipoParam);
      }
      
      if (regionParam) {
        // Usamos LIKE para permitir coincidencias parciales si es necesario o MATCH exacto
        query += ` AND p.region = ?`;
        bindParams.push(regionParam);
      }

      query += ` ORDER BY p.prioridad_score DESC, p.fecha_publicacion DESC LIMIT 50`;

      // Miniflare/D1 prepare no soporta arrays expansivos de forma limpia si no los pasamos como bind(...)
      let stmt = db.prepare(query);
      for (const param of bindParams) {
        stmt = stmt.bind(param); // No es la forma, D1 bind acepta (v1, v2)
      }
      // D1 driver in Cloudflare expects stmt.bind(...bindParams)
      
      const { results } = await db.prepare(query).bind(...bindParams).all();
      resultados = results || [];
    } catch (error) {
      console.error("Error al consultar propiedades:", error);
    }
  }

  return (
    <div className="dark:bg-slate-900 bg-slate-50 min-h-screen font-sans antialiased dark:text-slate-100 text-slate-900 pb-20 transition-colors">
      <div className="dark:bg-indigo-950 bg-indigo-100 border-b dark:border-indigo-500/40 border-indigo-300 text-center py-4 px-4 text-sm font-bold dark:text-indigo-100 text-indigo-900 shadow-md transition-colors">
        🌟 Plataforma de extensión de servicios de{' '}
        <a href="https://www.asesoriapublica.cl" target="_blank" rel="noopener noreferrer" className="underline dark:hover:text-white hover:text-indigo-600 dark:text-indigo-300 text-indigo-700 font-black tracking-wide">
          www.asesoriapublica.cl
        </a>{' '}
        — Consultoría privada y pública en Chile.
      </div>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Cabecera de Búsqueda */}
        <div className="space-y-4">
          <Link href="/" className="text-xs font-bold dark:text-indigo-400 text-indigo-600 dark:hover:text-white hover:text-indigo-800 transition-colors">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-black dark:text-white text-slate-900">
            {resultados.length > 0 ? `Se encontraron ${resultados.length} propiedades` : 'Búsqueda de Propiedades'}
          </h1>
          <div className="flex gap-2">
            {tipoParam && (
              <span className="text-xs font-bold uppercase tracking-wider dark:text-slate-400 text-slate-600 dark:bg-slate-800 bg-slate-200 border dark:border-slate-700 border-slate-300 px-3 py-1 rounded-full">
                {tipoParam === 'terreno' ? 'Terrenos / Parcelas' : tipoParam === 'casa' ? 'Casas' : 'Locales Comerciales'}
              </span>
            )}
            {regionParam && (
              <span className="text-xs font-bold uppercase tracking-wider dark:text-indigo-300 text-indigo-700 dark:bg-indigo-900/50 bg-indigo-100 border dark:border-indigo-800 border-indigo-300 px-3 py-1 rounded-full">
                {regionParam}
              </span>
            )}
          </div>
        </div>

        {/* Grid de Resultados */}
        {resultados.length === 0 ? (
          <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 rounded-3xl p-16 text-center dark:text-slate-500 text-slate-400 text-sm shadow-sm transition-colors">
            <p className="text-lg mb-2">No encontramos propiedades con esos filtros.</p>
            <p>Intenta cambiar tu búsqueda o eliminar los filtros de región.</p>
            <Link href="/buscar" className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md text-xs tracking-wider uppercase">
              Ver todo el catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resultados.map((item: any) => (
              <PropertyCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
