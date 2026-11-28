import { expect, test, type Page } from "@playwright/test";

/** Quitter l'application par erreur puis revenir : on retrouve son travail, là où on l'avait laissé. */
type W = { monaco: { editor: { getModels(): Array<{ getValue(): string; setValue(v: string): void; uri: { toString(): string } }>; getEditors(): Array<{ getModel(): { uri: { toString(): string } } | null }> } } };
const models = (page: Page) => page.evaluate(() => (window as unknown as W).monaco.editor.getModels().map((m) => ({ uri: m.uri.toString(), value: m.getValue() })));
const ready = (page: Page) => page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });

test("ZENTECH Algo : le code non enregistré est retrouvé, chaque langage garde le sien", async ({ page }) => {
  await page.goto("/editeur?langage=pseudocode");
  await ready(page);
  await page.evaluate(() => (window as unknown as W).monaco.editor.getModels()[0].setValue('DEBUT\n  ECRIRE("mon travail")\nFIN'));
  await page.waitForTimeout(300);
  await page.reload();
  await ready(page);
  await expect.poll(async () => (await models(page))[0]?.value).toContain("mon travail");
  // Un autre langage : son propre brouillon ; retour au pseudocode : le code est toujours là.
  await page.goto("/editeur?langage=javascript");
  await ready(page);
  await expect.poll(async () => (await models(page)).some((m) => m.value.includes("mon travail"))).toBe(false);
  await page.goto("/editeur?langage=pseudocode");
  await ready(page);
  await expect.poll(async () => (await models(page))[0]?.value).toContain("mon travail");
});

test("ZENTECH IDE : onglets, fichier actif et entrées retrouvés", async ({ page }) => {
  await page.goto("/ide");
  await ready(page);
  await page.keyboard.press("Control+p");
  await page.getByLabel("Rechercher un fichier").fill("script");
  await page.getByLabel("Rechercher un fichier").press("Enter");
  await page.waitForFunction(() => (window as unknown as W).monaco.editor.getModels().some((m) => m.uri.toString().endsWith("/js/script.js")));
  await page.evaluate(() => (window as unknown as W).monaco.editor.getModels().find((m) => m.uri.toString().endsWith("/js/script.js"))!.setValue("// je travaillais ici\nconsole.log(1);"));
  await page.getByRole("tab", { name: "Console" }).click();
  await page.getByLabel("Entrées du programme").fill("42");
  await page.waitForTimeout(600);
  await page.reload();
  await ready(page);
  await expect.poll(() => page.evaluate(() => (window as unknown as W).monaco.editor.getEditors().map((e) => e.getModel()?.uri.toString() ?? "").join(" "))).toContain("/js/script.js");
  await expect.poll(async () => (await models(page)).find((m) => m.uri.endsWith("/js/script.js"))?.value).toContain("je travaillais ici");
  await page.getByRole("tab", { name: "Console" }).click();
  await expect(page.getByLabel("Entrées du programme")).toHaveValue("42");
});

test("Laboratoire : l'algorithme écrit est retrouvé", async ({ page }) => {
  await page.goto("/laboratoire");
  await ready(page);
  await page.evaluate(() => (window as unknown as W).monaco.editor.getModels()[0].setValue('ALGORITHME Moi\nDEBUT\n  ECRIRE("labo")\nFIN'));
  await page.waitForTimeout(300);
  await page.reload();
  await ready(page);
  await expect.poll(async () => (await models(page))[0]?.value).toContain('ECRIRE("labo")');
});

test("ouverture de l'application : retour à la dernière page de travail", async ({ page }) => {
  await page.goto("/editeur?langage=python");
  await ready(page);
  await page.goto("/flow/classique");
  await expect(page.getByTestId("larp-fenetre")).toBeVisible({ timeout: 30_000 });
  // Application principale : la dernière page ; application ZENTECH Algo : sa dernière page à elle.
  await page.goto("/reprendre");
  await expect(page).toHaveURL(/\/flow\/classique$/);
  await page.goto("/reprendre?app=editeur");
  await expect(page).toHaveURL(/\/editeur\?langage=python$/);
  // Rien de gardé pour l'IDE : sa page de départ.
  await page.evaluate(() => localStorage.removeItem("zentech:reprendre"));
  await page.goto("/reprendre?app=ide");
  await expect(page).toHaveURL(/\/ide$/);
});
