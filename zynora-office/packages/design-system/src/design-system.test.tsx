import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button, NavItem, SegmentedControl, applyTheme, resolveTheme } from "./index";

afterEach(cleanup);

describe("resolveTheme", () => {
  it("suit le système uniquement en mode « system »", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

describe("applyTheme", () => {
  it("pose data-theme et suit les changements du système", () => {
    const listeners: Array<() => void> = [];
    const media = {
      matches: false,
      addEventListener: (_: string, fn: () => void) => listeners.push(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.splice(listeners.indexOf(fn), 1),
    };
    vi.stubGlobal("matchMedia", () => media);
    const root = document.createElement("html");

    const stop = applyTheme("system", root);
    expect(root.dataset.theme).toBe("light");
    media.matches = true;
    listeners.forEach((fn) => fn());
    expect(root.dataset.theme).toBe("dark");
    stop();
    expect(listeners).toHaveLength(0);

    applyTheme("light", root);
    expect(root.dataset.theme).toBe("light");
    expect(listeners).toHaveLength(0);
    vi.unstubAllGlobals();
  });
});

describe("Button", () => {
  it("est un bouton non soumis par défaut et applique la variante", () => {
    const onClick = vi.fn();
    render(<Button variant="primary" onClick={onClick}>Enregistrer</Button>);
    const button = screen.getByRole("button", { name: "Enregistrer" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.className).toContain("z-button--primary");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

function Controlled() {
  const [value, setValue] = useState<"a" | "b" | "c">("a");
  return (
    <SegmentedControl
      label="Choix"
      value={value}
      onChange={setValue}
      options={[
        { value: "a", label: "Alpha" },
        { value: "b", label: "Bêta" },
        { value: "c", label: "Gamma" },
      ]}
    />
  );
}

describe("SegmentedControl", () => {
  it("expose un groupe radio accessible, utilisable à la souris et au clavier", () => {
    render(<Controlled />);
    const group = screen.getByRole("radiogroup", { name: "Choix" });
    const radio = (name: string) => screen.getByRole("radio", { name });
    expect(radio("Alpha").getAttribute("aria-checked")).toBe("true");
    expect(radio("Alpha").tabIndex).toBe(0);
    expect(radio("Bêta").tabIndex).toBe(-1);

    fireEvent.click(radio("Gamma"));
    expect(radio("Gamma").getAttribute("aria-checked")).toBe("true");

    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(radio("Alpha").getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(radio("Alpha"));
    fireEvent.keyDown(group, { key: "ArrowLeft" });
    expect(radio("Gamma").getAttribute("aria-checked")).toBe("true");
  });

  it("n'appelle pas onChange pour l'option déjà choisie", () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="X" value="a" onChange={onChange} options={[{ value: "a", label: "A" }]} />);
    fireEvent.click(screen.getByRole("radio", { name: "A" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("NavItem", () => {
  it("signale la page courante et respecte l'état désactivé", () => {
    const onSelect = vi.fn();
    render(
      <>
        <NavItem icon={null} label="Accueil" current onSelect={onSelect} />
        <NavItem icon={null} label="Slides" disabled onSelect={onSelect} />
      </>,
    );
    expect(screen.getByRole("button", { name: "Accueil" }).getAttribute("aria-current")).toBe("page");
    fireEvent.click(screen.getByRole("button", { name: "Slides" }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
