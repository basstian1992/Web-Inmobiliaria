import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Consejos Inmobiliarios Chile | Guía Completa para Comprar, Vender y Arrendar Propiedades, Parcelas y Locales Comerciales",
  description: "Guía definitiva con consejos legales, financieros y técnicos para comprar, vender o arrendar propiedades en Chile. Aprende sobre cesión de derechos, CIP, estudio de títulos, recepción municipal y más. Tips de expertos inmobiliarios 2026.",
  keywords: "consejos inmobiliarios chile, comprar parcela en chile, cesión de derechos, certificado informaciones previas, estudio de títulos, recepción final municipal, arrendar propiedad chile, comprar casa chile, inversion inmobiliaria, regularizar terreno, subdivisión predial, asesoria legal inmobiliaria, contrato arriendo notaria, inventario arriendo, cbr certificado, rol sii propiedad",
  openGraph: {
    title: "Guía Completa de Consejos Inmobiliarios para Comprar, Vender y Arrendar en Chile | Propiedades & Parcelas",
    description: "Todo lo que debes saber antes de comprar una parcela, casa o local comercial en Chile. Evita estafas y problemas legales con nuestra guía actualizada.",
    type: 'article',
    locale: 'es_CL',
    siteName: 'Propiedades & Parcelas Chile',
    url: 'https://www.propiedadesyparcelas.cl/consejos',
    images: [{ url: 'https://www.propiedadesyparcelas.cl/logo-nuevo.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Consejos Inmobiliarios Chile - Guía Completa 2026",
    description: "Aprende todo antes de comprar, vender o arrendar. Guía legal, financiera y técnica del mercado inmobiliario chileno.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: 'https://www.propiedadesyparcelas.cl/consejos' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': 'https://www.propiedadesyparcelas.cl/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Consejos Inmobiliarios', 'item': 'https://www.propiedadesyparcelas.cl/consejos' },
      ],
    },
    {
      '@type': 'Article',
      'headline': 'Guía Completa de Consejos Inmobiliarios para Comprar, Vender y Arrendar en Chile',
      'description': 'Todo lo que necesitas saber antes de realizar una transacción inmobiliaria en Chile. Consejos legales, financieros y técnicos actualizados.',
      'author': { '@type': 'Organization', 'name': 'Propiedades & Parcelas Chile' },
      'publisher': { '@type': 'Organization', 'name': 'Propiedades & Parcelas Chile', 'url': 'https://www.propiedadesyparcelas.cl/' },
      'datePublished': '2024-01-01',
      'dateModified': new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': '¿Qué es la cesión de derechos en un terreno?',
          'acceptedAnswer': { '@type': 'Answer', 'text': 'Es cuando compras un porcentaje de derechos sobre un inmueble sin obtener inmediatamente el título de dominio como propietario. En Chile, la subdivisión mínima legal es de 5.000 m² en zonas rurales. Para obtener título de dominio debes cumplir condiciones del Ministerio de Bienes Nacionales.' },
        },
        {
          '@type': 'Question',
          'name': '¿Qué es el Certificado de Informaciones Previas (CIP)?',
          'acceptedAnswer': { '@type': 'Answer', 'text': 'Es un documento emitido por la Dirección de Obras Municipales (DOM) que indica qué se puede construir en un terreno, si está en zona de riesgo, y la normativa urbanística aplicable. Es obligatorio solicitarlo antes de comprar un terreno.' },
        },
        {
          '@type': 'Question',
          'name': '¿Qué documentos revisar antes de comprar una casa en Chile?',
          'acceptedAnswer': { '@type': 'Answer', 'text': 'Debes verificar: Recepción Final de Obras (DOM), estudio de títulos de los últimos 10 años, certificado de deuda en TGR, gastos comunes al día, y certificado de hipotecas y gravámenes en el Conservador de Bienes Raíces.' },
        },
        {
          '@type': 'Question',
          'name': '¿Es obligatorio firmar el contrato de arriendo ante notario en Chile?',
          'acceptedAnswer': { '@type': 'Answer', 'text': 'Sí, es altamente recomendable. La Ley de Arriendo "Devuélveme mi casa" exige firmas autorizadas ante notario para agilizar desalojos en caso de incumplimiento. Además, un inventario con fotos protege tanto al arrendador como al arrendatario.' },
        },
        {
          '@type': 'Question',
          'name': '¿Qué es el Rol de Avalúo del SII?',
          'acceptedAnswer': { '@type': 'Answer', 'text': 'Es un número único asignado por el Servicio de Impuestos Internos a cada propiedad. Sin Rol propio no puedes escriturar ni regularizar. Verifica siempre que el terreno o propiedad tenga Rol de Avalúo antes de comprar.' },
        },
        {
          '@type': 'Question',
          'name': '¿Cómo publicar una propiedad en venta en Chile?',
          'acceptedAnswer': { '@type': 'Answer', 'text': 'Puedes publicar tu propiedad de forma gratuita en portales como Propiedades & Parcelas. Para mayor exposición, los planes pagados ofrecen impulso SEO, más fotos y videos, y prioridad en búsquedas de Google. Incluye fotos de calidad, descripción detallada y documentos legales disponibles.' },
        },
        {
          '@type': 'Question',
          'name': '¿Cuánto cuesta publicar un aviso inmobiliario en Chile?',
          'acceptedAnswer': { '@type': 'Answer', 'text': 'Existen planes desde $10.000 mensuales que incluyen 8 avisos, 16 fotos y 2 videos. El plan más completo cuesta $50.000 mensuales con 100 avisos, 60 fotos y 20 videos. También hay plan gratuito con 2 avisos y 5 fotos.' },
        },
        {
          '@type': 'Question',
          'name': '¿Qué es el Conservador de Bienes Raíces (CBR)?',
          'acceptedAnswer': { '@type': 'Answer', 'text': 'Es la institución encargada de registrar la propiedad inmueble en Chile. Allí debes solicitar el Certificado de Dominio Vigente y el Certificado de Hipotecas y Gravámenes para asegurar que el vendedor es dueño legítimo y la propiedad no tiene deudas.' },
        },
      ],
    },
  ],
};

