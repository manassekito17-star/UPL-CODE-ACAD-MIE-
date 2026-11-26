import { expect, test, type Page } from "@playwright/test";

/** ZENTECH Texte : l'ergonomie d'un éditeur de texte pour développeurs, testée au clavier. */
type W = { monaco: { editor: { getEditors(): Array<{ hasTextFocus(): boolean; getModel(): { uri: { toString(): string }; getValue(): string } | null; setPosition(p: { lineNumber: number; column: number }): void; focus(): void }> } } };

async function open(page: Page) {
  await page.goto("/texte");
  await page.evaluate(() => localStorage.removeItem("zentech:texte:session"));
  await page.goto("/texte");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.locator(".monaco-editor textarea").first().focus();
}
const activeUri = (page: Page) => page.evaluate(() => (window as unknown as W).monaco.editor.getEditors().find((e) => e.hasTextFocus())?.getModel()?.uri.toString() ?? "");

test("aller à n'importe quoi, curseurs multiples, recherche, exécution, enregistrement et session gardée", async ({ page }) => {
  test.setTimeout(120_000);
  await open(page);
  await expect(page.getByTestId("zt-onglets-0").getByRole("tab")).toHaveText([/LISEZMOI\.md/, /main\.py/]);

  // Ctrl+P : fichier par lettres floues.
  await page.keyboard.press("Control+p");
  await page.getByLabel("Aller à", { exact: true }).fill("scr");
  await page.getByLabel("Aller à", { exact: true }).press("Enter");
  await expect.poll(() => activeUri(page)).toContain("web/script.js");

  // @symbole et :ligne.
  await page.keyboard.press("Control+p");
  await page.getByLabel("Aller à", { exact: true }).fill("main@moy");
  await page.getByLabel("Aller à", { exact: true }).press("Enter");
  await expect(page.getByTestId("zt-position")).toHaveText("Ligne 1, Colonne 1");
  await page.keyboard.press("Control+g");
  await page.getByLabel("Aller à", { exact: true }).fill(":5");
  await page.getByLabel("Aller à", { exact: true }).press("Enter");
  await expect(page.getByTestId("zt-position")).toHaveText("Ligne 5, Colonne 1");

  // Ctrl+D : mot puis occurrence suivante.
  await page.keyboard.press("Control+d");
  await page.keyboard.press("Control+d");
  await expect(page.getByTestId("zt-position")).toHaveText("2 sélections");

  // Ctrl+F puis Alt+Entrée : toutes les occurrences deviennent des curseurs.
  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+f");
  await page.getByLabel("Rechercher", { exact: true }).fill("notes");
  await expect(page.getByTestId("zt-nb-trouves")).toHaveText("6 trouvés");
  await page.getByLabel("Rechercher", { exact: true }).press("Alt+Enter");
  await expect(page.getByTestId("zt-position")).toHaveText("6 sélections");
  await page.keyboard.type("liste");
  await expect.poll(() => page.evaluate(() => (window as unknown as W).monaco.editor.getEditors()[0].getModel()!.getValue())).toContain("def moyenne(liste)");
  // Onglet modifié (●), puis Ctrl+S.
  await expect(page.getByTestId("zt-onglets-0").getByRole("tab", { name: /main\.py/ })).toContainText("●");
  await page.keyboard.press("Control+s");
  await expect(page.getByTestId("zt-message")).toContainText("main.py » enregistré");
  await expect(page.getByTestId("zt-onglets-0").getByRole("tab", { name: /main\.py/ })).not.toContainText("●");

  // Ctrl+B : exécution du pseudocode, sortie en bas.
  await page.keyboard.press("Control+p");
  await page.getByLabel("Aller à", { exact: true }).fill("somme");
  await page.getByLabel("Aller à", { exact: true }).press("Enter");
  await page.keyboard.press("Control+b");
  await expect(page.getByTestId("zt-console")).toContainText("Somme = 55", { timeout: 30_000 });
  await expect(page.getByTestId("zt-console")).toContainText("--------------\n[Fin de programme]");

  // Palette de commandes : trier les lignes.
  await page.keyboard.press("Control+Shift+p");
  await page.getByLabel("Commande", { exact: true }).fill("trier les");
  await expect(page.getByTestId("zt-palette")).toContainText("Trier les lignes");
  await page.keyboard.press("Escape");

  // Rechercher dans les fichiers.
  await page.locator(".monaco-editor textarea").first().focus();
  await page.keyboard.press("Control+Shift+f");
  await page.getByLabel("Rechercher", { exact: true }).fill("compteur");
  await page.getByLabel("Rechercher", { exact: true }).press("Enter");
  await expect(page.getByTestId("zt-resultats")).toContainText("web/script.js");

  // Deux colonnes.
  await page.locator(".monaco-editor textarea").first().focus();
  await page.keyboard.press("Alt+Shift+2");
  await expect(page.getByTestId("zt-onglets-1")).toBeVisible();

  // Session gardée : après rechargement, le fichier modifié et les onglets sont là.
  await page.waitForTimeout(600);
  await page.reload();
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await expect(page.getByTestId("zt-onglets-1")).toBeVisible();
  await expect(page.getByTestId("zentech-texte")).toContainText("somme.algo");
});

test("préférences en JSON et thèmes, menus, raccourcis", async ({ page }) => {
  await open(page);
  await page.getByTestId("zt-menu-Préférences").click();
  await page.getByTestId("zt-cmd-theme.Monokai").click();
  await expect.poll(() => page.locator(".monaco-editor .monaco-editor-background").first().evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgb(39, 40, 34)");
  await expect(page.getByTestId("zentech-texte")).toHaveCSS("background-color", "rgb(30, 31, 28)");
  // Le fichier de préférences s'ouvre comme un fichier, avec le thème choisi écrit dedans.
  await page.getByTestId("zt-menu-Préférences").click();
  await page.getByTestId("zt-cmd-preferences.reglages").click();
  await expect(page.getByTestId("zt-onglets-0")).toContainText("Préférences.json");
  await expect.poll(() => page.evaluate(() => (window as unknown as W).monaco.editor.getEditors()[0].getModel()!.getValue())).toContain('"color_scheme": "Monokai"');
  // Liste des raccourcis.
  await page.getByTestId("zt-menu-Aide").click();
  await page.getByTestId("zt-cmd-aide.raccourcis").click();
  await expect(page.getByTestId("zt-raccourcis")).toContainText("Aller à n'importe quoi");
  await expect(page.getByTestId("zt-raccourcis")).toContainText("Ctrl+Maj+L");
});
