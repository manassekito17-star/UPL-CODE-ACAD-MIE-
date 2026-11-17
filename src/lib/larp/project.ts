/**
 * Projet de l'interface classique : un module principal, des modules
 * auxiliaires (pseudo-code ou organigramme) et des tampons d'entrées/sorties.
 * Les organigrammes réutilisent le modèle structuré de ZENTECH Flow Studio et se
 * traduisent en pseudo-code classique (avec correspondance bloc ↔ ligne pour
 * le surlignage pas-à-pas et la localisation des erreurs).
 */
import { newId, type AssignForm, type FlowKind, type FlowNode, type FlowProgram } from "../flow/model";
import type { CloudInfo } from "./cloud";
import type { SourceBuffer, SourceModule } from "./interpreter";

export type DocKind = "pseudo" | "organigramme" | "tampon";

export interface LarpDoc {
  id: string;
  kind: DocKind;
  name: string;
  main?: boolean;
  /** Pseudo-code (module) ou contenu (tampon). */
  code?: string;
  /** Organigramme. */
  flow?: FlowProgram;
  /** Organigramme auxiliaire : paramètres (ex. « X, RÉFÉRENCE Y »). */
  entree?: string;
  /** Organigramme auxiliaire : valeur de retour. */
  retour?: string;
}

export interface LarpProject {
  name: string;
  docs: LarpDoc[];
  /** Projet enregistré dans le compte (identifiant et révision côté serveur). */
  cloud?: CloudInfo;
}

export const MAIN_NAME = "PRINCIPAL";

export function newProject(kind: "pseudo" | "organigramme", name = "SansTitre"): LarpProject {
  const main: LarpDoc =
    kind === "pseudo" ? { id: newId(), kind, name: MAIN_NAME, main: true, code: "DÉBUT\n  \nFIN\n" } : { id: newId(), kind, name: MAIN_NAME, main: true, flow: { name: MAIN_NAME, vars: [], body: [] } };
  return { name, docs: [main] };
}

export function newModule(kind: "pseudo" | "organigramme", name: string): LarpDoc {
  return kind === "pseudo"
    ? { id: newId(), kind, name, code: `\\\\ Module auxiliaire ${name}\nENTRER\n  \nRETOURNER\n` }
    : { id: newId(), kind, name, flow: { name, vars: [], body: [] }, entree: "", retour: "" };
}

export function newBuffer(name: string): LarpDoc {
  return { id: newId(), kind: "tampon", name, code: "" };
}

/** Bloc d'organigramme avec des valeurs par défaut en syntaxe classique. */
export function larpNode(kind: FlowKind): FlowNode {
  const id = newId();
  switch (kind) {
    case "assign":
      return { id, kind, target: "", expr: "x = 0" };
    case "input":
      return { id, kind, target: "x" };
    case "output":
      return { id, kind, expr: '"Bonjour"' };
    case "if":
      return { id, kind, cond: "x > 0", yes: [], no: [] };
    case "while":
      return { id, kind, cond: "x > 0", body: [] };
    case "for":
      return { id, kind, variable: "i", from: "1", to: "10", step: "", body: [] };
    case "repeat":
      return { id, kind, cond: "x > 0", body: [] };
    case "call":
      return { id, kind, name: "Module", args: "" };
    case "comment":
      return { id, kind, text: "Commentaire" };
  }
}

/** Instruction(s) d'un bloc séquentiel (target vide : texte libre dans expr). */
export const processText = (n: Extract<FlowNode, { kind: "assign" }>) => (n.target ? `${n.target} = ${n.expr}` : n.expr);

export interface DocSource {
  code: string;
  /** Ligne (1…) → bloc d'organigramme ("debut" / "fin" pour les terminaux). */
  nodeAtLine: Map<number, string>;
  lineOfNode: Map<string, number>;
}

