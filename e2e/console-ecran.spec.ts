import { devices, expect, test, type Browser } from "@playwright/test";

/**
 * Sur téléphone, chaque éditeur affiche la sortie dans un écran « ← Console » plein écran, terminé par
 * « -------------- [Fin de programme] » ; la flèche revient au code. Sur ordinateur, la même fin s'affiche
 * sous la sortie.
 */
type W = { monaco: { editor: { getModels(): Array<{ setValue(v: string): void; uri: { toString(): string } }> } } };

async function phone(browser: Browser) {
  const opts: Record<string, unknown> = { ...devices["iPhone 13"] };
  delete opts.defaultBrowserType;
  const context = await browser.newContext(opts);
  return { context, page: await context.newPage() };
}
const END = "--------------\n[Fin de programme]";

test("ZENTECH Algo sur téléphone : écran Console, saisie, fin de programme, retour au code", async ({ browser }) => {
  const { context, page } = await phone(browser);
  await page.goto("/editeur?langage=pseudocode");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.evaluate(() => (window as unknown as W).monaco.editor.getModels()[0].setValue('VARIABLES n : ENTIER\nDEBUT\n  LIRE(n)\n  ECRIRE("D I E U")\n  ECRIRE("n = ", n)\nFIN'));
  await page.getByRole("button", { name: "▶ Exécuter" }).first().tap();
  const ecran = page.getByTestId("ecran-console");
  await expect(ecran).toBeVisible();
  await expect(ecran.getByRole("heading", { name: "Console" })).toBeVisible();
  await ecran.getByLabel("Valeur de n").fill("7");
  await ecran.getByRole("button", { name: "OK" }).tap();
  await expect(ecran).toContainText("D I E U");
  await expect(ecran).toContainText("n = 7");
  await expect(ecran).toContainText(END);
  await page.getByTestId("console-retour").tap();
  await expect(ecran).toHaveCount(0);
  await expect(page.locator(".monaco-editor").first()).toBeVisible();
  await context.close();
});

test("ZENTECH IDE sur téléphone : écran Console avec fin de programme", async ({ browser }) => {
  const { context, page } = await phone(browser);
  await page.goto("/ide");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  // Fichier JavaScript du projet de départ, ouvert avec Ctrl+P.
  await page.keyboard.press("Control+p");
  await page.getByLabel("Rechercher un fichier").fill("script");
  await page.getByLabel("Rechercher un fichier").press("Enter");
  await page.waitForFunction(() => (window as unknown as W).monaco.editor.getModels().some((m) => m.uri.toString().endsWith("/js/script.js")));
  await page.evaluate(() => (window as unknown as W).monaco.editor.getModels().find((m) => m.uri.toString().endsWith("/js/script.js"))!.setValue('console.log("Bonjour", 6 * 7);'));
  await page.getByRole("button", { name: /^Exécuter JavaScript/ }).first().tap();
  const ecran = page.getByTestId("ecran-console");
  await expect(ecran).toContainText("Bonjour 42", { timeout: 30_000 });
  await expect(ecran).toContainText(END);
  await page.getByTestId("console-retour").tap();
  await expect(ecran).toHaveCount(0);
  await context.close();
});

test("ZENTECH Texte sur téléphone : écran Console avec fin de programme", async ({ browser }) => {
  const { context, page } = await phone(browser);
  await page.goto("/texte");
  await page.evaluate(() => localStorage.removeItem("zentech:texte:session"));
  await page.goto("/texte");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.getByRole("button", { name: "Fichiers" }).tap();
  await page.getByTestId("zt-arbre-algo/somme.algo").last().dblclick();
  await page.getByRole("button", { name: "Exécuter (Ctrl+B)" }).tap();
  const ecran = page.getByTestId("ecran-console");
  await expect(ecran).toContainText("Somme = 55", { timeout: 30_000 });
  await expect(ecran).toContainText(END);
  await context.close();
});

test("ZENTECH Algo sur ordinateur : la console du bas se termine aussi par « [Fin de programme] »", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/editeur?langage=pseudocode");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.evaluate(() => (window as unknown as W).monaco.editor.getModels()[0].setValue('DEBUT\n  ECRIRE("ok")\nFIN'));
  await page.getByRole("button", { name: "▶ Exécuter" }).first().click();
  await expect(page.locator("pre[aria-live]").first()).toContainText(`ok\n${END}`);
  await expect(page.getByTestId("ecran-console")).toHaveCount(0);
});
