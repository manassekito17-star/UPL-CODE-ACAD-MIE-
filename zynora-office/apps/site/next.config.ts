import type { NextConfig } from "next";

// Site statique (export HTML) : hébergeable sur GitHub Pages, Vercel ou tout serveur de fichiers.
// Sur GitHub Pages, le site vit sous /<dépôt> : la CI fournit ZYNORA_BASE_PATH.
const basePath = process.env.ZYNORA_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
