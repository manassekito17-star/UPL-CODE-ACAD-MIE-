import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Moteur lourd (Python) dont le chargement ne se termine jamais, ou qui plante : plus d'attente sans fin. */
class SilentWorker {
  static last: SilentWorker | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: { preventDefault(): void }) => void) | null = null;
  terminated = false;
  constructor() {
    SilentWorker.last = this;
  }
  postMessage() {
    this.onmessage?.({ data: { type: "statut", message: "Chargement de Python…" } } as MessageEvent);
  }
  terminate() {
    this.terminated = true;
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("Worker", SilentWorker);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("chargement d'un moteur lourd", () => {
  it("connexion trop lente : message clair après 2 minutes (et statut « connexion lente » avant)", async () => {
    const { runInBrowser, LOAD_TIMEOUT_MS } = await import("./browser");
    const statuts: string[] = [];
    const p = runInBrowser("python", [{ name: "main.py", content: "print(1)" }], "", (m) => statuts.push(m));
    await vi.advanceTimersByTimeAsync(16_000);
    expect(statuts.at(-1)).toMatch(/connexion lente/);
    await vi.advanceTimersByTimeAsync(LOAD_TIMEOUT_MS);
    const r = await p;
    expect(r.status).toBe("erreur_execution");
    expect(r.stderr).toMatch(/Python n'a pas pu se charger/);
    expect(SilentWorker.last?.terminated).toBe(true);
  });

  it("plantage du moteur : message au lieu d'une attente sans fin", async () => {
    const { runInBrowser } = await import("./browser");
    const p = runInBrowser("python", [{ name: "main.py", content: "print(1)" }], "");
    SilentWorker.last!.onerror!({ preventDefault() {} });
    const r = await p;
    expect(r.stderr).toMatch(/s'est arrêté/);
  });
});
