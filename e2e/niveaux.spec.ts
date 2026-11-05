import { expect, test, type Locator, type Page } from "@playwright/test";
import { staticCourses } from "../src/content";
import type { LevelNumber, Quiz } from "../src/content/types";
import { isDemoMode, signUpStudent } from "./helpers";

/**
 * UPL ACADEMY multiniveaux : niveaux, positionnement, verrouillage des
 * examens, validation d'un niveau, certificat interne et bulletin.
 */
const course = (slug: string) => staticCourses.find((c) => c.slug === slug)!;

/** Répond à un quiz affiché dans `scope` : bonnes réponses pour les questions retenues. */
async function answer(scope: Locator, quiz: Quiz, right: (q: Quiz["questions"][number]) => boolean) {
  for (const q of quiz.questions) {
    const pick = right(q) ? q.correct : [q.choices.findIndex((_, i) => !q.correct.includes(i))];
    const item = scope.locator("li").filter({ hasText: q.prompt }).first();
    for (const k of pick) await item.getByRole("button", { name: q.choices[k], exact: true }).click();
  }
  await scope.getByRole("button", { name: "Valider mes réponses" }).click();
}

test("chaque parcours présente quatre niveaux, avec chapitres publiés ou au programme", async ({ page }) => {
  await page.goto("/formations/algorithmique");
  for (const n of [1, 2, 3, 4]) await expect(page.getByTestId(`niveau-${n}`)).toBeVisible();
  await expect(page.getByTestId("niveau-1")).toContainText("Très débutant");
  await expect(page.getByTestId("niveau-4")).toContainText("Au programme de ce niveau");

  await page.goto("/formations/html");
  await expect(page.getByTestId("niveau-1")).toContainText("Le web et le langage HTML");
  await expect(page.getByTestId("niveau-2")).toContainText("Au programme");
  await page.goto("/formations/css/niveaux/1");
  await expect(page.getByTestId("criteres-niveau")).toContainText("70 %");
});

test.describe.configure({ mode: "serial" });

test("le test de positionnement dispense les niveaux acquis et ouvre l'examen recommandé", async ({ page }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  await signUpStudent(page, "Positionnement Test");
  const algo = course("algorithmique");

  // Sans positionnement, l'examen du niveau 2 est verrouillé (contrôle serveur).
  const locked = await page.request.post("/api/quiz/algorithmique-examen-niveau-2/submit", { data: { answers: {} } });
  expect(locked.status()).toBe(403);

  await page.goto("/formations/algorithmique/positionnement");
  await answer(page.locator("main"), algo.placementTest!, (q) => q.level === 1 || q.level === 2);
  await expect(page.getByTestId("placement-result")).toContainText("Niveau 3");

  await page.goto("/formations/algorithmique");
  await expect(page.getByTestId("niveau-1")).toContainText("Dispensé");
  await expect(page.getByTestId("niveau-2")).toContainText("Dispensé");
  await expect(page.getByTestId("niveau-3")).toContainText("En cours");

  await page.goto("/formations/algorithmique/niveaux/3");
  await expect(page.locator("section#examen")).toContainText("Examen du niveau 3");
  await page.goto("/formations/algorithmique/niveaux/4");
  await expect(page.locator("section#examen")).toContainText("pas encore publié");
});

async function validateChapter(page: Page, courseSlug: string, lessonSlug: string) {
  const lesson = course(courseSlug).modules.flatMap((m) => m.lessons).find((l) => l.slug === lessonSlug)!;
  await page.goto(`/formations/${courseSlug}/${lessonSlug}`);
  const section = page.locator("section#evaluation");
  await answer(section, lesson.pedagogy!.evaluation!, () => true);
  await expect(section).toContainText("Chapitre validé ✓");
}

test("un étudiant valide le niveau 1 HTML et obtient un certificat interne vérifiable", async ({ page }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  await signUpStudent(page, "Niveau Valide");
  const html = course("html");
  const level1 = html.levels!.find((l) => l.number === (1 as LevelNumber))!;

  // Examen réussi d'abord : le niveau n'est pas validé tant que les chapitres ne le sont pas.
  await page.goto("/formations/html/niveaux/1");
  await answer(page.locator("section#examen"), level1.exam!, () => true);
  await expect(page.locator("section#examen")).toContainText("100 %");
  await expect(page.locator("section#examen")).not.toContainText("Niveau 1 validé");
  await page.reload();
  await expect(page.getByText("Ce qu'il reste à faire")).toBeVisible();

  const lessons = html.modules.filter((m) => m.level === 1).flatMap((m) => m.lessons);
  for (const l of lessons) await validateChapter(page, "html", l.slug);
  // La dernière validation de chapitre complète les critères : niveau validé côté serveur.
  await expect(page.locator("section#evaluation")).toContainText("Niveau 1 validé");

  await page.goto("/formations/html");
  await expect(page.getByTestId("niveau-1")).toContainText("Niveau validé");

  await page.goto("/bulletin");
  const card = page.getByTestId("bulletin-html");
  await expect(card).toContainText("Niveau validé");
  await expect(card).toContainText("Certificats internes");
  const verify = card.getByRole("link", { name: "vérifier" }).first();
  const href = await verify.getAttribute("href");
  expect(href).toMatch(/^\/certificats\/[a-f0-9]+$/);

  const pdf = await page.request.get(`${href}/pdf`);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
  const bulletin = await page.request.get("/bulletin/pdf");
  expect(bulletin.headers()["content-type"]).toContain("application/pdf");

  // Vérification publique, sans session
  await page.context().clearCookies();
  await page.goto(href!);
  await expect(page.getByTestId("certificat-verifie")).toContainText("Certificat authentique");
  await expect(page.getByTestId("certificat-verifie")).toContainText("Niveau Valide");
  await expect(page.getByText("ne constituent ni un diplôme")).toBeVisible();
  // Le PDF n'est pas accessible sans être le titulaire
  expect((await page.request.get(`${href}/pdf`)).status()).toBe(401);
  await page.goto("/certificats/deadbeefdeadbeef");
  await expect(page.getByText("Aucun certificat ne correspond")).toBeVisible();
});
