import { getRequestContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';




export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('Webhook Error: Falta MERCADOPAGO_ACCESS_TOKEN');
      return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 });
    }

    // 1. Obtener el ID del pago desde el body o los parámetros de consulta
    let paymentId: string | null = null;
    
    try {
      const body = await request.json();
      // Estructura estándar de notificaciones de Mercado Pago (IPN o Webhook)
      if (body.data?.id) {
        paymentId = body.data.id;
      } else if (body.id) {
        paymentId = body.id;
      }
    } catch (e) {
      // Si no hay JSON en el cuerpo, buscar en parámetros URL
      const { searchParams } = new URL(request.url);
      paymentId = searchParams.get('data.id') || searchParams.get('id');
    }

    if (!paymentId) {
      // Respondemos 200 OK para que Mercado Pago deje de reintentar si no viene un ID válido
      return NextResponse.json({ success: true, message: 'Notificación recibida sin ID de pago' }, { status: 200 });
    }

    // 2. Consultar detalles completos del pago a la API oficial de Mercado Pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Error al consultar el pago ${paymentId}:`, await response.text());
      return NextResponse.json({ error: 'Error al consultar detalles de pago en Mercado Pago' }, { status: 500 });
    }

    const paymentData = await response.json();

    // 3. Verificar si el pago fue aprobado
    if (paymentData.status === 'approved') {
      const propiedadId = paymentData.metadata?.propiedad_id;

      if (!propiedadId) {
        console.error('Pago aprobado pero falta el metadata propiedad_id:', paymentData.metadata);
        return NextResponse.json({ error: 'Falta ID de propiedad en los metadatos' }, { status: 400 });
      }

      // 4. Actualizar la base de datos D1 del anuncio correspondiente
      let db: any = null;
      try {
        db = getRequestContext().env.DB;
      } catch (e) {
        db = (globalThis as any).DB || (process.env as any).DB || (process.env as any).propiedadesyparcelas_db;
      }
      if (!db) {
        console.error('Error: No se encontró la base de datos D1 en process.env.propiedadesyparcelas_db o DB');
        return NextResponse.json({ error: 'Conexión a D1 no disponible' }, { status: 500 });
      }

      await db.prepare(
        `UPDATE propiedades 
         SET prioridad_score = 1, 
             fecha_expiracion_impulso = DATETIME('now', '+30 days') 
         WHERE id = ?`
      ).bind(propiedadId).run();

      console.log(`Propiedad impulsada con éxito: ${propiedadId}`);
      return NextResponse.json({ success: true, message: 'Propiedad impulsada con éxito' });
    }

    return NextResponse.json({ success: true, message: `Pago recibido con estado: ${paymentData.status}` });
  } catch (error: any) {
    console.error('Error procesando webhook de pago:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// También soportamos solicitudes GET (IPN antiguas de Mercado Pago a veces verifican mediante GET)
export async function GET(request: NextRequest) {
  return POST(request);
}
