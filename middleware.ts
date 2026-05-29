import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protegemos únicamente las rutas de administración como /dashboard
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
}, {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const config = {
  matcher: [
    // Omitir internos de Next.js y archivos estáticos (imágenes, css, js, etc.)
    '/((?!_next|[^?]*\\.[^?]*$).*)',
    // Asegurar que se ejecute siempre para las rutas de API
    '/(api|trpc)(.*)',
  ],
};
