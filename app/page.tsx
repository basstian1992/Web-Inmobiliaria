import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let db: any = null;
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    db = getCloudflareContext().env.DB;
  } catch (e) {
    db = (globalThis as any).DB || (process.env as any).DB || (process.env as any).propiedadesyparcelas_db;
  }

  // Consultamos las propiedades destacadas (prioridad_score desc) e incluimos la primera foto principal
  let destacadas: any[] = [];
  if (db) {
    try {
      const { results } = await db.prepare(
        `SELECT p.*, 
                (SELECT url_r2 FROM fotos WHERE propiedad_id = p.id LIMIT 1) as foto_principal 
         FROM propiedades p 
         ORDER BY p.prioridad_score DESC, p.fecha_publicacion DESC 
         LIMIT 9`
      ).all();
      destacadas = results || [];
    } catch (error) {
      console.error("Error al consultar propiedades:", error);
    }
  }

  return (
    <div className="bg-slate-900 min-h-screen font-sans antialiased text-slate-100 pb-20">
      
      {/* Cintillo de la Alianza en Cabecera */}
      <div className="bg-slate-950 border-b border-indigo-900/40 text-center py-3 px-4 text-xs font-semibold text-indigo-300">
        🚀 Propiedades & Parcelas es una extensión de servicios de{' '}
        <a href="https://www.asesoriapublica.cl" target="_blank" rel="noopener noreferrer" className="underline hover:text-white font-bold text-indigo-200">
          Asesoría Pública (www.asesoriapublica.cl)
        </a>{' '}
        — Legalidad y Corretaje Seguro en todo Chile.
      </div>

      {/* 1. SECCIÓN HERO (Buscador Premium) */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white py-28 px-4 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-indigo-400 uppercase tracking-widest text-[10px] font-bold bg-indigo-500/10 px-4.5 py-2 rounded-full border border-indigo-500/20">
            Terrenos, Casas y Locales Comerciales en Chile
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200">
            Propiedades & Parcelas Premium
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Plataforma exclusiva dirigida a quienes buscan comprar, vender o arrendar terrenos rurales, parcelas de agrado, casas de alto estándar y locales comerciales con saneamiento legal garantizado.
          </p>

          {/* Barra de Búsqueda UX Premium */}
          <div className="bg-slate-950/80 backdrop-blur-md p-3 rounded-2xl border border-slate-850 shadow-2xl max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-200">
            <select className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-300">
              <option value="">¿Qué buscas? (Todo)</option>
              <option value="terreno">Terrenos / Parcelas</option>
              <option value="casa">Casas</option>
              <option value="local">Locales Comerciales</option>
            </select>
            <select className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-300">
              <option value="">Ubicación (Todas)</option>
              <option value="melipilla">Melipilla</option>
              <option value="pomaire">Pomaire</option>
              <option value="santiago">Santiago</option>
            </select>
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 text-xs tracking-wider uppercase cursor-pointer">
              Buscar Propiedades
            </button>
          </div>
        </div>
      </section>

      {/* 2. VITRINA DE PROPIEDADES (Grid de Tarjetas Premium) */}
      <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Catálogo de Propiedades */}
        <div className="lg:col-span-3 space-y-10">
          <div className="flex justify-between items-end border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-2xl font-black text-white">Catálogo de Propiedades Destacadas</h2>
              <p className="text-slate-400 text-xs mt-1">Anuncios certificados legalmente y optimizados para buscadores.</p>
            </div>
            <Link href="/venta" className="text-xs font-bold text-indigo-400 hover:text-white transition-colors shrink-0">
              Ver catálogo completo →
            </Link>
          </div>

          {destacadas.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-16 text-center text-slate-500 text-sm">
              Actualmente no hay anuncios registrados. Sé el primero en publicar desde tu panel.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {destacadas.map((item: any) => {
                const esVIP = item.prioridad_score === 2;
                const propLabel = item.tipo_propiedad === 'terreno' ? 'Terreno / Parcela' : item.tipo_propiedad === 'casa' ? 'Casa' : 'Local Comercial';
                
                return (
                  <article 
                    key={item.id} 
                    className={`bg-slate-950 rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between ${
                      esVIP ? 'border-indigo-500/40 shadow-xl' : 'border-slate-850'
                    }`}
                  >
                    <div>
                      {/* Contenedor de Imagen de Portada */}
                      <div className="relative h-60 bg-slate-900 border-b border-slate-850">
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
                      <div className="p-6 space-y-3">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">{propLabel}</span>
                        <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 hover:text-indigo-400">
                          <Link href={`/${item.tipo_operacion}/${item.comuna}/${item.slug}`}>
                            {item.titulo}
                          </Link>
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{item.descripcion}</p>
                        
                        {/* Características técnicas */}
                        <div className="flex items-center gap-4 py-3 my-2 border-y border-slate-900 text-[11px] text-slate-300 font-medium">
                          <span className="flex items-center gap-1">📐 {item.superficie_total} m²</span>
                          {item.habitaciones > 0 && <span className="flex items-center gap-1">🛏️ {item.habitaciones} Dorm.</span>}
                          {item.banos > 0 && <span className="flex items-center gap-1">🚿 {item.banos} Baños</span>}
                        </div>
                      </div>
                    </div>

                    {/* Precio y Detalle */}
                    <div className="p-6 bg-slate-950 border-t border-slate-900 flex items-center justify-between">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">Valor</span>
                        <span className="text-xl font-black text-white">
                          {item.precio_uf ? `${item.precio_uf} UF` : item.precio_pesos ? `$${item.precio_pesos.toLocaleString('es-CL')} CLP` : 'Consultar'}
                        </span>
                      </div>
                      <Link 
                        href={`/${item.tipo_operacion}/${item.comuna}/${item.slug}`}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Barra Lateral Publicitaria de Asesoría Pública (Efecto Glassmorphism) */}
        <div className="lg:col-span-1 space-y-8">
          
          <div className="bg-gradient-to-br from-indigo-950 to-slate-950 border border-indigo-900/40 p-6 rounded-3xl shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
            <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-bold px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest block text-center">
              Alianza Estratégica
            </span>
            
            <div className="text-center space-y-3">
              <h3 className="text-base font-extrabold text-white">¿Vendes y necesitas regularizar títulos?</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                No arriesgues tu capital. En alianza comercial con <strong>Asesoría Pública</strong>, te conectamos con ingenieros y abogados especialistas en saneamiento, subdivisiones y estudio de títulos.
              </p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Visita el sitio oficial</span>
              <a 
                href="https://www.asesoriapublica.cl" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-400 hover:text-white font-black text-xs underline block mt-0.5"
              >
                www.asesoriapublica.cl
              </a>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Beneficios Premium</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex gap-2 items-start"><span className="text-indigo-400">✔</span> Compresión automática a WebP.</li>
              <li className="flex gap-2 items-start"><span className="text-indigo-400">✔</span> Microdatos enriquecidos (Rich Snippets).</li>
              <li className="flex gap-2 items-start"><span className="text-indigo-400">✔</span> Pagos seguros vinculados a Flow Chile.</li>
              <li className="flex gap-2 items-start"><span className="text-indigo-400">✔</span> Enlaces de video e integraciones directas.</li>
            </ul>
            <Link 
              href="/dashboard" 
              className="block text-center w-full bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-white font-extrabold text-xs py-2.5 rounded-xl border border-slate-800 transition-all mt-4"
            >
              Ir a mi panel
            </Link>
          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-850 py-12 mt-20 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <p>© {new Date().getFullYear()} Propiedades & Parcelas Chile. Todos los derechos reservados.</p>
          <p>
            Una plataforma operada y auspiciada en alianza oficial con{' '}
            <a href="https://www.asesoriapublica.cl" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-white font-bold underline">
              Asesoría Pública (www.asesoriapublica.cl)
            </a>
          </p>
        </div>
      </footer>

    </div>
  );
}
