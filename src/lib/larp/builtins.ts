/** Fonctions prédéfinies du langage classique (noms et synonymes documentés). */
import { norm } from "./lexer";
import { clone, cont, equals, flt, fmt, fmtFloat, int, RunError, str, toInt, toNum, type Val, type Value } from "./values";

export type BuiltinCtx = { sep: () => string; eof: (canal: number) => boolean; random: () => number };
type Fn = (args: Val[], ctx: BuiltinCtx) => Val;

const need = (args: Val[], n: number | number[], name: string) => {
  const ok = Array.isArray(n) ? n.includes(args.length) : args.length === n;
  if (!ok) throw new RunError(`${name} : nombre d'arguments incorrect (${args.length} reçu${args.length > 1 ? "s" : ""}).`);
};
const f1 = (name: string, f: (x: number) => number): Fn => (a) => {
  need(a, 1, name);
  return flt(f(toNum(a[0]).v as number));
};

function pad(s: string, width: number, left: boolean) {
  if (s.length >= width) return s;
  return left ? s + " ".repeat(width - s.length) : " ".repeat(width - s.length) + s;
}

function sci(v: number, digits: number) {
  const s = v.toExponential(Math.max(0, digits - 1)).toUpperCase();
  const [m, e] = s.split("E");
  const sign = e.startsWith("-") ? "-" : "+";
  return `${m}E${sign}${e.replace(/^[-+]/, "").padStart(3, "0")}`;
}

const thousands = (s: string) => {
  const [i, d] = s.split(".");
  const neg = i.startsWith("-");
  const g = (neg ? i.slice(1) : i).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "-" : "") + g + (d !== undefined ? "." + d : "");
};

/** FORMATER(chaîne de formatage, arguments…) : %[-][largeur][.précision]type (d e f g n m s x). */
export function formater(args: Val[], sep: string): string {
  if (!args.length) throw new RunError("FORMATER : une chaîne de formatage est requise.");
  const f = args[0];
  if (!f || f.k !== "s") throw new RunError("FORMATER : le premier argument doit être une chaîne de formatage.");
  let k = 1;
  return f.v.replace(/%(-?)(\d*)(?:\.(\d+))?([a-zA-Z%])/g, (all, l: string, w: string, p: string | undefined, t: string) => {
    if (t === "%") return "%";
    const left = l === "-";
    const width = w ? Number(w) : 0;
    const prec = p !== undefined ? Number(p) : undefined;
    if (k >= args.length) throw new RunError("FORMATER : il manque des arguments pour la chaîne de formatage.");
    const a = args[k++];
    let s: string;
    switch (t.toLowerCase()) {
      case "d": {
        const n = toInt(a);
        s = String(Math.abs(n)).padStart(prec ?? 0, "0");
        if (n < 0) s = "-" + s;
        break;
      }
      case "x":
        s = (toInt(a) >>> 0).toString(16).toUpperCase().padStart(prec ?? 0, "0");
        break;
      case "e":
        s = sci(toNum(a).v as number, prec ?? 15);
        break;
      case "f":
        s = prec === undefined ? fmtFloat(toNum(a).v as number) : (toNum(a).v as number).toFixed(prec);
        break;
      case "g": {
        const v = toNum(a).v as number;
        s = fmtFloat(Number(v.toPrecision(prec ?? 15)));
        break;
      }
      case "n":
        s = thousands((toNum(a).v as number).toFixed(prec ?? 2));
        break;
      case "m":
        s = "$" + thousands((toNum(a).v as number).toFixed(prec ?? 2));
        break;
      case "s": {
        s = fmt(a, sep);
        if (prec !== undefined) s = s.slice(0, prec);
        break;
      }
      default:
        throw new RunError(`FORMATER : spécificateur inconnu « ${all} ».`);
    }
    return pad(s, width, left);
  });
}

function chars(v: Val, sep: string): Val[] {
  if (v === null) return [];
  if (v.k === "c") return v.v.flatMap((x) => chars(x, sep));
  return [...fmt(v, sep)].map((c) => str(c));
}

function concatText(v: Val, sep: string): string {
  if (v === null) return "";
  if (v.k === "c") return v.v.map((x) => concatText(x, sep)).join("");
  return fmt(v, sep);
}

