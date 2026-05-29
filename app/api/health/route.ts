import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  let hasClerkKey = false;
  let hasClerkSecret = false;
  let hasDB = false;
  let nodeVersion = 'unknown';
  let runtime = 'unknown';
  let envKeys: string[] = [];

  try {
    runtime = process.env.NEXT_RUNTIME || 'unknown';
    
    // Inyectar dinámicamente para pruebas
    if (typeof process !== 'undefined') {
      if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && (globalThis as any).NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = (globalThis as any).NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      }
      if (!process.env.CLERK_SECRET_KEY && (globalThis as any).CLERK_SECRET_KEY) {
        process.env.CLERK_SECRET_KEY = (globalThis as any).CLERK_SECRET_KEY;
      }

      // Sanitizar claves de Clerk eliminando el BOM invisible (\uFEFF) y espacios adicionales
      if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.replace(/^\uFEFF/, '').trim();
      }
      if (process.env.CLERK_SECRET_KEY) {
        process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY.replace(/^\uFEFF/, '').trim();
      }

      if ((globalThis as any).NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && typeof (globalThis as any).NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'string') {
        (globalThis as any).NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = (globalThis as any).NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.replace(/^\uFEFF/, '').trim();
      }
      if ((globalThis as any).CLERK_SECRET_KEY && typeof (globalThis as any).CLERK_SECRET_KEY === 'string') {
        (globalThis as any).CLERK_SECRET_KEY = (globalThis as any).CLERK_SECRET_KEY.replace(/^\uFEFF/, '').trim();
      }
    }

    hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !!(globalThis as any).NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    hasClerkSecret = !!process.env.CLERK_SECRET_KEY || !!(globalThis as any).CLERK_SECRET_KEY;
    
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const ctx = getCloudflareContext();
      if (ctx && ctx.env) {
        envKeys = Object.keys(ctx.env);
        hasDB = !!ctx.env.DB;
      }
    } catch (e: any) {
      console.error("Error al obtener contexto de Cloudflare:", e?.message || e);
      hasDB = !!(process.env as any).DB || !!(globalThis as any).DB || !!(process.env as any).propiedadesyparcelas_db;
    }
    nodeVersion = typeof process !== 'undefined' ? process.version : 'n/a';
  } catch (e) {
    // Evitar que falle en runtime
  }

  return NextResponse.json({
    status: 'ok',
    runtime,
    hasClerkKey,
    hasClerkSecret,
    hasDB,
    envKeys,
    nodeVersion,
    timestamp: new Date().toISOString(),
  });
}
