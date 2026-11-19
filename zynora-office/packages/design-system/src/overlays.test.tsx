import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button, Dialog, IconButton, TextField, ToastProvider, useToasts } from "./index";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function DialogHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Ouvrir</Button>
      <Dialog
        open={open}
        role="alertdialog"
        title="Supprimer ?"
        description="Action définitive."
        onClose={() => setOpen(false)}
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Annuler</Button>
            <Button variant="primary">Supprimer</Button>
          </>
        }
      />
    </>
  );
}

describe("Dialog", () => {
  it("prend le focus, le confine, se ferme avec Échap et rend le focus", () => {
    render(<DialogHarness />);
    const opener = screen.getByRole("button", { name: "Ouvrir" });
    opener.focus();
    fireEvent.click(opener);

    const dialog = screen.getByRole("alertdialog", { name: "Supprimer ?" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(screen.getByText("Action définitive.").id).toBe(dialog.getAttribute("aria-describedby"));
    const cancel = screen.getByRole("button", { name: "Annuler" });
    const confirm = screen.getByRole("button", { name: "Supprimer" });
    expect(document.activeElement).toBe(cancel);

    confirm.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(cancel);
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(confirm);

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});

describe("TextField", () => {
  it("relie l'étiquette et le message d'erreur au champ", () => {
    render(<TextField label="Nom du dossier" error="Nom réservé" defaultValue="CON" />);
    const input = screen.getByLabelText("Nom du dossier");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(input.getAttribute("aria-describedby") ?? "")?.textContent).toBe("Nom réservé");
  });
});

describe("IconButton", () => {
  it("a toujours un nom accessible", () => {
    render(
      <IconButton label="Ajouter aux favoris" aria-pressed={false}>
        ★
      </IconButton>,
    );
    expect(screen.getByRole("button", { name: "Ajouter aux favoris" }).getAttribute("type")).toBe("button");
  });
});

function ToastHarness({ onUndo }: { onUndo: () => void }) {
  const toast = useToasts();
  return (
    <Button onClick={() => toast({ tone: "success", message: "Placé dans la corbeille", action: { label: "Annuler", onAction: onUndo } })}>
      Agir
    </Button>
  );
}

describe("Toasts", () => {
  it("annonce le message, exécute l'action puis disparaît", () => {
    vi.useFakeTimers();
    const onUndo = vi.fn();
    render(
      <ToastProvider>
        <ToastHarness onUndo={onUndo} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Agir" }));
    expect(screen.getByRole("status").textContent).toContain("Placé dans la corbeille");
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(onUndo).toHaveBeenCalledOnce();
    expect(screen.getByRole("status").textContent).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Agir" }));
    act(() => {
      vi.advanceTimersByTime(6_001);
    });
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("exige un ToastProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ToastHarness onUndo={() => {}} />)).toThrow("ToastProvider");
  });
});