/** Texte classique d'un module (organigramme traduit au besoin). */
export function docSource(doc: LarpDoc): DocSource {
  if (doc.kind !== "organigramme" || !doc.flow) return { code: doc.code ?? "", nodeAtLine: new Map(), lineOfNode: new Map() };
  const lines: string[] = [];
  const nodeAtLine = new Map<number, string>();
  const lineOfNode = new Map<string, number>();
  const emit = (text: string, id: string, depth: number) => {
    lines.push("  ".repeat(depth) + text);
    nodeAtLine.set(lines.length, id);
    if (!lineOfNode.has(id)) lineOfNode.set(id, lines.length);
  };
  const seq = (list: FlowNode[], depth: number) => {
    for (const n of list) {
      switch (n.kind) {
        case "assign":
          for (const l of processText(n).split("\n")) if (l.trim()) emit(l.trim(), n.id, depth);
          if (!processText(n).trim()) emit("\\\\ (instruction vide)", n.id, depth);
          break;
        case "input":
          emit(`LIRE ${n.target}`, n.id, depth);
          break;
        case "output":
          emit(`ÉCRIRE ${n.expr}`, n.id, depth);
          break;
        case "call":
          emit(`EXÉCUTER ${n.name}${n.args.trim() ? `(${n.args})` : ""}`, n.id, depth);
          break;
        case "comment":
          for (const l of n.text.split("\n")) emit(`\\\\ ${l}`, n.id, depth);
          break;
        case "if":
          emit(`SI ${n.cond} ALORS`, n.id, depth);
          seq(n.yes, depth + 1);
          if (n.no.length) {
            lines.push("  ".repeat(depth) + "SINON");
            seq(n.no, depth + 1);
          }
          lines.push("  ".repeat(depth) + "FINSI");
          break;
        case "while":
          emit(`TANTQUE ${n.cond} FAIRE`, n.id, depth);
          seq(n.body, depth + 1);
          lines.push("  ".repeat(depth) + "FINTANTQUE");
          break;
        case "for":
          emit(`POUR ${n.variable} = ${n.from} JUSQU'À ${n.to}${n.step.trim() ? ` INCRÉMENT ${n.step}` : ""} FAIRE`, n.id, depth);
          seq(n.body, depth + 1);
          emit("FINPOUR", n.id, depth);
          break;
        case "repeat":
          lines.push("  ".repeat(depth) + "RÉPÉTER");
          seq(n.body, depth + 1);
          emit(`JUSQU'À ${n.cond}`, n.id, depth);
          break;
      }
    }
  };
  emit(doc.main ? "DÉBUT" : `ENTRER${doc.entree?.trim() ? ` ${doc.entree.trim()}` : ""}`, "debut", 0);
  seq(doc.flow.body, 1);
  emit(doc.main ? "FIN" : `RETOURNER${doc.retour?.trim() ? ` ${doc.retour.trim()}` : ""}`, "fin", 0);
  return { code: lines.join("\n") + "\n", nodeAtLine, lineOfNode };
}

/** Bloc correspondant à une ligne (ou au bloc précédent le plus proche). */
export function nodeForLine(src: DocSource, line: number): string | undefined {
  for (let l = line; l >= 1; l--) {
    const id = src.nodeAtLine.get(l);
    if (id) return id;
  }
  return undefined;
}

export function projectSources(p: LarpProject): { modules: SourceModule[]; buffers: SourceBuffer[]; sources: Map<string, DocSource> } {
  const sources = new Map<string, DocSource>();
  const modules: SourceModule[] = [];
  const buffers: SourceBuffer[] = [];
  for (const d of p.docs) {
    if (d.kind === "tampon") {
      buffers.push({ name: d.name, content: d.code ?? "" });
      continue;
    }
    const s = docSource(d);
    sources.set(d.name.toUpperCase(), s);
    modules.push({ name: d.name, main: !!d.main, code: s.code });
  }
  return { modules, buffers, sources };
}

// ---------------------------------------------------------------- Modèles du panneau (pseudo-code)

export interface Template {
  label: string;
  /** Lignes affichées dans le panneau (mots réservés en gras, éléments en italique entre accolades). */
  lines: string[];
  /** Texte inséré ; « {…} » = élément à compléter (sélectionné après insertion). */
  text: string;
}

