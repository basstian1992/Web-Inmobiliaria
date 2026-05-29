import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Requerido por @opennextjs/cloudflare para generar el output standalone
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
