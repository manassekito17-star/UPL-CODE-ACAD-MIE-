// SQL dans le navigateur grâce à sql.js : le vrai moteur SQLite compilé en
// WebAssembly. Chaque étudiant dispose de sa propre base, dans son propre
// navigateur : rien n'est exécuté sur le serveur de la plateforme.
// Attention : SQLite n'est pas MySQL ni PostgreSQL ; certaines syntaxes diffèrent
// (les messages d'aide le signalent quand c'est le cas).
const SQLJS_URL = "https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/";
const MAX_ROWS = 500;

let sqlPromise = null;
/** Base persistante du laboratoire SQL (mode « session »). */
let sessionDb = null;

function getSql() {
  if (!sqlPromise) {
    // Worker « classique » : sql-wasm.js est chargé par importScripts (aucun eval).
    importScripts(`${SQLJS_URL}sql-wasm.js`);
    sqlPromise = self.initSqlJs({ locateFile: (f) => `${SQLJS_URL}${f}` });
  }
  return sqlPromise;
}

const lineAt = (text, offset) => text.slice(0, offset).split("\n").length;

/** Position du premier caractère utile (après espaces et commentaires). */
function skipBlank(text, from) {
  let i = from;
  for (;;) {
    while (i < text.length && /\s/.test(text[i])) i++;
    if (text.startsWith("--", i)) {
      const n = text.indexOf("\n", i);
      i = n < 0 ? text.length : n + 1;
    } else if (text.startsWith("/*", i)) {
      const n = text.indexOf("*/", i + 2);
      i = n < 0 ? text.length : n + 2;
    } else return i;
  }
}

/** Explication en français des erreurs SQLite les plus courantes. */
function hintFor(message) {
  let m;
  if ((m = /no such table: (\S+)/i.exec(message))) return `La table « ${m[1]} » n'existe pas. Vérifiez son nom ou créez-la d'abord avec CREATE TABLE.`;
  if ((m = /no such column: (\S+)/i.exec(message))) return `La colonne « ${m[1]} » n'existe pas dans les tables utilisées. Vérifiez l'orthographe ou la table de la requête.`;
  if ((m = /table (\S+) already exists/i.exec(message))) return `La table « ${m[1]} » existe déjà. Utilisez CREATE TABLE IF NOT EXISTS ou supprimez-la avec DROP TABLE.`;
  if (/UNIQUE constraint failed/i.test(message)) return "Valeur en double : une contrainte UNIQUE ou une clé primaire interdit d'insérer deux fois la même valeur.";
  if (/NOT NULL constraint failed/i.test(message)) return "Une colonne déclarée NOT NULL n'a pas reçu de valeur.";
  if (/FOREIGN KEY constraint failed/i.test(message)) return "Clé étrangère invalide : la valeur ne correspond à aucune ligne de la table référencée (ou des lignes dépendent encore de celle-ci).";
  if (/CHECK constraint failed/i.test(message)) return "Une contrainte CHECK refuse cette valeur.";
  if (/near "AUTO_INCREMENT"/i.test(message)) return "AUTO_INCREMENT est la syntaxe de MySQL/MariaDB. Ce laboratoire utilise SQLite : écrivez « id INTEGER PRIMARY KEY AUTOINCREMENT » (ou simplement « INTEGER PRIMARY KEY »).";
  if (/near "(ENGINE|UNSIGNED|SERIAL|SHOW|DESCRIBE|USE)"/i.test(message)) return "Cette instruction est propre à MySQL ou PostgreSQL et n'existe pas dans SQLite, le moteur de ce laboratoire.";
  if (/incomplete input/i.test(message)) return "Requête incomplète : il manque probablement une parenthèse, une apostrophe fermante ou la fin de l'instruction.";
  if (/syntax error/i.test(message)) return "Erreur de syntaxe : vérifiez l'orthographe des mots-clés, les virgules entre les colonnes et les apostrophes autour des textes.";
  if (/(mismatch|datatype)/i.test(message)) return "Type de donnée incompatible avec la colonne.";
  return undefined;
}

