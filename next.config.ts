import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Polices embarquées dans les résumés PDF (lues à l'exécution).
  outputFileTracingIncludes: {
    "/formations/[course]/[lesson]/resume": ["./assets/fonts/**"],
    "/bulletin/pdf": ["./assets/fonts/**"],
    "/certificats/[code]/pdf": ["./assets/fonts/**"],
  },
  // Ressources pédagogiques (jusqu'à 20 Mo) envoyées par les enseignants via une action serveur.
  experimental: {
    serverActions: { bodySizeLimit: "21mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Service worker (utilisation sans Internet) : toujours la dernière version.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }, { key: "Service-Worker-Allowed", value: "/" }] },
    ];
  },
};

export default nextConfig;
