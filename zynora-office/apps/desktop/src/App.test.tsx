import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";
import { translator } from "./i18n";
import { IpcError, api as realApi } from "./ipc";
import { fakeApi } from "./test/fakeApi";

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.theme;
});

const nav = (name: string) => screen.getByRole("button", { name: new RegExp(`^${name}`) });

async function openDocuments() {
  fireEvent.click(await screen.findByRole("button", { name: "Documents" }));
  return screen.findByRole("heading", { name: "Documents", level: 1 });
}

describe("Socle", () => {
  it("affiche l'accueil, les informations système et des modules honnêtement inactifs", async () => {
    render(<App api={fakeApi()} />);
    expect(await screen.findByRole("heading", { name: "Bienvenue dans ZYNORA Office" })).toBeTruthy();
    expect(await screen.findByText("linux · x86_64")).toBeTruthy();
    for (const name of ["Word", "Slides"]) {
      expect((nav(name) as HTMLButtonElement).disabled).toBe(true);
    }
    expect((nav("Sheets") as HTMLButtonElement).disabled).toBe(false);
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
    vi.mocked(api.getSettings).mockRejectedValueOnce(new IpcError("La base locale n'a pas pu être ouverte"));
    render(<App api={api} />);
    expect((await screen.findByRole("alert")).textContent).toContain("La base locale n'a pas pu être ouverte");
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(await screen.findByRole("heading", { name: "Bienvenue dans ZYNORA Office" })).toBeTruthy();
  });

  it("garde l'ancien paramètre si l'enregistrement échoue", async () => {
    const api = fakeApi();
    vi.mocked(api.updateSetting).mockRejectedValueOnce(new IpcError("disque plein"));
    render(<App api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Paramètres" }));
    fireEvent.click(await screen.findByRole("radio", { name: "Sombre" }));
    expect((await screen.findByRole("alert")).textContent).toContain("disque plein");
    expect(screen.getByRole("radio", { name: "Clair" }).getAttribute("aria-checked")).toBe("true");
  });

  it("signale une session précédente interrompue, sans bloquer", async () => {
    render(<App api={fakeApi({ interrupted: true })} />);
    expect(await screen.findByText("La dernière session s'est interrompue")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Compris" }));
    expect(screen.queryByText("La dernière session s'est interrompue")).toBeNull();
  });
});

describe("Documents", () => {
  it("navigue dans les dossiers et revient par le fil d'Ariane", async () => {
    render(<App api={fakeApi({ folders: ["Clients"], files: ["Clients/devis.xlsx", "budget.csv"] })} />);
    await openDocuments();
    const table = await screen.findByRole("table");
    expect(within(table).getByText("budget.csv")).toBeTruthy();
    expect(within(table).getByText("Classeur")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Ouvrir Clients" }));
    expect(await screen.findByText("devis.xlsx")).toBeTruthy();
    expect(screen.queryByText("budget.csv")).toBeNull();
    const crumbs = screen.getByRole("navigation", { name: "Bibliothèque" });
    expect(within(crumbs).getByRole("button", { name: "Clients" }).getAttribute("aria-current")).toBe("location");
    fireEvent.click(within(crumbs).getByRole("button", { name: "Bibliothèque" }));
    expect(await screen.findByText("budget.csv")).toBeTruthy();
  });

  it("crée un dossier et affiche le refus du backend dans le champ", async () => {
    const api = fakeApi({ folders: ["Archives"] });
    render(<App api={api} />);
    await openDocuments();
    fireEvent.click(screen.getByRole("button", { name: "Nouveau dossier" }));
    const dialog = screen.getByRole("dialog", { name: "Nouveau dossier" });
    const input = within(dialog).getByLabelText("Nom du dossier");
    expect(document.activeElement).toBe(input);

    fireEvent.change(input, { target: { value: "Archives" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Créer" }));
    expect(await within(dialog).findByText("« Archives » existe déjà à cet endroit")).toBeTruthy();
    expect(input.getAttribute("aria-invalid")).toBe("true");

    fireEvent.change(input, { target: { value: "Projets" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(await screen.findByRole("button", { name: "Ouvrir Projets" })).toBeTruthy();
    expect(api.createFolder).toHaveBeenLastCalledWith("", "Projets");
  });

  it("renomme un document en présélectionnant le nom sans l'extension", async () => {
    const api = fakeApi({ files: ["brouillon.docx"] });
    render(<App api={api} />);
    await openDocuments();
    fireEvent.click(await screen.findByRole("button", { name: "Renommer brouillon.docx" }));
    const input = screen.getByLabelText("Nouveau nom") as HTMLInputElement;
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, "brouillon".length]);
    fireEvent.change(input, { target: { value: "Rapport final.docx" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);
    expect(await screen.findByText("Rapport final.docx")).toBeTruthy();
    expect(api.renameEntry).toHaveBeenCalledWith("brouillon.docx", "Rapport final.docx");
  });

  it("met à la corbeille avec une annulation immédiate possible", async () => {
    const api = fakeApi({ files: ["contrat.docx"] });
    render(<App api={api} />);
    await openDocuments();
    fireEvent.click(await screen.findByRole("button", { name: "Mettre contrat.docx à la corbeille" }));
    expect(await screen.findByText("« contrat.docx » a été placé dans la corbeille.")).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole("table")).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(await screen.findByText("« contrat.docx » a été restauré.")).toBeTruthy();
    expect(await screen.findByRole("table")).toBeTruthy();
    expect(api.restoreTrash).toHaveBeenCalledWith("1");
  });

  it("met en favori et le retrouve sur l'accueil", async () => {
    render(<App api={fakeApi({ files: ["plan.pptx"] })} />);
    await openDocuments();
    const star = await screen.findByRole("button", { name: "Ajouter plan.pptx aux favoris" });
    expect(star.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(star);
    expect((await screen.findByRole("button", { name: "Retirer plan.pptx des favoris" })).getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Accueil" }));
    const favorites = (await screen.findByRole("heading", { name: "Favoris" })).parentElement as HTMLElement;
    expect(await within(favorites).findByText("plan.pptx")).toBeTruthy();
    fireEvent.click(within(favorites).getByRole("button", { name: /Afficher dans Documents/ }));
    expect(await screen.findByRole("heading", { name: "Documents", level: 1 })).toBeTruthy();
  });

  it("recherche dans toute la bibliothèque et indique l'emplacement", async () => {
    render(<App api={fakeApi({ folders: ["Équipe"], files: ["Équipe/Planning été.xlsx", "notes.txt"] })} />);
    await openDocuments();
    fireEvent.change(screen.getByRole("searchbox", { name: "Rechercher dans la bibliothèque" }), { target: { value: "planning" } });
    expect(await screen.findByText("1 résultat(s) pour « planning »")).toBeTruthy();
    const table = screen.getByRole("table");
    expect(within(table).getByText("Planning été.xlsx")).toBeTruthy();
    expect(within(table).getByText("Équipe")).toBeTruthy();
    expect(within(table).getByRole("columnheader", { name: "Emplacement" })).toBeTruthy();
  });

  it("résume l'import et détaille les fichiers refusés", async () => {
    const api = fakeApi({
      importOutcome: {
        cancelled: false,
        imported: [{ path: "a.docx", name: "a.docx", kind: "text", size: 10, modified_ms: 1 }],
        rejected: [{ name: "macro.xlsx", reason: "ce document contient des macros : il n'est pas importé" }],
      },
    });
    render(<App api={api} />);
    await openDocuments();
    fireEvent.click(screen.getByRole("button", { name: "Importer…" }));
    expect(await screen.findByText("1 document(s) importé(s).")).toBeTruthy();
    const dialog = await screen.findByRole("dialog", { name: "Certains fichiers n'ont pas été importés" });
    expect(within(dialog).getByText("macro.xlsx")).toBeTruthy();
    expect(within(dialog).getByText(/contient des macros/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Fermer" }));
    expect(await screen.findByText("a.docx")).toBeTruthy();
    expect(api.importDocuments).toHaveBeenCalledWith("");
  });
});

describe("Corbeille", () => {
  it("demande confirmation avant toute suppression définitive", async () => {
    const api = fakeApi({ files: ["a.txt", "b.txt"] });
    await api.trashEntry("a.txt");
    await api.trashEntry("b.txt");
    render(<App api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Corbeille" }));
    const rows = await screen.findAllByRole("row");
    expect(rows).toHaveLength(3);

    fireEvent.click(within(rows[1] as HTMLElement).getByRole("button", { name: "Supprimer définitivement" }));
    const confirm = screen.getByRole("alertdialog", { name: "Supprimer définitivement « b.txt » ?" });
    expect(document.activeElement).toBe(within(confirm).getByRole("button", { name: "Annuler" }));
    fireEvent.click(within(confirm).getByRole("button", { name: "Annuler" }));
    expect(api.purgeTrash).not.toHaveBeenCalled();

    fireEvent.click(within(rows[1] as HTMLElement).getByRole("button", { name: "Supprimer définitivement" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Supprimer définitivement" }));
    expect(await screen.findByText("Suppression définitive effectuée.")).toBeTruthy();
    expect(api.purgeTrash).toHaveBeenCalledWith("2");

    fireEvent.click(screen.getByRole("button", { name: "Vider la corbeille" }));
    fireEvent.click(within(screen.getByRole("alertdialog", { name: "Vider la corbeille ?" })).getByRole("button", { name: "Vider la corbeille" }));
    expect(await screen.findByText("1 élément(s) supprimé(s) définitivement.")).toBeTruthy();
    expect(await screen.findByText("La corbeille est vide.")).toBeTruthy();
  });

  it("restaure un élément", async () => {
    const api = fakeApi({ files: ["a.txt"] });
    await api.trashEntry("a.txt");
    render(<App api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Corbeille" }));
    fireEvent.click(await screen.findByRole("button", { name: "Restaurer" }));
    expect(await screen.findByText("« a.txt » a été restauré.")).toBeTruthy();
    expect(await screen.findByText("La corbeille est vide.")).toBeTruthy();
  });
});

describe("Paramètres de bibliothèque", () => {
  it("change de dossier par le dialogue natif et le signale", async () => {
    const api = fakeApi();
    render(<App api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Paramètres" }));
    expect(await screen.findByText("/home/test/Documents/ZYNORA")).toBeTruthy();
    expect(screen.getByText("dossier par défaut")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Changer de dossier…" }));
    expect(await screen.findByText("Bibliothèque : /data/Bureau")).toBeTruthy();
    expect(api.chooseLibrary).toHaveBeenCalledOnce();
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
