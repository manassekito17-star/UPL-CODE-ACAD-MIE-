import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";
import { translator } from "./i18n";
import { IpcError, api as realApi, type Api, type AuditEvent, type Settings } from "./ipc";

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.theme;
});

/** Faux backend en mémoire qui reproduit le contrat des commandes Rust (pour l'interface seule). */
function fakeApi(initial: Settings = { theme: "light", language: "fr" }) {
  let settings = { ...initial };
  const events: AuditEvent[] = [{ id: 1, at_ms: Date.UTC(2026, 10, 18, 9, 30), action: "app.start", detail: "0.1.0" }];
  const api: Api = {
    appInfo: vi.fn(async () => ({ name: "ZYNORA Office", version: "0.1.0", schema_version: 1, os: "linux", arch: "x86_64" })),
    getSettings: vi.fn(async () => ({ ...settings })),
    updateSetting: vi.fn(async (change) => {
      settings = { ...settings, [change.key]: change.value };
      events.unshift({ id: events.length + 1, at_ms: Date.now(), action: "settings.update", detail: `${change.key}=${change.value}` });
      return { ...settings };
    }),
    recentEvents: vi.fn(async (limit: number) => events.slice(0, limit)),
  };
  return api;
}

describe("App", () => {
  it("affiche l'accueil avec les informations système et des modules honnêtement inactifs", async () => {
    render(<App api={fakeApi()} />);
    expect(await screen.findByRole("heading", { name: "Bienvenue dans ZYNORA Office" })).toBeTruthy();
    expect(await screen.findByText("linux · x86_64")).toBeTruthy();
    expect(screen.getByText("v1")).toBeTruthy();
    for (const name of ["Sheets", "Word", "Slides"]) {
      expect((screen.getByRole("button", { name: new RegExp(name) }) as HTMLButtonElement).disabled).toBe(true);
    }
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("enregistre le thème via le backend, l'applique et l'inscrit au journal", async () => {
    const api = fakeApi();
    render(<App api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Paramètres" }));
    fireEvent.click(await screen.findByRole("radio", { name: "Sombre" }));

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("dark"));
    expect(api.updateSetting).toHaveBeenCalledWith({ key: "theme", value: "dark" });
    expect(await screen.findByText("theme=dark")).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Sombre" }).getAttribute("aria-checked")).toBe("true");
  });

  it("change la langue de toute l'interface", async () => {
    render(<App api={fakeApi()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Paramètres" }));
    fireEvent.click(await screen.findByRole("radio", { name: "English" }));
    expect(await screen.findByRole("heading", { name: "Settings" })).toBeTruthy();
    await waitFor(() => expect(document.documentElement.lang).toBe("en"));
    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(await screen.findByRole("heading", { name: "Welcome to ZYNORA Office" })).toBeTruthy();
  });

  it("ouvre les paramètres avec Ctrl+,", async () => {
    render(<App api={fakeApi()} />);
    await screen.findByRole("heading", { name: "Bienvenue dans ZYNORA Office" });
    fireEvent.keyDown(window, { key: ",", ctrlKey: true });
    expect(await screen.findByRole("heading", { name: "Paramètres" })).toBeTruthy();
  });

  it("montre l'erreur du backend et permet de réessayer", async () => {
    const api = fakeApi();
    vi.mocked(api.getSettings).mockRejectedValueOnce(new IpcError("la base locale est indisponible"));
    render(<App api={api} />);
    expect((await screen.findByRole("alert")).textContent).toContain("la base locale est indisponible");
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(await screen.findByRole("heading", { name: "Bienvenue dans ZYNORA Office" })).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("garde l'ancien paramètre si l'enregistrement échoue", async () => {
    const api = fakeApi();
    vi.mocked(api.updateSetting).mockRejectedValueOnce(new IpcError("disque plein"));
    render(<App api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Paramètres" }));
    fireEvent.click(await screen.findByRole("radio", { name: "Sombre" }));
    expect((await screen.findByRole("alert")).textContent).toContain("disque plein");
    expect(screen.getByRole("radio", { name: "Clair" }).getAttribute("aria-checked")).toBe("true");
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});

describe("ipc hors de Tauri", () => {
  it("refuse clairement au lieu de simuler un backend", async () => {
    await expect(realApi.getSettings()).rejects.toThrow("not_in_tauri");
    render(<App />);
    expect((await screen.findByRole("alert")).textContent).toContain("application de bureau");
  });
});

describe("i18n", () => {
  it("remplace les variables et garde les inconnues visibles", () => {
    expect(translator("fr")("status.soon", { n: 2 })).toBe("Phase 2");
    expect(translator("en")("status.phase", {})).toBe("Phase {n} — not available yet");
  });
});
