import { strToU8, zipSync } from "fflate";
import { expect, test, type Page } from "@playwright/test";
import { isDemoMode, signUpStudent } from "./helpers";

/** UPL IDE — phase 2 : explorateur, onglets, éditeur, exécution réelle, projets, versions, import/export. */

async function setModel(page: Page, file: string, code: string) {
  await page.waitForFunction((f) => {
    const m = (window as unknown as { monaco?: { editor: { getModels(): Array<{ uri: { toString(): string } }> } } }).monaco;
    return Boolean(m?.editor.getModels().some((x) => x.uri.toString().endsWith(`/${f}`)));
  }, file, { timeout: 60_000 });
  await page.evaluate(
    ([f, c]) => {
      const m = (window as unknown as { monaco: { editor: { getModels(): Array<{ uri: { toString(): string }; setValue(v: string): void }> } } }).monaco;
      m.editor.getModels().find((x) => x.uri.toString().endsWith(`/${f}`))!.setValue(c);
    },
    [file, code] as const,
  );
}

async function newEntry(page: Page, button: "Nouveau fichier" | "Nouveau dossier", name: string) {
  await page.getByRole("button", { name: button, exact: true }).click();
  const input = page.getByLabel(button === "Nouveau fichier" ? "Nom du fichier" : "Nom du dossier");
  await input.fill(name);
  await input.press("Enter");
}

/** Ouvre une section de la barre d'activité (sans la refermer si elle est déjà ouverte). */
async function openSide(page: Page, name: string) {
  const b = page.getByRole("navigation", { name: "Sections de l'IDE" }).getByRole("button", { name, exact: true });
  if ((await b.getAttribute("aria-pressed")) !== "true") await b.click();
}

const tree = (page: Page) => page.getByRole("tree", { name: "Fichiers du projet" });
const item = (page: Page, path: string) => tree(page).locator(`[data-chemin="${path}"]`);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("upl-test-init")) {
      localStorage.clear();
      sessionStorage.setItem("upl-test-init", "1");
    }
  });
});

test("projet local : fichiers, dossiers, onglets, exécution JavaScript réelle et recherche", async ({ page }) => {
  page.on("dialog", (d) => (d.type() === "prompt" ? d.accept("src") : d.accept()));
  await page.goto("/ide");
  await expect(page.getByTestId("ide")).toBeVisible();
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });

  await newEntry(page, "Nouveau dossier", "src");
  await expect(item(page, "src")).toBeVisible();
  await newEntry(page, "Nouveau fichier", "main.js");
  await expect(page.getByRole("tab", { name: /main\.js/ })).toBeVisible();
  await setModel(page, "main.js", "const notes = [12, 15, 18];\nconsole.log('moyenne', notes.reduce((a, b) => a + b) / notes.length);");
  await expect(page.getByTestId("ide-barre-etat")).toContainText("JavaScript");
  await page.getByRole("button", { name: /Exécuter JavaScript/ }).click();
  await expect(page.getByTestId("ide-console")).toContainText("moyenne 15", { timeout: 30_000 });
  await page.getByRole("tab", { name: "Sortie" }).click();
  await expect(page.getByTestId("ide-panneau-sortie")).toContainText("navigateur (Web Worker isolé)");

  // Déplacer main.js dans src (menu « Déplacer vers… ») : l'onglet suit le fichier
  await item(page, "main.js").getByRole("button", { name: "Actions pour main.js" }).click();
  await page.getByRole("menuitem", { name: "Déplacer vers…" }).click();
  await expect(item(page, "src/main.js")).toBeVisible();
  await expect(page.getByRole("tab", { name: /main\.js/ })).toHaveAttribute("title", "src/main.js");

  // Renommer, dupliquer, supprimer avec confirmation
  await item(page, "src/main.js").getByRole("button", { name: "Actions pour main.js" }).click();
  await page.getByRole("menuitem", { name: "Renommer" }).click();
  await page.getByLabel("Nom du fichier").fill("app.js");
  await page.getByLabel("Nom du fichier").press("Enter");
  await expect(item(page, "src/app.js")).toBeVisible();
  await item(page, "src/app.js").getByRole("button", { name: "Actions pour app.js" }).click();
  await page.getByRole("menuitem", { name: "Dupliquer" }).click();
  await expect(item(page, "src/app (copie).js")).toBeVisible();
  await item(page, "src/app (copie).js").getByRole("button", { name: "Actions pour app (copie).js" }).click();
  await page.getByRole("menuitem", { name: "Supprimer" }).click();
  await expect(item(page, "src/app (copie).js")).toHaveCount(0);

  // Nom refusé
  await newEntry(page, "Nouveau fichier", "../pirate.txt");
  await expect(page.getByTestId("ide-message")).toContainText("Nom de fichier invalide");

  // Recherche dans le projet
  await openSide(page, "Recherche");
  await page.getByLabel("Texte à rechercher dans le projet").fill("moyenne");
  await expect(page.getByTestId("ide-resultats-recherche")).toContainText("src/app.js:2");

  // Vue fractionnée
  await page.getByRole("button", { name: /Vue fractionnée/ }).click();
  await expect(page.getByRole("tablist", { name: "Fichiers ouverts" })).toHaveCount(2);

  // Le brouillon local survit au rechargement
  await page.reload();
  await openSide(page, "Explorateur");
  await expect(item(page, "src/app.js")).toBeVisible();
});

