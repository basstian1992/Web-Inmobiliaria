'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const [links, setLinks] = useState({ flow_plan_10k: '', flow_plan_20k: '', flow_plan_50k: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/configuraciones')
      .then(res => res.json())
      .then(data => {
         if (data.success && data.configuraciones) {
           setLinks({
             flow_plan_10k: data.configuraciones.flow_plan_10k || '',
             flow_plan_20k: data.configuraciones.flow_plan_20k || '',
             flow_plan_50k: data.configuraciones.flow_plan_50k || ''
           });
         }
         setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
     e.preventDefault();
     setSaving(true);
     setMessage('');
     try {
       const res = await fetch('/api/admin/configuraciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(links)
       });
       const data = await res.json();
       if (data.success) {
         setMessage('¡Configuraciones guardadas con éxito!');
       } else {
         setMessage('Error al guardar: ' + data.error);
       }
     } catch (err) {
       setMessage('Error de red al guardar.');
     }
     setSaving(false);
  };

  if (!isLoaded || loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Cargando...</div>;
  }

  const isAdmin = user?.emailAddresses?.some(e => 
    e.emailAddress === 'b.alarconatenas@gmail.com' || 
    e.emailAddress === 'basklian@gmail.com' ||
    e.emailAddress === 'b.alarcontenas@gmail.com'
  );

  if (isLoaded && !isAdmin) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">No tienes permisos de administrador.</div>;
  }

  // Protección básica cliente (la verdadera validación va en la API)
  // Asumimos que si no tiene acceso, la API rebotará el guardado o la lectura
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-black text-white">Panel de Administración VIP</h1>
          <Link href="/dashboard" className="text-indigo-400 hover:text-white font-bold text-sm">
            ← Volver al Dashboard
          </Link>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-bold text-indigo-400 mb-6">Configuración de Links de Pago (Flow)</h2>
          <p className="text-slate-400 text-sm mb-6">
            Pega aquí los enlaces directos de suscripción generados en tu cuenta de Flow para cada plan.
            Estos enlaces se mostrarán a los vendedores cuando hagan clic en "Subir a Premium".
          </p>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Link Flow - Plan $10.000</label>
              <input 
                type="url" 
                value={links.flow_plan_10k}
                onChange={e => setLinks({...links, flow_plan_10k: e.target.value})}
                placeholder="Ej: https://www.flow.cl/btn.php?token=xyz"
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Link Flow - Plan $20.000</label>
              <input 
                type="url" 
                value={links.flow_plan_20k}
                onChange={e => setLinks({...links, flow_plan_20k: e.target.value})}
                placeholder="Ej: https://www.flow.cl/btn.php?token=abc"
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Link Flow - Plan $50.000</label>
              <input 
                type="url" 
                value={links.flow_plan_50k}
                onChange={e => setLinks({...links, flow_plan_50k: e.target.value})}
                placeholder="Ej: https://www.flow.cl/btn.php?token=123"
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {message && (
              <div className="bg-indigo-900/40 border border-indigo-500/50 text-indigo-200 p-4 rounded-xl text-sm font-bold text-center">
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-4 rounded-xl transition-all disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Configuraciones'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
