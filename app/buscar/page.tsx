import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';

export const dynamic = 'force-dynamic';

async function ensureFtsTable(db: any) {
  await db.prepare(
    `CREATE VIRTUAL TABLE IF NOT EXISTS propiedades_fts USING fts5(
      titulo, descripcion, comuna, region, propiedades_id UNINDEXED, tokenize='porter unicode61'
    )`
  ).run();

  const count = await db.prepare(`SELECT COUNT(*) as total FROM propiedades_fts`).first();
  if (!count || count.total === 0) {
    await db.prepare(`INSERT INTO propiedades_fts SELECT titulo, descripcion, comuna, region, id FROM propiedades`).run();
  }
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const tipoParam = typeof params.tipo === 'string' ? params.tipo : '';
  const regionParam = typeof params.region === 'string' ? params.region : '';
  const qParam = typeof params.q === 'string' ? params.q.trim() : '';

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
      if (qParam) {
        await ensureFtsTable(db);
      }

      let query: string;
      const bindParams: any[] = [];

      if (qParam) {
        const ftsQuery = qParam.split(/\s+/).filter(Boolean).map(w => `"${w}"`).join(' AND ');
        query = `
          SELECT p.*, fts.rank,
                 (SELECT url_r2 FROM fotos WHERE propiedad_id = p.id LIMIT 1) as foto_principal
          FROM propiedades_fts fts
          JOIN propiedades p ON p.id = fts.propiedades_id
          WHERE propiedades_fts MATCH ?
        `;
        bindParams.push(ftsQuery);
      } else {
        query = `
          SELECT p.*,
                 (SELECT url_r2 FROM fotos WHERE propiedad_id = p.id LIMIT 1) as foto_principal
          FROM propiedades p
          WHERE 1=1
        `;
      }

      if (tipoParam) {
        query += ` AND p.tipo_propiedad = ?`;
        bindParams.push(tipoParam);
      }

      if (regionParam) {
        query += ` AND p.region = ?`;
        bindParams.push(regionParam);
      }

      if (qParam) {
        query += ` ORDER BY fts.rank ASC, p.prioridad_score DESC`;
      } else {
        query += ` ORDER BY p.prioridad_score DESC, p.fecha_publicacion DESC`;
      }

      query += ` LIMIT 50`;

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
            {qParam
              ? `Resultados para "${qParam}"`
              : resultados.length > 0
                ? `Se encontraron ${resultados.length} propiedades`
                : 'Búsqueda de Propiedades'}
          </h1>

          {/* Buscador de texto + filtros */}
          <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 p-4 rounded-2xl shadow-sm">
            <form action="/buscar" method="GET" className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={qParam}
                  placeholder="Buscar por palabra clave: casa, parcela, viña..."
                  className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-600"
                />
              </div>
              <select name="tipo" className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                <option value="">Todos los tipos</option>
                <option value="terreno" selected={tipoParam === 'terreno'}>Terrenos / Parcelas</option>
                <option value="casa" selected={tipoParam === 'casa'}>Casas</option>
                <option value="local" selected={tipoParam === 'local'}>Locales Comerciales</option>
              </select>
              <select name="region" className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                <option value="">Todas las regiones</option>
                {['Arica y Parinacota','Tarapacá','Antofagasta','Atacama','Coquimbo','Valparaíso','Metropolitana de Santiago',"Libertador Gral. Bernardo O'Higgins",'Maule','Ñuble','Biobío','La Araucanía','Los Ríos','Los Lagos','Aysén','Magallanes'].map(r => (
                  <option key={r} value={r} selected={regionParam === r}>{r}</option>
                ))}
              </select>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm">
                Buscar
              </button>
              {(qParam || tipoParam || regionParam) && (
                <Link href="/buscar" className="text-slate-500 hover:text-white text-xs font-bold flex items-center px-2 transition-colors">
                  ✕ Limpiar
                </Link>
              )}
            </form>
          </div>

          {/* Badges de filtros activos */}
          <div className="flex gap-2 flex-wrap">
            {qParam && (
              <span className="text-xs font-bold uppercase tracking-wider dark:text-emerald-300 text-emerald-700 dark:bg-emerald-900/50 bg-emerald-100 border dark:border-emerald-800 border-emerald-300 px-3 py-1 rounded-full">
                "{qParam}"
              </span>
            )}
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
            <p className="text-lg mb-2">No encontramos propiedades con esos criterios.</p>
            <p>Intenta cambiar tu búsqueda o eliminar los filtros.</p>
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
