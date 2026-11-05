import { expect, test } from "@playwright/test";
import { setEditorCode } from "./helpers";

test("un exercice réussi est noté 100/100 avec la correction pédagogique", async ({ page }) => {
  await page.goto("/exercices/algo-pair-impair");
  await setEditorCode(page, 'VARIABLES n : ENTIER\nDEBUT\n  LIRE(n)\n  SI n MOD 2 = 0 ALORS\n    ECRIRE("pair")\n  SINON\n    ECRIRE("impair")\n  FINSI\nFIN');
  await page.getByRole("button", { name: "✓ Soumettre" }).click();
  await expect(page.getByText("Bravo, exercice réussi !")).toBeVisible();
  await expect(page.getByText("Correction pédagogique")).toBeVisible();
});

test("les tests cachés et la solution ne sont jamais envoyés au navigateur", async ({ page, request }) => {
  await page.goto("/exercices/algo-mention");
  const html = await page.content();
  expect(html).not.toContain("Note invalide\\n"); // sortie d'un test caché
  const r = await request.post("/api/exercises/algo-mention/submit", { data: { files: [{ name: "a.algo", content: 'ECRIRE("x")' }] } });
  const body = await r.json();
  for (const t of body.tests.filter((x: { hidden: boolean }) => x.hidden)) {
    expect(t.input).toBeUndefined();
    expect(t.expected).toBeUndefined();
  }
  expect(body.solution).toBeNull();
});
