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
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder',
  secretKey: process.env.CLERK_SECRET_KEY || 'sk_test_placeholder',
});

export const config = {
  matcher: [
    // Omitir internos de Next.js y archivos estáticos (imágenes, css, js, etc.)
    '/((?!_next|[^?]*\\.[^?]*$).*)',
    // Asegurar que se ejecute siempre para las rutas de API
    '/(api|trpc)(.*)',
  ],
};
