import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import { IMPORTANT_NOTICE } from "@/lib/announcement";

export const metadata: Metadata = {
  title: "Avis important",
  description: "UPL CODE ACADEMY MK est une initiative indépendante d'un média étudiant : ce n'est pas une plateforme officielle de l'Université Protestante de Lubumbashi.",
};

/** Statut de la plateforme : initiative indépendante, non officielle (page publique). */
export default function ImportantNoticePage() {
  return (
    <>
      <PageHeader eyebrow={IMPORTANT_NOTICE.eyebrow} title={IMPORTANT_NOTICE.title} />
      <Container className="max-w-3xl py-10">
        <div className="rounded-2xl border-l-4 border-[#f28c28] bg-white p-6 shadow-sm sm:p-8" data-testid="avis-important">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">⚠ Avis important</p>
          <div className="space-y-4 text-[16px] leading-relaxed text-gris-700">
            {IMPORTANT_NOTICE.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className="mt-6 border-t border-gris-200 pt-4 text-sm font-semibold text-nuit-900">L&apos;équipe UPL CODE ACADEMY MK</p>
        </div>
        <p className="mt-6 text-sm text-gris-500">
          Voir aussi la <Link href="/confidentialite" className="text-electrique-600 underline">politique de confidentialité</Link> et les{" "}
          <Link href="/conditions" className="text-electrique-600 underline">conditions d&apos;utilisation</Link>.
        </p>
      </Container>
    </>
  );
}
