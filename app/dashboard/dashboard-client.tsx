'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';

interface Property {
  id: string;
  titulo: string;
  tipo_operacion: string;
  tipo_propiedad: string;
  comuna: string;
  region: string;
  precio_pesos: number | null;
  precio_uf: number | null;
  prioridad_score: number;
  fecha_expiracion_impulso: string | null;
  fecha_publicacion: string;
}

interface DashboardClientProps {
  propiedades: Property[];
  userNombre: string;
}

export default function DashboardClient({ propiedades, userNombre }: DashboardClientProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modalPropiedad, setModalPropiedad] = useState<Property | null>(null);

  const iniciarPagoAutomatico = async (propiedadId: string, monto: number) => {
    try {
      setLoadingId(`${propiedadId}-${monto}`);
      
      const response = await fetch('/api/pagos/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propiedadId, monto }),
      });

      const data = await response.json();
      
      if (data.success && data.initPoint) {
        // Redirigir a Mercado Pago
        window.location.href = data.initPoint;
      } else {
        alert(data.error || 'Ocurrió un error al procesar el pago automático');
        setLoadingId(null);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión al procesar el pago');
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header Premium */}
      <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Propiedades y Parcelas
            </span>
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Dashboard
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-300 hidden sm:inline">
              Hola, <span className="font-bold text-white">{userNombre}</span>
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Banner de bienvenida premium */}
        <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white mb-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Gestiona tus anuncios e impulsa tus ventas</h1>
            <p className="text-indigo-200 mt-2 sm:text-lg leading-relaxed">
              Registra tus propiedades en Chile y destaca tus anuncios pagando un impulso. Las publicaciones impulsadas obtienen prioridad en los rastreadores de Google (SEO) y mayor visibilidad para compradores potenciales.
            </p>
          </div>
        </div>

        {/* Resumen rápido de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Publicadas</span>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{propiedades.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Anuncios Impulsados</span>
            <p className="text-3xl font-extrabold text-indigo-600 mt-1">
              {propiedades.filter(p => p.prioridad_score > 0).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Porcentaje Destacado</span>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">
              {propiedades.length > 0 
                ? `${Math.round((propiedades.filter(p => p.prioridad_score > 0).length / propiedades.length) * 100)}%`
                : '0%'}
            </p>
          </div>
        </div>

        {/* Grid de propiedades */}
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Mis Publicaciones</h2>

          {propiedades.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
              <p className="text-slate-400 text-lg font-medium">Aún no has creado ninguna publicación.</p>
              <p className="text-slate-400 text-sm mt-1">Las propiedades que registres aparecerán en este panel de control.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propiedades.map((propiedad) => {
                const esImpulsado = propiedad.prioridad_score > 0;
                
                return (
                  <div 
                    key={propiedad.id} 
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                          {propiedad.tipo_propiedad}
                        </span>
                        
                        {esImpulsado ? (
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full animate-pulse">
                            🚀 Impulsado
                          </span>
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                            Normal
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-2">
                        {propiedad.titulo}
                      </h3>
                      
                      <p className="text-slate-400 text-xs mt-1.5 flex items-center">
                        📍 {propiedad.comuna}, {propiedad.region}
                      </p>

                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-medium">Valor comercial</span>
                        <p className="text-2xl font-black text-slate-800 mt-0.5">
                          {propiedad.precio_uf 
                            ? `${propiedad.precio_uf} UF` 
                            : `$${propiedad.precio_pesos?.toLocaleString('es-CL')}`}
                        </p>
                      </div>

                      {esImpulsado && propiedad.fecha_expiracion_impulso && (
                        <div className="mt-3 bg-emerald-50 text-emerald-800 text-xs p-2.5 rounded-xl border border-emerald-100">
                          Expira el: <span className="font-bold">{new Date(propiedad.fecha_expiracion_impulso).toLocaleDateString('es-CL')}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                      <a
                        href={`/${propiedad.tipo_operacion}/${propiedad.comuna}/${propiedad.id}`}
                        target="_blank"
                        className="text-center w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm py-2.5 px-4 rounded-xl transition-all duration-200"
                      >
                        Ver ficha
                      </a>

                      {!esImpulsado && (
                        <button
                          onClick={() => setModalPropiedad(propiedad)}
                          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-1.5"
                        >
                          <span>Impulsar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal Premium para Impulsar Anuncios */}
      {modalPropiedad && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-scaleUp">
            {/* Cabecera del Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">Impulsar tu Publicación</h3>
                <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{modalPropiedad.titulo}</p>
              </div>
              <button 
                onClick={() => setModalPropiedad(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold bg-slate-200/50 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              <p className="text-slate-600 text-sm leading-relaxed">
                Elige la forma de destacar tu anuncio en el portal. Un anuncio con prioridad aparece por encima de los listados normales y acelera la venta.
              </p>

              {/* Opción 1: Impulso Plata ($10.000) - Automático */}
              <div className="border border-slate-200 hover:border-indigo-500 rounded-2xl p-4 flex justify-between items-center bg-white transition-colors duration-200">
                <div className="space-y-1">
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-md">Impulso Plata</span>
                  <h4 className="font-extrabold text-slate-800">30 Días de Prioridad</h4>
                  <p className="text-slate-400 text-xs">Pago seguro y activación automática al instante</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">$10.000</p>
                  <button
                    disabled={loadingId !== null}
                    onClick={() => iniciarPagoAutomatico(modalPropiedad.id, 10000)}
                    className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-1.5 px-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loadingId === `${modalPropiedad.id}-10000` ? 'Cargando...' : 'Pagar'}
                  </button>
                </div>
              </div>

              {/* Opción 2: Impulso Oro ($20.000) - Automático */}
              <div className="border border-slate-200 hover:border-blue-500 rounded-2xl p-4 flex justify-between items-center bg-white transition-colors duration-200">
                <div className="space-y-1">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-md">Impulso Oro</span>
                  <h4 className="font-extrabold text-slate-800">30 Días de Máxima Exposición</h4>
                  <p className="text-slate-400 text-xs">Doble visualización de prioridad y SEO premium</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">$20.000</p>
                  <button
                    disabled={loadingId !== null}
                    onClick={() => iniciarPagoAutomatico(modalPropiedad.id, 20000)}
                    className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-1.5 px-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loadingId === `${modalPropiedad.id}-20000` ? 'Cargando...' : 'Pagar'}
                  </button>
                </div>
              </div>

              {/* Separador */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Otras Formas de Pago</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Opción 3: Pago Manual (Enlace directo a tu cuenta) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800">Transferencia / Enlace Directo</h4>
                  <p className="text-slate-400 text-xs">Paga a nuestra cuenta y envíanos el comprobante</p>
                </div>
                <div className="text-right">
                  <a
                    href="https://link.mercadopago.cl/cobrosmercadobgaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-lg transition-colors shadow-sm"
                  >
                    Pagar Directo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
