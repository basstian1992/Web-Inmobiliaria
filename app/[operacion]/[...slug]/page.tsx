import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';
import GalleryLightbox from '@/components/GalleryLightbox';
import VisitTracker from '@/components/VisitTracker';
import PropertyMap from '@/components/PropertyMap';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ operacion: string; slug: string[] }>;
}

// === CONSTANTS ===
const TIPO_MAP: Record<string, { db: string; label: string; keywords: string }> = {
  terrenos: { db: 'terreno', label: 'Terrenos y Parcelas', keywords: 'terrenos en venta, parcelas en venta, terrenos agrícolas, parcelas de agrado, sitios eriazos, terrenos rurales chile' },
  casas: { db: 'casa', label: 'Casas', keywords: 'casas en venta, departamentos en venta, viviendas, propiedades residenciales, inmuebles, casas en chile' },
  'locales-comerciales': { db: 'local', label: 'Locales Comerciales', keywords: 'locales comerciales en venta, locales en arriendo, propiedades comerciales, bodegas, oficinas, locales chile' },
};

const OPERACION_LABEL: Record<string, string> = { venta: 'Venta', compra: 'Compra', arriendo: 'Arriendo' };
const OPERACION_PREP: Record<string, string> = { venta: 'en venta', compra: 'en compra', arriendo: 'en arriendo' };

const TIPO_DESCRIPTIONS: Record<string, Record<string, string>> = {
  venta: {
    terrenos: 'Descubre terrenos y parcelas en venta en Chile. Ideales para proyectos inmobiliarios, agricultura, ganadería o recreación.',
    casas: 'Encuentra casas en venta en Chile. Propiedades residenciales de alto estándar, con excelente conectividad y servicios cercanos.',
    'locales-comerciales': 'Explora locales comerciales en venta en Chile. Oportunidades de inversión en las mejores zonas comerciales del país.',
  },
  compra: {
    terrenos: 'Buscamos terrenos y parcelas en compra en Chile. Si tienes un terreno que quieras vender, contáctanos.',
    casas: 'Buscamos casas en compra en Chile. Si quieres vender tu propiedad, publícala con nosotros.',
    'locales-comerciales': 'Buscamos locales comerciales en compra en Chile. Oportunidades para vender tu propiedad comercial.',
  },
  arriendo: {
    terrenos: 'Encuentra terrenos y parcelas en arriendo en Chile. Perfectos para proyectos temporales, agricultura o eventos.',
    casas: 'Descubre casas en arriendo en Chile. Viviendas temporales y permanentes con los mejores estándares de calidad.',
    'locales-comerciales': 'Encuentra locales comerciales en arriendo en Chile. El espacio perfecto para tu negocio o emprendimiento.',
  },
};

// === HELPERS ===
function getEmbedUrl(url: string) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  }
  if (url.includes('vimeo.com')) {
    const regExp = /vimeo\.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  }
  return null;
}

