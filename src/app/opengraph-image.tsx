import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

/** Image d'aperçu des liens partagés (WhatsApp, Facebook, Telegram, Gmail…). */
export const alt = `${BRAND.name} — plateforme d'apprentissage de la programmation`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px", background: "linear-gradient(135deg, #050d1f 0%, #0a1a3a 60%, #123a8a 100%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div style={{ width: "110px", height: "110px", borderRadius: "24px", background: "linear-gradient(135deg, #1d5fe0, #22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "52px", fontWeight: 700 }}>{"</>"}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "72px", fontWeight: 800, letterSpacing: "2px" }}>UPL CODE ACADEMY</div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "34px", color: "#22d3ee", letterSpacing: "8px" }}>
              <span>{BRAND.slogan}</span>
              <span style={{ border: "3px solid #22d3ee", borderRadius: "10px", padding: "2px 14px", color: "white", letterSpacing: "4px" }}>MK</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "56px", fontSize: "36px", color: "#cbd5e1", lineHeight: 1.4 }}>
          Algorithmique, HTML, CSS, Python, C, JavaScript et Java — cours en quatre niveaux, éditeur de code, exercices corrigés et professeur IA.
        </div>
      </div>
    ),
    size,
  );
}
