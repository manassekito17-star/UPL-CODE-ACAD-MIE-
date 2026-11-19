// Vérifie le site exporté (dossier out/) : pages présentes, liens de téléchargement et ressources.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { test } from "node:test";

const out = resolve(import.meta.dirname, "../out");
const files = [
  "ZYNORA-Office-Windows-x64-setup.exe",
  "ZYNORA-Office-Windows-x64.msi",
  "ZYNORA-Office-macOS-AppleSilicon.dmg",
  "ZYNORA-Office-Linux-x86_64.AppImage",
  "ZYNORA-Office-Linux-amd64.deb",
  "ZYNORA-Office-Linux-x86_64.rpm",
  "ZYNORA-Office-Android-arm64-test.apk",
];

test("le site est exporté (lancer « pnpm build » avant)", () => {
  assert.ok(existsSync(join(out, "index.html")), "out/index.html absent");
  assert.ok(existsSync(join(out, "telecharger", "index.html")), "out/telecharger/index.html absent");
  assert.ok(existsSync(join(out, "zynora.svg")) && existsSync(join(out, "icon.png")));
});

test("la page de téléchargement pointe vers chaque installateur de la version publiée", () => {
  const html = readFileSync(join(out, "telecharger", "index.html"), "utf8");
  for (const f of files) {
    assert.ok(html.includes(`/releases/download/zynora-office-preview/${f}`), `lien manquant : ${f}`);
  }
  assert.match(html, /<html lang="fr">/);
});

test("l'accueil présente le tableur et ce qui reste à venir", () => {
  const html = readFileSync(join(out, "index.html"), "utf8");
  assert.match(html, /ZYNORA Sheets/);
  assert.match(html, /ZYNORA Word/);
  assert.match(html, /Télécharger gratuitement/);
});
