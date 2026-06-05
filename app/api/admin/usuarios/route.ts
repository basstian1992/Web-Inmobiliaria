import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['b.alarconatenas@gmail.com', 'basklian@gmail.com', 'b.alarcontenas@gmail.com'];

async function getDB() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    return getCloudflareContext().env.DB;
  } catch (e) {
    return (globalThis as any).DB || (process.env as any).DB || (process.env as any).propiedadesyparcelas_db;
  }
}

async function checkAdmin(user: any): Promise<boolean> {
  return user.emailAddresses?.some((e: any) => ADMIN_EMAILS.includes(e.emailAddress));
}

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    const db = await getDB();
    if (!db) return NextResponse.json({ success: false, error: 'DB not connected' }, { status: 500 });

    if (!(await checkAdmin(user))) {
      return NextResponse.json({ success: false, error: 'No tienes permisos de administrador.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo');

    if (tipo === 'propiedades') {
      const { results } = await db.prepare(
        `SELECT p.id, p.titulo, p.tipo_operacion, p.tipo_propiedad, p.comuna,
                p.fecha_publicacion, p.prioridad_score, p.slug,
                u.nombre as usuario_nombre, u.email as usuario_email
         FROM propiedades p JOIN usuarios u ON p.usuario_id = u.id
         ORDER BY p.fecha_publicacion DESC LIMIT 200`
      ).all();
      return NextResponse.json({ success: true, propiedades: results || [] });
    }

    const { results } = await db.prepare(
      `SELECT u.id, u.nombre, u.email, u.plan_tipo,
              (SELECT COUNT(*) FROM propiedades WHERE usuario_id = u.id) as propiedad_count
       FROM usuarios u ORDER BY u.fecha_registro DESC`
    ).all();

    return NextResponse.json({ success: true, usuarios: results || [] });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    const db = await getDB();
    if (!db) return NextResponse.json({ success: false, error: 'DB not connected' }, { status: 500 });

    if (!(await checkAdmin(user))) {
      return NextResponse.json({ success: false, error: 'No tienes permisos de administrador.' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, plan } = body;

    if (!userId || !plan) {
      return NextResponse.json({ success: false, error: 'userId y plan son requeridos' }, { status: 400 });
    }

    const validPlans = ['gratis', 'plan_10k', 'plan_20k', 'plan_50k', 'admin'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ success: false, error: 'Plan no válido' }, { status: 400 });
    }

    await db.prepare('UPDATE usuarios SET plan_tipo = ? WHERE id = ?').bind(plan, userId).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user plan:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
