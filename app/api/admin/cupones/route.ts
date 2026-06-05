import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

const ADMIN_EMAILS = ['b.alarconatenas@gmail.com', 'basklian@gmail.com', 'b.alarcontenas@gmail.com'];

async function getDb() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    return getCloudflareContext().env.DB;
  } catch (e) {
    return (globalThis as any).DB || (process.env as any).DB;
  }
}

async function ensureTable(db: any) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS cupones (
      id TEXT PRIMARY KEY,
      codigo TEXT UNIQUE NOT NULL,
      descuento INTEGER NOT NULL DEFAULT 50,
      plan_tipo TEXT NOT NULL,
      usos_maximos INTEGER DEFAULT 1,
      usos_actuales INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_expiracion DATETIME,
      creado_por TEXT NOT NULL
    )`
  ).run();
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user || !user.emailAddresses.some(e => ADMIN_EMAILS.includes(e.emailAddress))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const db = await getDb();
    if (!db) return NextResponse.json({ error: 'DB no disponible' }, { status: 500 });
    await ensureTable(db);
    const { results } = await db.prepare(`SELECT * FROM cupones ORDER BY fecha_creacion DESC`).all();
    return NextResponse.json({ success: true, cupones: results || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user || !user.emailAddresses.some(e => ADMIN_EMAILS.includes(e.emailAddress))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const body = await request.json();
    const { codigo, descuento, plan_tipo, usos_maximos, fecha_expiracion } = body;
    if (!codigo || !plan_tipo || !descuento) {
      return NextResponse.json({ error: 'Faltan campos: codigo, descuento, plan_tipo' }, { status: 400 });
    }
    const db = await getDb();
    if (!db) return NextResponse.json({ error: 'DB no disponible' }, { status: 500 });
    await ensureTable(db);
    const existente = await db.prepare(`SELECT id FROM cupones WHERE codigo = ?`).bind(codigo).first();
    if (existente) {
      return NextResponse.json({ error: 'Ya existe un cupón con ese código' }, { status: 400 });
    }
    const id = crypto.randomUUID();
    await db.prepare(
      `INSERT INTO cupones (id, codigo, descuento, plan_tipo, usos_maximos, usos_actuales, activo, fecha_expiracion, creado_por)
       VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?)`
    ).bind(id, codigo.toUpperCase(), parseInt(descuento), plan_tipo, parseInt(usos_maximos) || 1, fecha_expiracion || null, user.id).run();
    return NextResponse.json({ success: true, id, codigo: codigo.toUpperCase() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user || !user.emailAddresses.some(e => ADMIN_EMAILS.includes(e.emailAddress))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta id del cupón' }, { status: 400 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: 'DB no disponible' }, { status: 500 });
    await ensureTable(db);
    await db.prepare(`DELETE FROM cupones WHERE id = ?`).bind(id).run();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
