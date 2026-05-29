// DIAGNÓSTICO TEMPORAL: middleware pass-through sin Clerk
// para verificar si el Worker funciona correctamente sin autenticación
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.[^?]*$).*)',
    '/(api|trpc)(.*)',
  ],
};
