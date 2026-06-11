import { Metadata } from 'next';
import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';

export const dynamic = 'force-dynamic';

const OPERACION_LABEL: Record<string, string> = {
  venta: 'Venta',
  compra: 'Compra',
  arriendo: 'Arriendo',
};

const OPERACION_PREP: Record<string, string> = {
  venta: 'en venta',
  compra: 'en compra',
  arriendo: 'en arriendo',
};

const TIPO_SLUGS: Record<string, { slug: string; label: string }[]> = {
  venta: [
    { slug: 'terrenos', label: 'Terrenos y Parcelas' },
    { slug: 'casas', label: 'Casas' },
    { slug: 'locales-comerciales', label: 'Locales Comerciales' },
  ],
  compra: [
    { slug: 'terrenos', label: 'Terrenos y Parcelas' },
    { slug: 'casas', label: 'Casas' },
    { slug: 'locales-comerciales', label: 'Locales Comerciales' },
  ],
  arriendo: [
    { slug: 'terrenos', label: 'Terrenos y Parcelas' },
    { slug: 'casas', label: 'Casas' },
    { slug: 'locales-comerciales', label: 'Locales Comerciales' },
  ],
};

const SEO_DESCRIPTIONS: Record<string, string> = {
  venta: 'Encuentra propiedades en venta en Chile: terrenos, parcelas, casas y locales comerciales. El mejor portal inmobiliario chileno con fotos reales, precios actualizados y contacto directo con vendedores. Compra tu propiedad con confianza.',
  compra: 'Publica tu búsqueda de propiedades en compra en Chile. Si estás buscando terrenos, casas o locales comerciales para comprar, registra tu interés y recibe ofertas de vendedores.',
  arriendo: 'Descubre propiedades en arriendo en Chile. Casas, departamentos, terrenos y locales comerciales en arriendo con fotos, precios y contacto directo. Encuentra tu próximo hogar o negocio.',
};

export async function generateMetadata({ params }: { params: Promise<{ operacion: string }> }): Promise<Metadata> {
  const { operacion } = await params;
  const operLabel = OPERACION_LABEL[operacion] || operacion;
  const operPrep = OPERACION_PREP[operacion] || operacion;
  const title = `Propiedades ${operPrep} en Chile | ${operLabel} de Terrenos, Casas y Locales Comerciales | Propiedades & Parcelas`;
  const description = SEO_DESCRIPTIONS[operacion] || `Encuentra propiedades ${operPrep} en Chile. Terrenos, casas y locales comerciales ${operPrep}. Revisa fotos, precios y características.`;
  const url = `https://propiedadesyparcelas.cl/${operacion}`;

  return {
    title,
    description,
    keywords: `propiedades ${operPrep}, ${operLabel.toLowerCase()} de terrenos, ${operLabel.toLowerCase()} de casas, ${operLabel.toLowerCase()} de locales comerciales, portal inmobiliario chile, propiedadesyparcelas.cl, ${operLabel.toLowerCase()} propiedades chile, ${operLabel.toLowerCase()} parcelas`,
    openGraph: { title, description, type: 'website', locale: 'es_CL', siteName: 'Propiedades & Parcelas Chile', url },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    alternates: { canonical: url },
  };
}

