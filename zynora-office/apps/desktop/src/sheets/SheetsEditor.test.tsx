import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App } from "../App";
import { fakeApi } from "../test/fakeApi";

afterEach(cleanup);

async function openBudget(options: Parameters<typeof fakeApi>[0] = {}) {
  const api = fakeApi({ files: ["budget.xlsx"], ...options });
  render(<App api={api} />);
  fireEvent.click(await screen.findByRole("button", { name: "Documents" }));
  fireEvent.click(await screen.findByRole("button", { name: "Ouvrir budget.xlsx" }));
  await screen.findByRole("heading", { name: "budget.xlsx" });
  return { api, grid: screen.getByRole("grid", { name: "Grille du classeur" }) };
}

const nameBox = () => screen.getByLabelText("Zone de nom") as HTMLInputElement;
/** Indicateur d'enregistrement de la barre de titre (la zone des notifications est aussi un « status »). */
const saveStatus = () => document.querySelector(".sheets__status")?.textContent;
const formula = () => screen.getByLabelText("Barre de formule") as HTMLInputElement;

describe("ZYNORA Sheets", () => {
  it("ouvre un classeur avec le ruban, la barre de formule, la grille et les onglets", async () => {
    const { api } = await openBudget();
    expect(api.sheetsOpen).toHaveBeenCalledWith("budget.xlsx");
    expect(screen.getByRole("tab", { name: "Accueil", selected: true })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Police" })).toBeTruthy();
    expect(nameBox().value).toBe("A1");
    expect(screen.getByRole("tab", { name: "Feuil1", selected: true })).toBeTruthy();
    expect(saveStatus()).toBe("Enregistré");
  });

  it("la saisie au clavier est envoyée au moteur, puis la sélection descend", async () => {
    const { api, grid } = await openBudget();
    fireEvent.keyDown(grid, { key: "4" });
    const editor = screen.getByLabelText("A1") as HTMLInputElement;
    fireEvent.change(editor, { target: { value: "42" } });
    fireEvent.keyDown(editor, { key: "Enter" });
    await waitFor(() => expect(api.sheetsSetInput).toHaveBeenCalledWith(7, 0, 1, 1, "42"));
    await waitFor(() => expect(nameBox().value).toBe("A2"));
    expect(await screen.findByText("Modifications non enregistrées")).toBeTruthy();
    expect(within(grid).getByText("42")).toBeTruthy();
  });

  it("affiche la formule dans la barre et le résultat (fourni par le moteur) dans la grille", async () => {
    const { api, grid } = await openBudget({ formulaResults: { "=SOMME(A1:A2)": "30" } });
    fireEvent.focus(formula());
    fireEvent.change(formula(), { target: { value: "=SOMME(A1:A2)" } });
    fireEvent.keyDown(formula(), { key: "Enter" });
    await waitFor(() => expect(api.sheetsSetInput).toHaveBeenCalledWith(7, 0, 1, 1, "=SOMME(A1:A2)"));
    expect(await within(grid).findByText("30")).toBeTruthy();
    fireEvent.keyDown(grid, { key: "ArrowUp" });
    await waitFor(() => expect(formula().value).toBe("=SOMME(A1:A2)"));
  });

  it("Échap annule la saisie sans rien envoyer", async () => {
    const { api, grid } = await openBudget();
    fireEvent.keyDown(grid, { key: "x" });
    fireEvent.keyDown(screen.getByLabelText("A1"), { key: "Escape" });
    expect(screen.queryByLabelText("A1")).toBeNull();
    expect(api.sheetsSetInput).not.toHaveBeenCalled();
  });

  it("étend la sélection et affiche les statistiques calculées par le moteur", async () => {
    const { api, grid } = await openBudget();
    fireEvent.keyDown(grid, { key: "ArrowDown", shiftKey: true });
    await waitFor(() => expect(nameBox().value).toBe("A1:A2"));
    await waitFor(() => expect(api.sheetsStats).toHaveBeenCalledWith(7, { sheet: 0, top: 1, left: 1, bottom: 2, right: 1 }));
    expect(await screen.findByText("Somme : 30")).toBeTruthy();
    expect(screen.getByText("Moyenne : 15")).toBeTruthy();
  });

  it("applique le gras à la sélection depuis le ruban et le raccourci", async () => {
    const { api, grid } = await openBudget();
    fireEvent.click(screen.getByRole("button", { name: "Gras" }));
    await waitFor(() => expect(api.sheetsStyle).toHaveBeenCalledWith(7, { sheet: 0, top: 1, left: 1, bottom: 1, right: 1 }, { kind: "bold", value: true }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Gras" }).getAttribute("aria-pressed")).toBe("true"));
    fireEvent.keyDown(grid, { key: "b", ctrlKey: true });
    await waitFor(() => expect(api.sheetsStyle).toHaveBeenLastCalledWith(7, expect.anything(), { kind: "bold", value: false }));
  });

  it("navigue par la zone de nom", async () => {
    await openBudget();
    fireEvent.change(nameBox(), { target: { value: "c5" } });
    fireEvent.submit(nameBox().closest("form") as HTMLFormElement);
    await waitFor(() => expect(nameBox().value).toBe("C5"));
    fireEvent.change(nameBox(), { target: { value: "pas une référence" } });
    fireEvent.submit(nameBox().closest("form") as HTMLFormElement);
    await waitFor(() => expect(nameBox().value).toBe("C5"));
  });

  it("ajoute une feuille et l'active", async () => {
    const { api } = await openBudget();
    fireEvent.click(within(screen.getByRole("tablist", { name: "Feuilles" })).getByRole("button", { name: "Nouvelle feuille" }));
    expect(await screen.findByRole("tab", { name: "Feuil2", selected: true })).toBeTruthy();
    expect(api.sheetsSheet).toHaveBeenCalledWith(7, { op: "add" });
  });

  it("enregistre avec Ctrl+S", async () => {
    const { api, grid } = await openBudget();
    fireEvent.keyDown(grid, { key: "1" });
    fireEvent.keyDown(screen.getByLabelText("A1"), { key: "Enter" });
    await screen.findByText("Modifications non enregistrées");
    fireEvent.keyDown(grid, { key: "s", ctrlKey: true });
    await waitFor(() => expect(api.sheetsSave).toHaveBeenCalledWith(7));
    await waitFor(() => expect(saveStatus()).toBe("Enregistré"));
  });

  it("demande s'il faut enregistrer avant de fermer un classeur modifié", async () => {
    const { api, grid } = await openBudget();
    fireEvent.keyDown(grid, { key: "1" });
    fireEvent.keyDown(screen.getByLabelText("A1"), { key: "Enter" });
    await screen.findByText("Modifications non enregistrées");
    fireEvent.click(screen.getByRole("button", { name: "Retour à la bibliothèque" }));
    const dialog = screen.getByRole("alertdialog", { name: "Enregistrer les modifications de « budget.xlsx » ?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Annuler" }));
    expect(screen.getByRole("heading", { name: "budget.xlsx" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Retour à la bibliothèque" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Ne pas enregistrer" }));
    await waitFor(() => expect(api.sheetsClose).toHaveBeenCalledWith(7, true));
    expect(await screen.findByRole("heading", { name: "Documents", level: 1 })).toBeTruthy();
    expect(api.sheetsSave).not.toHaveBeenCalled();
  });

  it("propose de récupérer un classeur après un incident", async () => {
    const api = fakeApi({ files: ["devis.xlsx"], recoveries: [{ path: "devis.xlsx", file: "r.xlsx", saved_at_ms: 1 }] });
    render(<App api={api} />);
    const region = await screen.findByRole("region", { name: "Documents récupérables" });
    fireEvent.click(within(region).getByRole("button", { name: "Récupérer" }));
    expect(await screen.findByRole("heading", { name: "devis.xlsx" })).toBeTruthy();
    expect(screen.getByText("Récupéré après incident — enregistrez pour conserver")).toBeTruthy();
    expect(api.sheetsOpenRecovery).toHaveBeenCalledWith("devis.xlsx");
  });

  it("crée un nouveau classeur depuis l'accueil", async () => {
    const api = fakeApi();
    render(<App api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Nouveau classeur" }));
    expect(await screen.findByRole("heading", { name: "Classeur.xlsx" })).toBeTruthy();
    expect(api.sheetsCreate).toHaveBeenCalledWith("");
  });
});
