import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Frame, type Page } from "@playwright/test";

/**
 * Vrais projets montés dans ZENTECH IDE (site web multi-fichiers, application console) et
 * fonctionnalités de VS Code : Ctrl+P, F12 d'un fichier à l'autre, Ctrl+D, raccourcis.
 */
const fixture = (name: string) => readFileSync(join(__dirname, "projets", name), "utf8");

type MonacoWindow = { monaco: { editor: { getModels(): Array<{ uri: { toString(): string }; setValue(v: string): void; getValue(): string }>; getEditors(): Array<{ getModel(): { uri: { toString(): string } } | null; hasTextFocus(): boolean; getPosition(): { lineNumber: number }; setPosition(p: { lineNumber: number; column: number }): void; focus(): void; getSelections(): unknown[] }> } } };

const setModel = (page: Page, path: string, content: string) =>
  page.evaluate(([p, c]) => (window as unknown as MonacoWindow).monaco.editor.getModels().find((m) => m.uri.toString().endsWith(`/${p}`))!.setValue(c), [path, content] as const);

async function quickOpen(page: Page, query: string, path: string) {
  await page.keyboard.press("Control+p");
  const dialog = page.getByTestId("ide-aller-fichier");
  await dialog.getByLabel("Rechercher un fichier").fill(query);
  await dialog.getByLabel("Rechercher un fichier").press("Enter");
  await page.waitForFunction((p) => (window as unknown as MonacoWindow).monaco.editor.getEditors().some((e) => e.getModel()?.uri.toString().endsWith(`/${p}`)), path);
}

async function newFile(page: Page, path: string, content: string) {
  await page.getByRole("button", { name: "Fichier", exact: true }).click();
  await page.getByRole("menuitem", { name: "Nouveau fichier…" }).click();
  await page.getByLabel("Nom du fichier").fill(path);
  await page.getByLabel("Nom du fichier").press("Enter");
  await page.waitForFunction((p) => (window as unknown as MonacoWindow).monaco.editor.getModels().some((m) => m.uri.toString().endsWith(`/${p}`)), path);
  await setModel(page, path, content);
}

async function previewFrame(page: Page): Promise<Frame> {
  let found: Frame | null = null;
  await expect
    .poll(async () => {
      for (const f of page.frames()) if (f !== page.mainFrame() && (await f.locator("#plats").count().catch(() => 0))) found = f;
      return Boolean(found);
    })
    .toBe(true);
  return found!;
}

