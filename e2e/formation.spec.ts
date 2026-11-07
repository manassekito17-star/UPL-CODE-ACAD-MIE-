import { expect, test, type Page } from "@playwright/test";
import { staticCourses } from "../src/content";
import { isDemoMode } from "./helpers";

/**
 * Parcours réel d'un étudiant dans la Formation. Nécessite un Supabase
 * configuré (local ou distant) : ignoré en mode démonstration.
 */
const algo = staticCourses.find((c) => c.slug === "algorithmique")!;
const chapter = (slug: string) => algo.modules.flatMap((m) => m.lessons).find((l) => l.slug === slug)!;


async function answerEvaluation(page: Page, slug: string, correct: boolean) {
  const evaluation = chapter(slug).pedagogy!.evaluation!;
  const section = page.locator("section#evaluation");
  for (const q of evaluation.questions) {
    const pick = correct ? q.correct : [q.choices.findIndex((_, i) => !q.correct.includes(i))];
    const item = section.locator("li").filter({ hasText: q.prompt }).first();
    for (const k of pick) await item.getByRole("button", { name: q.choices[k], exact: true }).click();
  }
  await section.getByRole("button", { name: "Valider mes réponses" }).click();
}

test.describe.configure({ mode: "serial" });

test("un étudiant valide un chapitre en réussissant son évaluation", async ({ page }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  const email = `etudiant.${Date.now()}@exemple.cd`;

  await page.goto("/inscription");
  await page.getByLabel("Nom complet").fill("Amani Test");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill("Algorithme2026");
  await page.getByLabel("Confirmer le mot de passe").fill("Algorithme2026");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/tableau-de-bord/);

  // Chapitre complet : composantes, organigramme et trace réels
  await page.goto("/formations/algorithmique/introduction-algorithmique");
  for (const id of ["cours", "definitions", "algorithmes", "erreurs", "corriges", "td", "interrogation", "evaluation", "resume"]) {
    await expect(page.locator(`section#${id}`)).toBeVisible();
  }
  await expect(page.getByText("Réussissez l'évaluation finale pour valider ce chapitre.")).toBeVisible();
  await page.getByRole("tab", { name: "Organigramme" }).first().click();
  await expect(page.locator("section#algorithmes svg").first()).toBeVisible();
  await page.getByRole("tab", { name: "Tableau de suivi" }).first().click();
  await expect(page.locator("section#algorithmes table")).toContainText("moyenne");
  await expect(page.locator("section#erreurs")).toContainText("Message de l'interpréteur");

  // La validation par simple clic est refusée par le serveur
  const click = await page.request.post("/api/progress", { data: { courseSlug: "algorithmique", lessonSlug: "introduction-algorithmique", action: "terminer", secondsSpent: 5 } });
  expect(click.ok()).toBe(false);
  expect((await click.json()).error).toContain("évaluation");

  // Réussite de l'évaluation → chapitre validé
  await answerEvaluation(page, "introduction-algorithmique", true);
  await expect(page.locator("section#evaluation")).toContainText("Chapitre validé ✓");
  await page.reload();
  await expect(page.getByText("✓ Chapitre validé.")).toBeVisible();

  // Échec de l'évaluation du chapitre 2 → difficulté signalée
  await page.goto("/formations/algorithmique/logique-raisonnement");
  await answerEvaluation(page, "logique-raisonnement", false);
  await expect(page.locator("section#evaluation")).toContainText("il faut 70 %");

  // Tableau de progression de la Formation
  await page.goto("/formation");
  const row1 = page.locator("li").filter({ hasText: "Introduction à l'algorithmique" });
  await expect(row1.getByText("Validé", { exact: true })).toBeVisible();
  await expect(row1).toContainText("évaluation 100 %");
  await expect(page.getByText("✅ Distinguer problème, algorithme et programme")).toBeVisible();
  await expect(page.getByText(/Logique mathématique et raisonnement : évaluation non réussie/)).toBeVisible();
  const total = algo.modules.flatMap((m) => m.lessons).filter((l) => l.status === "publie").length;
  await expect(page.getByText(`1 chapitre(s) validé(s) sur ${total}`, { exact: true })).toBeVisible();

  // Badge fondé sur une activité vérifiée
  await page.goto("/tableau-de-bord");
  await expect(page.getByText("Premier chapitre validé")).toBeVisible();
});

test("le résumé de chapitre se télécharge en PDF", async ({ request }) => {
  const r = await request.get("/formations/algorithmique/operateurs/resume");
  expect(r.status()).toBe(200);
  expect(r.headers()["content-type"]).toBe("application/pdf");
  expect(r.headers()["content-disposition"]).toContain("resume-operateurs.pdf");
  const body = await r.body();
  expect(body.subarray(0, 5).toString()).toBe("%PDF-");
});

test("la rubrique Formation présente le programme et l'état des chapitres", async ({ page }) => {
  await page.goto("/formation");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Algorithmique et pseudocode");
  await expect(page.getByText("Chapitre complet")).toHaveCount(7);
  await expect(page.getByText(/Enrichissement en cours/).first()).toBeVisible();
});
