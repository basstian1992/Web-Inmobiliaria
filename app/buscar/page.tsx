import Link from 'next/link';

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
            {resultados.map((item: any) => {
              const esVIP = item.prioridad_score === 2;
              const propLabel = item.tipo_propiedad === 'terreno' ? 'Terreno / Parcela' : item.tipo_propiedad === 'casa' ? 'Casa' : 'Local Comercial';
              
              return (
                <article 
                  key={item.id} 
                  className={`dark:bg-slate-950 bg-white rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between ${
                    esVIP ? 'border-indigo-500/40 shadow-xl' : 'dark:border-slate-850 border-slate-200'
                  }`}
                >
                  <div>
                    {/* Contenedor de Imagen de Portada */}
                    <div className="relative h-60 dark:bg-slate-900 bg-slate-100 border-b dark:border-slate-850 border-slate-200">
                      <div className="absolute top-4 left-4 z-10 flex gap-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-500 text-slate-950 px-2.5 py-1 rounded-lg shadow-md">
                          {item.tipo_operacion === 'venta' ? 'Venta' : item.tipo_operacion === 'compra' ? 'Compra' : 'Arriendo'}
                        </span>
                        {esVIP && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                            ⭐ VIP Destacado
                          </span>
                        )}
                      </div>

                      {item.foto_principal ? (
                        <img 
                          src={item.foto_principal} 
                          alt={item.titulo} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-slate-950 flex flex-col items-center justify-center text-slate-500 text-xs">
                          <span>📷 Foto no disponible</span>
                        </div>
                      )}
                    </div>

                    {/* Información de la Tarjeta */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest dark:text-indigo-400 text-indigo-600">
                          {propLabel}
                        </span>
                        <h3 className="text-lg font-black dark:text-white text-slate-900 leading-snug line-clamp-2">
                          {item.titulo}
                        </h3>
                        <p className="dark:text-slate-400 text-slate-500 text-xs line-clamp-1">📍 {item.comuna}, {item.region}</p>
                      </div>

                      {/* Características / Ficha Rápida */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-medium dark:text-slate-300 text-slate-700 bg-slate-500/5 dark:bg-transparent dark:border dark:border-slate-800 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5">
                          <span>📐</span> <span>{item.superficie_total} m²</span>
                        </div>
                        {item.tipo_propiedad !== 'terreno' && (
                          <>
                            <div className="flex items-center gap-1.5">
                              <span>🛏️</span> <span>{item.habitaciones}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span>🚿</span> <span>{item.banos}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer de Tarjeta (Precio y Acción) */}
                  <div className="p-6 pt-0 flex items-end justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold dark:text-slate-500 text-slate-400">Valor</span>
                      <p className="text-xl font-black dark:text-white text-slate-900">
                        {item.precio_uf 
                          ? `${item.precio_uf} UF` 
                          : item.precio_pesos 
                            ? `$${item.precio_pesos.toLocaleString('es-CL')} CLP` 
                            : 'Consultar'}
                      </p>
                    </div>
                    <Link 
                      href={`/${item.tipo_operacion}/${item.comuna.toLowerCase()}/${item.slug}`} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center shrink-0 ${
                        esVIP 
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                      }`}
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
