import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { SYMBOL_PATH, SYMBOL_TRANSFORM, WORDMARK_H, WORDMARK_PATH, WORDMARK_W } from "@/lib/brand-paths";

/** Image d'aperçu des liens partagés (WhatsApp, Facebook, Telegram, Gmail…) : logo ZENTECH officiel. */
export const alt = `${BRAND.name} — ${BRAND.slogan}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const wordH = 74;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#020817", color: "white", fontFamily: "sans-serif" }}>
        <svg width="190" height="190" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="z" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#1677FF" />
              <stop offset="1" stopColor="#00D9D0" />
            </linearGradient>
          </defs>
          <path fill="url(#z)" fillRule="evenodd" transform={SYMBOL_TRANSFORM} d={SYMBOL_PATH} />
        </svg>
        <svg style={{ marginTop: "44px" }} height={wordH} width={(wordH * WORDMARK_W) / WORDMARK_H} viewBox={`0 0 ${WORDMARK_W} ${WORDMARK_H}`}>
          <path fill="#FFFFFF" d={WORDMARK_PATH} />
        </svg>
        <div style={{ marginTop: "26px", fontSize: "30px", letterSpacing: "12px", color: "#00D9D0" }}>{BRAND.slogan}</div>
        <div style={{ marginTop: "34px", fontSize: "28px", color: "#AAB4C3" }}>Programmation · Développement logiciel · Intelligence artificielle</div>
      </div>
    ),
    size,
  );
}
