import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  let hasClerkKey = false;
  let hasClerkSecret = false;
  let hasDB = false;
  let nodeVersion = 'unknown';
  let runtime = 'unknown';

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
      if (!(process.env as any).DB && (globalThis as any).DB) {
        (process.env as any).DB = (globalThis as any).DB;
      }
    }

    hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !!(globalThis as any).NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    hasClerkSecret = !!process.env.CLERK_SECRET_KEY || !!(globalThis as any).CLERK_SECRET_KEY;
    hasDB = !!(process.env as any).DB || !!(globalThis as any).DB;
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
    nodeVersion,
    timestamp: new Date().toISOString(),
  });
}
