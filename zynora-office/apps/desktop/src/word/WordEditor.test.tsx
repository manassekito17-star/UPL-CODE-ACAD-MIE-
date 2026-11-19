import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App } from "../App";
import type { DocModel } from "../ipc";
import { fakeApi } from "../test/fakeApi";

afterEach(cleanup);

const page: DocModel["page"] = { orientation: "portrait", width_mm: 210, height_mm: 297, margin_top_mm: 25, margin_right_mm: 25, margin_bottom_mm: 25, margin_left_mm: 25 };
const letter: DocModel = { page, blocks: [{ type: "paragraph", style: "normal", align: "left", runs: [{ text: "Bonjour le monde" }] }] };

async function openLetter(options: Parameters<typeof fakeApi>[0] = {}) {
  const api = fakeApi({ files: ["lettre.docx"], documents: { "lettre.docx": letter }, ...options });
  render(<App api={api} />);
  fireEvent.click(await screen.findByRole("button", { name: "Documents" }));
  fireEvent.click(await screen.findByRole("button", { name: "Ouvrir lettre.docx" }));
  await screen.findByRole("heading", { name: "lettre.docx" });
  await screen.findByRole("tab", { name: "Accueil" });
  return api;
}

const tool = (name: string) => screen.getByRole("button", { name });
const status = () => document.querySelector(".sheets__status")?.textContent;
const editor = () => screen.getByTestId("word-editor");
const saved = (api: ReturnType<typeof fakeApi>) => (api.wordSave as unknown as { mock: { calls: Array<[string, DocModel]> } }).mock.calls.at(-1)?.[1];

async function menu(label: string, item: string) {
  fireEvent.click(screen.getByRole("button", { name: label }));
  fireEvent.click(await screen.findByRole("menuitem", { name: item }));
}

