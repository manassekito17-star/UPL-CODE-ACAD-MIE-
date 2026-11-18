// Test de bout en bout de l'application RÉELLE (binaire Tauri + WebView + Rust + SQLite).
// Pilotage par WebDriver via tauri-driver, sans dépendance npm : protocole W3C en HTTP.
//
// Prérequis (Linux) : `cargo install tauri-driver --locked`, paquet `webkit2gtk-driver`,
// un serveur X (xvfb-run en CI) et le binaire compilé (`pnpm build`).
// Usage : node tests/e2e/smoke.mjs [chemin/du/binaire]
// Captures d'écran facultatives : ZYNORA_E2E_SCREENSHOTS=dossier
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import assert from "node:assert/strict";

const root = resolve(import.meta.dirname, "../..");
const binary = resolve(process.argv[2] ?? join(root, "target/release/zynora-desktop"));
assert.ok(existsSync(binary), `binaire introuvable : ${binary} (lancer « pnpm build » d'abord)`);

const PORT = 4444;
const base = `http://127.0.0.1:${PORT}`;
const ELEMENT = "element-6066-11e4-a52e-4f735466cecf";

// Données isolées : la vraie base de l'utilisateur n'est jamais touchée.
const dataHome = mkdtempSync(join(tmpdir(), "zynora-e2e-"));
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
  const find = (xpath) => s("POST", "/element", { using: "xpath", value: xpath }).then((e) => e[ELEMENT]);
  return {
    close: () => s("DELETE", ""),
    exec: (script) => s("POST", "/execute/sync", { script, args: [] }),
    text: async (xpath) => s("GET", `/element/${await find(xpath)}/text`),
    click: async (xpath) => s("POST", `/element/${await find(xpath)}/click`, {}),
    screenshot: async (name) => {
      const dir = process.env.ZYNORA_E2E_SCREENSHOTS;
      if (!dir) return;
      mkdirSync(dir, { recursive: true });
      await sleep(800); // WebKitGTK peut capturer une image antérieure au dernier rendu.
      writeFileSync(join(dir, `${name}.png`), Buffer.from(await s("GET", "/screenshot"), "base64"));
    },
    waitText: (xpath, what) => waitFor(async () => (await s("GET", `/element/${await find(xpath)}/text`)) || false, what),
  };
}

const step = (name) => console.log(`  ✓ ${name}`);
let failed = false;
try {
  await waitFor(() => fetch(`${base}/status`).then((r) => r.ok), "démarrage de tauri-driver");

  console.log("Session 1 : premier lancement");
  let app = await openSession();
  const title = await app.waitText("//h1", "affichage de l'accueil");
  assert.equal(title, "Bienvenue dans ZYNORA Office");
  step("l'accueil s'affiche (paramètres lus dans SQLite)");
  await app.waitText("//dd[contains(., '·')]", "informations système");
  step("les informations système viennent du backend Rust");
  await app.screenshot("1-accueil-clair");

  await app.click("//button[.//span[normalize-space()='Paramètres']]");
  await app.click("//button[@role='radio' and normalize-space()='Sombre']");
  await waitFor(async () => (await app.exec("return document.documentElement.dataset.theme")) === "dark", "thème sombre");
  step("le thème sombre est appliqué");
  await app.waitText("//ul[@class='journal']//span[text()='theme=dark']", "journal");
  step("le changement est inscrit au journal");
  await app.screenshot("2-parametres-sombre");
  await app.close();

  assert.ok(existsSync(join(dataHome, "app.zynora.office", "zynora.db")), "base SQLite absente du dossier de données");
  step("la base locale est créée dans le dossier de données de l'utilisateur");

  console.log("Session 2 : relance de l'application");
  app = await openSession();
  await app.waitText("//h1", "accueil après relance");
  await waitFor(async () => (await app.exec("return document.documentElement.dataset.theme")) === "dark", "thème conservé");
  step("le thème choisi est conservé après relance");
  await app.close();
} catch (error) {
  failed = true;
  console.error(`\n✗ ${error.stack ?? error}`);
} finally {
  driver.kill();
  rmSync(dataHome, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
