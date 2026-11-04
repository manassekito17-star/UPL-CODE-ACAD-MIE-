import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

// L'interface dépend de la session (en-tête, accès) : rendu à chaque requête.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "UPL Code Academy", template: "%s · UPL Code Academy" },
  description:
    "Plateforme universitaire d'apprentissage de l'algorithmique et de la programmation (pseudocode, Python, C, JavaScript, Java) assistée par un professeur IA.",
  applicationName: "UPL Code Academy",
};

export const viewport: Viewport = {
  themeColor: "#0a1a3a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
          Aller au contenu
        </a>
        <SiteHeader />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
