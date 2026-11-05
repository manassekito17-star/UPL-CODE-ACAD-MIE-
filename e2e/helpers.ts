import { expect, type Page } from "@playwright/test";

/** Attend l'éditeur Monaco puis remplace son contenu. */
export async function setEditorCode(page: Page, code: string) {
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.waitForFunction(() => Boolean((window as unknown as { monaco?: unknown }).monaco));
  await page.evaluate((c) => {
    const m = (window as unknown as { monaco: { editor: { getModels(): Array<{ setValue(v: string): void }> } } }).monaco;
    m.editor.getModels()[0].setValue(c);
  }, code);
}

export async function run(page: Page) {
  await page.getByRole("button", { name: "▶ Exécuter" }).first().click();
}

export async function expectConsole(page: Page, text: string | RegExp, timeout = 20_000) {
  await expect(page.locator("pre[aria-live]").first()).toContainText(text, { timeout });
}

/** Supabase est-il configuré sur le serveur testé ? (sinon : mode démonstration) */
export async function isDemoMode(page: Page) {
  await page.goto("/connexion");
  return (await page.getByText("Mode démonstration").count()) > 0;
}

/** Crée un compte étudiant et ouvre sa session (si Supabase est configuré). */
export async function signUpStudent(page: Page, name = "Étudiant Test") {
  if (await isDemoMode(page)) return null;
  const email = `etudiant.${Date.now()}.${Math.floor(Math.random() * 1e6)}@exemple.cd`;
  await page.goto("/inscription");
  await page.getByLabel("Nom complet").fill(name);
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill("Algorithme2026");
  await page.getByLabel("Confirmer le mot de passe").fill("Algorithme2026");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/tableau-de-bord/);
  return email;
}
