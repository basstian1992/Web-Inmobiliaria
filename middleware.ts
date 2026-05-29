// 1. Copiar variables de entorno globales de Cloudflare al process.env de Node
// ANTES de importar cualquier cosa de Clerk para evitar crashes por variables no inicializadas.
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

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Protegemos únicamente las rutas de administración como /dashboard
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Excluir ruta de diagnóstico de la autenticación para debuggear
  if (req.nextUrl.pathname === '/api/health') {
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
}, {
  // Solo le pasamos publishableKey de forma explícita para evitar crashes de compilación
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  // NO pasamos secretKey aquí para evitar que Clerk pida CLERK_ENCRYPTION_KEY.
  // Clerk la leerá automáticamente de process.env.CLERK_SECRET_KEY en tiempo de petición.
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.[^?]*$).*)',
    '/(api|trpc)(.*)',
  ],
};
