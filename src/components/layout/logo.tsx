import Link from "next/link";
import { ZitechSymbol, ZitechWordmark } from "@/components/brand/zitech-mark";
import { BRAND } from "@/lib/brand";

/** Logo horizontal ZiTECH (symbole + nom), version claire sur fond sombre ou sombre sur fond clair. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${BRAND.name} — accueil`}>
      <ZitechSymbol size={34} />
      <span className="leading-none">
        <ZitechWordmark height={15} color={light ? "#FFFFFF" : "#020817"} />
        <span className={`mt-1 block text-[8.5px] font-semibold uppercase tracking-[0.28em] ${light ? "text-cyan-accent" : "text-electrique-600"}`}>{BRAND.slogan}</span>
      </span>
    </Link>
  );
}
