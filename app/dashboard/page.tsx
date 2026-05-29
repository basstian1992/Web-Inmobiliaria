import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardClient from './dashboard-client';

export const dynamic = 'force-dynamic';


export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  let db: any = null;
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    db = getCloudflareContext().env.DB;
  } catch (e) {
    db = (globalThis as any).DB || (process.env as any).DB || (process.env as any).propiedadesyparcelas_db;
  }

  const defaultProfile = {
    id: user.id,
    nombre: user.firstName || user.username || 'Usuario',
    email: user.emailAddresses[0]?.emailAddress || '',
    plan_tipo: 'gratis',
    plan_expiracion: null as string | null
  };

  if (!db) {
    return (
      <DashboardClient 
        propiedades={[]} 
        userNombre={defaultProfile.nombre} 
        userProfile={defaultProfile}
      />
    );
  }

  // 1. Verificar y registrar el perfil de usuario en la base de datos D1
  let dbUser = await db.prepare(`SELECT * FROM usuarios WHERE id = ?`).bind(user.id).first();
  const isAdmin = user.emailAddresses.some(e => e.emailAddress === 'b.alarconatenas@gmail.com');
  const planEsperado = isAdmin ? 'admin' : 'gratis';

  if (!dbUser) {
    await db.prepare(
      `INSERT INTO usuarios (id, nombre, email, plan_tipo) VALUES (?, ?, ?, ?)`
    ).bind(user.id, defaultProfile.nombre, defaultProfile.email, planEsperado).run();
    dbUser = { ...defaultProfile, plan_tipo: planEsperado };
  } else if (isAdmin && dbUser.plan_tipo !== 'admin') {
    await db.prepare(`UPDATE usuarios SET plan_tipo = 'admin' WHERE id = ?`).bind(user.id).run();
    dbUser.plan_tipo = 'admin';
  }

  const userProfile = {
    id: dbUser.id,
    nombre: dbUser.nombre,
    email: dbUser.email,
    plan_tipo: dbUser.plan_tipo,
    plan_expiracion: dbUser.plan_expiracion
  };

  // 1. Consultar las propiedades asociadas al ID del usuario logueado en Clerk
  const { results } = await db.prepare(
    `SELECT * FROM propiedades WHERE usuario_id = ? ORDER BY fecha_publicacion DESC`
  ).bind(user.id).all();

  const propiedades = (results || []).map((row: any) => ({
    id: row.id,
    titulo: row.titulo,
    tipo_operacion: row.tipo_operacion,
    tipo_propiedad: row.tipo_propiedad,
    comuna: row.comuna,
    region: row.region,
    precio_pesos: row.precio_pesos,
    precio_uf: row.precio_uf,
    prioridad_score: row.prioridad_score,
    fecha_expiracion_impulso: row.fecha_expiracion_impulso,
    fecha_publicacion: row.fecha_publicacion,
  }));

  return (
    <DashboardClient 
      propiedades={propiedades} 
      userNombre={user.firstName || user.username || 'Usuario'} 
      userProfile={userProfile}
    />
  );
}
