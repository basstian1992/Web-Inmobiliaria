import Link from 'next/link';

export const metadata = {
  title: "Consejos Inmobiliarios - Antes de Comprar o Arrendar en Chile",
  description: "Guía completa y consejos clave que debes tener en cuenta antes de comprar o arrendar una propiedad o parcela en Chile.",
};

export default function ConsejosPage() {
  return (
    <div className="dark:bg-slate-900 bg-slate-50 min-h-screen font-sans antialiased text-slate-900 dark:text-slate-100 pb-20 transition-colors">
      
      {/* Banner / Header */}
      <section className="relative dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-20 px-4 sm:px-6 lg:px-8 text-center border-b dark:border-slate-800 border-slate-200 transition-colors overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="dark:text-indigo-400 text-indigo-600 uppercase tracking-widest text-[10px] font-bold dark:bg-indigo-500/10 bg-indigo-100 px-4.5 py-2 rounded-full border dark:border-indigo-500/20 border-indigo-300 shadow-sm">
            Guía Inmobiliaria Chile
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-blue-300 from-slate-900 via-indigo-900 to-blue-800 leading-tight">
            Lo que debes tener en cuenta antes de Comprar o Arrendar
          </h1>
          <p className="text-base sm:text-lg dark:text-slate-400 text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Evita estafas, problemas legales y dolores de cabeza. Revisa nuestra guía con las sugerencias legales, técnicas y prácticas más actualizadas en Chile.
          </p>
        </div>
      </section>

      {/* Contenido Principal */}
      <section className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Sección: Comprar Parcelas */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
            <div className="w-12 h-12 rounded-xl dark:bg-indigo-500/20 bg-indigo-100 flex items-center justify-center text-2xl border dark:border-indigo-500/30 border-indigo-200 shadow-sm">
              🌲
            </div>
            <h2 className="text-2xl font-black dark:text-white text-slate-900">Al Comprar Terrenos y Parcelas (Loteos)</h2>
          </div>
          
          <div className="grid gap-6">
            <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
              <h3 className="text-lg font-bold dark:text-indigo-400 text-indigo-700 mb-2">1. Cesión de Derechos (Código Civil artículo 1901 y siguientes)</h3>
              <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                En algunas zonas rurales de Chile, la subdivisión mínima legal es de 5.000 m² (Media hectárea) dependiendo lo que establezca la subdivisión predial mínima de su Plano Regulador Regional.  Considera que si te ofrecen Cesión de derechos en un terreno, compras un porcentaje de derechos sobre ese inmueble, pero no obtienes inmediatamente el título de dominio como propietario. En algunas ocasiones se permite regularizar "cesiones de derecho" dependiendo de la cantidad de años ejerciendo uso sobre la misma, por ello para obtener título de dominio en Chile de una cesión de derechos, primero debes cumplir las condiciones exigidas por el Ministerio de Bienes Nacionales de Chile.
              </p>
            </div>

            <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
              <h3 className="text-lg font-bold dark:text-indigo-400 text-indigo-700 mb-2">2. Certificado de Informaciones Previas (CIP)</h3>
              <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                Solicita siempre el CIP en la Dirección de Obras Municipales (DOM) de la comuna respectiva. Este documento te dirá qué se puede construir, si está en zona de riesgo (inundación, falla geológica), y la normativa urbanística aplicable.
              </p>
            </div>

            <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
              <h3 className="text-lg font-bold dark:text-indigo-400 text-indigo-700 mb-2">3. Factibilidad de Servicios Básicos</h3>
              <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                Revisa que exista factibilidad real (certificada) de agua potable, electricidad y alcantarillado. Si es zona rural, verifica los derechos de aprovechamiento de aguas, si requiere pozo profundo y la normativa sanitaria local (fosas sépticas).
              </p>
            </div>

            <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
              <h3 className="text-lg font-bold dark:text-indigo-400 text-indigo-700 mb-2">4. Rol Propio (SII) y CBR</h3>
              <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                Nunca compres si el terreno no tiene Rol de Avalúo propio emitido por el Servicio de Impuestos Internos. Además, verifica en el Conservador de Bienes Raíces (CBR) el Certificado de Dominio Vigente y el Certificado de Hipotecas y Gravámenes, para asegurar que quien vende es realmente el dueño y la propiedad no tiene deudas ni embargos.
              </p>
            </div>
          </div>
        </div>

        {/* Sección: Comprar Casas / Locales */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
            <div className="w-12 h-12 rounded-xl dark:bg-blue-500/20 bg-blue-100 flex items-center justify-center text-2xl border dark:border-blue-500/30 border-blue-200 shadow-sm">
              🏠
            </div>
            <h2 className="text-2xl font-black dark:text-white text-slate-900">Al Comprar Casas o Locales Comerciales</h2>
          </div>
          
          <div className="grid gap-6">
            <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
              <h3 className="text-lg font-bold dark:text-blue-400 text-blue-700 mb-2">1. Recepción Definitiva</h3>
              <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                Para locales y casas, verifica que cuenten con Recepción Final de Obras otorgada por la DOM. Una propiedad sin esto no puede ser hipotecada por bancos y, en el caso de locales, no podrá obtener Patente Comercial ni Resoluciones Sanitarias.
              </p>
            </div>

            <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
              <h3 className="text-lg font-bold dark:text-blue-400 text-blue-700 mb-2">2. Estudio de Títulos Obligatorio</h3>
              <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                Realiza un estudio de títulos abarcando idealmente los últimos 10 años. Revisa herencias, escrituras, poderes y estados civiles. Es preferible pagar a un abogado experto antes que perder millones de pesos en un juicio de nulidad.
              </p>
            </div>

            <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
              <h3 className="text-lg font-bold dark:text-blue-400 text-blue-700 mb-2">3. Deudas de Contribuciones, Gastos Comunes y Servicios</h3>
              <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                Pide un Certificado de Deuda en la Tesorería General de la República (TGR), cuentas de servicios básicos al día, y un certificado de la administración del condominio/edificio que acredite no tener deuda en gastos comunes.
              </p>
            </div>
          </div>
        </div>

        {/* Sección: Arriendos */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
            <div className="w-12 h-12 rounded-xl dark:bg-amber-500/20 bg-amber-100 flex items-center justify-center text-2xl border dark:border-amber-500/30 border-amber-200 shadow-sm">
              🔑
            </div>
            <h2 className="text-2xl font-black dark:text-white text-slate-900">Al Arrendar Propiedades</h2>
          </div>
          
          <div className="grid gap-6">
            <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
              <h3 className="text-lg font-bold dark:text-amber-500 text-amber-700 mb-2">1. Firma en Notaría</h3>
              <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                Firma el contrato de arriendo ante Notario Público. En Chile, la reciente ley "Devuélveme mi casa" facilita los desalojos rápidos, pero requerirás que las firmas estén autorizadas ante notario para agilizar el proceso legal.
              </p>
            </div>

            <div className="dark:bg-slate-950 bg-white p-6 rounded-2xl border dark:border-slate-850 border-slate-200 shadow-md">
              <h3 className="text-lg font-bold dark:text-amber-500 text-amber-700 mb-2">2. Inventario Detallado</h3>
              <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                Anexa al contrato de arriendo un inventario exhaustivo con fotos del estado del inmueble. Esto protegerá al propietario por daños, y al arrendatario para que le devuelvan su mes de garantía íntegro si entrega todo como lo recibió.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action - Asesoría Pública */}
        <div className="dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950/50 dark:to-slate-900 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border dark:border-indigo-900/50 border-indigo-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden transition-colors">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
          <h3 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 relative z-10">¿Necesitas ayuda legal o técnica?</h3>
          <p className="dark:text-indigo-200 text-indigo-800 text-sm max-w-2xl mx-auto leading-relaxed font-medium relative z-10">
            No corras riesgos con tu inversión patrimonial. Contamos con una alianza con especialistas en regularización, subdivisión y estudios de título.
          </p>
          <a 
            href="https://www.asesoriapublica.cl" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 px-8 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 uppercase tracking-widest text-xs relative z-10"
          >
            Visitar Asesoría Pública
          </a>
        </div>

      </section>

      {/* Footer minimalista */}
      <footer className="dark:bg-slate-950 bg-slate-100 border-t dark:border-slate-850 border-slate-300 py-8 text-center text-xs text-slate-500 transition-colors">
        <p>© {new Date().getFullYear()} Propiedades & Parcelas Chile.</p>
        <div className="mt-4">
          <Link href="/" className="dark:text-indigo-400 text-indigo-600 hover:underline font-bold">
            ← Volver al inicio
          </Link>
        </div>
      </footer>
    </div>
  );
}