export const PSEUDO_TEMPLATES: Template[] = [
  { label: "LIRE", lines: ["LIRE {liste_variables}"], text: "LIRE {liste_variables}" },
  { label: "LIRE DE", lines: ["LIRE {liste_variables} DE {numéro_canal}"], text: "LIRE {liste_variables} DE {numéro_canal}" },
  { label: "ÉCRIRE", lines: ["ÉCRIRE {liste_expressions}"], text: "ÉCRIRE {liste_expressions}" },
  { label: "ÉCRIRE DANS", lines: ["ÉCRIRE {liste_expressions} DANS {numéro_canal}"], text: "ÉCRIRE {liste_expressions} DANS {numéro_canal}" },
  { label: "REQUÊTE", lines: ["REQUÊTE {expression}, {liste_variables}"], text: "REQUÊTE {expression}, {liste_variables}" },
  { label: "SI", lines: ["SI {condition} ALORS", "   {suite_instructions}", "FINSI"], text: "SI {condition} ALORS\n  {suite_instructions}\nFINSI" },
  {
    label: "SI-SINON",
    lines: ["SI {condition} ALORS", "   {suite_instructions}", "SINON", "   {suite_instructions}", "FINSI"],
    text: "SI {condition} ALORS\n  {suite_instructions}\nSINON\n  {suite_instructions}\nFINSI",
  },
  {
    label: "SI-SINON SI",
    lines: ["SI {condition} ALORS", "   {suite_instructions}", "SINON SI {condition} ALORS", "   {suite_instructions}", "FINSI"],
    text: "SI {condition} ALORS\n  {suite_instructions}\nSINON SI {condition} ALORS\n  {suite_instructions}\nFINSI",
  },
  {
    label: "SÉLECTIONNER",
    lines: ["SÉLECTIONNER {expression}", "   {liste_expressions} : {suite_instructions}", "   SINON", "      {suite_instructions}", "FINSÉLECTIONNER"],
    text: "SÉLECTIONNER {expression}\n  {liste_constantes} : {suite_instructions}\n  SINON\n    {suite_instructions}\nFINSÉLECTIONNER",
  },
  { label: "TANTQUE", lines: ["TANTQUE {condition} FAIRE", "   {suite_instructions}", "FINTANTQUE"], text: "TANTQUE {condition} FAIRE\n  {suite_instructions}\nFINTANTQUE" },
  { label: "RÉPÉTER", lines: ["RÉPÉTER", "   {suite_instructions}", "JUSQU'À {condition}"], text: "RÉPÉTER\n  {suite_instructions}\nJUSQU'À {condition}" },
  {
    label: "POUR",
    lines: ["POUR {variable} = {début} JUSQU'À {fin} INCRÉMENT {pas} FAIRE", "   {suite_instructions}", "FINPOUR"],
    text: "POUR {variable} = {début} JUSQU'À {fin} FAIRE\n  {suite_instructions}\nFINPOUR",
  },
  {
    label: "POUR-INCRÉMENT",
    lines: ["POUR {variable} = {début} JUSQU'À {fin} INCRÉMENT {pas} FAIRE", "   {suite_instructions}", "FINPOUR"],
    text: "POUR {variable} = {début} JUSQU'À {fin} INCRÉMENT {pas} FAIRE\n  {suite_instructions}\nFINPOUR",
  },
  { label: "DÉBUT-FIN", lines: ["DÉBUT", "   {suite_instructions}", "FIN"], text: "DÉBUT\n  {suite_instructions}\nFIN" },
  { label: "EXÉCUTER", lines: ["EXÉCUTER {module}({liste_arguments})"], text: "EXÉCUTER {module}({liste_arguments})" },
  { label: "ENTRER", lines: ["ENTRER {liste_paramètres}", "   {suite_instructions}", "RETOURNER {valeur}"], text: "ENTRER {liste_paramètres}\n  {suite_instructions}\nRETOURNER {valeur}" },
  { label: "SÉPARATEUR", lines: ["SÉPARATEUR {caractère}"], text: 'SÉPARATEUR ","' },
  { label: "OUVRIR", lines: ["OUVRIR TAMPON {nom} SUR {canal} EN LECTURE"], text: 'OUVRIR TAMPON "{nom}" SUR {canal} EN LECTURE' },
  { label: "OUVRIR EN ÉCRITURE", lines: ["OUVRIR TAMPON {nom} SUR {canal} EN ÉCRITURE"], text: 'OUVRIR TAMPON "{nom}" SUR {canal} EN ÉCRITURE' },
  { label: "OUVRIR EN AJOUT", lines: ["OUVRIR TAMPON {nom} SUR {canal} EN AJOUT"], text: 'OUVRIR TAMPON "{nom}" SUR {canal} EN AJOUT' },
  { label: "OUVRIR FICHIER", lines: ["OUVRIR FICHIER {nom} SUR {canal} EN LECTURE"], text: 'OUVRIR FICHIER "{nom}" SUR {canal} EN LECTURE' },
  { label: "EST (type)", lines: ["SI {variable} EST {ENTIER|FLOTTANT|CHAÎNE|CONTENEUR|DÉFINIE} ALORS", "   {suite_instructions}", "FINSI"], text: "SI {variable} EST ENTIER ALORS\n  {suite_instructions}\nFINSI" },
  { label: "FERMER", lines: ["FERMER {liste_canaux}"], text: "FERMER {liste_canaux}" },
  { label: "DÉTRUIRE", lines: ["DÉTRUIRE {variable}"], text: "DÉTRUIRE {variable}" },
  { label: "COMPRESSER", lines: ["COMPRESSER {conteneur}"], text: "COMPRESSER {conteneur}" },
  { label: "Commentaire", lines: ["\\\\ {commentaire}"], text: "\\\\ {commentaire}" },
];

