import Link from 'next/link';

interface PropertyCardItem {
  id: string;
  tipo_operacion: string;
  tipo_propiedad: string;
  titulo: string;
  slug: string;
  comuna: string;
  region: string;
  descripcion: string;
  superficie_total: number;
  habitaciones: number;
  banos: number;
  precio_pesos: number;
  precio_uf: number;
  prioridad_score: number;
  foto_principal: string | null;
}

export default function PropertyCard({ item }: { item: PropertyCardItem }) {
  const esVIP = item.prioridad_score === 2;
  const propLabel = item.tipo_propiedad === 'terreno' ? 'Terreno / Parcela' : item.tipo_propiedad === 'casa' ? 'Casa' : 'Local Comercial';

  return (
    <article
      className={`dark:bg-slate-950 bg-white rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between ${
        esVIP ? 'border-indigo-500/40 shadow-xl' : 'dark:border-slate-850 border-slate-200'
      }`}
    >
      <div>
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

        <div className="p-6 space-y-3">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">{propLabel}</span>
          <h3 className="text-lg font-bold dark:text-white text-slate-900 leading-snug line-clamp-2 hover:text-indigo-500">
            <Link href={`/${item.tipo_operacion}/${item.comuna}/${item.slug}`}>{item.titulo}</Link>
          </h3>
          <p className="dark:text-slate-400 text-slate-600 text-xs leading-relaxed line-clamp-2">{item.descripcion}</p>

          <div className="flex items-center gap-4 py-3 my-2 border-y dark:border-slate-900 border-slate-200 text-[11px] dark:text-slate-300 text-slate-600 font-medium">
            <span className="flex items-center gap-1">📐 {item.superficie_total} m²</span>
            {item.habitaciones > 0 && <span className="flex items-center gap-1">🛏️ {item.habitaciones} Dorm.</span>}
            {item.banos > 0 && <span className="flex items-center gap-1">🚿 {item.banos} Baños</span>}
          </div>
        </div>
      </div>

      <div className="p-6 dark:bg-slate-950 bg-slate-50 border-t dark:border-slate-900 border-slate-200 flex items-center justify-between transition-colors">
        <div>
          <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">Valor</span>
          <span className="text-xl font-black dark:text-white text-slate-900">
            {item.precio_uf
              ? `${item.precio_uf} UF`
              : item.precio_pesos
                ? `$${item.precio_pesos.toLocaleString('es-CL')} CLP`
                : 'Consultar'}
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
}
