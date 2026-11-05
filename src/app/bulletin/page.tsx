import type { Metadata } from "next";
import Link from "next/link";
import { Badge, ButtonLink, Card, Container, EmptyState, Notice, PageHeader } from "@/components/ui";
import { LEVEL_NAMES } from "@/content/types";
import { requireUser } from "@/lib/auth";
import { getBulletin } from "@/lib/levels/bulletin";
import { INTERNAL_NOTICE_SHORT } from "@/lib/levels/notice";
import { LEVEL_STATUS_LABELS } from "@/lib/levels/rules";

export const metadata: Metadata = { title: "Bulletin de progression" };

export default async function BulletinPage() {
  const user = await requireUser("/bulletin");
  const data = await getBulletin(user);
  return (
    <Container className="space-y-8 py-10">
      <PageHeader title="Bulletin de progression" subtitle="Niveaux, chapitres validés, résultats d'évaluation, points à revoir et certificats internes, par parcours." />
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/bulletin/pdf" variant="secondaire">Télécharger le bulletin (PDF)</ButtonLink>
      </div>
      {!data.length && (
        <EmptyState title="Aucun parcours commencé">
          <p>Ouvrez un chapitre ou passez un test de positionnement pour démarrer.</p>
          <ButtonLink href="/formations" className="mt-3">Voir les formations</ButtonLink>
        </EmptyState>
      )}
      {data.map((b) => (
        <Card key={b.course.slug} className="space-y-4 p-5" data-testid={`bulletin-${b.course.slug}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold text-nuit-900">
              <Link href={`/formations/${b.course.slug}`} className="hover:underline">{b.course.title}</Link>
            </h2>
            <Badge tone="bleu">Niveau actuel : {b.current} — {LEVEL_NAMES[b.current]}</Badge>
          </div>
          {b.placement && <p className="text-sm text-gris-700">Positionnement du {new Date(b.placement.at).toLocaleDateString("fr-FR")} : niveau {b.placement.recommended} recommandé.</p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="text-xs uppercase text-gris-500">
                <tr><th className="py-1">Niveau</th><th>Statut</th><th>Chapitres validés</th><th>Examen</th></tr>
              </thead>
              <tbody>
                {b.levels.map((lv) => (
                  <tr key={lv.number} className="border-t border-gris-100">
                    <td className="py-2"><Link href={`/formations/${b.course.slug}/niveaux/${lv.number}`} className="text-electrique-600 hover:underline">{lv.number} — {LEVEL_NAMES[lv.number]}</Link></td>
                    <td>{LEVEL_STATUS_LABELS[lv.status]}</td>
                    <td>{lv.lessons.length ? `${lv.validatedCount}/${lv.lessons.length}` : "—"}</td>
                    <td>{lv.examBest !== null ? `${lv.examBest} %` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {b.toReview.length > 0 && (
            <Notice tone="alerte" title="Chapitres à revoir">
              <ul className="list-disc pl-5">
                {b.toReview.map((r) => (
                  <li key={r.slug}><Link href={`/formations/${b.course.slug}/${r.slug}`} className="underline">{r.title}</Link> : {r.reason}</li>
                ))}
              </ul>
            </Notice>
          )}
          {b.certificates.length > 0 && (
            <div>
              <h3 className="font-semibold text-nuit-900">Certificats internes</h3>
              <ul className="mt-1 space-y-1 text-sm">
                {b.certificates.map((c) => (
                  <li key={c.code}>
                    {c.level ? `Niveau ${c.level} — ${LEVEL_NAMES[c.level]}` : "Parcours complet"} · {new Date(c.issuedAt).toLocaleDateString("fr-FR")}
                    {c.score !== null && ` · ${c.score} %`} ·{" "}
                    <Link href={`/certificats/${c.code}`} className="text-electrique-600 hover:underline">vérifier</Link> ·{" "}
                    <a href={`/certificats/${c.code}/pdf`} className="text-electrique-600 hover:underline">PDF</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}
      <p className="text-xs text-gris-500">{INTERNAL_NOTICE_SHORT}</p>
    </Container>
  );
}
