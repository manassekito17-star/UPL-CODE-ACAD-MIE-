/**
 * Valeurs du langage classique (compatible LARP) : entiers, flottants, chaînes,
 * conteneurs (tableaux hétérogènes indexés à partir de 1) et valeur indéfinie
 * (#IND). Le type d'une variable dépend de son contenu (polymorphisme
 * contextuel) ; les conversions suivent les règles documentées.
 */

export type Value =
  | { k: "i"; v: number }
  | { k: "f"; v: number }
  | { k: "s"; v: string }
  | { k: "c"; v: Array<Value | null> }
  | { k: "b"; v: boolean };

export type Num = { k: "i"; v: number } | { k: "f"; v: number };

/** null = valeur indéfinie (#IND). */
export type Val = Value | null;

export class RunError extends Error {}

export const INT_MIN = -2147483648;
export const INT_MAX = 2147483647;

export const int = (v: number): Value => {
  if (!Number.isFinite(v) || v < INT_MIN || v > INT_MAX) throw new RunError("Débordement : une valeur entière doit rester entre -2147483648 et 2147483647.");
  return { k: "i", v: Math.trunc(v) };
};
export const flt = (v: number): Value => {
  if (Number.isNaN(v)) throw new RunError("Opération mathématique invalide (résultat non numérique).");
  if (!Number.isFinite(v)) throw new RunError("Débordement : valeur flottante hors limites (1.7E308).");
  return { k: "f", v };
};
export const str = (v: string): Value => ({ k: "s", v });
export const bool = (v: boolean): Value => ({ k: "b", v });
export const cont = (v: Array<Value | null>): Value => ({ k: "c", v });

export function clone(v: Val): Val {
  if (v && v.k === "c") return { k: "c", v: v.v.map(clone) };
  return v;
}

