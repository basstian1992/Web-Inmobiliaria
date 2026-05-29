import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';




export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { propiedadId, monto } = await request.json();
    if (!propiedadId || !monto) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    if (monto !== 10000 && monto !== 20000) {
      return NextResponse.json({ error: 'Monto de impulso inválido' }, { status: 400 });
    }

    // El token de acceso se almacena en variables de entorno de Cloudflare
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Error de configuración: falta token de Mercado Pago' },
        { status: 500 }
      );
    }

    const host = request.nextUrl.origin;

    // Llamada directa con fetch para evitar dependencias pesadas e incompatibles con Edge Runtime
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            id: `impulso-${propiedadId}`,
            title: `Impulso Premium ($${monto.toLocaleString('es-CL')}) - Propiedades y Parcelas`,
            unit_price: monto,
            quantity: 1,
            currency_id: 'CLP',
          },
        ],
        metadata: {
          propiedad_id: propiedadId,
          monto: monto,
        },
        back_urls: {
          success: `${host}/dashboard?status=success&propiedadId=${propiedadId}`,
          failure: `${host}/dashboard?status=failure`,
          pending: `${host}/dashboard?status=pending`,
        },
        auto_return: 'approved',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al crear la preferencia de pago' },
        { status: response.status }
      );
    }

    // Retornamos la URL de pago para redireccionar
    return NextResponse.json({ success: true, initPoint: data.init_point });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
