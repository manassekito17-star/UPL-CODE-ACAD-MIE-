import type { Metadata } from "next";
import { AlgorithmLab, type LabPreset } from "@/components/lab/algorithm-lab";
import { Container, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getCourse } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Laboratoire d'algorithmique",
  description: "Exécution pas à pas des algorithmes en pseudocode : variables, pile d'appels, organigramme synchronisé et saisie interactive.",
};

const SAMPLE = `ALGORITHME Moyenne
VARIABLES
  n, i : ENTIER
  note, somme : REEL
DEBUT
  ECRIRE("Combien de notes ?")
  LIRE(n)
  somme ← 0
  POUR i DE 1 A n FAIRE
    LIRE(note)
    somme ← somme + note
  FINPOUR
  SI n > 0 ALORS
    ECRIRE("Moyenne : ", somme / n)
  SINON
    ECRIRE("Aucune note")
  FINSI
FIN`;

export default async function LabPage({ searchParams }: PageProps<"/laboratoire">) {
  const sp = await searchParams;
  const [course, user] = await Promise.all([getCourse("algorithmique"), getCurrentUser()]);
  const presets: LabPreset[] = [{ id: "exemple-moyenne", title: "Moyenne de n notes (LIRE interactif)", group: "Démarrage", code: SAMPLE, stdin: "" }];
  for (const m of course?.modules ?? []) {
    for (const l of m.lessons.filter((x) => x.status === "publie")) {
      (l.pedagogy?.commentedAlgorithms ?? []).forEach((a, i) => {
        if ((a.language ?? "pseudocode") !== "pseudocode") return;
        presets.push({ id: `algorithme:${l.slug}:${i}`, title: a.title, group: `${m.title} — ${l.title}`, code: a.code, stdin: a.stdin ?? "", back: `/formations/${course!.slug}/${l.slug}#algorithmes` });
      });
      l.examples.forEach((ex, i) => {
        if (ex.language !== "pseudocode") return;
        presets.push({ id: `exemple:${l.slug}:${i}`, title: `Exemple — ${ex.title}`, group: `${m.title} — ${l.title}`, code: ex.code, stdin: ex.stdin ?? "", back: `/formations/${course!.slug}/${l.slug}#exemples` });
      });
    }
  }
  // Ouverture depuis un chapitre : ?algorithme=<leçon>/<n> ou ?exemple=<leçon>/<n>
  let initial: LabPreset | undefined;
  for (const kind of ["algorithme", "exemple"] as const) {
    const v = sp[kind];
    if (typeof v === "string" && /^[a-z0-9-]{2,80}\/\d{1,2}$/.test(v)) {
      const [lesson, i] = v.split("/");
      initial = presets.find((p) => p.id === `${kind}:${lesson}:${i}`);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="UPL ACADEMY · Laboratoire"
        title="Laboratoire d'algorithmique"
        subtitle="Exécutez un algorithme instruction par instruction : avancez, reculez, mettez en pause, observez les variables, la pile d'appels, la sortie et l'organigramme synchronisé. Les conditions et les tours de boucle sont expliqués à chaque étape."
      />
      <Container className="py-6">
        <AlgorithmLab presets={presets} initial={initial} loggedIn={Boolean(user)} />
      </Container>
    </>
  );
}
