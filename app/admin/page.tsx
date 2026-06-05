'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

type Tab = 'config' | 'usuarios' | 'propiedades' | 'cupones';

const PLANES = ['gratis', 'plan_10k', 'plan_20k', 'plan_50k', 'admin'];

const PLAN_LABELS: Record<string, string> = {
  gratis: 'Gratis',
  plan_10k: 'Plan 10K',
  plan_20k: 'Plan 20K',
  plan_50k: 'Plan 50K',
  admin: 'Admin',
};

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const [tab, setTab] = useState<Tab>('config');

  // Config tab state
  const [links, setLinks] = useState({ flow_plan_10k: '', flow_plan_20k: '', flow_plan_50k: '' });
  const [configLoading, setConfigLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState('');

  // Usuarios tab state
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

  // Propiedades tab state
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [propiedadesLoading, setPropiedadesLoading] = useState(false);

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/admin/configuraciones');
      const data = await res.json();
      if (data.success && data.configuraciones) {
        setLinks({
          flow_plan_10k: data.configuraciones.flow_plan_10k || '',
          flow_plan_20k: data.configuraciones.flow_plan_20k || '',
          flow_plan_50k: data.configuraciones.flow_plan_50k || '',
        });
      }
    } catch {}
    setConfigLoading(false);
  };

  useEffect(() => {
    if (!isLoaded) return;
    loadConfig();
  }, [isLoaded]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setConfigMessage('');
    try {
      const res = await fetch('/api/admin/configuraciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(links),
      });
      const data = await res.json();
      setConfigMessage(data.success ? 'Configuraciones guardadas con éxito!' : 'Error al guardar: ' + data.error);
    } catch {
      setConfigMessage('Error de red al guardar.');
    }
    setSaving(false);
  };

  const fetchUsuarios = async () => {
    setUsuariosLoading(true);
    try {
      const res = await fetch('/api/admin/usuarios');
      const data = await res.json();
      if (data.success) setUsuarios(data.usuarios);
    } catch {}
    setUsuariosLoading(false);
  };

  const fetchPropiedades = async () => {
    setPropiedadesLoading(true);
    try {
      const res = await fetch('/api/admin/usuarios?tipo=propiedades');
      const data = await res.json();
      if (data.success) setPropiedades(data.propiedades);
    } catch {}
    setPropiedadesLoading(false);
  };

  useEffect(() => {
    if (tab === 'usuarios' && usuarios.length === 0) fetchUsuarios();
  }, [tab]);

  useEffect(() => {
    if (tab === 'propiedades' && propiedades.length === 0) fetchPropiedades();
  }, [tab]);

  const handlePlanChange = async (userId: string, plan: string) => {
    setUpdatingPlan(userId);
    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan }),
      });
      const data = await res.json();
      if (data.success) {
        setUsuarios(prev => prev.map(u => (u.id === userId ? { ...u, plan_tipo: plan } : u)));
      }
    } catch {}
    setUpdatingPlan(null);
  };

  if (!isLoaded || configLoading) {
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

  const tabs: { key: Tab; label: string }[] = [
    { key: 'config', label: 'Config Flow' },
    { key: 'cupones', label: 'Cupones' },
    { key: 'usuarios', label: 'Usuarios' },
    { key: 'propiedades', label: 'Propiedades' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-black text-white">Panel de Administración VIP</h1>
          <Link href="/dashboard" className="text-indigo-400 hover:text-white font-bold text-sm">
            ← Volver al Dashboard
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-t-xl font-bold text-sm transition-all ${
                tab === t.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Config Flow */}
        {tab === 'config' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-xl font-bold text-indigo-400 mb-6">Configuración de Links de Pago (Flow)</h2>
            <p className="text-slate-400 text-sm mb-6">
              Pega aquí los enlaces directos de suscripción generados en tu cuenta de Flow para cada plan.
              Estos enlaces se mostrarán a los vendedores cuando hagan clic en &quot;Subir a Premium&quot;.
            </p>
            <form onSubmit={handleSaveConfig} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Link Flow - Plan $10.000</label>
                <input
                  type="url"
                  value={links.flow_plan_10k}
                  onChange={e => setLinks({ ...links, flow_plan_10k: e.target.value })}
                  placeholder="Ej: https://www.flow.cl/btn.php?token=xyz"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Link Flow - Plan $20.000</label>
                <input
                  type="url"
                  value={links.flow_plan_20k}
                  onChange={e => setLinks({ ...links, flow_plan_20k: e.target.value })}
                  placeholder="Ej: https://www.flow.cl/btn.php?token=abc"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Link Flow - Plan $50.000</label>
                <input
                  type="url"
                  value={links.flow_plan_50k}
                  onChange={e => setLinks({ ...links, flow_plan_50k: e.target.value })}
                  placeholder="Ej: https://www.flow.cl/btn.php?token=123"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              {configMessage && (
                <div className="bg-indigo-900/40 border border-indigo-500/50 text-indigo-200 p-4 rounded-xl text-sm font-bold text-center">
                  {configMessage}
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
        )}

        {/* Tab: Cupones */}
        {tab === 'cupones' && <CuponesTab />}

        {/* Tab: Usuarios */}
        {tab === 'usuarios' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-indigo-400">Usuarios ({usuarios.length})</h2>
              <button
                onClick={fetchUsuarios}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all"
              >
                Actualizar
              </button>
            </div>
            {usuariosLoading ? (
              <div className="text-center text-slate-400 py-8">Cargando usuarios...</div>
            ) : usuarios.length === 0 ? (
              <div className="text-center text-slate-500 py-8">No hay usuarios registrados.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-left">
                      <th className="pb-3 pr-4 font-bold">Nombre</th>
                      <th className="pb-3 pr-4 font-bold">Email</th>
                      <th className="pb-3 pr-4 font-bold">Plan</th>
                      <th className="pb-3 pr-4 font-bold">Propiedades</th>
                      <th className="pb-3 font-bold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                        <td className="py-3 pr-4 text-white font-medium">{u.nombre}</td>
                        <td className="py-3 pr-4 text-slate-300">{u.email}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            u.plan_tipo === 'admin' ? 'bg-purple-900 text-purple-200' :
                            u.plan_tipo === 'plan_50k' ? 'bg-amber-900 text-amber-200' :
                            u.plan_tipo === 'plan_20k' ? 'bg-blue-900 text-blue-200' :
                            u.plan_tipo === 'plan_10k' ? 'bg-green-900 text-green-200' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {PLAN_LABELS[u.plan_tipo] || u.plan_tipo}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-300">{u.propiedad_count}</td>
                        <td className="py-3">
                          <select
                            value={u.plan_tipo}
                            onChange={e => handlePlanChange(u.id, e.target.value)}
                            disabled={updatingPlan === u.id}
                            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                          >
                            {PLANES.map(p => (
                              <option key={p} value={p}>{PLAN_LABELS[p]}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Propiedades */}
        {tab === 'propiedades' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-indigo-400">Todas las Propiedades ({propiedades.length})</h2>
              <button
                onClick={fetchPropiedades}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all"
              >
                Actualizar
              </button>
            </div>
            {propiedadesLoading ? (
              <div className="text-center text-slate-400 py-8">Cargando propiedades...</div>
            ) : propiedades.length === 0 ? (
              <div className="text-center text-slate-500 py-8">No hay propiedades publicadas.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-left">
                      <th className="pb-3 pr-4 font-bold">Título</th>
                      <th className="pb-3 pr-4 font-bold">Tipo</th>
                      <th className="pb-3 pr-4 font-bold">Operación</th>
                      <th className="pb-3 pr-4 font-bold">Comuna</th>
                      <th className="pb-3 pr-4 font-bold">Usuario</th>
                      <th className="pb-3 pr-4 font-bold">Score</th>
                      <th className="pb-3 font-bold">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propiedades.map(p => (
                      <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                        <td className="py-3 pr-4 text-white font-medium max-w-xs truncate">{p.titulo}</td>
                        <td className="py-3 pr-4 text-slate-300 capitalize">{p.tipo_propiedad}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            p.tipo_operacion === 'venta' ? 'bg-green-900 text-green-200' :
                            p.tipo_operacion === 'arriendo' ? 'bg-blue-900 text-blue-200' :
                            'bg-amber-900 text-amber-200'
                          }`}>
                            {p.tipo_operacion}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-300">{p.comuna}</td>
                        <td className="py-3 pr-4 text-slate-300">{p.usuario_nombre || p.usuario_email}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold ${p.prioridad_score > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                            {p.prioridad_score}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 text-xs">{p.fecha_publicacion ? new Date(p.fecha_publicacion).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Cupones */}
        {tab === 'cupones' && (
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-8">
            <h2 className="text-xl font-bold text-indigo-400">Cupones de Descuento</h2>
            <CuponesManager />
          </div>
        )}
      </div>
    </div>
  );
}

function CuponesManager() {
  const [cupones, setCupones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [codigo, setCodigo] = useState('');
  const [descuento, setDescuento] = useState('50');
  const [planTipo, setPlanTipo] = useState('plan_10k');
  const [usosMaximos, setUsosMaximos] = useState('1');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const res = await fetch('/api/admin/cupones');
      const d = await res.json();
      if (d.success) setCupones(d.cupones);
    } catch {}
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/cupones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, descuento, plan_tipo: planTipo, usos_maximos: usosMaximos, fecha_expiracion: fechaExpiracion || null }),
      });
      const d = await res.json();
      if (d.success) {
        setMsg(`Cupón ${d.codigo} creado con éxito!`);
        setCodigo('');
        load();
      } else {
        setMsg('Error: ' + d.error);
      }
    } catch { setMsg('Error de red'); }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cupón?')) return;
    try {
      await fetch(`/api/admin/cupones?id=${id}`, { method: 'DELETE' });
      load();
    } catch {}
  };

  const precios: Record<string, number> = { plan_10k: 10000, plan_20k: 20000, plan_50k: 50000 };

  useEffect(() => { load(); }, []);

  const planLabel: Record<string, string> = { plan_10k: 'Plan 10K', plan_20k: 'Plan 20K', plan_50k: 'Plan 50K' };

  return (
    <div className="space-y-8">
      {/* Formulario crear cupón */}
      <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Crear Nuevo Cupón</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Código</label>
            <input value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} placeholder="EJ: VERANO50" className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none uppercase" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Descuento %</label>
            <input type="number" value={descuento} onChange={e => setDescuento(e.target.value)} min="1" max="100" className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Plan</label>
            <select value={planTipo} onChange={e => setPlanTipo(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="plan_10k">Plan 10K</option>
              <option value="plan_20k">Plan 20K</option>
              <option value="plan_50k">Plan 50K</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Usos máximos</label>
            <input type="number" value={usosMaximos} onChange={e => setUsosMaximos(e.target.value)} min="1" className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Expira (opcional)</label>
            <input type="date" value={fechaExpiracion} onChange={e => setFechaExpiracion(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={creating} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all text-sm disabled:opacity-50">
              {creating ? 'Creando...' : 'Crear Cupón'}
            </button>
          </div>
        </div>
        {msg && <div className="bg-indigo-900/40 border border-indigo-500/50 text-indigo-200 p-3 rounded-xl text-sm font-bold text-center">{msg}</div>}
      </form>

      {/* Lista de cupones */}
      {loading ? (
        <div className="text-center text-slate-400 py-8">Cargando cupones...</div>
      ) : cupones.length === 0 ? (
        <div className="text-center text-slate-500 py-8">No hay cupones creados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="pb-3 pr-4 font-bold">Código</th>
                <th className="pb-3 pr-4 font-bold">Dto</th>
                <th className="pb-3 pr-4 font-bold">Plan</th>
                <th className="pb-3 pr-4 font-bold">Precio Original</th>
                <th className="pb-3 pr-4 font-bold">Precio Final</th>
                <th className="pb-3 pr-4 font-bold">Usos</th>
                <th className="pb-3 pr-4 font-bold">Expira</th>
                <th className="pb-3 font-bold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {cupones.map(c => {
                const original = precios[c.plan_tipo] || 0;
                const final = Math.round(original * (100 - c.descuento) / 100);
                return (
                  <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                    <td className="py-3 pr-4 text-white font-bold">{c.codigo}</td>
                    <td className="py-3 pr-4 text-emerald-400 font-bold">-{c.descuento}%</td>
                    <td className="py-3 pr-4 text-slate-300">{planLabel[c.plan_tipo] || c.plan_tipo}</td>
                    <td className="py-3 pr-4 text-slate-400">${original.toLocaleString('es-CL')}</td>
                    <td className="py-3 pr-4 text-white font-bold">${final.toLocaleString('es-CL')}</td>
                    <td className="py-3 pr-4 text-slate-300">{c.usos_actuales}/{c.usos_maximos}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">{c.fecha_expiracion ? new Date(c.fecha_expiracion + 'T00:00:00').toLocaleDateString('es-CL') : '-'}</td>
                    <td className="py-3">
                      <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 text-xs font-bold">Eliminar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
