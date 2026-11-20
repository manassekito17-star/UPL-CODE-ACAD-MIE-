import type { SourceFile } from "./types";

/**
 * Aperçu des projets web (module sans dépendance, utilisable dans le
 * navigateur) : les fichiers sont assemblés en un document affiché dans un
 * <iframe sandbox="allow-scripts"> (origine opaque : aucun accès aux
 * cookies ni à la page de la plateforme) avec une politique CSP qui
 * interdit toute connexion réseau.
 */

export const PREVIEW_CSP =
  "default-src 'none'; img-src data: blob: https:; media-src data: https:; style-src 'unsafe-inline'; font-src data:; script-src 'unsafe-inline'; connect-src 'none'; form-action 'none'; base-uri 'none'";

/** Relais de la console de l'aperçu vers l'éditeur (postMessage). */
const CONSOLE_BRIDGE = `<script>(function(){var send=function(level,args){try{parent.postMessage({source:"upl-apercu",level:level,text:Array.prototype.map.call(args,function(a){try{return typeof a==="object"?JSON.stringify(a):String(a)}catch(e){return String(a)}}).join(" ")},"*")}catch(e){}};["log","info","warn","error"].forEach(function(l){var o=console[l];console[l]=function(){send(l,arguments);o&&o.apply(console,arguments)}});window.addEventListener("error",function(e){send("error",[e.message+(e.lineno?" (ligne "+e.lineno+")":"")])});})();</script>`;

/**
 * Stockage de l'aperçu (localStorage / sessionStorage) : l'aperçu n'a pas d'origine propre
 * (bac à sable), le vrai localStorage y est donc interdit et une page qui l'utilise s'arrêtait
 * sur une erreur. On fournit le même objet, gardé dans l'onglet de l'éditeur : les données
 * restent quand l'aperçu se recharge (à chaque modification du code), comme sur un vrai site.
 */
type StorageArea = "local" | "session";
const previewStorage: Record<StorageArea, Record<string, string>> = { local: {}, session: {} };
const STORAGE_LIMIT = 1_000_000;

/** Modification envoyée par l'aperçu (postMessage) : appliquée au stockage de l'onglet. */
export function applyPreviewStorage(change: unknown) {
  const c = change as { area?: unknown; key?: unknown; value?: unknown } | null;
  if (!c || (c.area !== "local" && c.area !== "session") || typeof c.key !== "string") return;
  const area = previewStorage[c.area];
  if (c.value === null) {
    delete area[c.key];
    return;
  }
  if (typeof c.value !== "string") return;
  const size = Object.entries(area).reduce((n, [k, v]) => n + k.length + v.length, 0);
  if (size + c.key.length + c.value.length > STORAGE_LIMIT) return;
  area[c.key] = c.value;
}

/** Vide le stockage de l'aperçu (tests, changement de projet). */
export function clearPreviewStorage() {
  previewStorage.local = {};
  previewStorage.session = {};
}

const storageBridge = () =>
  `<script>(function(){var init=${JSON.stringify(previewStorage).replace(/</g, "\\u003c")};function sync(a,k,v){try{parent.postMessage({source:"upl-apercu",storage:{area:a,key:k,value:v}},"*")}catch(e){}}function mk(a){var d=init[a]||{};var api={getItem:function(k){k=String(k);return Object.prototype.hasOwnProperty.call(d,k)?d[k]:null},setItem:function(k,v){k=String(k);d[k]=String(v);sync(a,k,d[k])},removeItem:function(k){k=String(k);delete d[k];sync(a,k,null)},clear:function(){Object.keys(d).forEach(function(k){delete d[k];sync(a,k,null)})},key:function(i){return Object.keys(d)[i]||null}};Object.defineProperty(api,"length",{get:function(){return Object.keys(d).length}});return api}var ok=true;try{window.localStorage.getItem("_")}catch(e){ok=false}if(!ok){try{Object.defineProperty(window,"localStorage",{value:mk("local"),configurable:true});Object.defineProperty(window,"sessionStorage",{value:mk("session"),configurable:true})}catch(e){}}})();</script>`;

/**
 * Formulaire envoyé sans être géré par le script de la page : dans l'aperçu, l'envoi vers un serveur
 * est impossible (bac à sable). On l'annule et on affiche les champs envoyés dans la console.
 */
const FORM_BRIDGE = `<script>window.addEventListener("submit",function(e){if(e.defaultPrevented)return;e.preventDefault();var f=e.target,o={};try{new FormData(f).forEach(function(v,k){o[k]=typeof v==="string"?v:"(fichier)"})}catch(x){}console.info("Formulaire envoyé (aperçu, aucun serveur) : "+JSON.stringify(o))});</script>`;

const missing = (kind: string, name: string) =>
  `<script>console.warn(${JSON.stringify(`${kind} introuvable dans le projet : ${name} (vérifiez le nom et le dossier du fichier).`).replace(/</g, "\\u003c")})</script>`;

const escapeForScript = (s: string) => s.replace(/<\/script/gi, "<\\/script");
const escapeForStyle = (s: string) => s.replace(/<\/style/gi, "<\\/style");

export function fileByName(files: SourceFile[], name: string): SourceFile | undefined {
  const clean = name.replace(/^\.\//, "").split(/[?#]/)[0];
  return files.find((f) => f.name === clean);
}

/** Document HTML principal du projet (index.html, sinon le premier fichier .html). */
export function mainHtml(files: SourceFile[]): SourceFile | undefined {
  return files.find((f) => f.name === "index.html") ?? files.find((f) => f.name.endsWith(".html"));
}

/** Assemble les fichiers en un document autonome pour l'aperçu. */
export function buildPreviewDocument(files: SourceFile[]): string {
  const main = mainHtml(files);
  let html = main?.content ?? "<p>Aucun fichier index.html.</p>";
  // <link rel="stylesheet" href="style.css"> → <style> en ligne
  html = html.replace(/<link\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi, (tag, href: string) => {
    if (!/rel\s*=\s*["']?stylesheet/i.test(tag)) return tag;
    const f = fileByName(files, href);
    if (f) return `<style data-fichier="${f.name}">\n${escapeForStyle(f.content)}\n</style>`;
    return /^(https?:)?\/\//i.test(href) ? tag : missing("Feuille de style", href);
  });
  // <script src="script.js"></script> → <script> en ligne
  html = html.replace(/<script\b([^>]*)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (tag, _a, src: string) => {
    const f = fileByName(files, src);
    if (f) return `<script data-fichier="${f.name}">\n${escapeForScript(f.content)}\n</script>`;
    return /^(https?:)?\/\//i.test(src) ? tag : missing("Script", src);
  });
  const head = `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">${CONSOLE_BRIDGE}${storageBridge()}${FORM_BRIDGE}`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => `${m}${head}`);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (m) => `${m}<head>${head}</head>`);
  return `<!DOCTYPE html><html><head>${head}</head><body>${html}</body></html>`;
}