/**
 * Modèles du panneau (organigramme), comme dans LARP sur PC : chaque modèle crée
 * un bloc d'un type donné, prérempli (ex. REQUÊTE, OUVRIR, SÉLECTIONNER sont des
 * instructions séquentielles au contenu proposé). `mark` : texte dans la vignette.
 */
export interface FlowTemplate {
  id: string;
  kind: FlowKind;
  label: string;
  mark?: string;
  /** Figure particulière (bloc séquentiel) : requête, tampon, sélection. */
  form?: AssignForm;
  make: () => FlowNode;
}

type IfNode = Extract<FlowNode, { kind: "if" }>;
type LoopNode<K extends "while" | "repeat" | "for"> = Extract<FlowNode, { kind: K }>;
/** SI-SINON : une instruction à compléter dans chaque branche. */
const ifElse = (mirror: boolean): FlowNode => ({
  ...(larpNode("if") as IfNode),
  yes: [{ id: newId(), kind: "output", expr: '"Vrai"' }],
  no: [{ id: newId(), kind: "output", expr: '"Faux"' }],
  ...(mirror ? { mirror: true } : {}),
});

const seqBlock = (expr: string, form?: AssignForm) => (): FlowNode => ({ id: newId(), kind: "assign", target: "", expr, ...(form ? { form } : {}) });

