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
    return f ? `<style data-fichier="${f.name}">\n${escapeForStyle(f.content)}\n</style>` : tag;
  });
  // <script src="script.js"></script> → <script> en ligne
  html = html.replace(/<script\b([^>]*)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (tag, _a, src: string) => {
    const f = fileByName(files, src);
    return f ? `<script data-fichier="${f.name}">\n${escapeForScript(f.content)}\n</script>` : tag;
  });
  const head = `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">${CONSOLE_BRIDGE}`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => `${m}${head}`);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (m) => `${m}<head>${head}</head>`);
  return `<!DOCTYPE html><html><head>${head}</head><body>${html}</body></html>`;
}