test("aperçu web avec vues ordinateur / téléphone et console de la page", async ({ page }) => {
  await page.goto("/ide");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await page.getByRole("button", { name: "Aperçu web" }).click();
  const frame = page.frameLocator('iframe[title="Aperçu du projet"]');
  await expect(frame.locator("h1")).toHaveText("Mon site");
  await expect(frame.locator("h1")).toHaveCSS("color", "rgb(29, 95, 224)"); // css/style.css relié depuis index.html
  await frame.getByRole("button", { name: "Cliquez-moi" }).click();
  await expect(page.getByTestId("ide-console")).toContainText("[page] Bouton cliqué !");
  await page.getByRole("button", { name: "Téléphone" }).click();
  await expect(page.locator('iframe[title="Aperçu du projet"]')).toHaveJSProperty("offsetWidth", 390);
});

test("interface de type studio : menus, éditeurs ouverts, plan, fil d'Ariane, pages de l'aperçu", async ({ page }) => {
  await page.goto("/ide");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  // Thème studio (gris neutre) par défaut et barre d'état bleue.
  await expect(page.getByTestId("ide")).toHaveClass(/ide-studio/);
  await expect(page.getByTestId("ide-fil-ariane")).toContainText("index.html");
  // Menu Fichier → Nouveau fichier : le champ de saisie s'ouvre dans l'explorateur.
  const menubar = page.getByRole("menubar", { name: "Menus de l'IDE" });
  await menubar.getByRole("button", { name: "Fichier", exact: true }).click();
  await page.getByRole("menuitem", { name: "Nouveau fichier…" }).click();
  const input = page.getByLabel("Nom du fichier");
  await input.fill("outils.js");
  await input.press("Enter");
  await expect(page.getByRole("tab", { name: /outils\.js/ })).toBeVisible();
  await expect(page.getByTestId("ide-fil-ariane")).toContainText("outils.js");
  await expect(page.getByTestId("ide-editeurs-ouverts")).toContainText("index.html");
  await expect(page.getByTestId("ide-editeurs-ouverts")).toContainText("outils.js");
  // Plan : fonctions du fichier ouvert, clic → ligne.
  await setModel(page, "outils.js", "const a = 1;\n\nfunction somme(x, y) {\n  return x + y;\n}\n");
  await expect(page.getByTestId("ide-plan")).toContainText("somme");
  await page.getByTestId("ide-plan").getByRole("button", { name: /somme/ }).click();
  await expect(page.getByTestId("ide-barre-etat")).toContainText("Ln 3");
  // Menu Affichage : minicarte et thème appliqués réellement.
  await menubar.getByRole("button", { name: "Affichage", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "Thème clair" }).click();
  await expect(page.getByTestId("ide")).toHaveClass(/ide-clair/);
  // Fermer un éditeur depuis « Éditeurs ouverts ».
  await page.getByTestId("ide-editeurs-ouverts").getByRole("button", { name: "Fermer outils.js" }).click();
  await expect(page.getByRole("tab", { name: /outils\.js/ })).toHaveCount(0);
  // Aperçu : choix de la page affichée parmi les pages HTML du projet.
  await newEntry(page, "Nouveau fichier", "contact.html");
  await setModel(page, "contact.html", "<h1>Contact</h1>");
  await page.getByRole("button", { name: "Aperçu web" }).click();
  await page.getByLabel("Page affichée dans l'aperçu").selectOption("index.html");
  const frame = page.frameLocator('iframe[title="Aperçu du projet"]');
  await expect(frame.locator("h1")).toHaveText("Mon site");
  await page.getByLabel("Page affichée dans l'aperçu").selectOption("contact.html");
  await expect(frame.locator("h1")).toHaveText("Contact");
});

