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

export async function generateMetadata({ params }: { params: Promise<{ operacion: string }> }): Promise<Metadata> {
  const { operacion } = await params;
  const operLabel = OPERACION_LABEL[operacion] || operacion;
  const title = `Propiedades ${OPERACION_PREP[operacion] || operacion} en Chile | ${operLabel} | Propiedades & Parcelas`;
  const description = `Encuentra propiedades ${OPERACION_PREP[operacion] || operacion} en Chile. Terrenos, casas y locales comerciales ${OPERACION_PREP[operacion] || operacion}. Revisa fotos, precios y características.`;
  const url = `https://propiedadesyparcelas.cl/${operacion}`;

  return {
    title,
    description,
    keywords: `propiedades ${OPERACION_PREP[operacion]}, ${operLabel.toLowerCase()} de terrenos, casas, locales, portal inmobiliario chile, propiedadesyparcelas.cl`,
    openGraph: { title, description, type: 'website', locale: 'es_CL', siteName: 'Propiedades & Parcelas Chile', url },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
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
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-xs dark:text-slate-400 text-slate-500">
            <Link href="/" className="dark:hover:text-white hover:text-slate-900 transition-colors">Inicio</Link>
            <span>/</span>
            <span className="dark:text-white text-slate-900 font-bold">{operLabel}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-black dark:text-white text-slate-900">
            Propiedades {operPrep} en Chile
          </h1>
          <p className="dark:text-slate-400 text-slate-600 text-sm max-w-3xl">
            {propiedades.length > 0
              ? `Mostrando ${propiedades.length} propiedades ${operPrep} en todo Chile.`
              : `No hay propiedades ${operPrep} disponibles actualmente.`}
          </p>
        </div>

        {tipos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tipos.map((t) => (
              <Link
                key={t.slug}
                href={`/${operacion}/${t.slug}`}
                className="text-xs font-bold uppercase tracking-wider dark:bg-slate-800 bg-white dark:text-indigo-400 text-indigo-600 border dark:border-slate-700 border-slate-300 px-4 py-2 rounded-full hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all"
              >
                {t.label}
              </Link>
            ))}
          </div>
        )}

        {propiedades.length === 0 ? (
          <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 rounded-3xl p-16 text-center dark:text-slate-500 text-slate-400 text-sm shadow-sm transition-colors">
            <p className="text-lg mb-2">No encontramos propiedades {operPrep}.</p>
            <Link href="/buscar" className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md text-xs tracking-wider uppercase">
              Explorar todo el catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propiedades.map((item: any) => (
              <PropertyCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
