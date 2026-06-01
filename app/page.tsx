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
    <div className="dark:bg-slate-900 bg-slate-50 min-h-screen font-sans antialiased dark:text-slate-100 text-slate-900 pb-20 transition-colors">
      
      {/* Cintillo de la Alianza en Cabecera (Más destacado) */}
      <div className="dark:bg-indigo-950 bg-indigo-100 border-b dark:border-indigo-500/40 border-indigo-300 text-center py-4 px-4 text-sm font-bold dark:text-indigo-100 text-indigo-900 shadow-md transition-colors">
        🌟 Plataforma de extensión de servicios de{' '}
        <a href="https://www.asesoriapublica.cl" target="_blank" rel="noopener noreferrer" className="underline dark:hover:text-white hover:text-indigo-600 dark:text-indigo-300 text-indigo-700 font-black tracking-wide">
          www.asesoriapublica.cl
        </a>{' '}
        — Consultoría privada y pública en Chile.
      </div>

      {/* 1. SECCIÓN HERO (Buscador Premium) */}
      <section className="relative dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:text-white text-slate-900 py-28 px-4 sm:px-6 lg:px-8 text-center overflow-hidden border-b dark:border-slate-800 border-slate-200 transition-colors">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="dark:text-indigo-400 text-indigo-600 uppercase tracking-widest text-[10px] font-bold dark:bg-indigo-500/10 bg-indigo-100 px-4.5 py-2 rounded-full border dark:border-indigo-500/20 border-indigo-300">
            Terrenos, Casas y Locales Comerciales en Chile
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-blue-300 from-slate-900 via-indigo-900 to-blue-800 leading-tight">
            Propiedades, Locales Comerciales, Compra-Venta en Chile
          </h1>
          <p className="text-base sm:text-lg dark:text-slate-400 text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Plataforma exclusiva dirigida a quienes buscan comprar, vender o arrendar terrenos rurales, parcelas de agrado, casas de alto estándar y locales comerciales con saneamiento legal garantizado.
          </p>

          {/* Barra de Búsqueda UX Premium */}
          <form action="/buscar" method="GET" className="dark:bg-slate-950/80 bg-white/80 backdrop-blur-md p-3 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-2xl max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 dark:text-slate-200 text-slate-800 transition-colors">
            <select name="tipo" className="w-full dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-300 p-3.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-300 text-slate-700 transition-colors">
              <option value="">¿Qué buscas? (Todo)</option>
              <option value="terreno">Terrenos / Parcelas</option>
              <option value="casa">Casas</option>
              <option value="local">Locales Comerciales</option>
            </select>
            <select name="region" className="w-full dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-300 p-3.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-300 text-slate-700 transition-colors">
              <option value="">Ubicación (Todas)</option>
              <option value="Arica y Parinacota">Región de Arica y Parinacota</option>
              <option value="Tarapacá">Región de Tarapacá</option>
              <option value="Antofagasta">Región de Antofagasta</option>
              <option value="Atacama">Región de Atacama</option>
              <option value="Coquimbo">Región de Coquimbo</option>
              <option value="Valparaíso">Región de Valparaíso</option>
              <option value="Metropolitana de Santiago">Región Metropolitana de Santiago</option>
              <option value="Libertador Gral. Bernardo O'Higgins">Región del Libertador Gral. B. O'Higgins</option>
              <option value="Maule">Región del Maule</option>
              <option value="Ñuble">Región de Ñuble</option>
              <option value="Biobío">Región del Biobío</option>
              <option value="La Araucanía">Región de La Araucanía</option>
              <option value="Los Ríos">Región de Los Ríos</option>
              <option value="Los Lagos">Región de Los Lagos</option>
              <option value="Aysén">Región de Aysén del Gral. Carlos Ibáñez del Campo</option>
              <option value="Magallanes">Región de Magallanes y de la Antártica Chilena</option>
            </select>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 text-xs tracking-wider uppercase cursor-pointer">
              Buscar Propiedades
            </button>
          </form>
        </div>
      </section>

      {/* 2. VITRINA DE PROPIEDADES (Grid de Tarjetas Premium) */}
      <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Catálogo de Propiedades */}
        <div className="lg:col-span-3 space-y-10">
          <div className="flex justify-between items-end border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-2xl font-black dark:text-white text-slate-900">Catálogo de Propiedades Destacadas</h2>
              <p className="dark:text-slate-400 text-slate-600 text-xs mt-1">Anuncios certificados legalmente y optimizados para buscadores.</p>
            </div>
            <Link href="/buscar" className="text-xs font-bold dark:text-indigo-400 text-indigo-600 dark:hover:text-white hover:text-indigo-800 transition-colors shrink-0">
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
                      <div className="p-6 space-y-3">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">{propLabel}</span>
                        <h3 className="text-lg font-bold dark:text-white text-slate-900 leading-snug line-clamp-2 hover:text-indigo-500">
                          <Link href={`/${item.tipo_operacion}/${item.comuna}/${item.slug}`}>
                            {item.titulo}
                          </Link>
                        </h3>
                        <p className="dark:text-slate-400 text-slate-600 text-xs leading-relaxed line-clamp-2">{item.descripcion}</p>
                        
                        {/* Características técnicas */}
                        <div className="flex items-center gap-4 py-3 my-2 border-y dark:border-slate-900 border-slate-200 text-[11px] dark:text-slate-300 text-slate-600 font-medium">
                          <span className="flex items-center gap-1">📐 {item.superficie_total} m²</span>
                          {item.habitaciones > 0 && <span className="flex items-center gap-1">🛏️ {item.habitaciones} Dorm.</span>}
                          {item.banos > 0 && <span className="flex items-center gap-1">🚿 {item.banos} Baños</span>}
                        </div>
                      </div>
                    </div>

                    {/* Precio y Detalle */}
                    <div className="p-6 dark:bg-slate-950 bg-slate-50 border-t dark:border-slate-900 border-slate-200 flex items-center justify-between transition-colors">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">Valor</span>
                        <span className="text-xl font-black dark:text-white text-slate-900">
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
          
          <div className="dark:bg-gradient-to-br dark:from-indigo-950 dark:to-slate-950 bg-gradient-to-br from-indigo-50 to-white border dark:border-indigo-900/40 border-indigo-200 p-6 rounded-3xl shadow-2xl relative overflow-hidden space-y-6 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <span className="dark:bg-indigo-500/10 bg-indigo-100 dark:text-indigo-400 text-indigo-700 text-[9px] font-bold px-3 py-1 rounded-full border dark:border-indigo-500/20 border-indigo-300 uppercase tracking-widest block text-center">
              Alianza Estratégica
            </span>
            
            <div className="text-center space-y-3">
              <h3 className="text-base font-extrabold dark:text-white text-slate-900">¿Vendes y necesitas regularizar títulos?</h3>
              <p className="dark:text-slate-400 text-slate-600 text-xs leading-relaxed">
                No arriesgues tu capital. En alianza comercial con <strong>Asesoría Pública</strong>, te conectamos con ingenieros y abogados especialistas en saneamiento, subdivisiones y estudio de títulos.
              </p>
            </div>

            <div className="dark:bg-slate-900/60 bg-white/60 p-4 rounded-2xl border dark:border-slate-800 border-slate-200 text-center shadow-sm">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Visita el sitio oficial</span>
              <a 
                href="https://www.asesoriapublica.cl" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="dark:text-indigo-400 text-indigo-600 dark:hover:text-white hover:text-indigo-800 font-black text-xs underline block mt-0.5"
              >
                www.asesoriapublica.cl
              </a>
            </div>
          </div>

          <div className="dark:bg-slate-950 bg-white border dark:border-slate-850 border-slate-200 p-6 rounded-3xl shadow-xl space-y-4 transition-colors">
            <h4 className="text-xs font-bold dark:text-white text-slate-900 uppercase tracking-wider border-b dark:border-slate-800 border-slate-200 pb-2">Beneficios Premium</h4>
            <ul className="space-y-2.5 text-xs dark:text-slate-400 text-slate-600">
              <li className="flex gap-2 items-start"><span className="text-indigo-500">✔</span> Compresión automática a WebP.</li>
              <li className="flex gap-2 items-start"><span className="text-indigo-500">✔</span> Microdatos enriquecidos (Rich Snippets).</li>
              <li className="flex gap-2 items-start"><span className="text-indigo-500">✔</span> Pagos seguros vinculados a Flow Chile.</li>
              <li className="flex gap-2 items-start"><span className="text-indigo-500">✔</span> Enlaces de video e integraciones directas.</li>
            </ul>
            <Link 
              href="/dashboard" 
              className="block text-center w-full dark:bg-slate-900 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 dark:text-indigo-400 text-indigo-600 dark:hover:text-white hover:text-indigo-800 font-extrabold text-xs py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 transition-all mt-4"
            >
              Ir a mi panel
            </Link>
          </div>

        </div>

      </section>

      {/* 3. SECCIÓN TARIFAS Y PLANES */}
      <section className="dark:bg-slate-950 bg-slate-50 py-24 border-t dark:border-slate-800 border-slate-200 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black dark:text-white text-slate-900 tracking-tight">Planes y Tarifas para Vendedores</h2>
            <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
              Publica tus propiedades y llega a miles de compradores. Nuestro sistema optimiza tu aviso y lo impulsa en motores de búsqueda como Google (SEO) según tu nivel de plan, dándote visibilidad tanto dentro como fuera del sitio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Plan Gratis */}
            <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-3xl p-8 flex flex-col shadow-lg transition-colors">
              <h3 className="text-xl font-black dark:text-white text-slate-900">Básico</h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black dark:text-white text-slate-900">Gratis</span>
              </div>
              <ul className="space-y-3 text-xs dark:text-slate-400 text-slate-600 mb-8 flex-1">
                <li className="flex gap-2">✅ Hasta <strong>2 Avisos</strong> activos</li>
                <li className="flex gap-2">✅ Hasta <strong>5 Fotos</strong> por aviso</li>
                <li className="flex gap-2 opacity-50">❌ Sin videos</li>
                <li className="flex gap-2">✅ Posicionamiento Estándar</li>
              </ul>
              <Link href="/dashboard" className="text-center w-full dark:bg-slate-800 bg-slate-200 dark:hover:bg-slate-700 hover:bg-slate-300 dark:text-white text-slate-900 font-bold py-3 rounded-xl transition-all text-xs">
                Comenzar Gratis
              </Link>
            </div>

            {/* Plan 10K */}
            <div className="dark:bg-gradient-to-b dark:from-indigo-950 dark:to-slate-900 bg-gradient-to-b from-indigo-50 to-white border dark:border-indigo-900/40 border-indigo-200 rounded-3xl p-8 flex flex-col shadow-xl transition-colors">
              <h3 className="text-xl font-black dark:text-indigo-400 text-indigo-700">Plan 10K</h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black dark:text-white text-slate-900">$10.000</span>
                <span className="text-slate-500 text-xs ml-1">CLP/mes</span>
              </div>
              <ul className="space-y-3 text-xs dark:text-slate-300 text-slate-700 mb-8 flex-1">
                <li className="flex gap-2">✅ Hasta <strong>4 Avisos</strong> activos</li>
                <li className="flex gap-2">✅ Hasta <strong>8 Fotos</strong> por aviso</li>
                <li className="flex gap-2">✅ <strong>1 Video</strong> (Enlace)</li>
                <li className="flex gap-2 dark:text-indigo-300 text-indigo-600">🚀 Impulso SEO Medio</li>
                <li className="flex gap-2 dark:text-indigo-300 text-indigo-600">🚀 Prioridad en Buscador Interno</li>
              </ul>
              <Link href="/dashboard" className="text-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all text-xs shadow-md">
                Suscribirse
              </Link>
            </div>

            {/* Plan 20K */}
            <div className="dark:bg-gradient-to-b dark:from-blue-950 dark:to-slate-900 bg-gradient-to-b from-blue-50 to-white border-2 dark:border-blue-500/40 border-blue-400 relative rounded-3xl p-8 flex flex-col shadow-2xl transform scale-105 z-10 transition-colors">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                Recomendado
              </span>
              <h3 className="text-xl font-black dark:text-blue-400 text-blue-700">Plan 20K</h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black dark:text-white text-slate-900">$20.000</span>
                <span className="text-slate-500 text-xs ml-1">CLP/mes</span>
              </div>
              <ul className="space-y-3 text-xs dark:text-slate-300 text-slate-700 mb-8 flex-1">
                <li className="flex gap-2">✅ Hasta <strong>10 Avisos</strong> activos</li>
                <li className="flex gap-2">✅ Hasta <strong>20 Fotos</strong> por aviso</li>
                <li className="flex gap-2">✅ Hasta <strong>3 Videos</strong></li>
                <li className="flex gap-2 dark:text-blue-300 text-blue-600">🔥 Impulso SEO Alto VIP</li>
                <li className="flex gap-2 dark:text-blue-300 text-blue-600">🔥 Rich Snippets en Google</li>
              </ul>
              <Link href="/dashboard" className="text-center w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all text-xs shadow-lg">
                Suscribirse VIP
              </Link>
            </div>

            {/* Plan 50K */}
            <div className="dark:bg-gradient-to-b dark:from-amber-950 dark:to-slate-900 bg-gradient-to-b from-amber-50 to-white border dark:border-amber-900/40 border-amber-200 rounded-3xl p-8 flex flex-col shadow-xl transition-colors">
              <h3 className="text-xl font-black dark:text-amber-400 text-amber-600">Agencia 50K</h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black dark:text-white text-slate-900">$50.000</span>
                <span className="text-slate-500 text-xs ml-1">CLP/mes</span>
              </div>
              <ul className="space-y-3 text-xs dark:text-slate-300 text-slate-700 mb-8 flex-1">
                <li className="flex gap-2">✅ Hasta <strong>50 Avisos</strong> activos</li>
                <li className="flex gap-2">✅ Hasta <strong>30 Fotos</strong> por aviso</li>
                <li className="flex gap-2">✅ Hasta <strong>10 Videos</strong></li>
                <li className="flex gap-2 dark:text-amber-300 text-amber-600">👑 Exposición Máxima Absoluta</li>
                <li className="flex gap-2 dark:text-amber-300 text-amber-600">👑 Campaña SEO Ultra Integrada</li>
              </ul>
              <Link href="/dashboard" className="text-center w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition-all text-xs shadow-md">
                Contratar Agencia
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="dark:bg-slate-950 bg-slate-100 border-t dark:border-slate-850 border-slate-300 py-12 mt-20 text-center text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <p>© {new Date().getFullYear()} Propiedades & Parcelas Chile. Todos los derechos reservados.</p>
          <p>
            Plataforma operada y auspiciada en alianza oficial con{' '}
            <a href="https://www.asesoriapublica.cl" target="_blank" rel="noopener noreferrer" className="dark:text-indigo-400 text-indigo-600 hover:text-indigo-800 dark:hover:text-white font-bold underline">
              Asesoría Pública (www.asesoriapublica.cl)
            </a>
          </p>
        </div>
      </footer>

    </div>
  );
}
