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
  // Interface LARP : s'ouvre et exécute un algorithme sans Internet.
  await page.goto("/flow/classique");
  await expect(page.getByTestId("larp-fenetre")).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("zone-code").fill('DÉBUT\n  ÉCRIRE "Sans Internet"\nFIN\n');
  await page.keyboard.press("F7");
  await expect(page.getByTestId("console-texte")).toContainText("Sans Internet");

  // Page qui demande Internet : propose les éditeurs gardés sur l'appareil.
  await page.goto("/formations");
  await expect(page.getByText("Pas de connexion Internet")).toBeVisible();
  for (const name of ["UPL IDE", "UPL Algo", "Interface LARP"]) await expect(page.getByRole("link", { name: new RegExp(name) })).toBeVisible();
  await page.getByRole("link", { name: /Interface LARP/ }).click();
  await expect(page.getByTestId("larp-fenetre")).toBeVisible({ timeout: 30_000 });
});

test("éditeur « UPL Algo » : installation, préparation, puis algorithme exécuté sans Internet", async ({ page, context }) => {
  test.setTimeout(180_000);
  await page.goto("/editeur?langage=pseudocode");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/editeur.webmanifest");
  const manifest = await (await page.request.get("/editeur.webmanifest")).json();
  expect(manifest.short_name).toBe("UPL Algo");
  // Vraie application installable (sans logo du navigateur) : icône adaptable et captures pour la fenêtre d'installation.
  expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBe(true);
  expect(manifest.screenshots.map((s: { form_factor: string }) => s.form_factor).sort()).toEqual(["narrow", "wide"]);
  for (const s of manifest.screenshots) expect((await page.request.get(s.src)).status()).toBe(200);

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

test("projets enregistrés consultables sans Internet : « Mes programmes » puis réouverture du programme", async ({ page, context }) => {
  test.setTimeout(240_000);
  const { isDemoMode, setEditorCode } = await import("./helpers");
  test.skip(await isDemoMode(page), "Supabase non configuré");
  await page.goto("/editeur?langage=pseudocode");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.evaluate(() => navigator.serviceWorker.ready);
  // Préparation « utiliser sans Internet » (éditeur gardé sur l'appareil), comme un étudiant.
  await page.getByRole("button", { name: "Plus d'options" }).click();
  await page.getByRole("menuitem", { name: /Installer · utiliser sans Internet/ }).click();
  const prep = page.getByTestId("ide-hors-ligne");
  await prep.getByLabel("Inclure Python (environ 10 Mo)").uncheck();
  await prep.getByTestId("ide-preparer-hors-ligne").click();
  await expect(prep.getByText(/Prêt : UPL Algo fonctionne maintenant sans Internet/)).toBeVisible({ timeout: 150_000 });
  await prep.getByRole("button", { name: "Fermer" }).click();
  await setEditorCode(page, 'ALGORITHME HorsLigne\nDEBUT\n  ECRIRE("sans internet")\nFIN');
  const titre = `Hors ligne ${Date.now()}`;
  page.once("dialog", (d) => d.accept(titre));
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText(/Programme enregistré/)).toBeVisible();

  // Avec Internet : la liste est affichée (et gardée sur l'appareil avec la page du programme).
  await page.getByRole("button", { name: "Plus d'options" }).click();
  await page.getByRole("menuitem", { name: "Mes programmes" }).click();
  const link = page.getByTestId("mes-programmes").getByRole("link", { name: new RegExp(titre) });
  await expect(link).toBeVisible();
  const href = (await link.getAttribute("href"))!;
  await expect
    .poll(() => page.evaluate(async (h) => Boolean((await caches.match(h)) && (await caches.match("/api/programs"))), href), { timeout: 30_000 })
    .toBe(true);
  // Copie dans le stockage du téléphone (liste + contenu), utilisée même sans mode hors ligne à jour.
  const id = href.split("programme=")[1];
  await expect
    .poll(() => page.evaluate((pid) => Object.keys(localStorage).some((k) => k.startsWith("upl:programmes:") && localStorage.getItem(k)!.includes(pid) && localStorage.getItem(k)!.includes("sans internet")), id), { timeout: 30_000 })
    .toBe(true);

  // Sans Internet : la liste et le programme s'ouvrent depuis la copie de l'appareil.
  await context.setOffline(true);
  await page.goto("/editeur?langage=pseudocode");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 30_000 });
  await page.getByRole("button", { name: "Plus d'options" }).click();
  await page.getByRole("menuitem", { name: "Mes programmes" }).click();
  await expect(page.getByTestId("programmes-hors-ligne")).toBeVisible();
  await page.getByTestId("mes-programmes").getByRole("link", { name: new RegExp(titre) }).click();
  await expect(page).toHaveURL(/programme=/);
  await page.waitForFunction(() => Boolean((window as unknown as { monaco?: unknown }).monaco));
  await expect.poll(() => page.evaluate(() => (window as unknown as { monaco: { editor: { getModels(): Array<{ getValue(): string }> } } }).monaco.editor.getModels().map((m) => m.getValue()).join("\n"))).toContain("sans internet");
  await context.setOffline(false);
});
