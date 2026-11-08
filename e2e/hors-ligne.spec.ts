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
});
