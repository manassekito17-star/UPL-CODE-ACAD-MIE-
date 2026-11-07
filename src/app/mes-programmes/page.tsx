import type { Metadata } from "next";
import Link from "next/link";
import { DeleteProgramButton } from "@/components/editor/delete-program-button";
import { ButtonLink, Container, EmptyState, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/components/ui/labels";
import { requireUser } from "@/lib/auth";
import { isLanguageId, LANGUAGES } from "@/lib/execution/languages";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mes programmes" };

export default async function ProgramsPage() {
  await requireUser("/mes-programmes");
  const supabase = await createClient();
  const [{ data: programs }, { data: runs }] = await Promise.all([
    supabase.from("programs").select("id, title, language_id, updated_at").order("updated_at", { ascending: false }),
    supabase.from("execution_results").select("id, language_id, status, created_at, time_ms, source_excerpt").is("submission_id", null).order("created_at", { ascending: false }).limit(20),
  ]);
  return (
    <>
      <PageHeader title="Mes programmes" subtitle="Vos programmes enregistrés et l'historique de vos dernières exécutions.">
        <ButtonLink href="/editeur">Nouveau programme</ButtonLink>
      </PageHeader>
      <Container className="grid gap-8 py-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-bold text-nuit-900">Programmes enregistrés</h2>
          {!programs?.length ? (
            <EmptyState title="Aucun programme enregistré">Écrivez un programme dans l&apos;éditeur puis cliquez sur « Enregistrer ».</EmptyState>
          ) : (
            <ul className="divide-y divide-gris-100 rounded-xl border border-gris-200 bg-white">
              {programs.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <Link href={`/editeur?programme=${p.id}`} className="min-w-0 flex-1">
                    <p className="truncate font-medium text-nuit-900 hover:text-electrique-600">{p.title}</p>
                    <p className="text-xs text-gris-500">
                      {isLanguageId(p.language_id) ? LANGUAGES[p.language_id].shortLabel : p.language_id} · modifié le {formatDateTime(p.updated_at)}
                    </p>
                  </Link>
                  <DeleteProgramButton id={p.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="mb-3 font-bold text-nuit-900">Historique des exécutions (serveur)</h2>
          {!runs?.length ? (
            <EmptyState title="Aucune exécution enregistrée" />
          ) : (
            <ul className="space-y-2">
              {runs.map((r) => (
                <li key={r.id} className="rounded-lg border border-gris-200 bg-white px-4 py-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className={r.status === "ok" ? "text-succes" : "text-erreur"}>● {r.status}</span>
                    <span className="text-xs text-gris-500">{formatDateTime(r.created_at)}</span>
                  </div>
                  <pre className="mt-1 truncate font-mono text-xs text-gris-700">{(r.source_excerpt ?? "").split("\n")[0]}</pre>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Container>
    </>
  );
}
