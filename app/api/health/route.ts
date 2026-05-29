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
    hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    hasClerkSecret = !!process.env.CLERK_SECRET_KEY;
    hasDB = !!(process.env as any).DB;
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
