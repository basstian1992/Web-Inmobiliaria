import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import crypto from 'crypto';

// Algoritmo de firma oficial de Flow Chile
function signParams(params: Record<string, any>, secretKey: string): string {
  const sortedKeys = Object.keys(params).sort();
  let concatString = '';
  for (const key of sortedKeys) {
    if (key === 's') continue;
    const val = params[key];
    if (val !== undefined && val !== null) {
      concatString += key + val;
    }
  }
  return crypto.createHmac('sha256', secretKey).update(concatString).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, cupon } = body; // 'plan_10k', 'plan_20k', 'plan_50k' + optional coupon code

    if (!plan || !['plan_10k', 'plan_20k', 'plan_50k'].includes(plan)) {
      return NextResponse.json({ error: 'Plan seleccionado inválido' }, { status: 400 });
    }

    let monto = 0;
    let subject = '';
    if (plan === 'plan_10k') {
      monto = 10000;
      subject = 'Suscripción Portal Inmobiliario - Plan 10K (Exposición Media)';
    } else if (plan === 'plan_20k') {
      monto = 20000;
      subject = 'Suscripción Portal Inmobiliario - Plan 20K (Exposición Alta)';
    } else if (plan === 'plan_50k') {
      monto = 50000;
      subject = 'Suscripción Portal Inmobiliario - Plan 50K (Exposición Máxima)';
    }

    // Obtener variables de entorno de Cloudflare y BD
    let db: any = null;
    let flowApiKey = '';
    let flowSecretKey = '';
    let flowSandbox = 'true';

    try {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      const env = getCloudflareContext().env;
      db = env.DB;
      flowApiKey = env.FLOW_API_KEY || '';
      flowSecretKey = env.FLOW_SECRET_KEY || '';
      flowSandbox = env.FLOW_SANDBOX || 'true';
    } catch (e) {
      db = (globalThis as any).DB || process.env.DB || (process.env as any).propiedadesyparcelas_db;
      flowApiKey = process.env.FLOW_API_KEY || '';
      flowSecretKey = process.env.FLOW_SECRET_KEY || '';
      flowSandbox = process.env.FLOW_SANDBOX || 'true';
    }

    // Validar cupón de descuento si se envió
    let descuentoAplicado = 0;
    let cuponInfo: any = null;

    if (cupon && db) {
      cuponInfo = await db.prepare(
        `SELECT * FROM cupones WHERE codigo = ? AND activo = 1 AND usos_actuales < usos_maximos AND (fecha_expiracion IS NULL OR fecha_expiracion > DATETIME('now'))`
      ).bind(cupon.toUpperCase()).first();

      if (!cuponInfo) {
        return NextResponse.json({ error: 'Cupón inválido, expirado o sin usos disponibles' }, { status: 400 });
      }

      descuentoAplicado = cuponInfo.descuento;
      const descuentoMonto = Math.round(monto * descuentoAplicado / 100);
      monto = monto - descuentoMonto;
      subject = `${subject} (CUPÓN: ${cupon.toUpperCase()} - ${descuentoAplicado}% DCTO)`;
    }

    // Buscar en la configuración del administrador si el link estático fue configurado
    if (db) {
       const key = `flow_${plan}`;
       const config = await db.prepare('SELECT valor FROM configuraciones WHERE clave = ?').bind(key).first();
       if (config && config.valor && config.valor.trim() !== '') {
          // Si el administrador configuró un link de Flow directo, retornamos ese.
          return NextResponse.json({ success: true, redirectUrl: config.valor.trim() });
       }
    }

    if (!flowApiKey || !flowSecretKey) {
      console.error('Configuración de Flow incompleta: falta FLOW_API_KEY o FLOW_SECRET_KEY');
      return NextResponse.json({ error: 'El portal de pagos de Flow no está configurado en el servidor' }, { status: 500 });
    }

    const flowBaseUrl = flowSandbox === 'true' 
      ? 'https://sandbox.flow.cl/api' 
      : 'https://www.flow.cl/api';

    const baseUrl = 'https://www.propiedadesyparcelas.cl';
    const email = user.emailAddresses[0]?.emailAddress || '';
    const commerceOrder = cuponInfo ? `${user.id}:${plan}:${Date.now()}:${cuponInfo.codigo}` : `${user.id}:${plan}:${Date.now()}`;

    // Parámetros requeridos por Flow para la creación de pagos
    const flowParams: Record<string, any> = {
      apiKey: flowApiKey,
      commerceOrder: commerceOrder,
      subject: subject,
      amount: monto,
      email: email,
      urlConfirmation: `${baseUrl}/api/webhook-flow`,
      urlReturn: `${baseUrl}/dashboard?payment=success`,
    };

    // Firmar los parámetros
    flowParams.s = signParams(flowParams, flowSecretKey);

    // Convertir a url-encoded form body
    const formBody = Object.keys(flowParams)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(flowParams[key]))
      .join('&');

    const response = await fetch(`${flowBaseUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al llamar a la API de Flow:', errorText);
      return NextResponse.json({ error: 'Error del servidor de pagos Flow' }, { status: 500 });
    }

    const data = await response.json();
    if (data.url && data.token) {
      return NextResponse.json({ success: true, redirectUrl: `${data.url}?token=${data.token}` });
    }

    return NextResponse.json({ error: 'Respuesta inválida del servidor de pagos' }, { status: 500 });
  } catch (error: any) {
    console.error('Error en flow-create:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