/** Message en français pour une instruction sans résultat (CREATE, DROP…). */
function describe(text) {
  const m = /^\s*(CREATE|DROP|ALTER)\s+(?:UNIQUE\s+)?(TABLE|VIEW|INDEX|TRIGGER)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?["`[]?(\w+)/i.exec(text);
  if (m) {
    const [, verb, what, name] = m;
    const noun = { TABLE: "Table", VIEW: "Vue", INDEX: "Index", TRIGGER: "Déclencheur" }[what.toUpperCase()];
    const fem = what.toUpperCase() === "TABLE" || what.toUpperCase() === "VIEW";
    const done = { CREATE: "créé", DROP: "supprimé", ALTER: "modifié" }[verb.toUpperCase()];
    return `${noun} « ${name} » ${done}${fem ? "e" : ""}.`;
  }
  const verb = /^\s*(\w+)/.exec(text)?.[1]?.toUpperCase() ?? "";
  if (verb === "BEGIN") return "Transaction commencée.";
  if (verb === "COMMIT" || verb === "END") return "Transaction validée (COMMIT).";
  if (verb === "ROLLBACK") return "Transaction annulée (ROLLBACK).";
  return `${verb} exécuté.`;
}

/** Tableau texte lisible (utilisé pour la console et la correction automatique). */
function formatTable(columns, rows) {
  const cell = (v) => (v === null ? "NULL" : v instanceof Uint8Array ? `<blob ${v.length} octets>` : String(v));
  const data = rows.map((r) => r.map(cell));
  const widths = columns.map((c, i) => Math.max(c.length, ...data.map((r) => r[i].length)));
  const line = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join(" | ").trimEnd();
  const out = [line(columns), widths.map((w) => "-".repeat(w)).join("-+-")];
  for (const r of data) out.push(line(r));
  out.push(`(${rows.length} ligne${rows.length > 1 ? "s" : ""})`);
  return out.join("\n");
}

/** Structure de la base : tables, colonnes, clés et relations. */
function schemaOf(db) {
  const tables = [];
  const list = db.exec("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name");
  for (const [name, type] of list[0]?.values ?? []) {
    const q = String(name).replace(/"/g, '""');
    const cols = db.exec(`PRAGMA table_info("${q}")`)[0]?.values ?? [];
    const fks = db.exec(`PRAGMA foreign_key_list("${q}")`)[0]?.values ?? [];
    let count = null;
    try {
      count = db.exec(`SELECT COUNT(*) FROM "${q}"`)[0]?.values[0][0] ?? 0;
    } catch {
      /* vue invalide */
    }
    tables.push({
      name,
      type,
      rows: count,
      columns: cols.map(([, colName, colType, notnull, , pk]) => ({ name: colName, type: colType, notNull: Boolean(notnull), pk: Number(pk) > 0 })),
      // PRAGMA foreign_key_list : id, seq, table, from, to, ...
      foreignKeys: fks.map((f) => ({ from: f[3], table: f[2], to: f[4] })),
    });
  }
  return tables;
}

/** Exécute un script SQL instruction par instruction. */
function runScript(db, sql) {
  const results = [];
  const outputs = [];
  /** Journal ordonné : messages et numéros de tableaux de résultats. */
  const log = [];
  let changes = 0;
  const it = db.iterateStatements(sql);
  let consumed = 0;
  for (;;) {
    const start = skipBlank(sql, consumed);
    let stmt;
    try {
      const n = it.next();
      if (n.done) break;
      stmt = n.value;
    } catch (x) {
      return { results, outputs, log, changes, error: String(x?.message ?? x), line: lineAt(sql, start) };
    }
    consumed = sql.length - it.getRemainingSQL().length;
    const text = stmt.getSQL();
    try {
      const columns = stmt.getColumnNames();
      const rows = [];
      let truncated = false;
      while (stmt.step()) {
        if (rows.length < MAX_ROWS) rows.push(stmt.get());
        else truncated = true;
      }
      if (columns.length) {
        log.push({ table: results.length });
        results.push({ sql: text.trim(), columns, rows, truncated });
        outputs.push(formatTable(columns, rows) + (truncated ? `\n… affichage limité à ${MAX_ROWS} lignes` : ""));
      } else {
        const c = db.getRowsModified();
        changes += c;
        const verb = /^\s*(\w+)/.exec(text)?.[1]?.toUpperCase();
        if (verb && ["INSERT", "UPDATE", "DELETE", "REPLACE"].includes(verb)) {
          const msg = `${c} ligne${c > 1 ? "s" : ""} ${verb === "DELETE" ? "supprimée" : verb === "UPDATE" ? "modifiée" : "insérée"}${c > 1 ? "s" : ""}.`;
          outputs.push(msg);
          log.push({ message: msg });
        } else if (verb) {
          log.push({ message: describe(text) });
        }
      }
    } catch (x) {
      return { results, outputs, log, changes, error: String(x?.message ?? x), line: lineAt(sql, start) };
    } finally {
      stmt.free();
    }
  }
  return { results, outputs, log, changes };
}

self.onmessage = async (e) => {
  let SQL;
  try {
    self.postMessage({ type: "statut", message: "Chargement de SQLite…" });
    SQL = await getSql();
  } catch (x) {
    sqlPromise = null;
    console.error("[sql-worker]", x);
    self.postMessage({ type: "resultat", ok: false, stdout: "", stderr: "Impossible de charger le moteur SQL dans le navigateur (connexion Internet requise la première fois)." });
    return;
  }
  const d = e.data;
  if (d.warmup) return;
  // « session » : base conservée entre les requêtes (laboratoire SQL) ; sinon base neuve à chaque exécution.
  if (d.reset || (d.mode === "session" && !sessionDb)) {
    sessionDb?.close();
    sessionDb = new SQL.Database();
    sessionDb.exec("PRAGMA foreign_keys = ON");
  }
  const db = d.mode === "session" ? sessionDb : new SQL.Database();
  if (d.mode !== "session") db.exec("PRAGMA foreign_keys = ON");
  self.postMessage({ type: "debut" });
  const started = performance.now();
  try {
    if (d.setup) {
      const s = runScript(db, d.setup);
      if (s.error) {
        self.postMessage({ type: "resultat", ok: false, stdout: "", stderr: `Erreur dans les données de départ : ${s.error}`, timeMs: 0 });
        return;
      }
    }
    const files = d.files ?? [];
    const sql = d.sql ?? files[0]?.content ?? "";
    const r = runScript(db, sql);
    const version = db.exec("SELECT sqlite_version()")[0].values[0][0];
    // SQLite accepte certains mots de MySQL sans leur donner le même sens : on le signale.
    const notices = [];
    if (/AUTO_INCREMENT/i.test(sql)) notices.push("AUTO_INCREMENT est la syntaxe de MySQL/MariaDB : SQLite l'accepte comme simple nom de type, sans numérotation automatique. Écrivez « id INTEGER PRIMARY KEY AUTOINCREMENT ».");
    if (/\b(VARCHAR|CHAR)\s*\(\s*\d+\s*\)/i.test(sql)) notices.push("SQLite accepte VARCHAR(n) mais ne limite pas la longueur du texte (MySQL et PostgreSQL la limitent).");
    self.postMessage({
      type: "resultat",
      ok: !r.error,
      stdout: r.outputs.join("\n\n") + (r.outputs.length ? "\n" : ""),
      stderr: r.error ? `Erreur SQL (ligne ${r.line}) : ${r.error}` : "",
      errorLine: r.error ? r.line : undefined,
      hint: r.error ? hintFor(r.error) : notices.join("\n") || undefined,
      tables: r.results,
      log: r.log,
      changes: r.changes,
      schema: schemaOf(db),
      engineLabel: `SQLite ${version}`,
      timeMs: Math.round(performance.now() - started),
    });
  } finally {
    if (d.mode !== "session") db.close();
  }
};
