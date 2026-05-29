import Link from 'next/link';

export default async function HomePage() {
  let db: any = null;
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    db = getCloudflareContext().env.DB;
  } catch (e) {
    db = (globalThis as any).DB || (process.env as any).DB || (process.env as any).propiedadesyparcelas_db;
  }

  // Consultamos las 6 propiedades destacadas (prioridad_score > 0 primero)
  // Añadimos una verificación de seguridad para evitar caídas durante compilaciones locales
  let destacadas: any[] = [];
  if (db) {
    try {
      const { results } = await db.prepare(
        `SELECT * FROM propiedades ORDER BY prioridad_score DESC, fecha_publicacion DESC LIMIT 6`
      ).all();
      destacadas = results || [];
    } catch (error) {
      console.error("Error al consultar propiedades:", error);
    }
  }

  return (
    <div className="bg-white min-h-screen font-sans antialiased text-gray-900">
      
      {/* 1. SECCIÓN HERO (Buscador Principal Premium) */}
      <section className="relative bg-gradient-to-r from-slate-900 to-blue-950 text-white py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-blue-400 uppercase tracking-widest text-xs font-bold bg-blue-950/60 px-4 py-1.5 rounded-full border border-blue-800">
            Encuentra tu lugar en Chile
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mt-4 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-100">
            Propiedades & Parcelas Premium
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Plataforma exclusiva de venta de terrenos, parcelas y propiedades con alta plusvalía en las mejores regiones del país.
          </p>

          {/* Barra de Búsqueda UX Premium */}
          <div className="bg-white p-2 sm:p-4 rounded-2xl shadow-2xl max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-2 text-gray-800">
            <select className="w-full bg-slate-50 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium">
              <option value="">¿Qué buscas? (Todo)</option>
              <option value="parcela">Parcelas</option>
              <option value="casa">Casas</option>
            </select>
            <select className="w-full bg-slate-50 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium">
              <option value="">Ubicación (Todas)</option>
              <option value="melipilla">Melipilla</option>
              <option value="pomaire">Pomaire</option>
            </select>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-blue-500/20 text-sm tracking-wide">
              Buscar Propiedades
            </button>
          </div>
        </div>
      </section>

      {/* 2. VITRINA DE PROPIEDADES (Grid de Tarjetas Premium) */}
      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Propiedades Destacadas</h2>
            <p className="text-gray-500 mt-1">Anuncios verificados con prioridad de visibilidad.</p>
          </div>
          <Link href="/venta" className="text-sm font-bold text-blue-600 hover:text-blue-700 mt-2 sm:mt-0 flex items-center gap-1 group">
            Ver catálogo completo <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destacadas.map((item: any) => (
            <article 
              key={item.id} 
              className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                item.prioridad_score === 2 ? 'border-amber-400 ring-1 ring-amber-400/30 shadow-md' : 'border-gray-100'
              }`}
            >
              {/* Contenedor de Imagen de Portada */}
              <div className="relative h-64 bg-slate-100">
                <div className="absolute top-4 left-4 z-10 flex gap-1.5">
                  <span className="text-xs font-bold uppercase bg-blue-600 text-white px-2.5 py-1 rounded-lg shadow-sm">
                    {item.tipo_operacion}
                  </span>
                  {item.prioridad_score === 2 && (
                    <span className="text-xs font-bold uppercase bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                      ⭐ Premium
                    </span>
                  )}
                </div>
                {/* Reemplazar por la URL real de la foto principal guardada en R2 */}
                <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center text-gray-400 text-xs">
                  Foto de la Propiedad (Cloudflare R2)
                </div>
              </div>

              {/* Información de la Tarjeta */}
              <div className="p-6">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{item.tipo_propiedad}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2 line-clamp-1 hover:text-blue-600">
                  <Link href={`/${item.tipo_operacion}/${item.comuna}/${item.slug}`}>
                    {item.titulo}
                  </Link>
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.descripcion}</p>
                
                {/* Características técnicas de la Parcela/Casa */}
                <div className="flex items-center gap-4 py-3 my-4 border-y border-gray-100 text-xs text-gray-600 font-medium">
                  <span className="flex items-center gap-1">📐 {item.superficie_total} m²</span>
                  {item.habitaciones > 0 && <span className="flex items-center gap-1">🛏️ {item.habitaciones} Dorm.</span>}
                  {item.banos > 0 && <span className="flex items-center gap-1">🚿 {item.banos} Baños</span>}
                </div>

                {/* Precio Comercial Chileno */}
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Valor</span>
                    <span className="text-2xl font-black text-slate-950">
                      {item.precio_uf ? `${item.precio_uf} UF` : `$${item.precio_pesos?.toLocaleString('es-CL')}`}
                    </span>
                  </div>
                  <Link 
                    href={`/${item.tipo_operacion}/${item.comuna}/${item.slug}`}
                    className="bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
