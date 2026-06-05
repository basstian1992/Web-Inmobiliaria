import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

const TIPO_LABEL: Record<string, string> = {
  terreno: 'Terreno / Parcela',
  casa: 'Casa',
  local: 'Local Comercial',
};

const OPERACION_VERBO: Record<string, string> = {
  venta: 'vende',
  compra: 'compra',
  arriendo: 'arrienda',
};

const OPERACION_PREP: Record<string, string> = {
  venta: 'en venta',
  compra: 'en compra',
  arriendo: 'en arriendo',
};

function generateDescription(props: {
  tipo_propiedad: string;
  tipo_operacion: string;
  titulo: string;
  comuna: string;
  region: string;
  superficie_total: number;
  habitaciones: number;
  banos: number;
  precio_pesos: number;
  precio_uf: number;
}) {
  const tipo = TIPO_LABEL[props.tipo_propiedad] || props.tipo_propiedad;
  const verbo = OPERACION_VERBO[props.tipo_operacion] || props.tipo_operacion;
  const prep = OPERACION_PREP[props.tipo_operacion] || props.tipo_operacion;

  const precioTexto = props.precio_uf
    ? `${props.precio_uf} UF`
    : props.precio_pesos
      ? `$${props.precio_pesos.toLocaleString('es-CL')} CLP`
      : 'a consultar';

  const habTexto = props.habitaciones > 0 ? `${props.habitaciones} dormitorio${props.habitaciones > 1 ? 's' : ''}` : '';
  const banoTexto = props.banos > 0 ? `${props.banos} baño${props.banos > 1 ? 's' : ''}` : '';
  const specs = [habTexto, banoTexto].filter(Boolean).join(', ');

  const templates = [
    `🏡 **${props.titulo}** — ${tipo} ${prep} en ${props.comuna}, ${props.region}.

📐 Con una superficie total de **${props.superficie_total} m²**, esta propiedad ofrece un espacio ideal${specs ? ` con ${specs}` : ''} para quienes buscan calidad de vida y proyección en una de las zonas más prometedoras de Chile.

💰 Valor: **${precioTexto}**.

📍 Ubicación estratégica en ${props.comuna}, con acceso a servicios, comercio, educación y conectividad vial. Perfecto para familias, inversionistas o emprendedores que desean establecerse en ${props.region}.

🔍 Características destacadas:
• Superficie total: ${props.superficie_total} m²${props.habitaciones > 0 ? `\n• ${habTexto}` : ''}${props.banos > 0 ? `\n• ${banoTexto}` : ''}
• Documentación al día con saneamiento legal
• Excelente plusvalía y proyección de valorización

🤝 Esta propiedad es publicada a través de Propiedades & Parcelas Chile, plataforma inmobiliaria en alianza estratégica con **Asesoría Pública (www.asesoriapublica.cl)**, consultora especializada en saneamiento de títulos, estudios de dominio y regularización de terrenos rurales y urbanos en todo Chile.

📞 Para agendar una visita o recibir más información, contáctanos directamente y te pondremos en contacto con el vendedor o corredor responsable.

✨ No dejes pasar esta oportunidad única. ${props.comuna} te espera.`,

    `✨ **OPORTUNIDAD ÚNICA** — ${tipo} ${prep} en ${props.comuna}

Se ${verbo} ${tipo.toLowerCase()} de ${props.superficie_total} m²${specs ? ` (${specs})` : ''} en el corazón de ${props.comuna}, ${props.region}. Un inmueble con excelente proyección de valorización y todas las condiciones para convertirse en el hogar o inversión que buscas.

✅ **Lo que debes saber:**
• Ubicación: ${props.comuna}, ${props.region}
• Superficie total: ${props.superficie_total} m²
• Precio: ${precioTexto}
• Tipo: ${tipo} ${prep}
${props.habitaciones > 0 ? `• Dormitorios: ${props.habitaciones}` : ''}
${props.banos > 0 ? `• Baños: ${props.banos}` : ''}

🏆 **Valor agregado:**
Esta propiedad cuenta con el respaldo de **Asesoría Pública (www.asesoriapublica.cl)**, garantizando que la documentación y el saneamiento legal sean revisados por expertos. No arriesgues tu inversión: asegúrate con profesionales.

📲 Contáctanos para coordinar una visita presencial o virtual. ¡Te esperamos en ${props.comuna}!`,

    `📢 **${props.titulo}** — ${tipo} ${prep} — ${props.comuna}, ${props.region}

Se ${verbo} ${tipo.toLowerCase()} de ${props.superficie_total} m²${specs ? ` con ${specs}` : ''}, ubicado en ${props.comuna}, ${props.region}. Precio: ${precioTexto}.

**CARACTERÍSTICAS PRINCIPALES:**
✔ Superficie: ${props.superficie_total} m²
${props.habitaciones > 0 ? `✔ ${habTexto}` : ''}
${props.banos > 0 ? `✔ ${banoTexto}` : ''}
✔ Excelente ubicación y accesibilidad
✔ Documentación legal en orden

**INFORMACIÓN IMPORTANTE:**
Antes de concretar cualquier operación inmobiliaria, te recomendamos asesorarte con **Asesoría Pública (www.asesoriapublica.cl)**, expertos en saneamiento de títulos, subdivisiones y estudios de dominio en Chile. La tranquilidad de tu inversión no tiene precio.

**CONTACTO:**
Para más información sobre esta propiedad y agendar visitas, no dudes en escribirnos. Atendemos consultas técnicas y comerciales de lunes a viernes.

📍 ${props.comuna}, ${props.region}, Chile`,
  ];

  const selected = templates[Math.floor(Math.random() * templates.length)];

  return {
    descripcion: selected,
    seo_keywords: `${tipo.toLowerCase()} ${prep} ${props.comuna}, ${props.tipo_operacion} de ${tipo.toLowerCase()} en ${props.region}, propiedades ${prep} ${props.comuna}, inmobiliaria Chile, corretaje ${props.comuna}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      tipo_propiedad,
      tipo_operacion,
      titulo,
      comuna,
      region,
      superficie_total,
      habitaciones,
      banos,
      precio_pesos,
      precio_uf,
    } = body;

    if (!tipo_propiedad || !tipo_operacion || !titulo || !comuna || !region || !superficie_total) {
      return NextResponse.json({ error: 'Faltan datos obligatorios (tipo_propiedad, tipo_operacion, titulo, comuna, region, superficie_total)' }, { status: 400 });
    }

    const result = generateDescription({
      tipo_propiedad,
      tipo_operacion,
      titulo,
      comuna,
      region,
      superficie_total: parseInt(superficie_total),
      habitaciones: parseInt(habitaciones) || 0,
      banos: parseInt(banos) || 0,
      precio_pesos: parseInt(precio_pesos) || 0,
      precio_uf: parseFloat(precio_uf) || 0,
    });

    return NextResponse.json({
      success: true,
      descripcion: result.descripcion,
      seo_keywords: result.seo_keywords,
    });
  } catch (error: any) {
    console.error('Error generando descripción:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