test("projets du compte : création, enregistrement, conflit, versions, import et export ZIP, isolation", async ({ page, browser }) => {
  test.skip(await isDemoMode(page), "Supabase non configuré");
  await signUpStudent(page, "IDE Test");
  await page.goto("/ide");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });

  // Création d'un projet Python à partir d'un modèle
  await openSide(page, "Projets");
  await page.getByLabel("Nom du nouveau projet").fill("Gestion des notes");
  await page.getByLabel("Modèle du projet").selectOption("python");
  await page.getByRole("button", { name: "Créer", exact: true }).click();
  await expect(page).toHaveURL(/\/ide\?projet=[0-9a-f-]{36}/);
  const id = new URL(page.url()).searchParams.get("projet")!;
  await expect(page.getByTestId("ide-nom-projet")).toHaveText("Gestion des notes");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });

  // Modification puis enregistrement (Ctrl+S)
  await openSide(page, "Explorateur");
  await item(page, "outils.py").click();
  await setModel(page, "outils.py", 'def saluer(nom):\n    return f"Salut, {nom} !"\n');
  await expect(page.getByTestId("ide-statut")).toHaveText("Modifications non enregistrées");
  await page.keyboard.press("Control+s");
  await expect(page.getByTestId("ide-statut")).toHaveText("Enregistré");
  await expect(page.getByTestId("ide-barre-etat")).toContainText("rév. 2");

  // Rechargement : le contenu vient de la base
  await page.reload();
  const res = await page.request.get(`/api/projects/${id}`);
  expect((await res.json()).project.files.find((f: { path: string }) => f.path === "outils.py").content).toContain("Salut");

  // Conflit : un enregistrement fondé sur une ancienne révision est refusé
  const stale = await page.request.put(`/api/projects/${id}`, { data: { files: [{ path: "a.py", content: "" }], folders: [], baseRevision: 1 } });
  expect(stale.status()).toBe(409);
  expect((await stale.json()).server.revision).toBe(2);

  // Point de sauvegarde visible dans l'historique
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await openSide(page, "Historique des versions");
  await page.getByLabel("Nom du point de sauvegarde").fill("Avant les tests");
  await page.getByRole("button", { name: "Créer", exact: true }).click();
  await expect(page.getByTestId("ide-versions")).toContainText("Avant les tests");
  await expect(page.getByTestId("ide-versions")).toContainText("Création");

  // Export ZIP
  await openSide(page, "Explorateur");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Exporter le projet en ZIP" }).click()]);
  expect(download.suggestedFilename()).toBe("Gestion-des-notes.zip");

  // Import ZIP dans le projet (le dossier racine de l'archive est retiré)
  const zip = Buffer.from(zipSync({ "depot/tests/test_outils.py": strToU8("from outils import saluer\nassert saluer('A')\n") }));
  await page.getByTestId("ide-import-fichiers").setInputFiles({ name: "depot.zip", mimeType: "application/zip", buffer: zip });
  await expect(item(page, "tests/test_outils.py")).toBeVisible();

  // Isolation : un autre étudiant ne voit pas ce projet
  const other = await browser.newContext();
  const p2 = await other.newPage();
  await signUpStudent(p2, "Autre Étudiant");
  expect((await p2.request.get(`/api/projects/${id}`)).status()).toBe(404);
  expect((await p2.request.put(`/api/projects/${id}`, { data: { files: [], folders: [], baseRevision: 2, force: true } })).status()).toBe(404);
  await p2.goto(`/ide?projet=${id}`);
  await expect(p2.getByText("Projet introuvable.")).toBeVisible();
  await other.close();
});

