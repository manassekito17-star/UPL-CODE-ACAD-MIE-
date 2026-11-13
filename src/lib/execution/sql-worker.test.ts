import { describe, expect, it } from "vitest";
import { runSqlWorker } from "./sql-worker-harness";

const BASE = `CREATE TABLE etudiants (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, postnom TEXT, age INTEGER, filiere TEXT);
INSERT INTO etudiants (nom, postnom, age, filiere) VALUES ('Kito', 'Manasse', 23, 'Informatique'), ('Mbuyi', 'Grace', 19, 'Droit');`;

describe("moteur SQL du navigateur (sql.js, fichier public/workers/sql-worker.js)", () => {
  it("exécute un script complet et formate les résultats en tableau", async () => {
    const r = await runSqlWorker({ files: [{ name: "requetes.sql", content: `${BASE}\nSELECT nom, age FROM etudiants WHERE age > 20;` }] });
    expect(r.ok).toBe(true);
    expect(r.engineLabel).toMatch(/^SQLite 3\./);
    expect(r.stdout).toBe("2 lignes insérées.\n\nnom  | age\n-----+----\nKito | 23\n(1 ligne)\n");
    expect(r.tables).toEqual([{ sql: "SELECT nom, age FROM etudiants WHERE age > 20;", columns: ["nom", "age"], rows: [["Kito", 23]], truncated: false }]);
    expect(r.log?.map((l) => l.message ?? `tableau ${l.table}`)).toEqual(["Table « etudiants » créée.", "2 lignes insérées.", "tableau 0"]);
    expect(r.schema?.[0].name).toBe("etudiants");
  });

  it("base neuve à chaque exécution, données de départ fournies à part", async () => {
    const r = await runSqlWorker({ files: [{ name: "q.sql", content: "SELECT COUNT(*) AS n FROM etudiants;" }], setup: BASE });
    expect(r.stdout).toContain("2\n(1 ligne)");
    const again = await runSqlWorker({ files: [{ name: "q.sql", content: "SELECT COUNT(*) AS n FROM etudiants;" }] });
    expect(again.ok).toBe(false);
    expect(again.stderr).toBe("Erreur SQL (ligne 1) : no such table: etudiants");
    expect(again.hint).toMatch(/La table « etudiants » n'existe pas/);
  });

  it("indique la ligne de l'instruction fautive et explique l'erreur", async () => {
    const r = await runSqlWorker({ files: [{ name: "q.sql", content: "CREATE TABLE t (id INTEGER PRIMARY KEY, nom TEXT NOT NULL);\n\nINSERT INTO t (nom) VALUES (NULL);" }] });
    expect(r.errorLine).toBe(3);
    expect(r.hint).toMatch(/NOT NULL/);
  });

  it("applique les clés étrangères et signale les syntaxes propres à MySQL", async () => {
    const fk = await runSqlWorker({
      files: [{ name: "q.sql", content: "CREATE TABLE f (id INTEGER PRIMARY KEY);\nCREATE TABLE e (id INTEGER PRIMARY KEY, f_id INTEGER REFERENCES f (id));\nINSERT INTO e (f_id) VALUES (99);" }],
    });
    expect(fk.ok).toBe(false);
    expect(fk.hint).toMatch(/Clé étrangère invalide/);
    const my = await runSqlWorker({ files: [{ name: "q.sql", content: "CREATE TABLE t (id INT AUTO_INCREMENT PRIMARY KEY, nom VARCHAR(20));" }] });
    expect(my.ok).toBe(true);
    expect(my.hint).toMatch(/AUTO_INCREMENT est la syntaxe de MySQL/);
  });

  it("transactions : ROLLBACK annule les modifications", async () => {
    const r = await runSqlWorker({
      files: [{ name: "q.sql", content: `${BASE}\nBEGIN;\nDELETE FROM etudiants;\nROLLBACK;\nSELECT COUNT(*) AS n FROM etudiants;` }],
    });
    expect(r.log?.map((l) => l.message).filter(Boolean)).toContain("Transaction annulée (ROLLBACK).");
    expect(r.tables?.[0].rows).toEqual([[2]]);
  });

  it("mode session (laboratoire) : la base est conservée entre deux requêtes, puis réinitialisée", async () => {
    await runSqlWorker({ mode: "session", reset: true, sql: BASE });
    const r = await runSqlWorker({ mode: "session", sql: "SELECT nom FROM etudiants ORDER BY nom;" });
    expect(r.tables?.[0].rows).toEqual([["Kito"], ["Mbuyi"]]);
    const reset = await runSqlWorker({ mode: "session", reset: true, sql: "SELECT name FROM sqlite_master;" });
    expect(reset.tables?.[0].rows).toEqual([]);
  });
});
