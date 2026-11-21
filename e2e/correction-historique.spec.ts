import { expect, test, type Page } from "@playwright/test";
import { expectConsole, run, setEditorCode } from "./helpers";

/** « Corriger le code » et historique des versions dans ZENTECH Algo, ZENTECH IDE et le laboratoire. */
type W = { monaco: { editor: { getModels(): Array<{ getValue(): string; setValue(v: string): void; uri: { toString(): string } }> } } };
const modelValue = (page: Page, i = 0) => page.evaluate((n) => (window as unknown as W).monaco.editor.getModels()[n].getValue(), i);

test("ZENTECH Algo : correction automatique puis retour à l'ancienne version", async ({ page }) => {
  await page.goto("/editeur?langage=pseudocode");
  const faux = 'VARIABLES x : ENTIER\nDEBUT\n  x ← 5\n  SI x > 1\n    ECRIR("grand")\n  FINSI\nFIN';
  await setEditorCode(page, faux);
  await run(page);
  await page.getByTestId("corriger-code").click();
  await expect(page.getByTestId("code-corrige")).toContainText("SI x > 1 ALORS");
  await expect(page.getByTestId("liste-corrections")).toContainText("ECRIR → ECRIRE");
  await page.getByTestId("appliquer-correction").click();
  // Les deux erreurs (ALORS oublié, ECRIR) sont corrigées en une fois.
  await expect.poll(() => modelValue(page)).toContain("SI x > 1 ALORS");
  expect(await modelValue(page)).toContain('ECRIRE("grand")');
  await run(page);
  await expectConsole(page, "grand");

  // Historique : la première version (avec les erreurs) peut être restaurée.
  await page.getByRole("button", { name: "Plus d'options" }).click();
  await page.getByRole("menuitem", { name: "Historique des versions" }).click();
  const dialog = page.getByTestId("historique-versions");
  await expect(dialog.getByTestId("version").first()).toBeVisible();
  expect(await dialog.getByTestId("version").count()).toBeGreaterThanOrEqual(2);
  await dialog.getByTestId("version").last().click();
  await expect(dialog.getByTestId("version-apercu")).toContainText("SI x > 1\n");
  await dialog.getByTestId("restaurer-version").click();
  await expect.poll(() => modelValue(page)).toBe(faux);
});

test("ZENTECH IDE : JavaScript corrigé automatiquement, historique du fichier", async ({ page }) => {
  await page.goto("/ide");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.getByRole("button", { name: "Fichier", exact: true }).click();
  await page.getByRole("menuitem", { name: "Nouveau fichier…" }).click();
  await page.getByLabel("Nom du fichier").fill("calcul.js");
  await page.getByLabel("Nom du fichier").press("Enter");
  await page.waitForFunction(() => (window as unknown as W).monaco.editor.getModels().some((m) => m.uri.toString().endsWith("/calcul.js")));
  await page.evaluate(() => (window as unknown as W).monaco.editor.getModels().find((m) => m.uri.toString().endsWith("/calcul.js"))!.setValue('const total = 6 * 7;\nconsol.lgo("Total :", total;\n'));
  await page.getByRole("tab", { name: "Console" }).click();
  await page.getByRole("button", { name: /^Exécuter JavaScript/ }).click();
  await page.getByTestId("corriger-code").click();
  await expect(page.getByTestId("code-corrige")).toContainText('console.log("Total :", total);');
  await page.getByTestId("appliquer-correction").click();
  await page.getByRole("button", { name: /^Exécuter JavaScript/ }).click();
  await expect(page.getByTestId("ide-console")).toContainText("Total : 42", { timeout: 30_000 });

  await page.getByRole("button", { name: "Fichier", exact: true }).click();
  await page.getByRole("menuitem", { name: "Historique du fichier (sur cet appareil)…" }).click();
  const dialog = page.getByTestId("historique-versions");
  expect(await dialog.getByTestId("version").count()).toBeGreaterThanOrEqual(2);
  await expect(dialog).toContainText("Correction automatique");
});

test("Laboratoire : correction automatique et historique", async ({ page }) => {
  await page.goto("/laboratoire");
  await setEditorCode(page, 'ALGORITHME T\nVARIABLES\n  i : ENTIER\nDEBUT\n  POUR i DE 1 A 2 FAIRE\n    ECRIRE(i)\nFIN');
  await page.getByRole("button", { name: "▶ Lancer l'exécution pas à pas" }).click();
  await page.getByTestId("corriger-code").click();
  await expect(page.getByTestId("code-corrige")).toContainText("FINPOUR");
  await page.getByTestId("appliquer-correction").click();
  await expect.poll(() => modelValue(page)).toContain("  FINPOUR");
  await page.getByRole("button", { name: "▶ Lancer l'exécution pas à pas" }).click();
  await expect(page.getByTestId("lab-etape")).toBeVisible();
  await page.getByTestId("ouvrir-historique").click();
  await expect(page.getByTestId("historique-versions")).toContainText("Correction automatique");
});
