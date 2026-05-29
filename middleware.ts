import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protegemos únicamente las rutas de administración como /dashboard
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Omitir internos de Next.js y archivos estáticos (imágenes, css, js, etc.)
    '/((?!_next|[^?]*\\.[^?]*$).*)',
    // Asegurar que se ejecute siempre para las rutas de API
    '/(api|trpc)(.*)',
  ],
};
