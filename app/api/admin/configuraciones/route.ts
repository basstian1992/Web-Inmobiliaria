import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let db: any = null;
    try {
      db = getCloudflareContext().env.DB;
    } catch (e) {
      db = (globalThis as any).DB || process.env.DB || (process.env as any).propiedadesyparcelas_db;
    }

    if (!db) return NextResponse.json({ success: false, error: 'DB not connected' }, { status: 500 });

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

    // En un sistema real verificaríamos si user.publicMetadata.role === 'admin'
    // Para este MVP, o verificamos que el usuario es admin en nuestra tabla `usuarios`
    
    let db: any = null;
    try {
      db = getCloudflareContext().env.DB;
    } catch (e) {
      db = (globalThis as any).DB || process.env.DB || (process.env as any).propiedadesyparcelas_db;
    }
    if (!db) return NextResponse.json({ success: false, error: 'DB not connected' }, { status: 500 });

    const dbUser = await db.prepare('SELECT plan_tipo FROM usuarios WHERE id = ?').bind(user.id).first();
    if (!dbUser || dbUser.plan_tipo !== 'admin') {
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
