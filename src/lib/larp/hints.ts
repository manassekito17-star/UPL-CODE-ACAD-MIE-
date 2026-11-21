import { BUILTIN_NAMES } from "./builtins";
import { KEYWORDS, norm } from "./lexer";

/**
 * « Comment corriger » : pour chaque erreur de LARP, une explication simple et la ligne à écrire,
 * à partir du message d'erreur et du texte de la ligne fautive.
 */

/** Distance d'édition (fautes de frappe : lettre oubliée, en trop, inversée). */
export function distance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  return d[a.length][b.length];
}

/** Le nom connu le plus proche (fautes de frappe), ou null si aucun ne ressemble assez. */
export function closest(word: string, names: Iterable<string>): string | null {
  const w = norm(word);
  let best: string | null = null;
  let bestD = Infinity;
  for (const n of names) {
    const d = distance(w, norm(n));
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  const max = w.length <= 3 ? 1 : w.length <= 6 ? 2 : 3;
  return best && bestD > 0 && bestD <= max ? best : null;
}

/** Mots des instructions, écrits comme on les tape (avec accents). */
const STATEMENTS = ["ÉCRIRE", "LIRE", "SI", "SINON", "FINSI", "POUR", "FINPOUR", "TANTQUE", "FINTANTQUE", "RÉPÉTER", "JUSQU'À", "EXÉCUTER", "RETOURNER", "DÉBUT", "FIN", "ALORS", "FAIRE", "SÉLECTIONNER", "FINSÉLECTIONNER"];

/** Noms des fonctions prédéfinies, tels qu'on les écrit. */
const FUNCTIONS = ["ABSOLU", "ALÉATOIRE", "ARRONDIR", "CHAÎNE", "COMPTER", "COSINUS", "ENTIER", "FLOTTANT", "LONGUEUR", "MAJUSCULES", "MAXIMUM", "MINIMUM", "MINUSCULES", "PLAFOND", "PLANCHER", "POSITION", "RACINE", "SINUS", "SOUSENSEMBLE", "TAILLE", "TANGENTE", "TRONQUER"];

const TEMPLATES: Record<string, string> = {
  ALORS: "Une condition SI se termine par ALORS :\n  SI note >= 10 ALORS\n    ÉCRIRE \"Admis\"\n  FINSI",
  FINSI: "Chaque SI doit être fermé par FINSI (avant FIN ou avant le bloc suivant) :\n  SI x > 0 ALORS\n    ÉCRIRE \"positif\"\n  FINSI",
  FAIRE: "La ligne de la boucle se termine par FAIRE :\n  POUR i = 1 JUSQU'À 10 FAIRE\n  TANTQUE x < 10 FAIRE",
  FINPOUR: "Chaque POUR doit être fermé par FINPOUR :\n  POUR i = 1 JUSQU'À 5 FAIRE\n    ÉCRIRE i\n  FINPOUR",
  FINTANTQUE: "Chaque TANTQUE doit être fermé par FINTANTQUE :\n  TANTQUE x < 10 FAIRE\n    x = x + 1\n  FINTANTQUE",
  "JUSQU'À": "Une boucle POUR s'écrit avec JUSQU'À (ou JUSQU'A) :\n  POUR i = 1 JUSQU'À 10 FAIRE",
  FINSÉLECTIONNER: "Chaque SÉLECTIONNER doit être fermé par FINSÉLECTIONNER.",
};

const quoted = (message: string, after: string) => {
  const m = new RegExp(`${after}\\s*«\\s*([^»]+?)\\s*»`).exec(message);
  return m ? m[1] : null;
};

/**
 * Conseil de correction pour une erreur LARP.
 * @param message  le message de l'erreur
 * @param lineText le texte de la ligne indiquée par l'erreur
 * @param modules  noms des modules du projet (pour EXÉCUTER)
 */
export function fixHint(message: string, lineText = "", modules: string[] = []): string | null {
  const line = lineText.trim();

  // Fonction inconnue : faute de frappe, tableau écrit avec ( ), ou fonction d'un autre langage.
  const fn = quoted(message, "Module ou fonction");
  if (fn) {
    const guess = closest(fn, [...FUNCTIONS, ...BUILTIN_NAMES, ...modules]);
    if (guess) return `« ${fn} » n'existe pas. Vouliez-vous dire ${guess}( ) ? Remplacez ${fn} par ${guess}.`;
    if (/^(LEN|SIZE|LENGTH|COUNT)$/i.test(fn)) return `En LARP, la taille d'un tableau s'écrit TAILLE(T) ou LONGUEUR(T).`;
    if (/^(PRINT|PRINTF|CONSOLE)$/i.test(fn)) return `Pour afficher, écrivez : ÉCRIRE "texte", variable`;
    if (/^(INPUT|SCANF|READ)$/i.test(fn)) return `Pour lire une valeur, écrivez : LIRE variable`;
    return `« ${fn} » n'est ni une fonction de LARP ni un module du projet.\n• Pour un tableau, utilisez des crochets : ${fn}[i] au lieu de ${fn}(i).\n• Pour un module, créez-le dans le Navigateur (Projet » Nouveau module).\n• Liste des fonctions : menu Aide.`;
  }
  const ins = quoted(message, "Instruction inconnue");
  if (ins) {
    const guess = closest(ins, STATEMENTS);
    if (guess) return `Faute de frappe ? Écrivez ${guess} au lieu de ${ins}.`;
    return `« ${ins} » n'est pas une instruction. Pour donner une valeur, écrivez : ${ins} = 0 (ou ${ins} ← 0). Pour exécuter un module : EXÉCUTER ${ins}.`;
  }
  const mod = quoted(message, "Module");
  if (mod && /inexistant/.test(message)) {
    const guess = closest(mod, modules);
    return guess ? `Vouliez-vous dire le module ${guess} ? Écrivez EXÉCUTER ${guess}.` : `Créez d'abord le module « ${mod} » (Projet » Nouveau module), ou corrigez son nom.`;
  }

  // Mot attendu : faute de frappe sur ce mot, ou mot oublié.
  const exp = /^(?:«\s*)?([^\s»]+)(?:\s*»)? attendu, trouvé (.+)\.$/.exec(message);
  if (exp) {
    const [, want, found] = exp;
    const raw = /«\s*(.+?)\s*»/.exec(found)?.[1];
    if (raw && !KEYWORDS.has(norm(raw)) && distance(norm(raw), norm(want)) <= 2 && /^[\p{L}']+$/u.test(raw)) return `Faute de frappe : écrivez ${want} au lieu de ${raw}.`;
    if (TEMPLATES[want]) return `Il manque ${want}. ${TEMPLATES[want]}`;
    if (want === "=" && /^POUR/i.test(line)) return "Une boucle POUR s'écrit : POUR i = 1 JUSQU'À 10 FAIRE";
    if (want === ")") return "Une parenthèse ( n'est pas fermée : ajoutez ) à la fin.";
    if (want === "]") return "Un crochet [ n'est pas fermé : ajoutez ] (ex. NOTE[i]).";
    return `Il manque ${want} sur cette ligne (avant ${found}).`;
  }
  if (/Fin d'instruction attendue/.test(message)) {
    const raw = quoted(message, "trouvé");
    const first = /^[\p{L}']+/u.exec(line)?.[0];
    const guess = first && !STATEMENTS.some((k) => norm(k) === norm(first)) ? closest(first, STATEMENTS) : null;
    if (guess) return `Faute de frappe : écrivez ${guess} au lieu de ${first}.`;
    if (/^(ÉCRIRE|ECRIRE|AFFICHER)/i.test(line)) return `Dans ÉCRIRE, séparez chaque élément par une virgule : ÉCRIRE "Somme = ", somme`;
    if (/^(LIRE|SAISIR)/i.test(line)) return "Pour lire plusieurs valeurs, séparez-les par des virgules : LIRE a, b";
    if (raw === ";") return "Retirez le point-virgule « ; » : LARP n'en utilise pas en fin de ligne.";
    return `Une seule instruction par ligne : passez à la ligne avant « ${raw ?? "…"} », ou vérifiez qu'il ne manque pas un opérateur (+, -, *, /) ou une virgule.`;
  }
  if (/Expression incomplète|Valeur attendue/.test(message)) {
    if (/(=|←|<-)\s*$/.test(line)) return "Après le signe =, écrivez la valeur : x = 0";
    if (/[-+*/^]\s*$/.test(line)) return "La ligne se termine par un opérateur : ajoutez la valeur qui manque (ex. somme + note).";
    if (/\(\s*\)/.test(line) || /,\s*[,)]/.test(line)) return "Une valeur manque entre les parenthèses ou après une virgule.";
    return "Une valeur manque : vérifiez qu'il ne reste pas un opérateur, une virgule ou une parenthèse sans valeur.";
  }
  if (/Chaîne de caractères non terminée/.test(message)) return "Fermez le texte avec le même guillemet qu'au début : ÉCRIRE \"Bonjour\"";
  const ch = quoted(message, "Caractère inattendu");
  if (ch) {
    if (ch === ";") return "Retirez le point-virgule « ; » : LARP n'en utilise pas.";
    if (ch === "{" || ch === "}") return "LARP n'utilise pas d'accolades : les blocs se ferment avec FINSI, FINPOUR, FINTANTQUE.";
    if (ch === "“" || ch === "”" || ch === "«" || ch === "»") return "Utilisez les guillemets droits \" (clavier anglais) et non “ ” ou « ».";
    return `Supprimez le caractère « ${ch} » ou remplacez-le par l'opérateur voulu (+ - * / = < >).`;
  }
  if (/Nombre mal formé/.test(message)) return "Un nombre décimal s'écrit avec un point : 2.5 (et non 2,5 dans le code).";
  if (/opérateurs relationnels ne peuvent pas être enchaînés/.test(message)) return "Écrivez : SI a > 5 ET a < 10 ALORS";
  if (/Affectation invalide/.test(message)) return "À gauche du = il faut un nom de variable : somme = a + b (et non a + b = somme).";
  if (/un seul SINON/.test(message)) return "Pour plusieurs cas, écrivez SINON SI condition ALORS, puis un seul SINON à la fin.";
  if (/Aucune instruction ne peut suivre FIN/.test(message)) return "Déplacez ces lignes avant FIN, ou supprimez-les. Vérifiez aussi qu'un FINSI/FINPOUR n'a pas été écrit FIN.";
  if (/se termine par FIN/.test(message)) return "Remplacez RETOURNER par FIN à la fin du module principal.";
  if (/se termine par RETOURNER/.test(message)) return "Remplacez FIN par RETOURNER à la fin de ce module.";
  if (/DÉBUT ne peut apparaître/.test(message)) return "Gardez un seul DÉBUT, sur la première ligne du module principal.";
  if (/Instruction (attendue|inattendue)/.test(message)) {
    const raw = quoted(message, "trouvé") ?? quoted(message, "inattendue");
    if (raw && /^FIN/i.test(raw)) return `« ${raw} » ne ferme aucun bloc ouvert ici : vérifiez que le SI/POUR/TANTQUE correspondant existe, ou supprimez cette ligne.`;
    return "Commencez la ligne par une instruction : ÉCRIRE, LIRE, SI, POUR, TANTQUE ou variable = valeur.";
  }

  // Erreurs pendant l'exécution.
  if (/Division( entière)? par zéro|Modulo par zéro/.test(message)) return "Le diviseur vaut 0. Vérifiez-le avant : SI b <> 0 ALORS … FINSI";
  if (/Types incompatibles/.test(message)) {
    if (/chaîne/.test(message)) return "Un texte est mélangé à un nombre. Convertissez : ENTIER(x) ou FLOTTANT(x) pour un nombre, CHAÎNE(x) pour un texte. Un texte s'écrit entre guillemets.";
    if (/vrai\/faux/.test(message)) return "VRAI/FAUX ne se calcule pas avec des nombres : utilisez une condition (SI x = VRAI ALORS).";
    return "Les deux valeurs ne sont pas du même type : convertissez avec ENTIER( ), FLOTTANT( ) ou CHAÎNE( ).";
  }
  if (/indéfinie|#IND/.test(message)) return "Une variable est utilisée avant d'avoir reçu une valeur. Donnez-lui une valeur avant (somme = 0) ou lisez-la (LIRE x). Vérifiez aussi l'orthographe du nom.";
  if (/positions d'un conteneur commencent à 1/.test(message)) return "Les cases d'un tableau sont numérotées à partir de 1 : POUR i = 1 JUSQU'À TAILLE(T) FAIRE";
  if (/n'est pas un conteneur/.test(message)) return "Les crochets [ ] ne s'utilisent qu'avec un tableau. Créez-le d'abord : T = [ ] ou T[1] = valeur.";
  if (/Une condition doit être vraie ou fausse/.test(message)) return "Une condition compare deux valeurs : SI x = 5 ALORS (et non SI x ALORS quand x est un nombre).";
  if (/incrément d'une boucle POUR ne peut pas être 0/.test(message)) return "Utilisez un pas différent de 0 : POUR i = 10 JUSQU'À 1 INCRÉMENT -1 FAIRE";
  if (/Pile d'appels saturée/.test(message)) return "Un module s'appelle sans fin : ajoutez une condition d'arrêt (SI n <= 1 ALORS …).";
  if (/Débordement/.test(message)) return "Le nombre devient trop grand : vérifiez la condition d'arrêt de la boucle.";
  return null;
}