function buildPropertySchemas(propiedad: any, operacion: string, comuna: string, slug: string, fotos: any[]) {
  const breadcrumbLabel = propiedad.tipo_operacion === 'venta' ? 'Venta' : propiedad.tipo_operacion === 'compra' ? 'Compra' : 'Arriendo';
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': 'https://www.propiedadesyparcelas.cl/' },
      { '@type': 'ListItem', 'position': 2, 'name': breadcrumbLabel, 'item': `https://www.propiedadesyparcelas.cl/buscar?operacion=${propiedad.tipo_operacion}` },
      { '@type': 'ListItem', 'position': 3, 'name': propiedad.comuna, 'item': `https://www.propiedadesyparcelas.cl/buscar?comuna=${propiedad.comuna}` },
      { '@type': 'ListItem', 'position': 4, 'name': propiedad.titulo }
    ]
  };
  const isTerreno = propiedad.tipo_propiedad === 'terreno';
  const listingType = isTerreno ? 'Land' : 'SingleFamilyResidence';
  const listing: any = {
    '@type': listingType,
    'address': { '@type': 'PostalAddress', 'addressLocality': propiedad.comuna, 'addressRegion': propiedad.region, 'addressCountry': 'CL' }
  };
  if (isTerreno) {
    listing.landArea = { '@type': 'QuantitativeValue', 'value': propiedad.superficie_total, 'unitCode': 'MTK' };
  } else {
    listing.numberOfRooms = propiedad.habitaciones;
    listing.numberOfBathroomsTotal = propiedad.banos;
    listing.floorSize = { '@type': 'QuantitativeValue', 'value': propiedad.superficie_total, 'unitCode': 'MTK' };
  }
  const realEstateListing: any = {
    '@type': 'RealEstateListing',
    'name': propiedad.titulo,
    'description': propiedad.descripcion,
    'datePosted': propiedad.fecha_publicacion,
    'url': `https://www.propiedadesyparcelas.cl/${operacion}/${comuna}/${slug}`,
    'listing': listing,
    'offers': {
      '@type': 'Offer',
      'price': propiedad.precio_uf || propiedad.precio_pesos,
      'priceCurrency': propiedad.precio_uf ? 'CLF' : 'CLP',
      'availability': 'https://schema.org/InStock'
    }
  };
  if (fotos && fotos.length > 0) realEstateListing.image = fotos[0].url_r2;
  const organization = { '@type': 'RealEstateAgent', 'name': 'Propiedades & Parcelas Chile', 'url': 'https://www.propiedadesyparcelas.cl/', 'areaServed': { '@type': 'Country', 'name': 'Chile' } };
  const website = { '@type': 'WebSite', 'name': 'Propiedades & Parcelas Chile', 'url': 'https://www.propiedadesyparcelas.cl/', 'potentialAction': { '@type': 'SearchAction', 'target': 'https://www.propiedadesyparcelas.cl/buscar?q={search_term_string}', 'query-input': 'required name=search_term_string' } };
  return [breadcrumb, realEstateListing, organization, website];
}

// === METADATA ===
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { operacion, slug } = await params;

  if (slug.length === 1) {
    const tipo = slug[0];
    const tipoInfo = TIPO_MAP[tipo];
    if (!tipoInfo) return {};
    const tipoLabel = tipoInfo.label;
    const operLabel = OPERACION_LABEL[operacion] || operacion;
    const operPrep = OPERACION_PREP[operacion] || operacion;
    const description = TIPO_DESCRIPTIONS[operacion]?.[tipo] || `Encuentra ${tipoLabel.toLowerCase()} ${operPrep} en Chile.`;
    const url = `https://propiedadesyparcelas.cl/${operacion}/${tipo}`;
    return {
      title: `${operLabel} de ${tipoLabel} en Chile | Propiedades & Parcelas`,
      description,
      keywords: `${tipoInfo.keywords}, ${operPrep} de ${tipoLabel.toLowerCase()}, portal inmobiliario chile, propiedadesyparcelas.cl`,
      openGraph: { title: `${operLabel} de ${tipoLabel} en Chile | Propiedades & Parcelas`, description, type: 'website', locale: 'es_CL', siteName: 'Propiedades & Parcelas Chile', url },
      twitter: { card: 'summary_large_image', title: `${operLabel} de ${tipoLabel} en Chile | Propiedades & Parcelas`, description },
      robots: { index: true, follow: true },
      alternates: { canonical: url },
    };
  }

  if (slug.length === 2) {
    const [, propSlug] = slug;
    let db: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      db = getCloudflareContext().env.DB;
    } catch (e) {
      db = (globalThis as any).DB || (process.env as any).DB;
    }
    if (!db) return {};
    const propiedad = await db.prepare(
      `SELECT p.titulo, p.descripcion, p.comuna, p.region, p.tipo_propiedad, p.tipo_operacion, p.precio_pesos, p.precio_uf,
              (SELECT url_r2 FROM fotos WHERE propiedad_id = p.id ORDER BY es_principal DESC LIMIT 1) as foto_principal
       FROM propiedades p WHERE slug = ?`
    ).bind(propSlug).first();
    if (!propiedad) return {};
    const propTipoLabel = propiedad.tipo_propiedad === 'terreno' ? 'Terreno / Parcela' : propiedad.tipo_propiedad === 'casa' ? 'Casa' : 'Local Comercial';
    const tituloSEO = `${propTipoLabel} en ${propiedad.tipo_operacion === 'venta' ? 'Venta' : propiedad.tipo_operacion === 'compra' ? 'Compra' : 'Arriendo'} | ${propiedad.titulo} en ${propiedad.comuna} | Propiedades & Parcelas Chile`;
    const descSEO = `${propiedad.descripcion.substring(0, 155)}... Encuentra parcelas en venta, arriendos de locales y casas en Chile en propiedadesyparcelas.cl`;
    const operacionLabel = propiedad.tipo_operacion === 'venta' ? 'venta' : propiedad.tipo_operacion === 'compra' ? 'compra' : 'arriendo';
    const keywords = `${propTipoLabel} en ${operacionLabel}, ${propTipoLabel} en ${propiedad.comuna}, ${propiedad.tipo_operacion} de ${propTipoLabel.toLowerCase()}, propiedades en ${propiedad.comuna}, ${propiedad.region}, corretaje, inmobiliaria Chile, propiedades y parcelas`;
    return {
      title: tituloSEO, description: descSEO, keywords,
      openGraph: { title: tituloSEO, description: descSEO, type: 'website', locale: 'es_CL', siteName: 'Propiedades & Parcelas Chile', url: `https://www.propiedadesyparcelas.cl/${operacion}/${slug[0]}/${slug[1]}`, images: propiedad.foto_principal ? [{ url: propiedad.foto_principal, width: 1200, height: 630 }] : [] },
      twitter: { card: 'summary_large_image', title: tituloSEO, description: descSEO, images: propiedad.foto_principal ? [propiedad.foto_principal] : [] },
      robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
      alternates: { canonical: `https://www.propiedadesyparcelas.cl/${operacion}/${slug[0]}/${slug[1]}` },
      other: { 'og:price:amount': propiedad.precio_uf?.toString() || propiedad.precio_pesos?.toString() || '', 'og:price:currency': propiedad.precio_uf ? 'CLF' : 'CLP' },
    };
  }

  return {};
}

