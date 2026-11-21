import { beforeEach, describe, expect, it } from "vitest";
import { clearVersions, diffStats, formatWhen, listVersions, recordVersion } from "./history";

beforeEach(() => {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  } as Storage;
});

describe("historique des versions", () => {
  it("garde les versions, sans doublon consécutif, plus récente d'abord", () => {
    expect(recordVersion("k", "a = 1", "Exécution")).toBe(true);
    expect(recordVersion("k", "a = 1", "Exécution")).toBe(false);
    expect(recordVersion("k", "a = 2", "Enregistrement")).toBe(true);
    expect(recordVersion("k", "   ", "vide")).toBe(false);
    const list = listVersions("k");
    expect(list.map((v) => v.code)).toEqual(["a = 2", "a = 1"]);
    expect(list[0].reason).toBe("Enregistrement");
  });

  it("limite à 40 versions par fichier et sépare les fichiers", () => {
    for (let i = 0; i < 50; i++) recordVersion("k", `v${i}`, "x");
    recordVersion("autre", "z", "x");
    expect(listVersions("k")).toHaveLength(40);
    expect(listVersions("autre")).toHaveLength(1);
    clearVersions("k");
    expect(listVersions("k")).toHaveLength(0);
  });

  it("compare deux versions et affiche une date lisible", () => {
    expect(diffStats("a\nb\nc", "a\nB\nc\nd")).toEqual({ added: 2, removed: 1 });
    const now = new Date(2026, 10, 21, 15, 0).getTime();
    expect(formatWhen(now - 60_000, now)).toMatch(/^Aujourd'hui à 14:59/);
    expect(formatWhen(now - 86_400_000, now)).toMatch(/^Hier/);
  });
});
