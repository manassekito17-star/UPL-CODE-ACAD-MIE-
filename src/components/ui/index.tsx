import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Variant = "primaire" | "secondaire" | "fantome" | "danger" | "clair" | "sombre";
const VARIANTS: Record<Variant, string> = {
  primaire: "bg-electrique-600 text-white hover:bg-electrique-500 shadow-sm",
  secondaire: "bg-white text-nuit-900 border border-gris-200 hover:border-electrique-400 hover:text-electrique-600",
  fantome: "text-nuit-800 hover:bg-gris-100",
  danger: "bg-erreur text-white hover:bg-red-700",
  clair: "bg-white text-nuit-900 hover:bg-cyan-soft",
  sombre: "text-gray-200 hover:bg-white/10 hover:text-white",
};
const SIZES = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base" };

export function buttonClass(variant: Variant = "primaire", size: keyof typeof SIZES = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    extra,
  );
}

export function Button({ variant = "primaire", size = "md", className, ...props }: ComponentProps<"button"> & { variant?: Variant; size?: keyof typeof SIZES }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant = "primaire", size = "md", className, ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: keyof typeof SIZES }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-[var(--radius-carte)] border border-gris-200 bg-white shadow-[0_1px_2px_rgba(10,26,58,0.04)]", className)} {...props} />;
}

const BADGES = {
  bleu: "bg-electrique-100 text-electrique-600",
  cyan: "bg-cyan-soft text-cyan-800",
  vert: "bg-green-100 text-green-800",
  orange: "bg-amber-100 text-amber-800",
  rouge: "bg-red-100 text-red-800",
  gris: "bg-gris-100 text-gris-700",
  nuit: "bg-nuit-900 text-white",
};
export function Badge({ tone = "gris", className, children }: { tone?: keyof typeof BADGES; className?: string; children: ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", BADGES[tone], className)}>{children}</span>;
}

export function ProgressBar({ value, className, label }: { value: number; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      <div className="h-2 overflow-hidden rounded-full bg-gris-100" role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progression"}>
        <div className="h-full rounded-full bg-gradient-to-r from-electrique-600 to-cyan-accent transition-[width]" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...props} />;
}

export function PageHeader({ title, subtitle, children, eyebrow }: { title: string; subtitle?: string; eyebrow?: string; children?: ReactNode }) {
  return (
    <div className="border-b border-gris-200 bg-white">
      <Container className="py-8 sm:py-10">
        {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-electrique-600">{eyebrow}</p>}
        <h1 className="text-2xl font-bold text-nuit-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-3xl text-gris-700">{subtitle}</p>}
        {children && <div className="mt-5">{children}</div>}
      </Container>
    </div>
  );
}

export function Notice({ tone = "info", title, children }: { tone?: "info" | "alerte" | "erreur" | "succes"; title?: string; children: ReactNode }) {
  const tones = {
    info: "border-electrique-400/40 bg-electrique-100/60 text-nuit-800",
    alerte: "border-amber-300 bg-amber-50 text-amber-900",
    erreur: "border-red-300 bg-red-50 text-red-900",
    succes: "border-green-300 bg-green-50 text-green-900",
  };
  return (
    <div className={cn("rounded-lg border px-4 py-3 text-sm", tones[tone])} role={tone === "erreur" ? "alert" : "status"}>
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div>{children}</div>
    </div>
  );
}

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-nuit-900">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gris-500">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "block w-full rounded-lg border border-gris-200 bg-white px-3 py-2 text-sm text-nuit-900 placeholder:text-gris-500 focus:border-electrique-500 focus:outline-none focus:ring-2 focus:ring-electrique-100";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-carte)] border border-dashed border-gris-200 bg-white px-6 py-10 text-center">
      <p className="font-semibold text-nuit-900">{title}</p>
      {children && <div className="mt-2 text-sm text-gris-500">{children}</div>}
    </div>
  );
}
