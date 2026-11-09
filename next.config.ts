import type { NextConfig } from "next";

/**
 * Politique de sécurité du contenu (CSP), adaptée aux fonctionnalités réelles :
 * - Next.js utilise des scripts en ligne ('unsafe-inline') ;
 * - les moteurs d'exécution (JavaScript des étudiants, Pyodide/WebAssembly) ont besoin d'eval et de wasm ;
 * - l'éditeur Monaco et Python (Pyodide) viennent de cdn.jsdelivr.net, avec des workers « blob: » ;
 * - les données passent par Supabase ; la connexion Google se fait par navigation (non bloquée) ;
 * - l'aperçu web est un cadre srcdoc isolé (sandbox), avec sa propre politique sans réseau ;
 * - vercel.live : barre d'outils des déploiements de prévisualisation uniquement.
 * Les plugins (object), les changements de base et l'intégration du site par un autre site sont interdits.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://cdn.jsdelivr.net https://vercel.live",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "connect-src 'self' blob: data: https://*.supabase.co wss://*.supabase.co https://cdn.jsdelivr.net https://vercel.live",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "frame-src 'self' blob: data: https://vercel.live",
  "frame-ancestors 'self'",
  "form-action 'self' https://*.supabase.co https://accounts.google.com",
  "base-uri 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Même origine seulement : la préparation hors ligne charge l'éditeur et le laboratoire dans un cadre invisible.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // N'annonce pas la technologie utilisée (en-tête X-Powered-By).
  poweredByHeader: false,
  // Pas de cartes de sources (source maps) publiques en production.
  productionBrowserSourceMaps: false,
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
