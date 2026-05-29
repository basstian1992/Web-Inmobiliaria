import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = (process.env as any).DB;
  return NextResponse.json({
    status: 'ok',
    runtime: process.env.NEXT_RUNTIME || 'unknown',
    hasClerkKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
    hasDB: !!db,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
}
