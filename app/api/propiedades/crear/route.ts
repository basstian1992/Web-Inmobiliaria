import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      tipo_operacion,
      tipo_propiedad,
      titulo,
      descripcion,
      precio_pesos,
      precio_uf,
      region,
      comuna,
      habitaciones,
      banos,
      superficie_total,
      contacto_nombre,
      contacto_telefono,
      contacto_email,
      observaciones,
      documentos, // Array de strings (documentos)
    } = body;

    // Validar campos obligatorios
    if (!tipo_operacion || !tipo_propiedad || !titulo || !descripcion || !region || !comuna || !superficie_total) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // 1. Obtener Base de Datos
    let db: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      db = getCloudflareContext().env.DB;
    } catch (e) {
      db = (globalThis as any).DB || (process.env as any).DB || (process.env as any).propiedadesyparcelas_db;
    }

    if (!db) {
      return NextResponse.json({ error: 'Base de datos no disponible' }, { status: 500 });
    }

    // 2. Obtener el perfil del usuario en D1
    let dbUser = await db.prepare(`SELECT * FROM usuarios WHERE id = ?`).bind(user.id).first();
    
    // Si no está registrado en D1, lo registramos por seguridad
    const isAdmin = user.emailAddresses.some(e => e.emailAddress === 'b.alarconatenas@gmail.com');
    const planDefault = isAdmin ? 'admin' : 'gratis';

    if (!dbUser) {
      const userNombre = user.firstName || user.username || 'Usuario';
      const userEmail = user.emailAddresses[0]?.emailAddress || '';
      await db.prepare(
        `INSERT INTO usuarios (id, nombre, email, plan_tipo) VALUES (?, ?, ?, ?)`
      ).bind(user.id, userNombre, userEmail, planDefault).run();
      
      dbUser = { plan_tipo: planDefault };
    } else if (isAdmin && dbUser.plan_tipo !== 'admin') {
      await db.prepare(`UPDATE usuarios SET plan_tipo = 'admin' WHERE id = ?`).bind(user.id).run();
      dbUser.plan_tipo = 'admin';
    }

    const plan = dbUser.plan_tipo || 'gratis';

    // 3. Obtener cantidad de propiedades existentes del usuario
    const countResult = await db.prepare(
      `SELECT COUNT(*) as total FROM propiedades WHERE usuario_id = ?`
    ).bind(user.id).first();
    const totalPropiedades = countResult?.total || 0;

    // 4. Validar límites de avisos según plan
    let maxAvisos = 2;
    if (plan === 'plan_10k') maxAvisos = 4;
    else if (plan === 'plan_20k') maxAvisos = 10;
    else if (plan === 'plan_50k') maxAvisos = 50;
    else if (plan === 'admin') maxAvisos = 999999;

    if (totalPropiedades >= maxAvisos) {
      return NextResponse.json({ 
        error: `Límite de avisos alcanzado. Tu plan (${plan.toUpperCase()}) te permite un máximo de ${maxAvisos} avisos. Por favor, sube tu plan en el Dashboard para continuar publicando.`
      }, { status: 403 });
    }

    // 5. Generar slug único
    let baseSlug = slugify(titulo);
    if (!baseSlug) baseSlug = 'propiedad';
    let finalSlug = baseSlug;
    
    // Validar si existe el slug y generar uno secuencial si es necesario
    let slugExists = await db.prepare(`SELECT id FROM propiedades WHERE slug = ?`).bind(finalSlug).first();
    let counter = 1;
    while (slugExists) {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      finalSlug = `${baseSlug}-${randomSuffix}`;
      slugExists = await db.prepare(`SELECT id FROM propiedades WHERE slug = ?`).bind(finalSlug).first();
      counter++;
      if (counter > 10) break; // Evitar bucle infinito
    }

    // 6. Configurar prioridad inicial score
    let prioridadScore = 0;
    if (plan === 'plan_10k' || plan === 'plan_20k') {
      prioridadScore = 1;
    } else if (plan === 'plan_50k' || plan === 'admin') {
      prioridadScore = 2;
    }

    // 7. Formatear documentos como JSON String
    const documentosJson = documentos ? JSON.stringify(documentos) : '[]';

    // 8. Insertar propiedad
    const propiedadId = crypto.randomUUID();
    
    await db.prepare(
      `INSERT INTO propiedades (
        id, usuario_id, tipo_operacion, tipo_propiedad, titulo, slug, descripcion, 
        precio_pesos, precio_uf, region, comuna, habitaciones, banos, superficie_total, 
        prioridad_score, contacto_nombre, contacto_telefono, contacto_email, observaciones, documentos
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      propiedadId,
      user.id,
      tipo_operacion, // 'venta', 'compra', 'arriendo'
      tipo_propiedad, // 'terreno', 'casa', 'local'
      titulo,
      finalSlug,
      descripcion,
      precio_pesos ? parseInt(precio_pesos) : null,
      precio_uf ? parseFloat(precio_uf) : null,
      region,
      comuna,
      habitaciones ? parseInt(habitaciones) : 0,
      banos ? parseInt(banos) : 0,
      superficie_total ? parseInt(superficie_total) : 0,
      prioridadScore,
      contacto_nombre || null,
      contacto_telefono || null,
      contacto_email || null,
      observaciones || null,
      documentosJson
    ).run();

    console.log(`Propiedad creada exitosamente con ID: ${propiedadId}`);
    return NextResponse.json({ success: true, propiedadId, slug: finalSlug });
  } catch (error: any) {
    console.error('Error al crear propiedad:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
