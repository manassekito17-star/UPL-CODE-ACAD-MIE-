import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App } from "../App";
import { fakeApi } from "../test/fakeApi";

afterEach(cleanup);

async function open(options: Parameters<typeof fakeApi>[0] = {}) {
  const api = fakeApi({ files: ["budget.xlsx"], ...options });
  render(<App api={api} />);
  fireEvent.click(await screen.findByRole("button", { name: "Documents" }));
  fireEvent.click(await screen.findByRole("button", { name: "Ouvrir budget.xlsx" }));
  await screen.findByRole("heading", { name: "budget.xlsx" });
  return { api, grid: screen.getByRole("grid", { name: "Grille du classeur" }) };
}

const A1 = { sheet: 0, top: 1, left: 1, bottom: 1, right: 1 };
const tab = (name: string) => fireEvent.click(screen.getByRole("tab", { name }));
const menu = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const item = (name: string) => fireEvent.click(screen.getByRole("menuitem", { name }));

describe("Ruban de ZYNORA Sheets", () => {
  it("propose les onglets Accueil, Insertion, Formules, Données et Affichage", async () => {
    await open();
    const tabs = within(screen.getByRole("tablist", { name: "Ruban" })).getAllByRole("tab").map((t) => t.textContent);
    expect(tabs).toEqual(["Accueil", "Insertion", "Formules", "Données", "Affichage"]);
    for (const group of ["Presse-papiers", "Police", "Alignement", "Nombre", "Cellules", "Édition"]) {
      expect(screen.getByRole("group", { name: group })).toBeTruthy();
    }
  });

  it("Accueil : police, taille, alignement vertical, renvoi, bordures, décimales", async () => {
    const { api } = await open();
    fireEvent.change(screen.getByLabelText("Nom de la police"), { target: { value: "Georgia" } });
    await waitFor(() => expect(api.sheetsFormat).toHaveBeenCalledWith(7, A1, { op: "font_name", name: "Georgia" }));
    fireEvent.change(screen.getByLabelText("Taille de police"), { target: { value: "18" } });
    await waitFor(() => expect(api.sheetsStyle).toHaveBeenCalledWith(7, A1, { kind: "font_size", value: 18 }));
    fireEvent.click(screen.getByRole("button", { name: "Augmenter la taille de police" }));
    await waitFor(() => expect(api.sheetsStyle).toHaveBeenCalledWith(7, A1, { kind: "font_size_delta", value: 1 }));
    fireEvent.click(screen.getByRole("button", { name: "Aligner en haut" }));
    await waitFor(() => expect(api.sheetsStyle).toHaveBeenCalledWith(7, A1, { kind: "vertical_align", value: "top" }));
    fireEvent.click(screen.getByRole("button", { name: "Renvoyer à la ligne automatiquement" }));
    await waitFor(() => expect(api.sheetsStyle).toHaveBeenCalledWith(7, A1, { kind: "wrap", value: true }));

    menu("Bordures");
    expect(screen.getAllByRole("menuitem")).toHaveLength(10);
    item("Bordures extérieures");
    await waitFor(() => expect(api.sheetsFormat).toHaveBeenCalledWith(7, A1, { op: "borders", preset: "outer", line: "thin", color: "#000000" }));
    expect(screen.queryByRole("menu")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Ajouter une décimale" }));
    await waitFor(() => expect(api.sheetsFormat).toHaveBeenCalledWith(7, A1, { op: "decimals", delta: 1 }));
    fireEvent.click(screen.getByRole("button", { name: "Séparateur de milliers" }));
    await waitFor(() => expect(api.sheetsFormat).toHaveBeenCalledWith(7, A1, { op: "thousands" }));
    fireEvent.change(screen.getByLabelText("Format de nombre"), { target: { value: "0.00%" } });
    await waitFor(() => expect(api.sheetsStyle).toHaveBeenCalledWith(7, A1, { kind: "number_format", value: "0.00%" }));
  });

  it("menus au clavier : flèches et Échap", async () => {
    await open();
    menu("Effacer");
    const items = screen.getAllByRole("menuitem");
    expect(document.activeElement).toBe(items[0]);
    fireEvent.keyDown(items[0] as HTMLElement, { key: "ArrowDown" });
    expect(document.activeElement).toBe(items[1]);
    fireEvent.keyDown(items[1] as HTMLElement, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Effacer" }));
  });

  it("Reproduire la mise en forme applique les styles de la source à la sélection suivante", async () => {
    const { api, grid } = await open();
    fireEvent.click(screen.getByRole("button", { name: "Reproduire la mise en forme" }));
    expect(screen.getByRole("button", { name: "Reproduire la mise en forme" }).getAttribute("aria-pressed")).toBe("true");
    const layer = grid.querySelector(".grid__cells") as HTMLElement;
    fireEvent.mouseDown(layer, { button: 0, clientX: 150, clientY: 30 });
    fireEvent.mouseUp(window);
    await waitFor(() => expect(api.sheetsFormat).toHaveBeenCalledWith(7, expect.objectContaining({ left: 2 }), { op: "copy_styles", source: A1 }));
  });

  it("Rechercher (Ctrl+F) sélectionne les cellules trouvées une à une", async () => {
    const { grid } = await open();
    for (const ch of ["Total"]) {
      fireEvent.keyDown(grid, { key: ch[0] });
      fireEvent.change(screen.getByLabelText("A1"), { target: { value: ch } });
      fireEvent.keyDown(screen.getByLabelText("A1"), { key: "Enter" });
    }
    await waitFor(() => expect((screen.getByLabelText("Zone de nom") as HTMLInputElement).value).toBe("A2"));
    fireEvent.keyDown(grid, { key: "f", ctrlKey: true });
    const dialog = screen.getByRole("dialog", { name: "Rechercher et remplacer" });
    fireEvent.change(within(dialog).getByLabelText("Rechercher"), { target: { value: "tot" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Suivant" }));
    await waitFor(() => expect((screen.getByLabelText("Zone de nom") as HTMLInputElement).value).toBe("A1"));
    expect(within(dialog).getByText(/1 sur 1/)).toBeTruthy();
  });

  it("Formules : insérer une fonction depuis le catalogue", async () => {
    await open();
    tab("Formules");
    fireEvent.click(within(screen.getByRole("tabpanel")).getByRole("button", { name: "Insérer une fonction" }));
    const dialog = screen.getByRole("dialog", { name: "Insérer une fonction" });
    fireEvent.change(within(dialog).getByLabelText("Rechercher une fonction"), { target: { value: "moyenne" } });
    expect(within(within(dialog).getByRole("listbox")).getAllByRole("option").map((o) => o.textContent)).toEqual(["MOYENNE"]);
    expect(within(dialog).getByText("MOYENNE(nombre1; …)")).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Insérer" }));
    expect((screen.getByLabelText("A1") as HTMLInputElement).value).toBe("=MOYENNE(");
  });

  it("Formules : menus de la bibliothèque par catégorie et gestionnaire de noms", async () => {
    const { api } = await open();
    tab("Formules");
    menu("Logique");
    item("SI");
    expect((screen.getByLabelText("A1") as HTMLInputElement).value).toBe("=SI(");
    fireEvent.keyDown(screen.getByLabelText("A1"), { key: "Escape" });

    fireEvent.click(screen.getByRole("button", { name: "Gestionnaire de noms" }));
    const dialog = screen.getByRole("dialog", { name: "Gestionnaire de noms" });
    expect(within(dialog).getByText("Aucun nom défini.")).toBeTruthy();
    expect((within(dialog).getByLabelText("Fait référence à") as HTMLInputElement).value).toBe("='Feuil1'!$A$1");
    fireEvent.change(within(dialog).getByLabelText("Nom"), { target: { value: "Taux" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Ajouter" }));
    expect(await within(dialog).findByText("Taux")).toBeTruthy();
    expect(api.sheetsNames).toHaveBeenCalledWith(7, { op: "add", name: "Taux", scope: null, formula: "='Feuil1'!$A$1" });

    fireEvent.click(screen.getByRole("button", { name: "Calculer maintenant" }));
    expect(await screen.findByText("Classeur recalculé.")).toBeTruthy();
  });

  it("Données : tri et suppression des doublons sur la sélection", async () => {
    const { api, grid } = await open();
    fireEvent.keyDown(grid, { key: "ArrowDown", shiftKey: true });
    fireEvent.keyDown(grid, { key: "ArrowDown", shiftKey: true });
    tab("Données");
    fireEvent.click(screen.getByRole("button", { name: "Trier de Z à A" }));
    const range = { sheet: 0, top: 1, left: 1, bottom: 3, right: 1 };
    await waitFor(() => expect(api.sheetsData).toHaveBeenCalledWith(7, { op: "sort", range, key: 1, ascending: false, header: false }));

    fireEvent.click(screen.getByRole("button", { name: "Supprimer les doublons" }));
    const dialog = screen.getByRole("dialog", { name: "Supprimer les doublons" });
    fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    expect(await screen.findByText("2 doublon(s) supprimé(s).")).toBeTruthy();
    expect(api.sheetsData).toHaveBeenLastCalledWith(7, { op: "remove_duplicates", range, header: true });
  });

  it("Affichage : quadrillage, en-têtes et barre de formule", async () => {
    const { api, grid } = await open();
    tab("Affichage");
    fireEvent.click(screen.getByLabelText("Quadrillage"));
    await waitFor(() => expect(grid.className).toContain("grid--no-lines"));
    expect(api.sheetsGridlines).toHaveBeenLastCalledWith(7, 0, false);
    fireEvent.click(screen.getByLabelText("Afficher les en-têtes"));
    expect(grid.querySelector(".grid__col-headers")).toBeNull();
    fireEvent.click(screen.getByLabelText("Afficher la barre de formule"));
    expect(screen.queryByLabelText("Zone de nom")).toBeNull();
  });

  it("Insertion : un symbole s'ajoute à la saisie", async () => {
    await open();
    tab("Insertion");
    fireEvent.click(screen.getByRole("button", { name: "Symbole" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Symbole" })).getByRole("button", { name: "€" }));
    expect((screen.getByLabelText("A1") as HTMLInputElement).value).toBe("€");
  });

  it("supprimer une feuille demande confirmation", async () => {
    const { api } = await open();
    fireEvent.click(within(screen.getByRole("tablist", { name: "Feuilles" })).getByRole("button", { name: "Nouvelle feuille" }));
    await screen.findByRole("tab", { name: "Feuil2", selected: true });
    menu("Supprimer");
    item("Supprimer la feuille");
    const confirm = screen.getByRole("alertdialog", { name: "Supprimer la feuille « Feuil2 » ?" });
    fireEvent.click(within(confirm).getByRole("button", { name: "Supprimer la feuille" }));
    await waitFor(() => expect(api.sheetsSheet).toHaveBeenLastCalledWith(7, { op: "delete", sheet: 1 }));
  });
});