const INT_RE = /^\s*[-+]?\d+\s*$/;
const FLT_RE = /^\s*[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?\s*$/;

/** Conversion d'une chaîne en nombre (null si impossible). */
export function parseNumber(s: string): Num | null {
  if (INT_RE.test(s)) {
    const n = Number(s);
    if (n >= INT_MIN && n <= INT_MAX) return { k: "i", v: n };
    return { k: "f", v: n };
  }
  if (FLT_RE.test(s)) return { k: "f", v: Number(s) };
  return null;
}

/** Valeur lue au clavier ou dans un tampon : entier, flottant ou chaîne. */
export function inputValue(s: string): Value {
  if (/^[-+]?\d+$/.test(s)) {
    const n = Number(s);
    return n >= INT_MIN && n <= INT_MAX ? { k: "i", v: n } : { k: "f", v: n };
  }
  if (/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(s)) return { k: "f", v: Number(s) };
  return { k: "s", v: s };
}

export const typeName = (v: Val) =>
  v === null ? "indéfinie" : v.k === "i" ? "entier" : v.k === "f" ? "flottant" : v.k === "s" ? "chaîne de caractères" : v.k === "c" ? "conteneur" : "vrai/faux";

/** Affichage d'un flottant : 15 chiffres significatifs, zéros inutiles retirés, exposant « E ». */
export function fmtFloat(v: number): string {
  if (v === 0) return "0";
  const s = v.toPrecision(15);
  if (s.includes("e")) {
    const [m, e] = s.split("e");
    const mm = m.includes(".") ? m.replace(/0+$/, "").replace(/\.$/, "") : m;
    return `${mm}E${e.startsWith("+") ? e.slice(1) : e}`;
  }
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
}

/** Représentation affichée par ÉCRIRE (sep = séparateur actif). */
export function fmt(v: Val, sep = " "): string {
  if (v === null) return "#IND";
  switch (v.k) {
    case "i":
      return String(v.v);
    case "f":
      return fmtFloat(v.v);
    case "s":
      return v.v;
    case "b":
      return v.v ? "VRAI" : "FAUX";
    case "c":
      return `[${v.v.map((x) => fmt(x, sep)).join(sep)}]`;
  }
}

export function toNum(v: Val, what = "une valeur numérique"): Num {
  if (v === null) throw new RunError("Valeur indéfinie (#IND) utilisée dans une expression.");
  if (v.k === "i" || v.k === "f") return v as Num;
  if (v.k === "s") {
    const n = parseNumber(v.v);
    if (n) return n;
    throw new RunError(`Types incompatibles : la chaîne « ${v.v} » n'est pas ${what}.`);
  }
  throw new RunError(`Types incompatibles : ${typeName(v)} utilisé là où ${what} est attendue.`);
}

export function toInt(v: Val): number {
  const n = toNum(v, "un nombre entier");
  return Math.trunc(n.v as number);
}

const isNum = (v: Value): v is { k: "i" | "f"; v: number } => v.k === "i" || v.k === "f";

function numOp(a: Value, b: Value, f: (x: number, y: number) => number, forceFloat = false): Value {
  const r = f(a.v as number, b.v as number);
  return !forceFloat && a.k === "i" && b.k === "i" ? int(r) : flt(r);
}

export function equals(a: Val, b: Val): boolean {
  if (a === null || b === null) return a === b;
  if (a.k === "c" || b.k === "c") {
    if (a.k !== "c" || b.k !== "c" || a.v.length !== b.v.length) return false;
    return a.v.every((x, i) => equals(x, b.v[i]));
  }
  return compare(a, b) === 0;
}

/** Comparaison (-1, 0, 1) de deux valeurs comparables. */
export function compare(a: Val, b: Val): number {
  if (a === null || b === null) throw new RunError("Valeur indéfinie (#IND) dans une comparaison.");
  if (a.k === "c" || b.k === "c") throw new RunError("Les conteneurs ne se comparent qu'avec = ou !=.");
  if (a.k === "b" || b.k === "b") {
    if (a.k === "b" && b.k === "b") return a.v === b.v ? 0 : a.v ? 1 : -1;
    throw new RunError("Types incompatibles dans la comparaison.");
  }
  let x: Value = a;
  let y: Value = b;
  if (isNum(x) !== isNum(y)) {
    const s = (isNum(x) ? y : x) as { k: "s"; v: string };
    const n = parseNumber(s.v);
    if (n) {
      if (isNum(x)) y = n;
      else x = n;
    } else {
      x = str(fmt(x));
      y = str(fmt(y));
    }
  }
  if (isNum(x) && isNum(y)) return x.v < y.v ? -1 : x.v > y.v ? 1 : 0;
  const s1 = (x as { v: string }).v;
  const s2 = (y as { v: string }).v;
  return s1 < s2 ? -1 : s1 > s2 ? 1 : 0;
}

export function binary(op: string, a: Val, b: Val): Value | null {
  switch (op) {
    case "+": {
      if (a === null || b === null) throw new RunError("Valeur indéfinie (#IND) utilisée dans une expression.");
      if (a.k === "c" || b.k === "c") {
        const l = a.k === "c" ? a.v.map(clone) : [clone(a)];
        const r = b.k === "c" ? b.v.map(clone) : [clone(b)];
        return cont([...l, ...r]);
      }
      if (a.k === "b" || b.k === "b") throw new RunError("Types incompatibles : vrai/faux dans une addition.");
      if (a.k === "s" && b.k === "s") return str(a.v + b.v);
      if (a.k === "s" || b.k === "s") {
        const s = (a.k === "s" ? a : b) as { k: "s"; v: string };
        const n = parseNumber(s.v);
        if (n) return a.k === "s" ? numOp(n, b, (x, y) => x + y) : numOp(a, n, (x, y) => x + y);
        return str(fmt(a) + fmt(b));
      }
      return numOp(a, b, (x, y) => x + y);
    }
    case "-": {
      if (a !== null && a.k === "c") {
        const rm = b !== null && b.k === "c" ? b.v : [b];
        const left = a.v.filter((x) => !rm.some((y) => equals(x, y))).map(clone);
        return left.length ? cont(left) : null;
      }
      return numOp(toNum(a), toNum(b), (x, y) => x - y);
    }
    case "*":
      return numOp(toNum(a), toNum(b), (x, y) => x * y);
    case "/": {
      const y = toNum(b);
      if (y.v === 0) throw new RunError("Division par zéro.");
      return numOp(toNum(a), y, (p, q) => p / q, true);
    }
    case "//": {
      const x = toInt(a);
      const y = toInt(b);
      if (y === 0) throw new RunError("Division entière par zéro.");
      return int(Math.trunc(x / y));
    }
    case "%": {
      const x = toInt(a);
      const y = toInt(b);
      if (y === 0) throw new RunError("Modulo par zéro.");
      return int(x % y);
    }
    case "^": {
      const x = toNum(a);
      const y = toNum(b);
      if (x.k === "i" && y.k === "i" && y.v >= 0) {
        const r = Math.pow(x.v, y.v);
        if (r >= INT_MIN && r <= INT_MAX) return int(r);
      }
      return flt(Math.pow(x.v, y.v));
    }
    case "=":
    case "!=": {
      if (a === null || b === null) throw new RunError("Valeur indéfinie (#IND) dans une comparaison.");
      const same = a.k === "c" || b.k === "c" ? equals(a, b) : compare(a, b) === 0;
      return bool(op === "=" ? same : !same);
    }
    case "<":
      return bool(compare(a, b) < 0);
    case "<=":
      return bool(compare(a, b) <= 0);
    case ">":
      return bool(compare(a, b) > 0);
    case ">=":
      return bool(compare(a, b) >= 0);
  }
  throw new RunError(`Opérateur inconnu ${op}.`);
}

export function truth(v: Val): boolean {
  if (v !== null && v.k === "b") return v.v;
  throw new RunError(`Une condition doit être vraie ou fausse (obtenu : ${v === null ? "#IND" : fmt(v)}).`);
}
