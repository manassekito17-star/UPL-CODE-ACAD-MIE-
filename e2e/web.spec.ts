import { expect, test, type Page } from "@playwright/test";
import { staticExercises } from "../src/content";
import { isDemoMode, signUpStudent } from "./helpers";

/** Parcours HTML / CSS : aperçu isolé dans UPL IDE, console de la page, correction structurelle. */

async function setFile(page: Page, file: string, code: string) {
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.waitForFunction(() => Boolean((window as unknown as { monaco?: unknown }).monaco));
  await page.evaluate(
    ([f, c]) => {
      const m = (window as unknown as { monaco: { editor: { getModels(): Array<{ uri: { path: string }; setValue(v: string): void }> } } }).monaco;
      const model = m.editor.getModels().find((x) => x.uri.path.endsWith(`/${f}`));
      if (!model) throw new Error(`modèle ${f} introuvable`);
      model.setValue(c);
    },
    [file, code] as const,
  );
}

const preview = (page: Page) => page.frameLocator('iframe[title="Aperçu de la page"]');

test("UPL IDE : projet web avec aperçu en direct et console de la page", async ({ page }) => {
  await page.goto("/editeur?langage=html");
  await expect(page.getByRole("button", { name: "↻ Actualiser l'aperçu" })).toBeVisible();
  for (const f of ["index.html", "style.css", "script.js"]) await expect(page.getByRole("button", { name: f, exact: true })).toBeVisible();

  await setFile(page, "index.html", '<!DOCTYPE html><html lang="fr"><head><link rel="stylesheet" href="style.css"></head><body><h1 id="t">Bonjour UPL</h1><script src="script.js"></script></body></html>');
  await page.getByRole("button", { name: "style.css", exact: true }).click();
  await setFile(page, "style.css", "h1 { color: rgb(255, 0, 0); }");
  await page.getByRole("button", { name: "script.js", exact: true }).click();
  await setFile(page, "script.js", 'console.log("script chargé", 6 * 7);\nfetch("https://example.com").catch(() => console.error("réseau bloqué"));');

  await expect(preview(page).locator("h1")).toHaveText("Bonjour UPL");
  await expect(preview(page).locator("h1")).toHaveCSS("color", "rgb(255, 0, 0)");
  await expect(page.getByTestId("console-apercu")).toContainText("script chargé 42");
  // CSP de l'aperçu : aucune requête réseau
  await expect(page.getByTestId("console-apercu")).toContainText("réseau bloqué");

  // L'aperçu est isolé : pas d'accès aux cookies ni à la page parente
  await setFile(page, "script.js", 'try { console.log("cookie:" + document.cookie); } catch (e) { console.log("cookie bloqué"); }\ntry { console.log(parent.document.title); } catch (e) { console.log("parent inaccessible"); }');
  await expect(page.getByTestId("console-apercu")).toContainText("parent inaccessible");
  await expect(page.getByTestId("console-apercu")).toContainText("cookie bloqué");

  // Le serveur refuse d'« exécuter » du HTML
  const r = await page.request.post("/api/execute", { data: { language: "html", files: [{ name: "index.html", content: "<p>x</p>" }], stdin: "" } });
  expect(r.status()).toBe(400);
});

test("une démonstration de chapitre s'ouvre dans UPL IDE avec un retour au cours", async ({ page }) => {
  await page.goto("/formations/css/css-introduction-selecteurs");
  await page.locator("section#algorithmes").getByRole("tab", { name: "Aperçu" }).first().click();
  await expect(page.locator("section#algorithmes iframe").first()).toBeVisible();
  await page.locator("section#algorithmes").getByRole("link", { name: "Ouvrir dans UPL IDE" }).first().click();
  await expect(page).toHaveURL(/\/editeur\?algorithme=css\/css-introduction-selecteurs\/0/);
  await expect(preview(page).locator("h1").first()).toBeVisible();
  await page.getByTestId("retour-cours").click();
  await expect(page).toHaveURL(/\/formations\/css\/css-introduction-selecteurs#algorithmes/);
});

test("exercice CSS corrigé automatiquement (fichier style.css ouvert au départ)", async ({ page }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  await signUpStudent(page, "Web Test");
  const ex = staticExercises.find((e) => e.slug === "css-titre-couleur")!;
  await page.goto(`/exercices/${ex.slug}`);
  await expect(page.getByRole("button", { name: "style.css", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "✓ Soumettre" }).click();
  await expect(page.getByText("h1 { color: navy }").first()).toBeVisible();
  await expect(page.getByText(/aucune règle/).first()).toBeVisible();

  await setFile(page, "style.css", ex.solution);
  await expect(preview(page).locator("h1")).toHaveCSS("color", "rgb(0, 0, 128)");
  await page.getByRole("button", { name: "✓ Soumettre" }).click();
  await expect(page.getByText("Bravo, exercice réussi !")).toBeVisible();
});