test.describe("éditeur intelligent sur téléphone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  const value = (page: Page, file: string) =>
    page.evaluate((f) => (window as unknown as { monaco: { editor: { getModels(): Array<{ uri: { toString(): string }; getValue(): string }> } } }).monaco.editor.getModels().find((m) => m.uri.toString().endsWith(`/${f}`))!.getValue(), file);

  test("modèle de fichier, balises, clavier de programmation et pseudocode", async ({ page }) => {
    await page.goto("/ide");
    await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
    const clavier = page.getByTestId("ide-clavier");
    await expect(clavier).toBeVisible();

    // « accueil.html » : page complète créée automatiquement, curseur dans <title>.
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.getByRole("menuitem", { name: "Nouveau fichier…" }).click();
    await page.getByLabel("Nom du fichier").fill("accueil.html");
    await page.getByLabel("Nom du fichier").press("Enter");
    await expect.poll(() => value(page, "accueil.html")).toContain("<!DOCTYPE html>");
    await expect(page.getByTestId("ide-barre-etat")).toContainText("Ln 7, Col 10");
    await page.keyboard.type("Accueil");
    await expect.poll(() => value(page, "accueil.html")).toContain("<title>Accueil</title>");

    // Touches « div » puis « class » : <div class=""></div> ; « <p> » tapé → </p> ajouté.
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await clavier.getByRole("button", { name: "Bloc <div>" }).click();
    await clavier.getByRole("button", { name: "Attribut class" }).click();
    await page.keyboard.type("carte");
    await expect.poll(() => value(page, "accueil.html")).toContain('<div class="carte"></div>');
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await page.keyboard.type("<p>");
    await expect.poll(() => value(page, "accueil.html")).toContain("<p></p>");

    // Pseudocode : modèle valide, touche d'affectation « ← », symboles mathématiques (∈).
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.getByRole("menuitem", { name: "Nouveau fichier…" }).click();
    await page.getByLabel("Nom du fichier").fill("calcul.algo");
    await page.getByLabel("Nom du fichier").press("Enter");
    await expect.poll(() => value(page, "calcul.algo")).toContain("ALGORITHME calcul");
    await expect(page.getByTestId("ide-barre-etat")).toContainText("Ln 5, Col 3");
    await page.keyboard.type("x ");
    await clavier.getByRole("button", { name: "Affectation" }).click();
    await page.keyboard.type(" 3");
    await expect.poll(() => value(page, "calcul.algo")).toContain("DEBUT\n  x ← 3\nFIN");
    await clavier.getByRole("button", { name: /Symboles mathématiques/ }).click();
    await expect(page.getByTestId("ide-clavier-symboles").getByRole("button", { name: "∈", exact: true })).toBeVisible();
  });
});

test("Emmet : abréviation HTML développée par Tab", async ({ page }) => {
  await page.goto("/ide");
  await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
  await setModel(page, "index.html", "");
  await page.locator(".monaco-editor .view-lines").first().click();
  await page.keyboard.type("ul>li*2", { delay: 40 });
  await expect(page.locator(".suggest-widget.visible")).toContainText("Emmet");
  await page.keyboard.press("Tab");
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { monaco: { editor: { getModels(): Array<{ uri: { toString(): string }; getValue(): string }> } } }).monaco.editor.getModels().find((m) => m.uri.toString().endsWith("/index.html"))!.getValue()))
    .toMatch(/<ul>\s*<li><\/li>\s*<li><\/li>\s*<\/ul>/);
});

test.describe("copier-coller dans l'éditeur", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const value = (page: Page) => page.evaluate(() => (window as unknown as { monaco: { editor: { getEditors(): Array<{ getModel(): { getValue(): string } }> } } }).monaco.editor.getEditors()[0].getModel().getValue());

  test("Coller du menu du téléphone, boutons Tout / Copier / Couper / Coller et fenêtre de collage", async ({ page, context }) => {
    await page.goto("/ide");
    await page.locator(".monaco-editor").first().waitFor({ timeout: 60_000 });
    // « Coller » du menu du téléphone : événement paste natif sur la zone de saisie de l'éditeur.
    await page.locator(".monaco-editor .view-lines").first().click();
    await page.keyboard.press("Control+End");
    await page.evaluate(() => {
      const ta = document.querySelector(".monaco-editor textarea") as HTMLTextAreaElement;
      ta.focus();
      const dt = new DataTransfer();
      dt.setData("text/plain", "<!-- collage natif -->");
      ta.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
    });
    await expect.poll(() => value(page)).toContain("<!-- collage natif -->");

    // Sans accès direct au presse-papiers : fenêtre où coller avec l'appui long.
    const keys = page.getByTestId("ide-clavier-presse-papiers");
    await keys.getByRole("button", { name: "Coller" }).click();
    await page.getByTestId("zone-coller").fill("<p>collé à la main</p>");
    await page.getByRole("button", { name: "Insérer dans le fichier" }).click();
    await expect.poll(() => value(page)).toContain("<p>collé à la main</p>");

    // Avec accès : Tout + Copier, puis Coller.
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await keys.getByRole("button", { name: "Tout sélectionner" }).click();
    await keys.getByRole("button", { name: "Copier" }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("<!DOCTYPE html>");
    await page.evaluate(() => navigator.clipboard.writeText("<!-- depuis le presse-papiers -->"));
    await page.keyboard.press("Control+End");
    await keys.getByRole("button", { name: "Coller" }).click();
    await expect.poll(() => value(page)).toContain("<!-- depuis le presse-papiers -->");
  });
});
