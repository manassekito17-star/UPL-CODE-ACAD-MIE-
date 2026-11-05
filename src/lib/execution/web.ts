import type { WebCheck } from "@/content/types";
import type { SourceFile } from "./types";

/**
 * Projets web (HTML / CSS / JavaScript).
 *
 * - Aperçu : les fichiers sont assemblés en un document affiché dans un
 *   <iframe sandbox="allow-scripts"> (origine opaque : aucun accès aux
 *   cookies ni à la page de la plateforme) avec une politique CSP qui
 *   interdit toute connexion réseau.
 * - Correction : le document est analysé côté serveur (linkedom, css-tree)
 *   sans jamais exécuter le JavaScript de l'étudiant.
 */

const CSP =
  "default-src 'none'; img-src data: blob: https:; media-src data: https:; style-src 'unsafe-inline'; font-src data:; script-src 'unsafe-inline'; connect-src 'none'; form-action 'none'; base-uri 'none'";

/** Relais de la console de l'aperçu vers l'éditeur (postMessage). */
const CONSOLE_BRIDGE = `<script>(function(){var send=function(level,args){try{parent.postMessage({source:"upl-apercu",level:level,text:Array.prototype.map.call(args,function(a){try{return typeof a==="object"?JSON.stringify(a):String(a)}catch(e){return String(a)}}).join(" ")},"*")}catch(e){}};["log","info","warn","error"].forEach(function(l){var o=console[l];console[l]=function(){send(l,arguments);o&&o.apply(console,arguments)}});window.addEventListener("error",function(e){send("error",[e.message+(e.lineno?" (ligne "+e.lineno+")":"")])});})();</script>`;

const escapeForScript = (s: string) => s.replace(/<\/script/gi, "<\\/script");
const escapeForStyle = (s: string) => s.replace(/<\/style/gi, "<\\/style");

function fileByName(files: SourceFile[], name: string): SourceFile | undefined {
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
  const head = `<meta http-equiv="Content-Security-Policy" content="${CSP}">${CONSOLE_BRIDGE}`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => `${m}${head}`);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (m) => `${m}<head>${head}</head>`);
  return `<!DOCTYPE html><html><head>${head}</head><body>${html}</body></html>`;
}

// ---------- Analyse CSS ----------

export interface CssRule {
  selectors: string[];
  declarations: Map<string, string>;
}

export const normalizeSelector = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s*([>+~,])\s*/g, "$1")
    .replace(/\s+/g, " ");

export const normalizeValue = (v: string) =>
  v
    .trim()
    .toLowerCase()
    .replace(/\s*!important$/, "")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s+/g, " ")
    .replace(/["']/g, "");

/** Règles CSS de style.css (et des autres fichiers .css) et des balises <style>. */
export async function extractCssRules(files: SourceFile[], styleBlocks: string[]): Promise<CssRule[]> {
  const csstree = await import("css-tree");
  const sources = [...files.filter((f) => f.name.endsWith(".css")).map((f) => f.content), ...styleBlocks];
  const rules: CssRule[] = [];
  for (const src of sources) {
    const ast = csstree.parse(src, { parseValue: false, onParseError: () => undefined });
    csstree.walk(ast, {
      visit: "Rule",
      enter(node) {
        const selectors = csstree.generate(node.prelude).split(",").map(normalizeSelector);
        const declarations = new Map<string, string>();
        csstree.walk(node.block, {
          visit: "Declaration",
          enter(d) {
            declarations.set(d.property.toLowerCase(), normalizeValue(csstree.generate(d.value)));
          },
        });
        rules.push({ selectors, declarations });
      },
    });
  }
  return rules;
}

// ---------- Vérifications ----------

export interface CheckResult {
  passed: boolean;
  message: string;
  detail?: string;
}

type Doc = { querySelectorAll(s: string): ArrayLike<{ textContent: string | null; getAttribute(n: string): string | null }> };

export function evaluateCheck(check: WebCheck, doc: Doc, rules: CssRule[]): CheckResult {
  const fail = (detail: string): CheckResult => ({ passed: false, message: check.message, detail });
  const ok: CheckResult = { passed: true, message: check.message };
  if (check.type === "css") {
    const target = normalizeSelector(check.selector);
    let value: string | undefined;
    for (const r of rules) if (r.selectors.includes(target) && r.declarations.has(check.property)) value = r.declarations.get(check.property);
    if (value === undefined) return fail(`aucune règle « ${check.selector} { ${check.property}: … } » trouvée`);
    const expected = [...(check.equals ? [check.equals] : []), ...(check.oneOf ?? [])].map(normalizeValue);
    if (expected.length && !expected.includes(value)) return fail(`valeur trouvée : ${value}`);
    return ok;
  }
  let nodes: ReturnType<Doc["querySelectorAll"]>;
  try {
    nodes = doc.querySelectorAll(check.selector);
  } catch {
    return fail("sélecteur de vérification invalide");
  }
  const list = Array.from(nodes);
  if (check.type === "element") {
    const min = check.min ?? 1;
    if (list.length < min) return fail(`${list.length} élément(s) trouvé(s), au moins ${min} attendu(s)`);
    if (check.max !== undefined && list.length > check.max) return fail(`${list.length} élément(s) trouvé(s), au plus ${check.max} attendu(s)`);
    return ok;
  }
  if (!list.length) return fail(`aucun élément « ${check.selector} »`);
  if (check.type === "text") {
    const norm = (t: string | null) => (t ?? "").replace(/\s+/g, " ").trim();
    const texts = list.map((n) => norm(n.textContent));
    if (check.equals !== undefined && !texts.some((t) => t === check.equals)) return fail(`texte trouvé : « ${texts[0]} »`);
    if (check.contains !== undefined && !texts.some((t) => t.toLowerCase().includes(check.contains!.toLowerCase()))) return fail(`texte trouvé : « ${texts[0]} »`);
    return ok;
  }
  // attribute
  const values = list.map((n) => n.getAttribute(check.name));
  if (values.every((v) => v === null)) return fail(`attribut « ${check.name} » absent`);
  if (check.equals !== undefined && !values.some((v) => (v ?? "").trim() === check.equals)) return fail(`valeur : « ${values.find((v) => v !== null)} »`);
  if (check.contains !== undefined && !values.some((v) => (v ?? "").toLowerCase().includes(check.contains!.toLowerCase()))) return fail(`valeur : « ${values.find((v) => v !== null)} »`);
  return ok;
}

/** Évalue toutes les vérifications sur les fichiers d'un projet web. */
export async function checkWebProject(files: SourceFile[], checks: WebCheck[]): Promise<CheckResult[]> {
  const { parseHTML } = await import("linkedom");
  const main = mainHtml(files);
  const { document } = parseHTML(main?.content ?? "");
  const styleBlocks = Array.from(document.querySelectorAll("style")).map((s) => s.textContent ?? "");
  const rules = await extractCssRules(files, styleBlocks);
  return checks.map((c) => evaluateCheck(c, document as unknown as Doc, rules));
}
