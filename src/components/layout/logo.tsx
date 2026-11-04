import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="UPL Code Academy — accueil">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-electrique-600 to-cyan-accent font-mono text-sm font-bold text-white shadow-sm">
        {"</>"}
      </span>
      <span className={`leading-tight ${light ? "text-white" : "text-nuit-900"}`}>
        <span className="block text-sm font-extrabold tracking-wide">UPL CODE</span>
        <span className={`block text-[11px] font-semibold uppercase tracking-[0.2em] ${light ? "text-cyan-accent" : "text-electrique-600"}`}>Academy</span>
      </span>
    </Link>
  );
}
