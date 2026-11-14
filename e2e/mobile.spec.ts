import { expect, test } from "@playwright/test";
import { setEditorCode } from "./helpers";

for (const path of ["/", "/ide", "/laboratoire", "/formations", "/formations/python/fonctions", "/formations/algorithmique", "/formations/algorithmique/niveaux/1", "/formations/html/html-liens-images", "/formations/algorithmique/positionnement", "/exercices", "/exercices/algo-mention", "/exercices/css-carte-boite", "/editeur", "/editeur?langage=html", "/confidentialite", "/conditions", "/telecharger", "/avis-important"]) {
  test(`pas de défilement horizontal sur ${path}`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("sur téléphone : consignes, code et console sont accessibles", async ({ page }) => {
  await page.goto("/exercices/algo-somme-deux-nombres");
  await expect(page.getByRole("tab", { name: "consignes" })).toBeVisible();
  await expect(page.getByText("Lisez deux entiers").filter({ visible: true })).toBeVisible();
  await page.getByRole("tab", { name: "code" }).click();
  await page.locator(".monaco-editor").waitFor();
  await page.getByRole("button", { name: "▶ Exécuter" }).click();
  await expect(page.getByRole("tab", { name: "console" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Exécution terminée").filter({ visible: true })).toBeVisible();
});

test("sur téléphone : un balayage commencé sur un éditeur fait défiler la page (sans blocage)", async ({ page, context }) => {
  // Éditeur intégré dans une page (démonstration de l'accueil) ; la page Éditeur, elle, est en plein écran.
  await page.goto("/");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  const cdp = await context.newCDPSession(page);
  const swipe = async (y1: number, y2: number) => {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 180, y: y1 }] });
    for (let i = 1; i <= 12; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 180, y: y1 + ((y2 - y1) * i) / 12 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  };
  const top = await page.evaluate(() => document.querySelector(".monaco-editor")!.getBoundingClientRect().top);
  const viewport = page.viewportSize()!.height;
  const y = Math.min(viewport - 40, top + 200);
  await swipe(y, y - 250);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  const after = await page.evaluate(() => scrollY);
  const top2 = await page.evaluate(() => document.querySelector(".monaco-editor")!.getBoundingClientRect().top);
  await swipe(Math.max(top2 + 30, 80), Math.max(top2 + 30, 80) + 250);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(after);
});

test("sur téléphone : appui long pour sélectionner, glisser pour étendre, puis Supprimer", async ({ page, context }) => {
  await page.goto("/editeur?langage=pseudocode");
  // Page blanche à l'ouverture : chacun écrit son propre code.
  await expect(page.getByTestId("editeur-vide")).toBeVisible();
  await setEditorCode(page, 'ALGORITHME MonAlgorithme\nVARIABLES\n  nom : CHAINE\nDEBUT\n  ECRIRE("Quel est votre nom ?")\n  LIRE(nom)\nFIN');
  const code = () => page.evaluate(() => (window as unknown as { monaco: { editor: { getModels(): Array<{ getValue(): string }> } } }).monaco.editor.getModels()[0].getValue());
  const line1 = page.locator(".view-line", { hasText: "ALGORITHME" }).first();
  // Monaco redessine ses lignes : on attend une position stable.
  let box: { x: number; y: number; width: number; height: number } | null = null;
  await expect.poll(async () => (box = await line1.boundingBox())).not.toBeNull();
  box = box!;
  const cdp = await context.newCDPSession(page);
  const x = box.x + 20;
  const y = box.y + box.height / 2;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await page.waitForTimeout(700); // appui long
  await expect(page.getByTestId("barre-selection")).toBeVisible();
  // Glisser vers la droite : la sélection s'étend sur toute la première ligne.
  for (let i = 1; i <= 6; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + i * 50, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  // Poignées de début et de fin ; la poignée de fin glissée vers le bas étend la sélection d'une ligne.
  await expect(page.getByTestId("poignee-debut").locator("[data-which]")).toBeVisible();
  await expect(page.getByTestId("poignee-fin").locator("[data-which]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as unknown as { monaco: { editor: { getEditors(): Array<{ getSelection(): { endColumn: number } }> } } }).monaco.editor.getEditors()[0].getSelection().endColumn)).toBeGreaterThan(20);
  let fin: { x: number; y: number; width: number; height: number } | null = null;
  await expect.poll(async () => (fin = await page.getByTestId("poignee-fin").locator("[data-which]").boundingBox())).not.toBeNull();
  fin = fin!;
  const fx = fin.x + fin.width / 2;
  const fy = fin.y + fin.height / 2;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: fx, y: fy }] });
  for (let i = 1; i <= 5; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: fx, y: fy + i * box.height * 0.6 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  const selected = await page.evaluate(() => {
    const ed = (window as unknown as { monaco: { editor: { getEditors(): Array<{ getSelection(): { startLineNumber: number; endLineNumber: number } }> } } }).monaco.editor.getEditors()[0];
    const s = ed.getSelection();
    return s.endLineNumber - s.startLineNumber;
  });
  expect(selected).toBeGreaterThanOrEqual(1);
  const before = await code();
  await page.getByTestId("barre-selection").getByRole("button", { name: "Supprimer" }).click();
  const after = await code();
  expect(after.length).toBeLessThan(before.length - 20);
  expect(after).not.toContain("ALGORITHME");
  await expect(page.getByTestId("barre-selection")).toHaveCount(0);
});

test("sur téléphone : un toucher ailleurs efface la sélection (comme Bloc-notes)", async ({ page, context }) => {
  await page.goto("/editeur?langage=pseudocode");
  await setEditorCode(page, 'ALGORITHME Essai\nVARIABLES\n  x : ENTIER\nDEBUT\n  x <- 1\nFIN');
  // « Tout » via la barre : on sélectionne d'abord un mot par appui long, puis Tout.
  const line = page.locator(".view-line", { hasText: "Essai" }).first();
  let box: { x: number; y: number; width: number; height: number } | null = null;
  await expect.poll(async () => (box = await line.boundingBox())).not.toBeNull();
  box = box!;
  const cdp = await context.newCDPSession(page);
  const tap = async (x: number, y: number, hold = 0) => {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    if (hold) await page.waitForTimeout(hold);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  };
  await tap(box.x + 20, box.y + box.height / 2, 700);
  await expect(page.getByTestId("barre-selection")).toBeVisible();
  await page.getByTestId("barre-selection").getByRole("button", { name: "Tout" }).click();
  // Toucher bref sur une autre ligne : la sélection disparaît, le curseur s'y place.
  await tap(box.x + 30, box.y + box.height * 4.5);
  await expect(page.getByTestId("barre-selection")).toHaveCount(0);
});
