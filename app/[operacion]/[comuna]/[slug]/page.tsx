import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{
    operacion: string;
    comuna: string;
    slug: string;
  }>;
}

// 1. GENERACIÓN DE METADATOS DINÁMICOS PARA GOOGLE (SEO SENIOR)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const db = (process.env as any).propiedadesyparcelas_db || (process.env as any).DB;
  
  if (!db) return {};

  // Buscamos los datos básicos de la propiedad para armar los títulos dinámicos
  const propiedad = await db.prepare(
    `SELECT titulo, descripcion, comuna, region FROM propiedades WHERE slug = ?`
  ).bind(slug).first();

  if (!propiedad) return {};

  const tituloSEO = `${propiedad.titulo} en ${propiedad.comuna} | Propidades y Parcelas`;

  return {
    title: tituloSEO,
    description: propiedad.descripcion.substring(0, 160), // Máximo de caracteres recomendado por Google
    openGraph: {
      title: tituloSEO,
      description: propiedad.descripcion.substring(0, 160),
      type: 'website',
      locale: 'es_CL',
    },
  };
}

// 2. COMPONENTE VISUAL DE LA PÁGINA (DISEÑO PREMIUM)
export default async function PropiedadPage({ params }: Props) {
  const { slug } = await params;
  const db = (process.env as any).propiedadesyparcelas_db || (process.env as any).DB;

  if (!db) {
    notFound();
  }

  // Consultamos los datos completos de la propiedad y sus fotos adjuntas
  const propiedad = await db.prepare(
    `SELECT * FROM propiedades WHERE slug = ?`
  ).bind(slug).first();

  if (!propiedad) {
    notFound();
  }

  const { results: fotos } = await db.prepare(
    `SELECT url_r2 FROM fotos WHERE propiedad_id = ?`
  ).bind(propiedad.id).all();

  // 3. INYECCIÓN DEL SCHEMA INMOBILIARIO (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    'name': propiedad.titulo,
    'description': propiedad.descripcion,
    'datePosted': propiedad.fecha_publicacion,
    'priceCurrency': propiedad.precio_uf ? 'CLF' : 'CLP',
    'price': propiedad.precio_uf || propiedad.precio_pesos,
    'listings': {
      '@type': 'SingleFamilyResidence',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': propiedad.comuna,
        'addressRegion': propiedad.region,
        'addressCountry': 'CL'
      }
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Inyección invisible para los robots de búsqueda de Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Título de Cabecera Estilo Premium */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <span className="text-sm font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          En {propiedad.tipo_operacion}
        </span>
        <h1 className="text-4xl font-extrabold text-gray-900 mt-3 tracking-tight">
          {propiedad.titulo}
        </h1>
        <p className="text-gray-500 mt-2">📍 {propiedad.comuna}, {propiedad.region}, Chile</p>
      </div>

      {/* Galería de Fotos Cuadrícula Moderna */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {fotos.map((foto: any, index: number) => (
          <div key={index} className="overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
            <img 
              src={foto.url_r2} 
              alt={`Vista de la propiedad ${index + 1}`} 
              className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>

      {/* Detalles Comerciales y Características técnicas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Descripción de la Propiedad</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{propiedad.descripcion}</p>
          </div>
        </div>

        {/* Tarjeta de precio y contacto lateral pegajosa (Sidebar Premium) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-gray-50 border border-gray-200 p-6 rounded-2xl shadow-sm">
            <div className="mb-6">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Precio Solicitado</span>
              <p className="text-3xl font-black text-gray-950 mt-1">
                {propiedad.precio_uf ? `${propiedad.precio_uf} UF` : `$${propiedad.precio_pesos?.toLocaleString('es-CL')}`}
              </p>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-gray-200 text-sm text-gray-600">
              <div className="flex justify-between"><span>📐 Sup. Total:</span> <span className="font-bold">{propiedad.superficie_total} m²</span></div>
              <div className="flex justify-between"><span>🛏️ Dormitorios:</span> <span className="font-bold">{propiedad.habitaciones}</span></div>
              <div className="flex justify-between"><span>🚿 Baños:</span> <span className="font-bold">{propiedad.banos}</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
