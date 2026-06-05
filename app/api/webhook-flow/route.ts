import { NextRequest, NextResponse } from 'next/server';
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
    // 1. Obtener el token enviado por Flow (generalmente x-www-form-urlencoded POST)
    let token = '';
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      token = (formData.get('token') as string) || '';
    } else {
      // Intentar leer de JSON o URL query string como fallback
      try {
        const body = await request.json();
        token = body.token || '';
      } catch (e) {
        const { searchParams } = new URL(request.url);
        token = searchParams.get('token') || '';
      }
    }

    if (!token) {
      console.error('Webhook de Flow: No se recibió token en la petición');
      return NextResponse.json({ error: 'Token no proveído' }, { status: 400 });
    }

    // 2. Obtener variables de entorno
    let flowApiKey = '';
    let flowSecretKey = '';
    let flowSandbox = 'true';
    let db: any = null;

    try {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      const env = getCloudflareContext().env;
      flowApiKey = env.FLOW_API_KEY || '';
      flowSecretKey = env.FLOW_SECRET_KEY || '';
      flowSandbox = env.FLOW_SANDBOX || 'true';
      db = env.DB;
    } catch (e) {
      flowApiKey = process.env.FLOW_API_KEY || '';
      flowSecretKey = process.env.FLOW_SECRET_KEY || '';
      flowSandbox = process.env.FLOW_SANDBOX || 'true';
      db = (globalThis as any).DB || (process.env as any).DB;
    }

    if (!flowApiKey || !flowSecretKey) {
      console.error('Webhook de Flow: Configuración de API de Flow incompleta');
      return NextResponse.json({ error: 'Servidor no configurado' }, { status: 500 });
    }

    if (!db) {
      console.error('Webhook de Flow: Base de datos D1 no disponible');
      return NextResponse.json({ error: 'Base de datos no disponible' }, { status: 500 });
    }

    const flowBaseUrl = flowSandbox === 'true' 
      ? 'https://sandbox.flow.cl/api' 
      : 'https://www.flow.cl/api';

    // 3. Consultar el estado del pago a Flow usando /payment/getStatus
    const statusParams: Record<string, any> = {
      apiKey: flowApiKey,
      token: token,
    };
    statusParams.s = signParams(statusParams, flowSecretKey);

    const formBody = Object.keys(statusParams)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(statusParams[key]))
      .join('&');

    const response = await fetch(`${flowBaseUrl}/payment/getStatus?${formBody}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Webhook de Flow: Error al consultar estado de pago en Flow:', errText);
      return NextResponse.json({ error: 'Error al verificar pago' }, { status: 500 });
    }

    const paymentData = await response.json();
    
    // Status 2 en Flow significa pago exitoso / aprobado
    if (paymentData.status !== 2) {
      console.log(`Webhook de Flow: Pago no aprobado. Estado actual: ${paymentData.status}`);
      return NextResponse.json({ success: true, message: `Estado actual: ${paymentData.status}` });
    }

    const commerceOrder = paymentData.commerceOrder; // Formato: "userId:plan:timestamp" o "userId:plan:timestamp:CODIGO_CUPON"
    if (!commerceOrder || !commerceOrder.includes(':')) {
      console.error('Webhook de Flow: commerceOrder inválido o inexistente:', commerceOrder);
      return NextResponse.json({ error: 'Order de comercio inválida' }, { status: 400 });
    }

    const parts = commerceOrder.split(':');
    const userId = parts[0];
    const plan = parts[1];
    const cuponCodigo = parts.length >= 4 ? parts[3] : null;
    if (!userId || !plan) {
      console.error('Webhook de Flow: userId o plan faltantes en commerceOrder:', commerceOrder);
      return NextResponse.json({ error: 'Datos de orden incompletos' }, { status: 400 });
    }

    // 4. Actualizar el perfil del usuario en la base de datos D1
    // Añadimos 30 días de suscripción
    const dias = 30;
    
    await db.prepare(
      `UPDATE usuarios 
       SET plan_tipo = ?, 
           plan_expiracion = DATETIME('now', '+30 days'), 
           plan_suscripcion_id = ? 
       WHERE id = ?`
    ).bind(plan, token, userId).run();

    console.log(`Webhook de Flow: Suscripción activada con éxito para usuario ${userId}. Plan: ${plan}`);

    // Opcional: impulsar automáticamente sus avisos existentes a un score más alto para potenciar su SEO
    let prioridadScore = 1;
    if (plan === 'plan_50k') {
      prioridadScore = 2;
    }
    
    await db.prepare(
      `UPDATE propiedades 
       SET prioridad_score = ?, 
           fecha_expiracion_impulso = DATETIME('now', '+30 days') 
       WHERE usuario_id = ?`
    ).bind(prioridadScore, userId).run();

    // Si se usó un cupón, incrementar su contador de usos
    if (cuponCodigo) {
      await db.prepare(
        `UPDATE cupones SET usos_actuales = usos_actuales + 1 WHERE codigo = ?`
      ).bind(cuponCodigo).run();
      console.log(`Webhook de Flow: Cupón ${cuponCodigo} usado por usuario ${userId}`);
    }

    // Flow espera un HTTP 200 con cuerpo o redirección si es necesario, pero para webhook (urlConfirmation) solo requiere HTTP 200 OK.
    return NextResponse.json({ success: true, message: 'Plan actualizado con éxito' });
  } catch (error: any) {
    console.error('Error procesando webhook de Flow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Permitir GET también por si Flow envía peticiones de verificación GET
export async function GET(request: NextRequest) {
  return POST(request);
}
