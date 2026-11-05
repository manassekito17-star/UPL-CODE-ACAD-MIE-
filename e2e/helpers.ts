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
