import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${BRAND.name} — accueil`}>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-electrique-600 to-cyan-accent font-mono text-sm font-bold text-white shadow-sm">
        {"</>"}
      </span>
      <span className={`leading-tight ${light ? "text-white" : "text-nuit-900"}`}>
        <span className="block text-sm font-extrabold tracking-wide">UPL CODE</span>
        <span className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${light ? "text-cyan-accent" : "text-electrique-600"}`}>
          Academy
          <span
            className={`rounded border px-1 py-px text-[9px] font-bold leading-none tracking-[0.12em] ${light ? "border-cyan-accent/60 text-white" : "border-electrique-600/50 text-nuit-900"}`}
          >
            MK
          </span>
        </span>
      </span>
    </Link>
  );
}