export const FLOW_TEMPLATES: FlowTemplate[] = [
  { id: "assign", kind: "assign", label: "Instruction séquentielle", make: () => larpNode("assign") },
  { id: "input", kind: "input", label: "Entrée (LIRE)", make: () => larpNode("input") },
  { id: "output", kind: "output", label: "Sortie (ÉCRIRE)", make: () => larpNode("output") },
  { id: "call", kind: "call", label: "Appel de module (EXÉCUTER)", make: () => larpNode("call") },
  { id: "comment", kind: "comment", label: "Commentaire à gauche de la ligne", make: () => ({ id: newId(), kind: "comment", text: "Commentaire", side: "left" }) },
  { id: "comment-droite", kind: "comment", label: "Commentaire à droite de la ligne", make: () => ({ id: newId(), kind: "comment", text: "Commentaire", side: "right" }) },
  { id: "if", kind: "if", label: "SI (Vrai à gauche)", make: () => larpNode("if") },
  { id: "if-miroir", kind: "if", label: "SI (Vrai à droite)", make: () => ({ ...(larpNode("if") as IfNode), mirror: true }) },
  { id: "if-sinon", kind: "if", label: "SI-SINON (Vrai à gauche, Faux à droite)", make: () => ifElse(false) },
  { id: "if-sinon-miroir", kind: "if", label: "SI-SINON (Faux à gauche, Vrai à droite)", make: () => ifElse(true) },
  { id: "while", kind: "while", label: "TANTQUE (retour à gauche)", make: () => larpNode("while") },
  { id: "while-miroir", kind: "while", label: "TANTQUE (retour à droite)", make: () => ({ ...(larpNode("while") as LoopNode<"while">), mirror: true }) },
  { id: "repeat", kind: "repeat", label: "RÉPÉTER-JUSQU'À (retour à gauche)", make: () => larpNode("repeat") },
  { id: "repeat-miroir", kind: "repeat", label: "RÉPÉTER-JUSQU'À (retour à droite)", make: () => ({ ...(larpNode("repeat") as LoopNode<"repeat">), mirror: true }) },
  { id: "for", kind: "for", label: "POUR (retour à gauche)", make: () => larpNode("for") },
  { id: "for-miroir", kind: "for", label: "POUR (retour à droite)", make: () => ({ ...(larpNode("for") as LoopNode<"for">), mirror: true }) },
  { id: "while-losange", kind: "while", label: "TANTQUE avec losange (retour à gauche)", make: () => ({ ...(larpNode("while") as LoopNode<"while">), diamond: true }) },
  { id: "while-losange-miroir", kind: "while", label: "TANTQUE avec losange (retour à droite)", make: () => ({ ...(larpNode("while") as LoopNode<"while">), diamond: true, mirror: true }) },
  { id: "requete", kind: "assign", form: "requete", mark: "REQ", label: "Requête (REQUÊTE : message puis lecture)", make: seqBlock('REQUÊTE "Entrez une valeur : ", x', "requete") },
  { id: "lire-de", kind: "input", mark: "L#", label: "Lecture dans un tampon (LIRE … DE canal)", make: () => ({ id: newId(), kind: "input", target: "x DE 1" }) },
  { id: "ecrire-dans", kind: "output", mark: "É#", label: "Écriture dans un tampon (ÉCRIRE … DANS canal)", make: () => ({ id: newId(), kind: "output", expr: "x DANS 1" }) },
  {
    id: "selectionner",
    kind: "assign",
    form: "selection",
    mark: "SEL",
    label: "Sélection (SÉLECTIONNER … FINSÉLECTIONNER)",
    make: seqBlock('SÉLECTIONNER x\n  1 : ÉCRIRE "un"\n  2, 3 : ÉCRIRE "deux ou trois"\n  SINON\n    ÉCRIRE "autre"\nFINSÉLECTIONNER', "selection"),
  },
  { id: "ouvrir", kind: "assign", form: "tampon", mark: "OUV", label: "Ouvrir un tampon (OUVRIR … SUR canal EN LECTURE/ÉCRITURE/AJOUT)", make: seqBlock('OUVRIR TAMPON "Donnees" SUR 1 EN LECTURE', "tampon") },
  { id: "fermer", kind: "assign", form: "tampon", mark: "FER", label: "Fermer un tampon (FERMER canal)", make: seqBlock("FERMER 1", "tampon") },
  { id: "separateur", kind: "assign", mark: "SÉP", label: "Séparateur des valeurs (SÉPARATEUR)", make: seqBlock('SÉPARATEUR ","') },
  { id: "detruire", kind: "assign", mark: "DÉT", label: "Détruire une variable ou un élément (DÉTRUIRE)", make: seqBlock("DÉTRUIRE x") },
  { id: "compresser", kind: "assign", mark: "CMP", label: "Compresser un conteneur (COMPRESSER)", make: seqBlock("COMPRESSER t") },
];

export const flowTemplate = (id: string) => FLOW_TEMPLATES.find((t) => t.id === id);

// ---------------------------------------------------------------- Enregistrement local

export const STORE_KEY = "upl:larp:projets";

export function savedProjects(): Record<string, LarpProject> {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}") as Record<string, LarpProject>;
  } catch {
    return {};
  }
}

export function saveProject(p: LarpProject) {
  const all = savedProjects();
  all[p.name] = p;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}

export function deleteSaved(name: string) {
  const all = savedProjects();
  delete all[name];
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  } catch {
    /* stockage indisponible */
  }
}

/** Exemple fourni à l'ouverture (factorielle avec module auxiliaire). */
export function exampleProject(): LarpProject {
  return {
    name: "Exemple",
    docs: [
      {
        id: newId(),
        kind: "pseudo",
        name: MAIN_NAME,
        main: true,
        code: '\\\\ Module principal\nDÉBUT\n  REQUÊTE "Entrez un entier : ", N\n  ÉCRIRE "La factorielle de ", N, " est ", Factorielle(N)\nFIN\n',
      },
      {
        id: newId(),
        kind: "pseudo",
        name: "Factorielle",
        code: "\\\\ Module auxiliaire Factorielle\nENTRER n\n  F = 1\n  POUR i = 2 JUSQU'À n FAIRE\n    F = F * i\n  FINPOUR\nRETOURNER F\n",
      },
    ],
  };
}
