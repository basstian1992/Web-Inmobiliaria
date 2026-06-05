import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

async function getDB() {
  try {
    return getCloudflareContext().env.DB;
  } catch (e) {
    return (globalThis as any).DB || (process.env as any).DB || (process.env as any).propiedadesyparcelas_db;
  }
}

const ADMIN_EMAILS = ['b.alarconatenas@gmail.com', 'basklian@gmail.com', 'b.alarcontenas@gmail.com'];

async function syncUser(db: any, user: any) {
  const isAdmin = user.emailAddresses.some((e: any) => ADMIN_EMAILS.includes(e.emailAddress));
  const planEsperado = isAdmin ? 'admin' : 'gratis';
  const dbUser = await db.prepare('SELECT plan_tipo FROM usuarios WHERE id = ?').bind(user.id).first();

  if (!dbUser) {
    const nombre = user.firstName || user.username || 'Usuario';
    const email = user.emailAddresses[0]?.emailAddress || '';
    await db.prepare(
      'INSERT INTO usuarios (id, nombre, email, plan_tipo) VALUES (?, ?, ?, ?)'
    ).bind(user.id, nombre, email, planEsperado).run();
    return planEsperado;
  }

  if (isAdmin && dbUser.plan_tipo !== 'admin') {
    await db.prepare("UPDATE usuarios SET plan_tipo = 'admin' WHERE id = ?").bind(user.id).run();
    return 'admin';
  }

  return dbUser.plan_tipo;
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    let db = await getDB();
    if (!db) return NextResponse.json({ success: false, error: 'DB not connected' }, { status: 500 });

    const plan = await syncUser(db, user);
    if (plan !== 'admin') {
      return NextResponse.json({ success: false, error: 'No tienes permisos de administrador.' }, { status: 403 });
    }

    const keys = ['flow_plan_10k', 'flow_plan_20k', 'flow_plan_50k'];
    const placeholders = keys.map(() => '?').join(',');
    const { results } = await db.prepare(
      `SELECT clave, valor FROM configuraciones WHERE clave IN (${placeholders})`
    ).bind(...keys).all();

    const configMap: Record<string, string> = {};
    if (results) {
      results.forEach((row: any) => {
        configMap[row.clave] = row.valor;
      });
    }

    return NextResponse.json({ success: true, configuraciones: configMap });
  } catch (error: any) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    let db = await getDB();
    if (!db) return NextResponse.json({ success: false, error: 'DB not connected' }, { status: 500 });

    const plan = await syncUser(db, user);
    if (plan !== 'admin') {
      return NextResponse.json({ success: false, error: 'No tienes permisos de administrador.' }, { status: 403 });
    }

    const body = await req.json();
    const keys = ['flow_plan_10k', 'flow_plan_20k', 'flow_plan_50k'];

    for (const key of keys) {
      if (body[key] !== undefined) {
        await db.prepare(
          `INSERT INTO configuraciones (clave, valor) VALUES (?, ?) 
           ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor, fecha_actualizacion=CURRENT_TIMESTAMP`
        ).bind(key, body[key]).run();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