export default function ConsejosPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="dark:bg-slate-900 bg-slate-50 min-h-screen font-sans antialiased text-slate-900 dark:text-slate-100 pb-20 transition-colors">

        {/* Banner / Header */}
        <section className="relative dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-20 px-4 sm:px-6 lg:px-8 text-center border-b dark:border-slate-800 border-slate-200 transition-colors overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto space-y-6">
            <span className="dark:text-indigo-400 text-indigo-600 uppercase tracking-widest text-[10px] font-bold dark:bg-indigo-500/10 bg-indigo-100 px-4.5 py-2 rounded-full border dark:border-indigo-500/20 border-indigo-300 shadow-sm">
              Guía Inmobiliaria Chile 2026
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-blue-300 from-slate-900 via-indigo-900 to-blue-800 leading-tight">
              Consejos Inmobiliarios en Chile: Guía Completa para Comprar, Vender y Arrendar
            </h1>
            <p className="text-base sm:text-lg dark:text-slate-400 text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Evita estafas, problemas legales y dolores de cabeza. Revisa nuestra guía con las sugerencias legales, técnicas y prácticas más actualizadas del mercado inmobiliario chileno. Aprende todo sobre <strong>cesión de derechos</strong>, <strong>CIP</strong>, <strong>estudio de títulos</strong> y más.
            </p>
          </div>
        </section>

        {/* Barra de navegación interna */}
        <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-8">
          <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-4 shadow-md flex flex-wrap gap-2 justify-center text-xs font-bold">
            <span className="dark:text-slate-400 text-slate-500 mr-1">📌 Saltar a:</span>
            <a href="#terrenos" className="dark:text-indigo-400 text-indigo-600 hover:underline">Terrenos</a>
            <span className="dark:text-slate-700 text-slate-300">|</span>
            <a href="#casas" className="dark:text-indigo-400 text-indigo-600 hover:underline">Casas y Locales</a>
            <span className="dark:text-slate-700 text-slate-300">|</span>
            <a href="#arriendos" className="dark:text-indigo-400 text-indigo-600 hover:underline">Arriendos</a>
            <span className="dark:text-slate-700 text-slate-300">|</span>
            <a href="#faq" className="dark:text-indigo-400 text-indigo-600 hover:underline">Preguntas Frecuentes</a>
            <span className="dark:text-slate-700 text-slate-300">|</span>
            <a href="#publicar" className="dark:text-indigo-400 text-indigo-600 hover:underline">Publicar Propiedad</a>
          </div>
        </nav>

        {/* Contenido Principal */}
        <section className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-16">

          {/* Sección: Comprar Parcelas */}
          <div id="terrenos" className="space-y-6 scroll-mt-20">
            <div className="flex items-center gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
              <div className="w-12 h-12 rounded-xl dark:bg-indigo-500/20 bg-indigo-100 flex items-center justify-center text-2xl border dark:border-indigo-500/30 border-indigo-200 shadow-sm">
                🌲
              </div>
              <h2 className="text-2xl font-black dark:text-white text-slate-900">Guía para Comprar Terrenos y Parcelas en Chile</h2>
            </div>
            <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
              Comprar un terreno o parcela en Chile es una de las inversiones más importantes que puedes hacer. Ya sea para construir tu vivienda, como inversión o para proyectos agrícolas, es fundamental conocer los aspectos legales y técnicos antes de firmar. En <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">Propiedades & Parcelas Chile</Link> te entregamos los mejores consejos.
            </p>

            <div className="grid gap-6">
              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="text-lg font-bold dark:text-indigo-400 text-indigo-700 mb-2">1. Cesión de Derechos: Lo que Debes Saber</h3>
                <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                  En zonas rurales de Chile, la subdivisión mínima legal es de <strong>5.000 m²</strong> (media hectárea), dependiendo del Plano Regulador Regional. La cesión de derechos significa que compras un porcentaje de derechos sobre un inmueble, pero <strong>no obtienes inmediatamente el título de dominio</strong> como propietario. Para regularizar una cesión de derechos y obtener tu título de dominio, debes cumplir las condiciones del <strong>Ministerio de Bienes Nacionales de Chile</strong>. Siempre consulta con un abogado especialista antes de aceptar una cesión de derechos.
                </p>
                <div className="mt-3 pt-3 border-t dark:border-slate-800 border-slate-200">
                  <Link href="/venta/terrenos" className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-bold">🔍 Ver terrenos en venta en Chile →</Link>
                </div>
              </div>

              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="text-lg font-bold dark:text-indigo-400 text-indigo-700 mb-2">2. Certificado de Informaciones Previas (CIP)</h3>
                <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                  El CIP se solicita en la <strong>Dirección de Obras Municipales (DOM)</strong> de la comuna respectiva. Este documento es vital porque te indica: qué se puede construir, si el terreno está en zona de riesgo (inundación, falla geológica), la normativa urbanística aplicable, y los usos de suelo permitidos. <strong>Nunca compres un terreno sin solicitar el CIP primero.</strong>
                </p>
              </div>

              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="text-lg font-bold dark:text-indigo-400 text-indigo-700 mb-2">3. Factibilidad de Servicios Básicos</h3>
                <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                  Revisa que exista <strong>factibilidad real y certificada</strong> de agua potable, electricidad y alcantarillado. En zonas rurales, verifica los <strong>derechos de aprovechamiento de aguas</strong> (DAA) inscritos en la DGA, si se requiere pozo profundo, y la normativa sanitaria local sobre fosas sépticas. Sin estos servicios, tu terreno podría no ser habitable.
                </p>
              </div>

              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="text-lg font-bold dark:text-indigo-400 text-indigo-700 mb-2">4. Rol de Avalúo SII y Certificado del CBR</h3>
                <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                  <strong>Nunca compres un terreno sin Rol de Avalúo propio</strong> emitido por el Servicio de Impuestos Internos (SII). Además, solicita en el <strong>Conservador de Bienes Raíces (CBR)</strong> el Certificado de Dominio Vigente y el Certificado de Hipotecas y Gravámenes. Esto asegura que quien vende es realmente el dueño y la propiedad no tiene deudas, embargos ni prohibiciones. El CBR es la institución clave para la seguridad jurídica de tu compra.
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Comprar Casas / Locales */}
          <div id="casas" className="space-y-6 scroll-mt-20">
            <div className="flex items-center gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
              <div className="w-12 h-12 rounded-xl dark:bg-blue-500/20 bg-blue-100 flex items-center justify-center text-2xl border dark:border-blue-500/30 border-blue-200 shadow-sm">
                🏠
              </div>
              <h2 className="text-2xl font-black dark:text-white text-slate-900">Consejos para Comprar Casas o Locales Comerciales</h2>
            </div>
            <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
              La compra de una casa o local comercial en Chile implica pasos adicionales comparado con terrenos. Desde la recepción municipal hasta las deudas de contribuciones, cada detalle cuenta. <Link href="/venta/casas" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">Explora casas en venta</Link> o <Link href="/venta/locales-comerciales" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">locales comerciales</Link> en nuestro portal.
            </p>

            <div className="grid gap-6">
              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="text-lg font-bold dark:text-blue-400 text-blue-700 mb-2">1. Recepción Definitiva Municipal</h3>
                <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                  Para casas y locales, verifica que cuenten con <strong>Recepción Final de Obras</strong> otorgada por la DOM. Una propiedad sin recepción definitiva <strong>no puede ser hipotecada</strong> por bancos. En locales comerciales, sin este documento no se puede obtener Patente Comercial ni Resoluciones Sanitarias. Es uno de los documentos más importantes en la <strong>compraventa de propiedades en Chile</strong>.
                </p>
              </div>

              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="text-lg font-bold dark:text-blue-400 text-blue-700 mb-2">2. Estudio de Títulos Obligatorio</h3>
                <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                  Realiza un <strong>estudio de títulos</strong> abarcando idealmente los últimos 10 años. Revisa herencias, escrituras, poderes y estados civiles. Un abogado experto en derecho inmobiliario puede detectar problemas que te ahorrarían millones en juicios de nulidad. El estudio de títulos es la <strong>mejor inversión preventiva</strong> en cualquier compra de propiedad.
                </p>
              </div>

              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="text-lg font-bold dark:text-blue-400 text-blue-700 mb-2">3. Deudas de Contribuciones, Gastos Comunes y Servicios</h3>
                <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                  Solicita: <strong>Certificado de Deuda</strong> en la Tesorería General de la República (TGR), cuentas de servicios básicos al día, y un certificado de la administración del condominio que acredite <strong>cero deuda en gastos comunes</strong>. Las deudas se transmiten al nuevo propietario, así que asegúrate de que todo esté al día antes de comprar.
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Arriendos */}
          <div id="arriendos" className="space-y-6 scroll-mt-20">
            <div className="flex items-center gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
              <div className="w-12 h-12 rounded-xl dark:bg-amber-500/20 bg-amber-100 flex items-center justify-center text-2xl border dark:border-amber-500/30 border-amber-200 shadow-sm">
                🔑
              </div>
              <h2 className="text-2xl font-black dark:text-white text-slate-900">Todo sobre Arrendar Propiedades en Chile</h2>
            </div>
            <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
              El mercado de arriendo en Chile ha experimentado cambios importantes con la nueva legislación. Ya seas arrendador o arrendatario, estos consejos te ayudarán a evitar conflictos. <Link href="/arriendo/casas" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">Ver casas en arriendo</Link> o <Link href="/arriendo/locales-comerciales" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">locales comerciales en arriendo</Link>.
            </p>

            <div className="grid gap-6">
              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="text-lg font-bold dark:text-amber-500 text-amber-700 mb-2">1. Contrato de Arriendo ante Notario</h3>
                <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                  Firma el contrato de arriendo <strong>ante Notario P&uacute;blico</strong>. En Chile, la Ley de Arriendo &ldquo;Devu&eacute;lveme mi casa&rdquo; (Ley N&deg; 21.461) facilita los desalojos r&aacute;pidos, pero exige que las firmas est&eacute;n autorizadas ante notario. Sin este requisito, el proceso legal puede demorar meses. La <strong>ley de arriendo en Chile</strong> protege tanto a arrendadores como arrendatarios cuando el contrato est&aacute; bien constituido.
                </p>
              </div>

              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="text-lg font-bold dark:text-amber-500 text-amber-700 mb-2">2. Inventario Detallado con Fotos</h3>
                <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                  Anexa al contrato de arriendo un <strong>inventario exhaustivo con fotos</strong> del estado del inmueble. Esto protege al propietario por daños causados por el arrendatario, y al arrendatario para que le devuelvan el mes de garantía íntegro si entrega todo en las mismas condiciones. Toma fotos con fecha y almacénalas.
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Cómo Publicar */}
          <div id="publicar" className="space-y-6 scroll-mt-20">
            <div className="flex items-center gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
              <div className="w-12 h-12 rounded-xl dark:bg-emerald-500/20 bg-emerald-100 flex items-center justify-center text-2xl border dark:border-emerald-500/30 border-emerald-200 shadow-sm">
                📢
              </div>
              <h2 className="text-2xl font-black dark:text-white text-slate-900">Cómo Publicar tu Propiedad y Destacar en Google</h2>
            </div>
            <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
              Publicar tu propiedad en el portal correcto marca la diferencia entre vender rápido o tener meses de espera. En <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">Propiedades & Parcelas Chile</Link> optimizamos cada aviso para que aparezca en los primeros resultados de Google. Sigue estos consejos:
            </p>
            <div className="grid gap-6">
              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="text-lg font-bold dark:text-emerald-400 text-emerald-700 mb-2">Consejos para un Aviso Exitoso</h3>
                <ul className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed space-y-2 list-disc list-inside">
                  <li><strong>Fotos profesionales:</strong> Las propiedades con fotos de calidad reciben hasta 3x más consultas.</li>
                  <li><strong>T&iacute;tulo descriptivo:</strong> Incluye ubicaci&oacute;n, tipo de propiedad y caracter&iacute;sticas clave (ej: &ldquo;Parcela Plana de 5.000m2 con Rol Propio en Melipilla&rdquo;).</li>
                  <li><strong>Descripción detallada:</strong> Menciona accesos, servicios cercanos, factibilidades, y todo lo que hace única a tu propiedad.</li>
                  <li><strong>Documentación legal:</strong> Incluir Rol SII, CIP, escritura y otros documentos aumenta la confianza del comprador.</li>
                  <li><strong>Precio transparente:</strong> Publica precio en CLP o UF. Las propiedades con precio visible reciben más visitas.</li>
                </ul>
                <div className="mt-4">
                  <Link href="/dashboard" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md text-xs tracking-wider uppercase">Publicar mi Propiedad Ahora</Link>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div id="faq" className="space-y-6 scroll-mt-20">
            <div className="flex items-center gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
              <div className="w-12 h-12 rounded-xl dark:bg-purple-500/20 bg-purple-100 flex items-center justify-center text-2xl border dark:border-purple-500/30 border-purple-200 shadow-sm">
                ❓
              </div>
              <h2 className="text-2xl font-black dark:text-white text-slate-900">Preguntas Frecuentes sobre Compra, Venta y Arriendo de Propiedades en Chile</h2>
            </div>
            <div className="grid gap-4">
              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="font-bold dark:text-white text-slate-900 mb-2">¿Qué es la cesión de derechos en un terreno?</h3>
                <p className="dark:text-slate-400 text-slate-600 text-sm">Es cuando compras un porcentaje de derechos sobre un inmueble sin obtener inmediatamente el título de dominio como propietario. En Chile, la subdivisión mínima legal es de 5.000 m² en zonas rurales.</p>
              </div>
              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="font-bold dark:text-white text-slate-900 mb-2">¿Dónde solicito el Certificado de Informaciones Previas (CIP)?</h3>
                  <p className="dark:text-slate-400 text-slate-600 text-sm">En la Dirección de Obras Municipales (DOM) de la comuna donde est&aacute; ubicado el terreno. Este documento indica qu&eacute; se puede construir y si hay riesgos geol&oacute;gicos o de inundaci&oacute;n.</p>
              </div>
              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="font-bold dark:text-white text-slate-900 mb-2">¿Qué documentos revisar antes de comprar una casa?</h3>
                <p className="dark:text-slate-400 text-slate-600 text-sm">Recepción Final de Obras de la DOM, estudio de títulos, certificado de deuda TGR, gastos comunes al día, y certificado de Hipotecas y Gravámenes del CBR.</p>
              </div>
              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="font-bold dark:text-white text-slate-900 mb-2">¿Es obligatorio firmar contrato de arriendo ante notario?</h3>
                <p className="dark:text-slate-400 text-slate-600 text-sm">S&iacute;, es altamente recomendable. La Ley &ldquo;Devu&eacute;lveme mi casa&rdquo; exige firmas notariadas para desalojos r&aacute;pidos. Sin notario, el proceso puede demorar meses.</p>
              </div>
              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="font-bold dark:text-white text-slate-900 mb-2">¿Cuánto cuesta publicar una propiedad en Chile?</h3>
                <p className="dark:text-slate-400 text-slate-600 text-sm">Hay plan gratuito con 4 avisos, 10 fotos y 1 video. Planes pagados desde $10.000/mes con 8 avisos, 16 fotos y 2 videos, hasta $50.000/mes con 100 avisos, 60 fotos y 20 videos con SEO Ultra.</p>
              </div>
              <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
                <h3 className="font-bold dark:text-white text-slate-900 mb-2">¿Qué es el Conservador de Bienes Raíces?</h3>
                <p className="dark:text-slate-400 text-slate-600 text-sm">Es la institución que registra la propiedad inmueble en Chile. Allí se solicita el Certificado de Dominio Vigente para verificar quién es el dueño legal de una propiedad.</p>
              </div>
            </div>
          </div>

          {/* Call to Action - Asesoría Pública */}
          <div className="dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950/50 dark:to-slate-900 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border dark:border-indigo-900/50 border-indigo-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden transition-colors">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
            <h2 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 relative z-10">¿Necesitas Asesoría Legal o Técnica para tu Propiedad?</h2>
            <p className="dark:text-indigo-200 text-indigo-800 text-sm max-w-2xl mx-auto leading-relaxed font-medium relative z-10">
              No corras riesgos con tu inversión patrimonial. Contamos con una alianza con especialistas en regularización, subdivisión de terrenos, estudios de título, saneamiento de propiedades y asesoría legal inmobiliaria en todo Chile.
            </p>
            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <a
                href="https://www.asesoriapublica.cl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 px-8 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 uppercase tracking-widest text-xs"
              >
                Visitar Asesoría Pública
              </a>
              <Link
                href="/buscar"
                className="inline-block dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-300 dark:hover:bg-slate-700 hover:bg-slate-100 dark:text-white text-slate-900 font-extrabold py-3.5 px-8 rounded-xl transition-all shadow-lg uppercase tracking-widest text-xs"
              >
                Buscar Propiedades
              </Link>
            </div>
          </div>

        </section>

        {/* Footer */}
        <footer className="dark:bg-slate-950 bg-slate-100 border-t dark:border-slate-850 border-slate-300 py-10 text-center text-xs text-slate-500 transition-colors">
          <div className="max-w-4xl mx-auto px-4 space-y-4">
            <p>© {new Date().getFullYear()} Propiedades & Parcelas Chile. Todos los derechos reservados.</p>
            <nav className="flex flex-wrap justify-center gap-4 text-indigo-600 dark:text-indigo-400">
              <Link href="/" className="hover:underline font-bold">Inicio</Link>
              <Link href="/venta/terrenos" className="hover:underline font-bold">Terrenos en Venta</Link>
              <Link href="/venta/casas" className="hover:underline font-bold">Casas en Venta</Link>
              <Link href="/venta/locales-comerciales" className="hover:underline font-bold">Locales Comerciales</Link>
              <Link href="/arriendo/casas" className="hover:underline font-bold">Arriendo de Casas</Link>
              <Link href="/buscar" className="hover:underline font-bold">Buscar Propiedades</Link>
            </nav>
            <p className="dark:text-slate-600 text-slate-400">
              Alianza exclusiva con{' '}
              <a href="https://www.asesoriapublica.cl" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-white font-bold underline">
                Asesoría Pública Legal (www.asesoriapublica.cl)
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
