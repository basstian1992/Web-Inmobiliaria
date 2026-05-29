import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Requerido por @opennextjs/cloudflare para generar el output standalone en producción (Linux)
  // Se desactiva en Windows local para evitar el error EPERM de creación de symlinks
  output: process.platform === 'win32' ? undefined : 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
