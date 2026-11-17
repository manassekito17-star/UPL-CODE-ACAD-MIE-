import { describe, expect, it } from "vitest";
import { pythonHint } from "./python-hints";

describe("explications des erreurs Python", () => {
  it("int() appliqué au texte de la question (input mal placé)", () => {
    const h = pythonHint('Traceback (most recent call last):\n  File "Fhfg.py", line 2, in <module>\n    age = input (int("entre ton age "))\nValueError: invalid literal for int() with base 10: \'entre ton age \'');
    expect(h).toMatch(/int\(input\("Entre ton âge : "\)\)/);
  });
  it("valeur saisie qui n'est pas un nombre, entrée manquante, texte + nombre", () => {
    expect(pythonHint("ValueError: invalid literal for int() with base 10: '12.5'")).toMatch(/Entrées/);
    expect(pythonHint("EOFError: EOF when reading a line")).toMatch(/case « Entrées » est vide/);
    expect(pythonHint('TypeError: can only concatenate str (not "int") to str')).toMatch(/str\(age\)/);
    expect(pythonHint("NameError: name 'Age' is not defined")).toMatch(/« Age »/);
    expect(pythonHint("tout va bien")).toBeUndefined();
  });
});
