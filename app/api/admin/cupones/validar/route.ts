import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { codigo } = await request.json();
    if (!codigo) {
      return NextResponse.json({ valido: false, error: 'Código requerido' }, { status: 400 });
    }

    let db: any = null;
    try {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      db = getCloudflareContext().env.DB;
    } catch (e) {
      db = (globalThis as any).DB || (process.env as any).DB;
    }

    if (!db) {
      return NextResponse.json({ valido: false, error: 'Base de datos no disponible' }, { status: 500 });
    }

    const cupon = await db.prepare(
      `SELECT * FROM cupones WHERE codigo = ? AND activo = 1 AND usos_actuales < usos_maximos AND (fecha_expiracion IS NULL OR fecha_expiracion > DATETIME('now'))`
    ).bind(codigo.toUpperCase()).first();

    if (!cupon) {
      return NextResponse.json({ valido: false, error: 'Cupón inválido, expirado o sin usos disponibles' });
    }

    return NextResponse.json({
      valido: true,
      descuento: cupon.descuento,
      plan_tipo: cupon.plan_tipo,
      codigo: cupon.codigo,
    });
  } catch (error: any) {
    return NextResponse.json({ valido: false, error: error.message }, { status: 500 });
  }
}