describe("ZYNORA Word", () => {
  it("ouvre un document avec le ruban, la page et la barre d'état", async () => {
    const api = await openLetter();
    expect(api.wordOpen).toHaveBeenCalledWith("lettre.docx");
    for (const tab of ["Accueil", "Insertion", "Mise en page", "Révision", "Affichage"]) expect(screen.getByRole("tab", { name: tab })).toBeTruthy();
    for (const group of ["Presse-papiers", "Police", "Paragraphe", "Styles", "Modification"]) expect(screen.getByRole("group", { name: group })).toBeTruthy();
    expect(editor().textContent).toContain("Bonjour le monde");
    expect(screen.getByText("3 mot(s)")).toBeTruthy();
    expect(status()).toBe("Enregistré");
  });

  it("met en forme puis enregistre exactement ce qui est affiché", async () => {
    const api = await openLetter();
    fireEvent.click(tool("Sélectionner tout"));
    fireEvent.click(tool("Gras (Ctrl+G)"));
    fireEvent.click(tool("Centrer (Ctrl+E)"));
    fireEvent.click(screen.getByRole("option", { name: "Titre 1" }));
    await waitFor(() => expect(status()).toBe("Modifications non enregistrées"));
    expect(editor().querySelector("h1 strong")?.textContent).toBe("Bonjour le monde");
    fireEvent.click(tool("Enregistrer"));
    await waitFor(() => expect(status()).toBe("Enregistré"));
    expect(saved(api)?.blocks[0]).toEqual({ type: "paragraph", style: "heading1", align: "center", runs: [{ text: "Bonjour le monde", bold: true }] });
  });

  it("listes, retraits, tableau, saut de page et mise en page sont enregistrés", async () => {
    const api = await openLetter();
    fireEvent.click(tool("Numérotation"));
    fireEvent.click(tool("Augmenter le retrait"));
    fireEvent.click(screen.getByRole("tab", { name: "Insertion" }));
    fireEvent.click(tool("Saut de page (Ctrl+Entrée)"));
    await menu("Tableau", "Insérer un tableau 2 × 2");
    fireEvent.click(screen.getByRole("tab", { name: "Mise en page" }));
    await menu("Orientation", "Paysage");
    await menu("Marges", "Étroites (1,27 cm)");
    fireEvent.click(tool("Enregistrer"));
    await waitFor(() => expect(api.wordSave).toHaveBeenCalled());
    const doc = saved(api)!;
    expect(doc.page).toMatchObject({ orientation: "landscape", margin_left_mm: 12.7, margin_top_mm: 12.7 });
    expect(doc.blocks[0]).toMatchObject({ list: { kind: "ordered", level: 1 } });
    expect(doc.blocks.map((b) => b.type)).toEqual(expect.arrayContaining(["page_break", "table"]));
    const table = doc.blocks.find((b) => b.type === "table");
    expect(table && "rows" in table ? table.rows.map((r) => r.length) : []).toEqual([2, 2]);
  });

  it("remplace toutes les occurrences en une seule opération annulable", async () => {
    await openLetter();
    fireEvent.click(tool("Remplacer (Ctrl+H)"));
    const dialog = await screen.findByRole("dialog", { name: "Remplacer (Ctrl+H)" });
    fireEvent.change(within(dialog).getByLabelText("Rechercher"), { target: { value: "monde" } });
    fireEvent.change(within(dialog).getByLabelText("Remplacer par"), { target: { value: "ZYNORA" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Remplacer tout" }));
    await waitFor(() => expect(editor().textContent).toContain("Bonjour le ZYNORA"));
    expect(await screen.findByText("1 remplacement(s) effectué(s)")).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Fermer" }));
    fireEvent.click(tool("Annuler"));
    await waitFor(() => expect(editor().textContent).toContain("Bonjour le monde"));
  });

  it("refuse les liens dangereux et insère un lien web", async () => {
    await openLetter();
    fireEvent.click(screen.getByRole("tab", { name: "Insertion" }));
    fireEvent.click(tool("Lien (Ctrl+K)"));
    const dialog = await screen.findByRole("dialog", { name: "Lien (Ctrl+K)" });
    const url = within(dialog).getByLabelText("Adresse (https://… ou mailto:…)");
    fireEvent.change(url, { target: { value: "javascript:alert(1)" } });
    expect((within(dialog).getByRole("button", { name: "OK" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(within(dialog).getByLabelText("Texte à afficher"), { target: { value: "site" } });
    fireEvent.change(url, { target: { value: "https://exemple.fr" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    await waitFor(() => expect(editor().querySelector("a")?.getAttribute("href")).toBe("https://exemple.fr"));
  });

  it("insère une image choisie par le cœur Rust, la redimensionne et l'enregistre", async () => {
    const api = await openLetter();
    fireEvent.click(screen.getByRole("tab", { name: "Insertion" }));
    expect((tool("Taille de l'image…") as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(tool("Image"));
    await waitFor(() => expect(editor().querySelector("img[data-zimage]")).toBeTruthy());
    expect(api.wordPickImage).toHaveBeenCalledWith(160);
    // L'image insérée est sélectionnée : sa taille se règle en millimètres, proportions conservées.
    await waitFor(() => expect((tool("Taille de l'image…") as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(tool("Taille de l'image…"));
    const dialog = await screen.findByRole("dialog", { name: "Taille de l'image" });
    fireEvent.change(within(dialog).getByLabelText("Largeur (mm)"), { target: { value: "25" } });
    expect((within(dialog).getByLabelText("Hauteur (mm)") as HTMLInputElement).value).toBe("25");
    fireEvent.click(within(dialog).getByRole("button", { name: "Appliquer" }));
    await waitFor(() => expect(editor().querySelector("img[data-zimage]")?.getAttribute("data-width")).toBe("25"));
    fireEvent.click(tool("Enregistrer"));
    await waitFor(() => expect(api.wordSave).toHaveBeenCalled());
    const runs = (saved(api)?.blocks[0] as { runs: Array<{ image?: { width_mm: number; height_mm: number } }> }).runs;
    expect(runs.find((r) => r.image)?.image).toMatchObject({ width_mm: 25, height_mm: 25 });
  });

  it("un document avec des éléments non conservés n'est jamais écrasé : copie imposée", async () => {
    const api = await openLetter({ lost: { "lettre.docx": ["images et dessins"] } });
    expect(screen.getByRole("note").textContent).toContain("images et dessins");
    expect((tool("Enregistrer") as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(tool("Enregistrer une copie"));
    const dialog = await screen.findByRole("dialog", { name: "Enregistrer une copie" });
    expect((within(dialog).getByLabelText("Nom du fichier (.docx ou .txt)") as HTMLInputElement).value).toBe("lettre - copie.docx");
    fireEvent.click(within(dialog).getByRole("button", { name: "Enregistrer une copie" }));
    await screen.findByRole("heading", { name: "lettre - copie.docx" });
    expect(api.wordSave).not.toHaveBeenCalled();
    expect(api.wordSaveCopy).toHaveBeenCalledWith("lettre.docx", "lettre - copie.docx", expect.objectContaining({ page }));
  });

  it("demande confirmation avant de fermer sans enregistrer et oublie la copie de récupération", async () => {
    const api = await openLetter();
    fireEvent.click(tool("Sélectionner tout"));
    fireEvent.click(tool("Italique (Ctrl+I)"));
    fireEvent.click(tool("Retour à la bibliothèque"));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Ne pas enregistrer" }));
    await screen.findByRole("heading", { name: "Documents" });
    expect(api.discardRecovery).toHaveBeenCalledWith("lettre.docx");
    expect(api.wordSave).not.toHaveBeenCalled();
  });

  it("crée un nouveau document depuis l'accueil et rouvre une copie de récupération", async () => {
    const api = fakeApi({ recoveries: [{ path: "notes.docx", file: "x.zdoc.json", saved_at_ms: 1 }], files: ["notes.docx"] });
    render(<App api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Récupérer" }));
    await screen.findByRole("heading", { name: "notes.docx" });
    expect(api.wordOpenRecovery).toHaveBeenCalledWith("notes.docx");
    expect(status()).toBe("Récupéré après incident — enregistrez pour conserver");
  });
});