export default async function OperacionLandingPage({ params }: { params: Promise<{ operacion: string }> }) {
  const { operacion } = await params;
  const operLabel = OPERACION_LABEL[operacion] || operacion;
  const operPrep = OPERACION_PREP[operacion] || operacion;
  const tipos = TIPO_SLUGS[operacion] || [];

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
        `SELECT p.*, 
                (SELECT url_r2 FROM fotos WHERE propiedad_id = p.id LIMIT 1) as foto_principal 
         FROM propiedades p 
         WHERE p.tipo_operacion = ?
         ORDER BY p.prioridad_score DESC, p.fecha_publicacion DESC 
         LIMIT 50`
      ).bind(operacion).all();
      propiedades = results || [];
    } catch (error) {
      console.error("Error al consultar propiedades:", error);
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': 'https://propiedadesyparcelas.cl/' },
          { '@type': 'ListItem', 'position': 2, 'name': operLabel, 'item': `https://propiedadesyparcelas.cl/${operacion}` },
        ],
      },
      {
        '@type': 'CollectionPage',
        'name': `Propiedades ${operPrep} en Chile`,
        'description': SEO_DESCRIPTIONS[operacion],
        'url': `https://propiedadesyparcelas.cl/${operacion}`,
      },
    ],
  };

  return (
    <div className="dark:bg-slate-900 bg-slate-50 min-h-screen font-sans antialiased dark:text-slate-100 text-slate-900 pb-20 transition-colors">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="dark:bg-indigo-950 bg-indigo-100 border-b dark:border-indigo-500/40 border-indigo-300 text-center py-4 px-4 text-sm font-bold dark:text-indigo-100 text-indigo-900 shadow-md transition-colors">
        🌟 Plataforma de extensión de servicios de{' '}
        <a href="https://www.asesoriapublica.cl" target="_blank" rel="noopener noreferrer" className="underline dark:hover:text-white hover:text-indigo-600 dark:text-indigo-300 text-indigo-700 font-black tracking-wide">
          www.asesoriapublica.cl
        </a>{' '}
        — Consultoría privada y pública en Chile.
      </div>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-xs dark:text-slate-400 text-slate-500">
            <Link href="/" className="dark:hover:text-white hover:text-slate-900 transition-colors">Inicio</Link>
            <span>/</span>
            <span className="dark:text-white text-slate-900 font-bold">{operLabel}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-black dark:text-white text-slate-900">
            Propiedades {operPrep} en Chile
          </h1>
          <p className="dark:text-slate-400 text-slate-600 text-sm max-w-3xl leading-relaxed">
            {SEO_DESCRIPTIONS[operacion]}
          </p>
          {propiedades.length > 0 && (
            <p className="text-xs dark:text-slate-500 text-slate-500 font-medium">
              {propiedades.length} propiedades{operacion === 'arriendo' ? '' : 's'} disponibles {operPrep} en todo Chile. Actualizado constantemente.
            </p>
          )}
        </div>

        {tipos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tipos.map((t) => (
              <Link
                key={t.slug}
                href={`/${operacion}/${t.slug}`}
                className="text-xs font-bold uppercase tracking-wider dark:bg-slate-800 bg-white dark:text-indigo-400 text-indigo-600 border dark:border-slate-700 border-slate-300 px-4 py-2 rounded-full hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all"
              >
                {t.label} {operPrep}
              </Link>
            ))}
          </div>
        )}

        {/* Seo text bloque */}
        <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 shadow-sm transition-colors">
          <h2 className="text-sm font-bold dark:text-white text-slate-900 mb-2">
            {operLabel === 'Venta' ? 'Compra' : operLabel === 'Arriendo' ? 'Arrienda' : 'Encuentra'} con confianza en Propiedades & Parcelas Chile
          </h2>
          <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
            Somos el portal inmobiliario chileno especializado en {operPrep.toLowerCase()}. 
            {operacion === 'venta' ? ' Publica tu propiedad en venta o encuentra el terreno, casa o local comercial que buscas. Todas nuestras publicaciones cuentan con fotos reales, descripciones detalladas y documentos de respaldo.' : ''}
            {operacion === 'arriendo' ? ' Encuentra el hogar o local perfecto para arrendar. Filtra por región, comuna, precio y tipo de propiedad.' : ''}
            {operacion === 'compra' ? ' Si buscas comprar una propiedad, publica tu requerimiento y recibe ofertas de vendedores directos.' : ''}
            {' '}Contamos con planes para corredores de propiedades y propietarios que quieren máxima exposición en Google.
          </p>
        </div>

        {propiedades.length === 0 ? (
          <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 rounded-3xl p-16 text-center dark:text-slate-500 text-slate-400 text-sm shadow-sm transition-colors">
            <p className="text-lg mb-2">No encontramos propiedades {operPrep}.</p>
            <p className="text-xs mb-6">Actualmente no hay anuncios disponibles para esta categoría. Vuelve pronto o explora otras opciones.</p>
            <Link href="/buscar" className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md text-xs tracking-wider uppercase">
              Explorar todo el catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {propiedades.map((item: any) => (
                <PropertyCard key={item.id} item={item} />
              ))}
            </div>
            <div className="text-center pt-8">
              <Link
                href="/buscar"
                className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md text-xs tracking-wider uppercase"
              >
                Ver todas las propiedades {operPrep} →
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