const table: Record<string, Fn> = {
  ABSOLU: (a) => {
    need(a, 1, "ABSOLU");
    const n = toNum(a[0]);
    return n.k === "i" ? int(Math.abs(n.v)) : flt(Math.abs(n.v));
  },
  ALEATOIRE: (a, ctx) => {
    need(a, [0, 1, 2], "ALÉATOIRE");
    const r = ctx.random();
    if (a.length === 0) return flt(r);
    if (a.length === 1) {
      const p = toNum(a[0]);
      return p.k === "i" ? int(Math.floor(r * p.v)) : flt(r * p.v);
    }
    const p = toNum(a[0]);
    const q = toNum(a[1]);
    if (p.k === "i" && q.k === "i") return int(p.v + Math.floor(r * (q.v - p.v)));
    return flt((p.v as number) + r * ((q.v as number) - (p.v as number)));
  },
  ARCTANGENTE: f1("ARCTANGENTE", Math.atan),
  ARRONDIR: (a) => {
    need(a, 1, "ARRONDIR");
    const n = toNum(a[0]);
    if (n.k === "i") return n;
    return int(Math.sign(n.v) * Math.round(Math.abs(n.v)));
  },
  CAPACITE: (a) => {
    need(a, 1, "CAPACITÉ");
    const c = a[0];
    if (!c || c.k !== "c") throw new RunError("CAPACITÉ : un conteneur est attendu.");
    return int(c.v.length);
  },
  COMPTER: (a, ctx) => {
    need(a, 1, "COMPTER");
    const c = a[0];
    if (c === null) throw new RunError("COMPTER : valeur indéfinie.");
    if (c.k === "c") return int(c.v.filter((x) => x !== null).length);
    return int([...fmt(c, ctx.sep())].length);
  },
  COSINUS: f1("COSINUS", Math.cos),
  DATE: (a) => {
    need(a, 0, "DATE");
    const d = new Date();
    return cont([int(d.getFullYear()), int(d.getMonth() + 1), int(d.getDate()), int(d.getDay() + 1)]);
  },
  ENCARACTERES: (a, ctx) => {
    need(a, 1, "ENCARACTÈRES");
    return cont(chars(a[0], ctx.sep()));
  },
  ENCHAINE: (a, ctx) => {
    need(a, 1, "ENCHAÎNE");
    return str(concatText(a[0], ctx.sep()));
  },
  EXP: (a) => {
    need(a, 0, "EXP");
    return flt(Math.E);
  },
  FINDECONTENU: (a, ctx) => {
    need(a, 1, "FINDECONTENU");
    return { k: "b", v: ctx.eof(toInt(a[0])) };
  },
  FORMATER: (a, ctx) => str(formater(a, ctx.sep())),
  HEURE: (a) => {
    need(a, 0, "HEURE");
    const d = new Date();
    return cont([int(d.getHours()), int(d.getMinutes()), int(d.getSeconds()), int(d.getMilliseconds())]);
  },
  LOG10: f1("LOG10", Math.log10),
  LOGE: f1("LOGE", Math.log),
  MAJUSCULES: (a, ctx) => {
    need(a, 1, "MAJUSCULES");
    return str(fmt(a[0], ctx.sep()).toUpperCase());
  },
  MINUSCULES: (a, ctx) => {
    need(a, 1, "MINUSCULES");
    return str(fmt(a[0], ctx.sep()).toLowerCase());
  },
  MAXIMUM: (a) => {
    if (a.length < 2) throw new RunError("MAXIMUM : au moins deux valeurs sont requises.");
    let best = toNum(a[0]);
    for (const x of a.slice(1)) {
      const n = toNum(x);
      if ((n.v as number) > (best.v as number)) best = n;
    }
    return best;
  },
  MINIMUM: (a) => {
    if (a.length < 2) throw new RunError("MINIMUM : au moins deux valeurs sont requises.");
    let best = toNum(a[0]);
    for (const x of a.slice(1)) {
      const n = toNum(x);
      if ((n.v as number) < (best.v as number)) best = n;
    }
    return best;
  },
  PI: (a) => {
    need(a, 0, "PI");
    return flt(Math.PI);
  },
  PLAFOND: (a) => {
    need(a, 1, "PLAFOND");
    return int(Math.ceil(toNum(a[0]).v as number));
  },
  PLANCHER: (a) => {
    need(a, 1, "PLANCHER");
    return int(Math.floor(toNum(a[0]).v as number));
  },
  POSITION: (a, ctx) => {
    need(a, 2, "POSITION");
    const [x, c] = a;
    if (c === null) throw new RunError("POSITION : valeur indéfinie.");
    if (c.k === "c") return int(c.v.findIndex((e) => equals(e, x)) + 1);
    return int(fmt(c, ctx.sep()).indexOf(fmt(x, ctx.sep())) + 1);
  },
  RACINE: (a) => {
    need(a, 1, "RACINE");
    const v = toNum(a[0]).v as number;
    if (v < 0) throw new RunError("RACINE : racine carrée d'un nombre négatif.");
    return flt(Math.sqrt(v));
  },
  SINUS: f1("SINUS", Math.sin),
  SOUSENSEMBLE: (a, ctx) => {
    need(a, 3, "SOUSENSEMBLE");
    const [c, d, l] = a;
    const start = Math.max(1, toInt(d));
    const len = Math.max(0, toInt(l));
    if (c === null) throw new RunError("SOUSENSEMBLE : valeur indéfinie.");
    if (c.k === "c") return cont(c.v.slice(start - 1, start - 1 + len).map(clone));
    return str([...fmt(c, ctx.sep())].slice(start - 1, start - 1 + len).join(""));
  },
};

const SYN: Record<string, string> = {
  ABS: "ABSOLU",
  ALEA: "ALEATOIRE",
  ARCTAN: "ARCTANGENTE",
  ARR: "ARRONDIR",
  CAP: "CAPACITE",
  COMPT: "COMPTER",
  LONGUEUR: "COMPTER",
  COS: "COSINUS",
  ENCARAC: "ENCARACTERES",
  FDC: "FINDECONTENU",
  MAX: "MAXIMUM",
  MIN: "MINIMUM",
  PLAF: "PLAFOND",
  PLAN: "PLANCHER",
  POS: "POSITION",
  SIN: "SINUS",
};

export function builtin(key: string): Fn | undefined {
  const k = norm(key);
  return table[SYN[k] ?? k];
}

/** Noms réservés aux fonctions prédéfinies (interdits comme noms de variables ou de modules). */
export const BUILTIN_NAMES = new Set([...Object.keys(table), ...Object.keys(SYN)]);

export type { Value };