test("site web réel (restaurant) : plusieurs fichiers, aperçu interactif, localStorage, formulaires, F12 et Ctrl+P", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/ide");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await setModel(page, "index.html", fixture("restaurant.html"));
  await quickOpen(page, "style", "css/style.css");
  await setModel(page, "css/style.css", fixture("restaurant.css"));
  await quickOpen(page, "script", "js/script.js");
  await setModel(page, "js/script.js", fixture("restaurant.js"));
  await newFile(page, "js/utils.js", fixture("restaurant-utils.js"));

  await page.getByRole("button", { name: "Aperçu web" }).click();
  let site = await previewFrame(page);
  await expect(site.locator(".carte")).toHaveCount(3);
  await site.locator(".carte button").first().click();
  await site.locator(".carte button").nth(1).click();
  await expect(site.locator("#total")).toHaveText(/13\s000 FC/);
  await site.locator("#filtre").fill("pon");
  await expect(site.locator(".carte")).toHaveCount(1);
  // localStorage (interdit dans le bac à sable de l'aperçu) : remplacé, et gardé au rechargement.
  await site.locator("#theme").click();
  await expect(site.locator("body")).toHaveClass(/sombre/);
  await page.evaluate(() => {
    const m = (window as unknown as MonacoWindow).monaco.editor.getModels().find((x) => x.uri.toString().endsWith("/css/style.css"))!;
    m.setValue(m.getValue() + "\n/* modification */");
  });
  await page.waitForTimeout(1500);
  site = await previewFrame(page);
  await expect(site.locator("body")).toHaveClass(/sombre/);
  // Formulaires : l'événement « submit » atteint bien le script de la page.
  await site.locator("#formulaire button").click();
  await expect(site.locator("#message")).toHaveText(/obligatoire/);
  await site.locator("#nom").fill("Kito");
  await site.locator("#personnes").fill("3");
  await site.locator("#formulaire button").click();
  await expect(site.locator("#message")).toHaveText(/Merci Kito/);
  await page.getByRole("tab", { name: "Console" }).click();
  await expect(page.getByTestId("ide-panneau-console")).toContainText("Ajouté");

  // F12 sur une fonction d'un autre fichier : utils.js s'ouvre sur la définition.
  await quickOpen(page, "script.js", "js/script.js");
  await page.evaluate(() => {
    type Ed = { getModel(): { uri: { toString(): string }; getLineContent(n: number): string } | null; setPosition(p: { lineNumber: number; column: number }): void; focus(): void };
    const eds = (window as unknown as { monaco: { editor: { getEditors(): Ed[] } } }).monaco.editor.getEditors();
    const ed = eds.find((e) => e.getModel()?.uri.toString().endsWith("/js/script.js"))!;
    ed.setPosition({ lineNumber: 9, column: ed.getModel()!.getLineContent(9).indexOf("formaterPrix") + 3 });
    ed.focus();
  });
  await page.keyboard.press("F12");
  await expect
    .poll(() => page.evaluate(() => (window as unknown as MonacoWindow).monaco.editor.getEditors().find((e) => e.getModel()?.uri.toString().endsWith("/js/utils.js"))?.getPosition().lineNumber ?? 0), { timeout: 10_000 })
    .toBe(8);

  // Ctrl+D : occurrence suivante du mot ajoutée à la sélection.
  await page.evaluate(() => {
    const ed = (window as unknown as MonacoWindow).monaco.editor.getEditors().find((e) => e.getModel()?.uri.toString().endsWith("/js/utils.js"))!;
    ed.setPosition({ lineNumber: 3, column: 6 });
    ed.focus();
  });
  await page.keyboard.press("Control+d");
  await page.keyboard.press("Control+d");
  expect(await page.evaluate(() => (window as unknown as MonacoWindow).monaco.editor.getEditors().find((e) => e.hasTextFocus())!.getSelections().length)).toBeGreaterThanOrEqual(2);

  // Ctrl+K Ctrl+S (curseur dans le code) : liste des raccourcis.
  await page.keyboard.press("Control+k");
  await page.keyboard.press("Control+s");
  await expect(page.getByTestId("ide-raccourcis")).toContainText("Aller à la définition");
  await page.keyboard.press("Escape");
  // Menu « Aller » de VS Code.
  await page.getByRole("button", { name: "Aller", exact: true }).click();
  await expect(page.getByRole("menuitem", { name: /Renommer le symbole/ })).toBeVisible();
});

test("application console réelle (JavaScript) : classes, console.table, prompt, erreur à la bonne ligne", async ({ page }) => {
  await page.goto("/ide");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await newFile(page, "stock.js", fixture("stock.js"));
  await page.getByRole("tab", { name: "Console" }).click();
  await page.getByLabel("Entrées du programme").fill("huile");
  await page.getByRole("button", { name: /^Exécuter JavaScript/ }).click();
  const console_ = page.getByTestId("ide-panneau-console");
  await expect(console_).toContainText("Huile : 12 en stock", { timeout: 30_000 });
  await expect(console_).toContainText("│ (index) │ nom");
  await expect(console_).toContainText("En rupture : Sucre");
  await setModel(page, "stock.js", "const a = 1;\nconsole.log(a);\nconsole.log(b);\n");
  await page.getByRole("button", { name: /^Exécuter JavaScript/ }).click();
  await expect(console_).toContainText("ReferenceError: b is not defined (ligne 3)", { timeout: 30_000 });
});