// === PAGE COMPONENT ===
export default async function CatchAllPage({ params }: Props) {
  const { operacion, slug } = await params;

  // ----- TIPO LANDING (1 segment: /venta/casas) -----
  if (slug.length === 1) {
    const tipo = slug[0];
    const tipoInfo = TIPO_MAP[tipo];
    if (!tipoInfo) { notFound(); }

    const dbTipo = tipoInfo.db;
    const tipoLabel = tipoInfo.label;
    const operLabel = OPERACION_LABEL[operacion] || operacion;
    const operPrep = OPERACION_PREP[operacion] || operacion;

    let db: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      db = getCloudflareContext().env.DB;
    } catch (e) {
      db = (globalThis as any).DB || (process.env as any).DB;
    }

    let propiedades: any[] = [];
    if (db) {
      try {
        const { results } = await db.prepare(
          `SELECT p.*, (SELECT url_r2 FROM fotos WHERE propiedad_id = p.id LIMIT 1) as foto_principal FROM propiedades p WHERE p.tipo_operacion = ? AND p.tipo_propiedad = ? ORDER BY p.prioridad_score DESC, p.fecha_publicacion DESC LIMIT 50`
        ).bind(operacion, dbTipo).all();
        propiedades = results || [];
      } catch (error) {
        console.error("Error al consultar propiedades:", error);
      }
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'BreadcrumbList', 'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': 'https://propiedadesyparcelas.cl/' },
          { '@type': 'ListItem', 'position': 2, 'name': operLabel, 'item': `https://propiedadesyparcelas.cl/${operacion}` },
          { '@type': 'ListItem', 'position': 3, 'name': tipoLabel, 'item': `https://propiedadesyparcelas.cl/${operacion}/${tipo}` },
        ]},
        { '@type': 'ItemList', 'name': `${operLabel} de ${tipoLabel} en Chile`, 'description': `Listado de ${tipoLabel.toLowerCase()} ${operPrep} en Chile`, 'url': `https://propiedadesyparcelas.cl/${operacion}/${tipo}`, numberOfItems: propiedades.length, itemListElement: propiedades.slice(0, 10).map((p: any, i: number) => ({ '@type': 'ListItem', position: i + 1, url: `https://propiedadesyparcelas.cl/${p.tipo_operacion}/${p.comuna}/${p.slug}` })) },
      ],
    };

    return (
      <div className="dark:bg-slate-900 bg-slate-50 min-h-screen font-sans antialiased dark:text-slate-100 text-slate-900 pb-20 transition-colors">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="dark:bg-indigo-950 bg-indigo-100 border-b dark:border-indigo-500/40 border-indigo-300 text-center py-4 px-4 text-sm font-bold dark:text-indigo-100 text-indigo-900 shadow-md transition-colors">
          🌟 Plataforma de extensión de servicios de{' '}
          <a href="https://www.asesoriapublica.cl" target="_blank" rel="noopener noreferrer" className="underline dark:hover:text-white hover:text-indigo-600 dark:text-indigo-300 text-indigo-700 font-black tracking-wide">www.asesoriapublica.cl</a>
          {' '}— Consultoría privada y pública en Chile.
        </div>
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-4">
            <nav className="flex items-center gap-2 text-xs dark:text-slate-400 text-slate-500">
              <Link href="/" className="dark:hover:text-white hover:text-slate-900 transition-colors">Inicio</Link>
              <span>/</span>
              <Link href={`/${operacion}`} className="dark:hover:text-white hover:text-slate-900 transition-colors">{operLabel}</Link>
              <span>/</span>
              <span className="dark:text-white text-slate-900 font-bold">{tipoLabel}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-black dark:text-white text-slate-900">{tipoLabel} {operPrep} en Chile</h1>
            <p className="dark:text-slate-400 text-slate-600 text-sm max-w-3xl">{TIPO_DESCRIPTIONS[operacion]?.[tipo] || `Encuentra ${tipoLabel.toLowerCase()} ${operPrep} en Chile.`}</p>
          </div>
          {propiedades.length === 0 ? (
            <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 rounded-3xl p-16 text-center dark:text-slate-500 text-slate-400 text-sm shadow-sm transition-colors">
              <p className="text-lg mb-2">No encontramos {tipoLabel.toLowerCase()} {operPrep}.</p>
              <p className="text-xs mb-6">Actualmente no hay anuncios disponibles para esta categoría.</p>
              <Link href="/buscar" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md text-xs tracking-wider uppercase">Explorar todo el catálogo</Link>
            </div>
          ) : (
            <>
              <p className="text-sm dark:text-slate-400 text-slate-600">Mostrando {propiedades.length} {tipoLabel.toLowerCase()} {operPrep}.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {propiedades.map((item: any) => (<PropertyCard key={item.id} item={item} />))}
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // ----- PROPERTY DETAIL (2 segments: /venta/santiago/propiedad-123) -----
  if (slug.length === 2) {
    const [comuna, propSlug] = slug;

    let db: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      db = getCloudflareContext().env.DB;
    } catch (e) {
      db = (globalThis as any).DB || (process.env as any).DB;
    }

    if (!db) { notFound(); }

    const propiedad = await db.prepare(`SELECT * FROM propiedades WHERE slug = ?`).bind(propSlug).first();
    if (!propiedad) { notFound(); }

    const { results: fotos } = await db.prepare(`SELECT url_r2 FROM fotos WHERE propiedad_id = ?`).bind(propiedad.id).all();
    const { results: videos } = await db.prepare(`SELECT * FROM videos WHERE propiedad_id = ?`).bind(propiedad.id).all();

    let documentosList: string[] = [];
    try { documentosList = JSON.parse(propiedad.documentos || '[]'); } catch (e) { documentosList = []; }

    const propLabel = propiedad.tipo_propiedad === 'terreno' ? 'Terreno / Parcela' : propiedad.tipo_propiedad === 'casa' ? 'Casa' : 'Local Comercial';
    const schemas = buildPropertySchemas(propiedad, operacion, comuna, propSlug, fotos);
    const jsonLd = { '@context': 'https://schema.org', '@graph': schemas };

    return (
      <div className="dark:bg-slate-900 bg-slate-50 min-h-screen dark:text-slate-100 text-slate-900 font-sans antialiased pb-20 transition-colors">
        <VisitTracker propiedadId={propiedad.id} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="dark:bg-slate-950 bg-indigo-100 border-b dark:border-slate-800 border-indigo-300 text-center py-2.5 px-4 text-xs font-semibold dark:text-indigo-300 text-indigo-900 transition-colors">
          🤝 Esta propiedad está auspiciada bajo la alianza de corretaje con{' '}
          <a href="https://www.asesoriapublica.cl" target="_blank" rel="noopener noreferrer" className="underline dark:hover:text-white hover:text-indigo-600 font-bold dark:text-indigo-200 text-indigo-700">www.asesoriapublica.cl</a>
        </div>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-xs font-bold dark:text-indigo-400 text-indigo-600 dark:hover:text-white hover:text-indigo-800 transition-colors">← Volver al catálogo principal</Link>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-10">
          <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md transition-colors">
            <div className="space-y-3">
              <div className="flex gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-950 dark:bg-indigo-400 bg-indigo-300 px-3 py-1 rounded-full">
                  {propiedad.tipo_operacion === 'venta' ? 'En Venta' : propiedad.tipo_operacion === 'compra' ? 'Se Compra' : 'En Arriendo'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider dark:text-slate-400 text-slate-600 dark:bg-slate-800 bg-slate-200 border dark:border-slate-700 border-slate-300 px-3 py-1 rounded-full">{propLabel}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold dark:text-white text-slate-900 tracking-tight">{propiedad.titulo}</h1>
              <p className="dark:text-slate-400 text-slate-600 text-sm flex items-center gap-1">📍 {propiedad.comuna}, {propiedad.region}, Chile</p>
            </div>
            <div className="dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 p-6 rounded-2xl text-center md:text-right w-full md:w-auto shrink-0 shadow-lg transition-colors">
              <span className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500 tracking-wider">Valor comercial</span>
              <p className="text-3xl font-black dark:text-white text-slate-900 mt-1">
                {propiedad.precio_uf ? `${propiedad.precio_uf} UF` : propiedad.precio_pesos ? `$${propiedad.precio_pesos.toLocaleString('es-CL')} CLP` : 'Consultar Precio'}
              </p>
            </div>
          </div>

          {fotos && fotos.length > 0 ? (
            <GalleryLightbox images={fotos.map((foto: any, index: number) => ({ url_r2: foto.url_r2, alt: `${propiedad.titulo} - Imagen ${index + 1}` }))} />
          ) : (
            <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 rounded-3xl p-12 text-center dark:text-slate-500 text-slate-400 text-sm font-medium shadow-sm transition-colors">No se han cargado imágenes para esta propiedad.</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 transition-colors">
                <h2 className="text-lg font-bold dark:text-white text-slate-900 uppercase tracking-wider border-b dark:border-slate-800 border-slate-200 pb-2">Descripción General</h2>
                <p className="dark:text-slate-300 text-slate-700 text-sm leading-relaxed whitespace-pre-line">{propiedad.descripcion}</p>
              </div>

              {documentosList.length > 0 && (
                <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 transition-colors">
                  <h2 className="text-lg font-bold dark:text-indigo-400 text-indigo-600 uppercase tracking-wider border-b dark:border-slate-800 border-slate-200 pb-2">📂 Documentación Checklist Legal</h2>
                  <p className="dark:text-slate-400 text-slate-600 text-xs">Esta propiedad cuenta con los siguientes documentos físicos revisados y saneados:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {documentosList.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-semibold dark:text-slate-200 text-slate-700">
                        <span className="text-emerald-500">✔</span><span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {videos && videos.length > 0 && (
                <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 transition-colors">
                  <h2 className="text-lg font-bold dark:text-white text-slate-900 uppercase tracking-wider border-b dark:border-slate-800 border-slate-200 pb-2">🎥 Videos de la Propiedad</h2>
                  {videos.map((vid: any, idx: number) => {
                    const embedUrl = vid.url_externo ? getEmbedUrl(vid.url_externo) : null;
                    return (
                      <div key={idx} className="space-y-2">
                        {embedUrl ? (
                          <div className="aspect-video w-full rounded-2xl overflow-hidden border dark:border-slate-850 border-slate-200">
                            <iframe src={embedUrl} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
                          </div>
                        ) : vid.url_externo ? (
                          <a href={vid.url_externo} target="_blank" rel="noopener noreferrer" className="block p-4 dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 rounded-2xl text-xs font-bold dark:text-indigo-400 text-indigo-600 dark:hover:text-white hover:text-indigo-800 text-center transition-colors">Ver Video Externo ↗ ({vid.url_externo})</a>
                        ) : vid.url_r2 ? (
                          <video src={vid.url_r2} controls className="w-full rounded-2xl border dark:border-slate-850 border-slate-200" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Mapa interactivo */}
              <PropertyMap comuna={propiedad.comuna} region={propiedad.region} titulo={propiedad.titulo} />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 p-6 rounded-3xl shadow-xl space-y-4 transition-colors">
                <h3 className="text-sm font-bold dark:text-slate-400 text-slate-500 uppercase tracking-widest border-b dark:border-slate-800 border-slate-200 pb-2">Ficha Técnica</h3>
                <div className="space-y-3 text-xs font-medium dark:text-slate-300 text-slate-700">
                  <div className="flex justify-between py-1 border-b dark:border-slate-900 border-slate-100">
                    <span>📐 Sup. Total:</span>
                    <span className="font-bold dark:text-white text-slate-900">{propiedad.superficie_total} m²</span>
                  </div>
                  {propiedad.tipo_propiedad !== 'terreno' && (
                    <>
                      <div className="flex justify-between py-1 border-b dark:border-slate-900 border-slate-100">
                        <span>🛏️ Dormitorios:</span>
                        <span className="font-bold dark:text-white text-slate-900">{propiedad.habitaciones}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b dark:border-slate-900 border-slate-100">
                        <span>🚿 Baños:</span>
                        <span className="font-bold dark:text-white text-slate-900">{propiedad.banos}</span>
                      </div>
                    </>
                  )}
                  {propiedad.observaciones && (
                    <div className="pt-2">
                      <span className="block text-[10px] dark:text-slate-500 text-slate-400 uppercase font-bold tracking-wider mb-1">Notas de Visitas</span>
                      <p className="dark:text-slate-400 text-slate-600 italic text-[11px] leading-relaxed">&ldquo;{propiedad.observaciones}&rdquo;</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="dark:bg-gradient-to-br dark:from-indigo-950 dark:to-slate-950 bg-gradient-to-br from-indigo-50 to-white border dark:border-indigo-900/40 border-indigo-200 p-6 rounded-3xl shadow-xl space-y-6 transition-colors">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest dark:text-indigo-400 text-indigo-700 dark:bg-indigo-500/10 bg-indigo-100 border dark:border-indigo-500/20 border-indigo-300 px-3 py-1 rounded-full inline-block">Contacto Autorizado</span>
                  <h4 className="text-lg font-black dark:text-white text-slate-900">{propiedad.contacto_nombre || 'Corredor Premium'}</h4>
                  <p className="dark:text-slate-400 text-slate-600 text-xs">Ponte en contacto directo con el vendedor para agendar visitas o hacer ofertas comerciales.</p>
                </div>
                <div className="space-y-3">
                  {propiedad.contacto_telefono && (
                    <a href={`https://wa.me/${propiedad.contacto_telefono.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                      <span>💬 WhatsApp Vendedor</span>
                    </a>
                  )}
                  {propiedad.contacto_email && (
                    <a href={`mailto:${propiedad.contacto_email}?subject=Interés por: ${encodeURIComponent(propiedad.titulo)}`} className="w-full dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-300 dark:hover:bg-slate-800 hover:bg-slate-200 dark:text-slate-300 text-slate-700 font-extrabold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm">
                      <span>✉ Enviar Correo</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="dark:bg-gradient-to-br dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950 bg-gradient-to-br from-indigo-50 via-white to-blue-50 border dark:border-indigo-900/30 border-indigo-200 p-6 rounded-3xl shadow-xl space-y-4 transition-colors">
                <h4 className="text-xs font-bold uppercase dark:text-indigo-400 text-indigo-700 tracking-wider">¿Estudio de Títulos Saneado?</h4>
                <p className="dark:text-slate-400 text-slate-600 text-xs leading-relaxed">Antes de firmar promesas de compraventa, asegúrate con abogados expertos en saneamientos, herencias y subdivisión de terrenos rurales en Chile.</p>
                <a href="https://www.asesoriapublica.cl" target="_blank" rel="noopener noreferrer" className="block text-center dark:bg-indigo-900/20 bg-indigo-100 dark:hover:bg-indigo-900/30 hover:bg-indigo-200 dark:text-indigo-300 text-indigo-700 font-bold text-xs py-2.5 rounded-xl border dark:border-indigo-900/40 border-indigo-300 transition-all">Visitar Asesoría Pública ↗</a>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  notFound();
}
