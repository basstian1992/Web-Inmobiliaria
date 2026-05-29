import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardClient from './dashboard-client';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const db = (process.env as any).propiedadesyparcelas_db || (process.env as any).DB;
  if (!db) {
    // Si la base de datos D1 no está vinculada aún, pasamos un array vacío de respaldo
    return (
      <DashboardClient 
        propiedades={[]} 
        userNombre={user.firstName || user.username || 'Usuario'} 
      />
    );
  }

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
    />
  );
}
