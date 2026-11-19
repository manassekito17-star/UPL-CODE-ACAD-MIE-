import "@zynora/design-system/tokens.css";
import "./globals.css";

import type { Metadata, Viewport } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: { default: "ZYNORA Office — suite bureautique", template: "%s — ZYNORA Office" },
  description: "ZYNORA Office : tableur hors connexion pour Windows, macOS, Linux et Android. Formules en français, XLSX et CSV, sauvegarde automatique.",
  icons: { icon: `${base}/zynora.svg`, apple: `${base}/icon.png` },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0e17" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <a className="skip" href="#contenu">
          Aller au contenu
        </a>
        <header className="site-header">
          <Link href="/" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${base}/zynora.svg`} alt="" width={32} height={32} />
            <span>
              ZYNORA <small>Office</small>
            </span>
          </Link>
          <nav aria-label="Navigation principale">
            <Link href="/">Accueil</Link>
            <Link href="/telecharger/" className="button button--primary">
              Télécharger
            </Link>
          </nav>
        </header>
        <main id="contenu">{children}</main>
        <footer className="site-footer">
          <p>© 2026 ZYNORA Office — version d&apos;aperçu.</p>
          <p>
            <a href="https://github.com/manassekito17-star/UPL-CODE-ACAD-MIE-/tree/main/zynora-office" rel="noopener">
              Code source et documentation
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
