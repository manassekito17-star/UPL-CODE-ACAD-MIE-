import { expect, test } from "@playwright/test";
import { isDemoMode, signUpStudent } from "./helpers";

/**
 * Câblage du professeur IA spécialisé, avec le fournisseur de TEST
 * (AI_PROVIDER=test, aucune IA appelée) : le serveur construit lui-même le
 * contexte du parcours, du chapitre et du niveau mesuré de l'étudiant.
 */
test("le professeur IA d'un chapitre connaît le parcours, le chapitre et le niveau mesuré", async ({ page }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  await signUpStudent(page, "Tuteur Test");

  // Nouvel étudiant : niveau 1 en CSS, aucun niveau encore mesuré
  await page.goto("/formations/css/css-modele-boite");
  const tutor = page.locator("section#professeur");
  await tutor.getByRole("button", { name: "M'interroger" }).click();
  await tutor.locator("textarea").fill("Interroge-moi sur le modèle de boîte");
  await tutor.locator("textarea").press("Enter");
  await expect(tutor).toContainText("Professeur de test — aucune IA n'a été appelée");
  await expect(tutor).toContainText("Mode : Mode EXAMINATEUR");
  await expect(tutor).toContainText("Parcours : CSS");
  await expect(tutor).toContainText("Chapitre : « Le modèle de boîte »");
  await expect(tutor).toContainText("Niveau actuel : 1 — Très débutant");

  // Le contexte envoyé par le navigateur ne peut pas imposer un niveau : il est recalculé.
  const forged = await page.request.post("/api/ai/tutor", {
    data: { message: "test", mode: "question", level: "avance", context: { courseSlug: "css" } },
  });
  const text = await forged.text();
  expect(text).toContain("Niveau actuel : 1 — Très débutant");
  expect(text).toContain("Niveau de langage : avancé"); // préférence conservée tant qu'aucun niveau n'est mesuré

  await page.goto("/professeur-ia?parcours=python");
  await page.locator("textarea").fill("Bonjour");
  await page.locator("textarea").press("Enter");
  await expect(page.getByText("Parcours : Python")).toBeVisible();
});
