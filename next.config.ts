import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Desactivado para restaurar las capacidades de servidor dinámico (APIs, Clerk, D1, R2)
  // 1. Decirle a Next que ignore los errores de TypeScript en el build
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. Decirle a Next que ignore las reglas estrictas de ESLint en el build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

// Forzando compilación limpia en la red de Cloudflare
