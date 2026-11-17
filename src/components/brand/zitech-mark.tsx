import { useId } from "react";
import { SYMBOL_PATH, SYMBOL_TRANSFORM, WORDMARK_H, WORDMARK_PATH, WORDMARK_W } from "@/lib/brand-paths";

/**
 * Logo ZiTECH : symbole « Z » à circuit (dégradé bleu électrique → turquoise),
 * vectorisé d'après le logo officiel. `tone` : couleur du symbole (dégradé, blanc, sombre).
 */
export function ZitechSymbol({ size = 36, tone = "degrade", className, title }: { size?: number; tone?: "degrade" | "blanc" | "sombre"; className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  const fill = tone === "blanc" ? "#FFFFFF" : tone === "sombre" ? "#020817" : `url(#${id})`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {tone === "degrade" && (
        <defs>
          <linearGradient id={id} x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1677FF" />
            <stop offset="1" stopColor="#00D9D0" />
          </linearGradient>
        </defs>
      )}
      <path fill={fill} fillRule="evenodd" transform={SYMBOL_TRANSFORM} d={SYMBOL_PATH} />
    </svg>
  );
}

/** Mot « ZiTECH » (lettres géométriques espacées), à la hauteur donnée. */
export function ZitechWordmark({ height = 14, color = "currentColor", className }: { height?: number; color?: string; className?: string }) {
  return (
    <svg height={height} width={(height * WORDMARK_W) / WORDMARK_H} viewBox={`0 0 ${WORDMARK_W} ${WORDMARK_H}`} className={className} aria-hidden>
      <path fill={color} d={WORDMARK_PATH} />
    </svg>
  );
}
