// Test de bout en bout de l'application RÉELLE (binaire Tauri + WebView + Rust + SQLite + disque).
// Pilotage par WebDriver via tauri-driver, sans dépendance npm : protocole W3C en HTTP.
//
// Prérequis (Linux) : `cargo install tauri-driver --locked`, paquet `webkit2gtk-driver`,
// un serveur X (xvfb-run en CI) et le binaire compilé (`pnpm build`).
// Usage : node tests/e2e/smoke.mjs [chemin/du/binaire]
// Captures d'écran facultatives : ZYNORA_E2E_SCREENSHOTS=dossier
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const root = resolve(import.meta.dirname, "../..");
const binary = resolve(process.argv[2] ?? join(root, "target/release/zynora-desktop"));
assert.ok(existsSync(binary), `binaire introuvable : ${binary} (lancer « pnpm build » d'abord)`);

const PORT = 4444;
const base = `http://127.0.0.1:${PORT}`;
const ELEMENT = "element-6066-11e4-a52e-4f735466cecf";

// Données isolées : la vraie base et les vrais documents de l'utilisateur ne sont jamais touchés.
const dataHome = mkdtempSync(join(tmpdir(), "zynora-e2e-"));
// Dossier « Documents » de l'utilisateur de test (spécification XDG user-dirs), avec une
// bibliothèque déjà remplie de fichiers réels.
const documents = join(dataHome, "Documents");
const library = join(documents, "ZYNORA");
writeFileSync(join(dataHome, "user-dirs.dirs"), `XDG_DOCUMENTS_DIR="${documents}"\n`);
mkdirSync(join(library, "Clients"), { recursive: true });
writeFileSync(join(library, "budget.csv"), "poste;montant\nloyer;800\n");
writeFileSync(join(library, "Clients", "devis.xlsx"), "PK\u0003\u0004");

const driver = spawn("tauri-driver", ["--port", String(PORT)], {
  env: { ...process.env, XDG_DATA_HOME: dataHome, XDG_CONFIG_HOME: dataHome },
  stdio: ["ignore", "inherit", "inherit"],
});

