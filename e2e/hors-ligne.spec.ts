import { expect, test, type Page } from "@playwright/test";

/** UPL IDE installable et utilisable sans Internet (service worker, préparation, exécution hors ligne). */

test.skip(({ browserName }) => browserName !== "chromium", "Service worker testé sur Chromium");

async function newFile(page: Page, name: string, content: string) {
  await page.getByRole("menubar").getByRole("button", { name: "Fichier", exact: true }).click();
  await page.getByRole("menuitem", { name: "Nouveau fichier…" }).click();
  await page.getByLabel("Nom du fichier").fill(name);
  await page.getByLabel("Nom du fichier").press("Enter");
  await page.waitForFunction((n) => (window as unknown as { monaco?: { editor: { getModels(): Array<{ uri: { toString(): string } }> } } }).monaco?.editor.getModels().some((m) => m.uri.toString().endsWith(`/${n}`)), name);
  await page.evaluate(
    ([n, v]) => (window as unknown as { monaco: { editor: { getModels(): Array<{ uri: { toString(): string }; setValue(x: string): void }> } } }).monaco.editor.getModels().find((m) => m.uri.toString().endsWith(`/${n}`))!.setValue(v),
    [name, content] as const,
  );
}

test("préparation puis utilisation sans Internet : éditeur, JavaScript, pseudocode, aperçu ; C refusé avec explication", async ({ page, context }) => {
  test.setTimeout(180_000);
  await page.goto("/ide");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/ide.webmanifest");

  await page.getByRole("menubar").getByRole("button", { name: "Fichier", exact: true }).click();
  await page.getByRole("menuitem", { name: "Installer et utiliser sans Internet…" }).click();
  const dialog = page.getByTestId("ide-hors-ligne");
  await dialog.getByLabel("Inclure Python (environ 10 Mo)").uncheck();
  await dialog.getByTestId("ide-preparer-hors-ligne").click();
  await expect(dialog.getByText(/Prêt : UPL IDE fonctionne maintenant sans Internet/)).toBeVisible({ timeout: 120_000 });
  await dialog.getByRole("button", { name: "Fermer" }).click();

  await context.setOffline(true);
  await page.reload();
  await page.locator(".monaco-editor").first().waitFor({ timeout: 30_000 });
  await expect(page.getByTestId("ide-hors-connexion")).toBeVisible();

  await newFile(page, "calcul.js", "console.log(6 * 7)");
  await page.getByRole("button", { name: /^Exécuter JavaScript/ }).click();
  await expect(page.getByTestId("ide-console")).toContainText("42", { timeout: 30_000 });

  await newFile(page, "somme.algo", "ALGORITHME S\nDEBUT\n  ECRIRE(2 + 3)\nFIN\n");
  await page.getByRole("button", { name: /^Exécuter Pseudocode/ }).click();
  await expect(page.getByTestId("ide-console")).toContainText("5", { timeout: 30_000 });

  await newFile(page, "main.c", "int main(void) { return 0; }");
  await page.getByRole("button", { name: /^Exécuter C/ }).click();
  await expect(page.getByTestId("ide-console")).toContainText("Hors connexion : le C et le Java");

  await page.getByRole("tab", { name: /index\.html/ }).first().click();
  await page.getByRole("button", { name: "Aperçu web" }).click();
  await expect(page.frameLocator('iframe[title="Aperçu du projet"]').locator("h1")).toHaveText("Mon site");

  // Éditeur et laboratoire d'algorithmique : utilisables sans Internet ; les cours demandent Internet.
  await page.goto("/editeur");
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "▶ Exécuter" }).click();
  await expect(page.getByText("interpréteur UPL").first()).toBeVisible({ timeout: 30_000 });
  await page.goto("/laboratoire");
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "▶ Lancer l'exécution pas à pas" }).click();
  await expect(page.getByText("Combien de notes ?").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Failed to execute 'importScripts'/)).toHaveCount(0);
  await page.goto("/formations");
  await expect(page.getByText("Pas de connexion Internet")).toBeVisible();
});

test("éditeur « UPL Algo » : installation, préparation, puis algorithme exécuté sans Internet", async ({ page, context }) => {
  test.setTimeout(180_000);
  await page.goto("/editeur?langage=pseudocode");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/editeur.webmanifest");
  const manifest = await (await page.request.get("/editeur.webmanifest")).json();
  expect(manifest.short_name).toBe("UPL Algo");

  await page.getByRole("button", { name: "Plus d'options" }).click();
  await page.getByRole("menuitem", { name: /Installer · utiliser sans Internet/ }).click();
  const dialog = page.getByTestId("ide-hors-ligne");
  await expect(dialog.getByRole("heading", { name: /Installer UPL Algo/ })).toBeVisible();
  await dialog.getByLabel("Inclure Python (environ 10 Mo)").uncheck();
  await dialog.getByTestId("ide-preparer-hors-ligne").click();
  await expect(dialog.getByText(/Prêt : UPL Algo fonctionne maintenant sans Internet/)).toBeVisible({ timeout: 120_000 });
  await dialog.getByRole("button", { name: "Fermer" }).click();

  // Sans Internet : la page se rouvre, l'algorithme s'écrit et s'exécute.
  await context.setOffline(true);
  await page.reload();
  await page.locator(".monaco-editor").first().waitFor({ timeout: 30_000 });
  await expect(page.getByText("hors ligne", { exact: true })).toBeVisible();
  await page.waitForFunction(() => Boolean((window as unknown as { monaco?: unknown }).monaco));
  await page.evaluate(() => (window as unknown as { monaco: { editor: { getModels(): Array<{ setValue(v: string): void }> } } }).monaco.editor.getModels()[0].setValue('Algorithme carre\nVariable n : entier\nDébut\n  lire(n)\n  écrire("Carré = ", n * n)\nFin'));
  await page.getByRole("button", { name: "▶ Exécuter" }).click();
  const field = page.getByLabel("Valeur de n");
  await field.fill("9");
  await field.press("Enter");
  await expect(page.locator("pre[aria-live]").last()).toContainText("Carré = 81");
  await context.setOffline(false);
});