async function wd(method, path, body) {
  const response = await fetch(base + path, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(`${method} ${path} → ${response.status} ${JSON.stringify(json.value)}`);
  return json.value;
}

async function waitFor(fn, what, timeoutMs = 15_000) {
  const end = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < end) {
    try {
      const value = await fn();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await sleep(200);
  }
  throw new Error(`délai dépassé : ${what}${lastError ? ` (${lastError.message})` : ""}`);
}

async function openSession() {
  const session = await wd("POST", "/session", {
    capabilities: { alwaysMatch: { browserName: "wry", "tauri:options": { application: binary } } },
  });
  const id = session.sessionId;
  const s = (method, path, body) => wd(method, `/session/${id}${path}`, body);
  const findNow = (xpath) => s("POST", "/element", { using: "xpath", value: xpath }).then((e) => e[ELEMENT]);
  const find = (xpath) => waitFor(() => findNow(xpath), xpath);
  return {
    close: () => s("DELETE", ""),
    exec: (script) => s("POST", "/execute/sync", { script, args: [] }),
    find,
    click: async (xpath) => s("POST", `/element/${await find(xpath)}/click`, {}),
    type: async (xpath, text) => {
      const element = await find(xpath);
      await s("POST", `/element/${element}/clear`, {});
      await s("POST", `/element/${element}/value`, { text });
    },
    /** Frappe au clavier sans vider l'élément (zone éditable : `clear` y laisse un <br> parasite). */
    keys: async (xpath, text) => {
      const element = await find(xpath);
      await s("POST", `/element/${element}/click`, {});
      await s("POST", `/element/${element}/value`, { text });
    },
    waitText: (xpath, what) => waitFor(async () => (await s("GET", `/element/${await findNow(xpath)}/text`)) || false, what),
    screenshot: async (name) => {
      const dir = process.env.ZYNORA_E2E_SCREENSHOTS;
      if (!dir) return;
      mkdirSync(dir, { recursive: true });
      await sleep(800); // WebKitGTK peut capturer une image antérieure au dernier rendu.
      writeFileSync(join(dir, `${name}.png`), Buffer.from(await s("GET", "/screenshot"), "base64"));
    },
  };
}

const step = (name) => console.log(`  ✓ ${name}`);
const button = (label) => `//button[@aria-label=${JSON.stringify(label)} or normalize-space()=${JSON.stringify(label)}]`;
const navItem = (label) => `//aside//button[.//span[normalize-space()=${JSON.stringify(label)}]]`;
const trashDir = join(library, ".zynora", "corbeille");
const inTrash = (name) => existsSync(trashDir) && readdirSync(trashDir).some((slot) => existsSync(join(trashDir, slot, name)));
const isDark = (app) => async () => (await app.exec("return document.documentElement.dataset.theme")) === "dark";

let failed = false;
let app;
try {
  await waitFor(() => fetch(`${base}/status`).then((r) => r.ok), "démarrage de tauri-driver");

  console.log("Session 1 : premier lancement");
  app = await openSession();
  assert.equal(await app.waitText("//h1", "affichage de l'accueil"), "Bienvenue dans ZYNORA Office");
  step("l'accueil s'affiche (paramètres lus dans SQLite)");
  await app.waitText("//dd[contains(., '·')]", "informations système");
  step("les informations système viennent du backend Rust");
  await app.screenshot("1-accueil");

  // --- Bibliothèque : documents réellement présents sur le disque ---
  await app.click(navItem("Documents"));
  await app.waitText("//table//*[text()='budget.csv']", "liste de la bibliothèque");
  await app.click(button("Ouvrir Clients"));
  await app.waitText("//table//*[text()='devis.xlsx']", "contenu du dossier Clients");
  await app.click("//nav[@aria-label='Bibliothèque']/button");
  await app.waitText("//table//*[text()='budget.csv']", "retour à la racine");
  step("la bibliothèque liste et parcourt les dossiers du disque");

  await app.click(button("Nouveau dossier"));
  await app.type("//div[@role='dialog']//input", "Projets");
  await app.click("//div[@role='dialog']//button[normalize-space()='Créer']");
  await app.find(button("Ouvrir Projets"));
  assert.ok(statSync(join(library, "Projets")).isDirectory(), "dossier absent du disque");
  step("un dossier créé dans l'interface existe sur le disque");

  await app.click(button("Renommer budget.csv"));
  await app.type("//div[@role='dialog']//input", "Budget 2026.csv");
  await app.click("//div[@role='dialog']//button[normalize-space()='Renommer']");
  await app.waitText("//table//*[text()='Budget 2026.csv']", "document renommé");
  assert.ok(existsSync(join(library, "Budget 2026.csv")) && !existsSync(join(library, "budget.csv")), "renommage absent du disque");
  step("le renommage est appliqué sur le disque");

  await app.click(button("Ajouter Budget 2026.csv aux favoris"));
  await app.find(button("Retirer Budget 2026.csv des favoris"));
  await app.screenshot("2-documents");
  await app.click(navItem("Accueil"));
  await app.waitText("//div[h2[text()='Favoris']]//li//span[contains(., 'Budget 2026.csv')]", "favori sur l'accueil");
  step("le favori apparaît sur l'accueil");

  await app.click(navItem("Documents"));
  await app.click(button("Mettre Budget 2026.csv à la corbeille"));
  await app.waitText("//div[@role='status']//span[contains(., 'placé dans la corbeille')]", "notification de corbeille");
  assert.ok(!existsSync(join(library, "Budget 2026.csv")) && inTrash("Budget 2026.csv"), "le fichier doit être dans la corbeille interne");
  step("la mise à la corbeille déplace le fichier sans le supprimer");

  await app.click(navItem("Corbeille"));
  await app.waitText("//table//td[contains(., 'Budget 2026.csv')]", "élément dans la corbeille");
  await app.screenshot("3-corbeille");
  await app.click("//table//tr[contains(., 'Budget 2026.csv')]//button[normalize-space()='Restaurer']");
  await waitFor(() => existsSync(join(library, "Budget 2026.csv")), "restauration sur le disque");
  step("la restauration remet le fichier à son emplacement");

  await app.click(navItem("Documents"));
  await app.click(button("Mettre Projets à la corbeille"));
  await waitFor(() => inTrash("Projets"), "dossier dans la corbeille");
  await app.click(navItem("Corbeille"));
  await app.click("//table//tr[contains(., 'Projets')]//button[normalize-space()='Supprimer définitivement']");
  await app.find("//div[@role='alertdialog']");
  await app.screenshot("4-confirmation");
  assert.ok(inTrash("Projets"), "rien ne doit être supprimé avant confirmation");
  await app.click("//div[@role='alertdialog']//button[normalize-space()='Supprimer définitivement']");
  await app.waitText("//p[text()='La corbeille est vide.']", "corbeille vide");
  assert.ok(!inTrash("Projets") && !existsSync(join(library, "Projets")), "suppression définitive non effectuée");
  step("la suppression définitive n'a lieu qu'après confirmation");

  // --- ZYNORA Sheets : saisie, calcul par le moteur, mise en forme, enregistrement ---
  const ENTER = "\uE007";
  const cell = (row, column) => `//div[@id='cell-${row}-${column}']`;
  // Lecture directe du DOM : la recherche XPath par text() n'est pas fiable sous WebKitWebDriver.
  const cellText = (row, column) => app.exec(`return document.getElementById('cell-${row}-${column}')?.textContent ?? null`);
  const waitCell = (row, column, expected, what) => waitFor(async () => (await cellText(row, column)) === expected, what);
  const typeInCell = async (row, column, text) => {
    await app.click(cell(row, column));
    await app.type("//input[@id='formula-input']", text + ENTER);
  };
  await app.click(navItem("Accueil"));
  await app.click("//section//button[normalize-space()='Nouveau classeur']");
  await waitFor(async () => (await app.exec("return document.querySelector('h1')?.textContent")) === "Classeur.xlsx", "ouverture du nouveau classeur");
  assert.ok(existsSync(join(library, "Classeur.xlsx")), "le nouveau classeur est créé dans la bibliothèque");
  step("un nouveau classeur est créé dans la bibliothèque et ouvert");

  await typeInCell(1, 1, "10");
  await typeInCell(2, 1, "32,5");
  await typeInCell(3, 1, "=SOMME(A1:A2)");
  await typeInCell(1, 2, "=A1/0");
  await waitCell(3, 1, "42,5", "résultat de la formule");
  await waitCell(1, 2, "#DIV/0!", "erreur de calcul");
  step("les formules sont calculées par le moteur (SOMME, #DIV/0!)");

  await app.click(cell(3, 1));
  await waitFor(async () => (await app.exec("return document.getElementById('formula-input').value")) === "=SOMME(A1:A2)", "formule dans la barre");
  await app.click(button("Gras"));
  await waitFor(async () => (await app.exec("return getComputedStyle(document.getElementById('cell-3-1')).fontWeight")) === "700", "gras appliqué");
  step("la barre de formule montre la formule ; le gras est appliqué");
  // Onglet Données : tri décroissant de A1:A2 (sélection par la zone de nom), calcul conservé.
  await app.type("//input[@id='name-box']", "A1:A2" + ENTER);
  await app.click("//button[@role='tab' and normalize-space()='Données']");
  await app.click(button("Trier de Z à A"));
  await waitCell(1, 1, "32,5", "tri décroissant");
  await waitCell(2, 1, "10", "tri décroissant (2)");
  await waitCell(3, 1, "42,5", "somme inchangée après tri");
  step("le tri de l'onglet Données réordonne les valeurs (moteur réel)");

  // Onglet Accueil : bordures sur A3.
  await app.click("//button[@role='tab' and normalize-space()='Accueil']");
  await app.click(cell(3, 1));
  await app.click("//button[@aria-label='Bordures']");
  await app.click("//button[@role='menuitem' and normalize-space()='Toutes les bordures']");
  await waitFor(async () => (await app.exec("return getComputedStyle(document.getElementById('cell-3-1')).borderTopWidth")) === "1px", "bordure affichée");
  step("les bordures du groupe Police sont appliquées et affichées");

  await app.screenshot("6-sheets");

  await app.click("//header//button[normalize-space()='Enregistrer']");
  await waitFor(async () => (await app.exec("return document.querySelector('.sheets__status')?.textContent")) === "Enregistré", "enregistrement");
  await app.click(button("Retour à la bibliothèque"));
  await app.click(navItem("Documents"));
  await app.click(button("Ouvrir Classeur.xlsx"));
  await waitCell(3, 1, "42,5", "valeur après réouverture");
  await waitFor(async () => (await app.exec("return getComputedStyle(document.getElementById('cell-3-1')).fontWeight")) === "700", "gras conservé");
  step("le classeur enregistré en XLSX se rouvre avec ses formules et sa mise en forme");
  await app.click(button("Retour à la bibliothèque"));

  // --- ZYNORA Word : saisie, mise en forme, enregistrement DOCX, copie en texte brut ---
  const editorText = () => app.exec("return document.querySelector('.word-editor')?.textContent ?? null");
  await app.click(navItem("Accueil"));
  await app.click("//section//button[normalize-space()='Nouveau document']");
  await waitFor(async () => (await app.exec("return document.querySelector('h1')?.textContent")) === "Document.docx", "ouverture du nouveau document");
  assert.ok(existsSync(join(library, "Document.docx")), "le nouveau document est créé dans la bibliothèque");
  await app.keys("//div[contains(@class,'word-editor')]", "Rapport annuel");
  await waitFor(async () => (await editorText()) === "Rapport annuel", "texte saisi dans l'éditeur");
  step("un nouveau document est créé et le texte saisi s'affiche");

  await app.click(button("Sélectionner tout"));
  await app.click("//button[@role='option' and normalize-space()='Titre 1']");
  await app.click(button("Gras (Ctrl+G)"));
  await waitFor(async () => (await app.exec("return document.querySelector('.word-editor h1 strong')?.textContent")) === "Rapport annuel", "titre en gras");
  await app.click("//button[@role='tab' and normalize-space()='Mise en page']");
  await app.click("//button[normalize-space()='Orientation']");
  await app.click("//button[@role='menuitem' and contains(., 'Paysage')]");
  await waitFor(async () => (await app.exec("return document.querySelector('.word__page').style.width")) === "297mm", "page en paysage");
  step("style Titre 1, gras et orientation paysage appliqués depuis le ruban");
  await app.screenshot("7-word");

  await app.click("//header//button[normalize-space()='Enregistrer']");
  await waitFor(async () => (await app.exec("return document.querySelector('.sheets__status')?.textContent")) === "Enregistré", "enregistrement du document");
  await app.click(button("Retour à la bibliothèque"));
  await app.click(navItem("Documents"));
  await app.click(button("Ouvrir Document.docx"));
  await waitFor(async () => (await app.exec("return document.querySelector('.word-editor h1 strong')?.textContent")) === "Rapport annuel", "titre après réouverture");
  assert.equal(await app.exec("return document.querySelector('.word__page').style.width"), "297mm");
  step("le document enregistré en DOCX se rouvre avec son style, son gras et sa mise en page");

  await app.click(button("Exporter en texte brut (.txt)"));
  await waitFor(() => existsSync(join(library, "Document.txt")), "export texte sur le disque");
  assert.equal(readFileSync(join(library, "Document.txt"), "utf8"), "Rapport annuel\n");
  step("l'export en texte brut écrit un nouveau fichier sans toucher au DOCX");
  await app.click(button("Retour à la bibliothèque"));

  // --- Paramètres et journal ---
  await app.click(navItem("Paramètres"));
  await app.click("//button[@role='radio' and normalize-space()='Sombre']");
  await waitFor(isDark(app), "thème sombre");
  step("le thème sombre est appliqué");
  await app.waitText("//ul[@class='journal']//span[text()='theme=dark']", "journal");
  await app.find("//ul[@class='journal']//code[text()='trash.purge']");
  await app.find("//ul[@class='journal']//code[text()='document.rename']");
  step("les opérations sur les fichiers et les paramètres sont journalisées");
  await app.screenshot("5-parametres-sombre");
  await app.close();

  assert.ok(existsSync(join(dataHome, "app.zynora.office", "zynora.db")), "base SQLite absente du dossier de données");
  step("la base locale est créée dans le dossier de données de l'utilisateur");

  // Simulation d'un arrêt brutal : le verrou de session reste en place.
  writeFileSync(join(dataHome, "app.zynora.office", "session.lock"), "0");

  console.log("Session 2 : relance après un arrêt brutal");
  app = await openSession();
  await app.waitText("//h1", "accueil après relance");
  await waitFor(isDark(app), "thème conservé");
  step("le thème choisi est conservé après relance");
  await app.waitText(`//strong[text()="La dernière session s'est interrompue"]`, "avertissement d'incident");
  step("l'interruption de la session précédente est détectée et signalée");
  await app.click(navItem("Documents"));
  await app.waitText("//table//*[text()='Budget 2026.csv']", "bibliothèque après relance");
  step("la bibliothèque est intacte après relance");
  await app.close();
} catch (error) {
  failed = true;
  console.error(`\n✗ ${error.stack ?? error}`);
  await app?.screenshot("echec").catch(() => undefined);
} finally {
  driver.kill();
  rmSync(dataHome, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
