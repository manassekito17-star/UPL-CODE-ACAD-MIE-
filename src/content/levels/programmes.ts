import { qcm, vraiFaux } from "../helpers";
import { levelExam, placement, type LevelPlan } from "./build";

const PRO_OBJECTIVES = (lang: string) => [
  `Concevoir l'architecture d'un programme ${lang} de taille réelle.`,
  "Mesurer et améliorer les performances.",
  "Écrire du code sûr et le tester automatiquement.",
  "Mener un projet professionnel de bout en bout.",
];

// =====================================================================
// Algorithmique et pseudocode
// =====================================================================
export const algorithmiqueLevels: LevelPlan[] = [
  {
    number: 1,
    title: "Niveau 1 — Très débutant : les fondements",
    description: "Aucune connaissance préalable. Vocabulaire, logique, méthode d'analyse, variables, types, opérateurs, entrées et sorties : tout ce qu'il faut pour écrire ses premiers algorithmes séquentiels.",
    objectives: ["Comprendre ce qu'est un algorithme et le vocabulaire de base.", "Raisonner avec des conditions logiques.", "Analyser un problème simple avant de l'écrire.", "Écrire, exécuter et tracer un algorithme séquentiel."],
    modules: [
      {
        slug: "fondements",
        title: "Les fondements",
        lessons: ["introduction-algorithmique", "logique-raisonnement", "analyse-problemes", "variables-constantes", "types-donnees", "operateurs", "entrees-sorties", "notion-algorithme"],
      },
    ],
    exam: levelExam("algorithmique-examen-niveau-1", "Examen du niveau 1 — Fondements de l'algorithmique", [
      qcm("Quelle propriété garantit qu'un algorithme s'arrête ?", ["La précision", "La finitude", "L'efficacité", "La lisibilité"], 1),
      qcm("Que vaut NON (VRAI ET FAUX) ?", ["VRAI", "FAUX"], 0),
      qcm("Quelle condition traduit « x n'appartient pas à [0 ; 100] » ?", ["(x < 0) ET (x > 100)", "(x < 0) OU (x > 100)", "(x <= 0) OU (x >= 100)", "NON x"], 1),
      qcm("Une précondition décrit…", ["le résultat", "ce que doivent vérifier les entrées", "le nom des variables", "la durée d'exécution"], 1),
      qcm("Après a ← 4 ; b ← a ; a ← a + b, que vaut a ?", ["4", "8", "12", "0"], 1),
      qcm("Quel type pour « le nombre de cours suivis » ?", ["REEL", "ENTIER", "CHAINE", "BOOLEEN"], 1),
      qcm("Que vaut 29 DIV 4 ?", ["7", "7.25", "1", "4"], 0),
      qcm("Que vaut 29 MOD 4 ?", ["7", "1", "3", "0"], 1),
      qcm("Que vaut 3 + 2 * 5 - 1 ?", ["24", "12", "14", "10"], 1),
      vraiFaux("Ranger 9 / 2 dans une variable ENTIER provoque une erreur de type.", true),
      qcm("Qu'affiche ECRIRE(\"n=\", 2 * 3) ?", ["n= 6", "n=6", "n=2 * 3", "6"], 1),
      qcm("Quel est le chiffre des dizaines de 572 ?", ["(572 DIV 10) MOD 10 = 7", "572 MOD 10 = 2", "572 DIV 100 = 5", "572 MOD 100 = 72"], 0),
    ]),
  },
  {
    number: 2,
    title: "Niveau 2 — Débutant : contrôler l'exécution et structurer les données",
    description: "Les fondamentaux du raisonnement algorithmique : conditions, boucles, compteurs et accumulateurs, tableaux, chaînes et organigrammes. Petits programmes et premiers projets.",
    objectives: ["Choisir et écrire la structure de contrôle adaptée.", "Parcourir et traiter un tableau ou une chaîne.", "Représenter un algorithme par un organigramme.", "Réaliser de petits programmes complets."],
    modules: [
      { slug: "structures-controle", title: "Structures de contrôle", lessons: ["structures-conditionnelles", "conditions-imbriquees", "boucles", "compteurs-accumulateurs", "organigrammes"] },
      { slug: "donnees-structurees", title: "Tableaux et chaînes", lessons: ["tableaux", "chaines-caracteres"] },
    ],
    exam: levelExam("algorithmique-examen-niveau-2", "Examen du niveau 2 — Contrôle et données", [
      qcm("Combien de fois s'exécute le corps de POUR i DE 2 A 9 FAIRE ?", ["7", "8", "9", "10"], 1),
      qcm("Quelle boucle s'exécute toujours au moins une fois ?", ["POUR", "TANT QUE", "RÉPÉTER … JUSQU'À"], 2),
      qcm("Avec note = 12, qu'affiche SI note >= 14 ALORS « Bien » SINON SI note >= 10 ALORS « Passable » SINON « Ajourné » FINSI ?", ["Bien", "Passable", "Ajourné", "Passable puis Ajourné"], 1),
      qcm("À quelle valeur initialise-t-on un accumulateur de produit ?", ["0", "1", "-1", "peu importe"], 1),
      qcm("T : TABLEAU[1..8] DE ENTIER. Quel accès provoque une erreur ?", ["T[1]", "T[8]", "T[0]", "T[4]"], 2),
      qcm("Pour trouver le maximum d'un tableau, on initialise le maximum avec…", ["0", "la première case", "la dernière case", "-1"], 1),
      qcm("Que vaut LONGUEUR(\"UPL Code\") ?", ["7", "8", "3", "2"], 1),
      qcm("Dans un organigramme, quel symbole représente une décision ?", ["Rectangle", "Losange", "Ovale", "Parallélogramme"], 1),
      vraiFaux("Une boucle TANT QUE dont la condition est fausse au départ n'exécute jamais son corps.", true),
      qcm("Quel schéma lit des valeurs jusqu'à une valeur d'arrêt ?", ["Une lecture avant la boucle et une à la fin du corps", "Une seule lecture dans la condition", "Une boucle POUR de 1 à 0", "Aucune boucle"], 0),
    ]),
  },
  {
    number: 3,
    title: "Niveau 3 — Intermédiaire : décomposer et résoudre",
    description: "Concepts approfondis : sous-programmes, récursivité, algorithmes de recherche et de tri, résolution de problèmes complets, bonnes pratiques et débogage.",
    objectives: ["Découper un problème en fonctions et procédures.", "Écrire et analyser des fonctions récursives.", "Programmer les recherches et les tris classiques.", "Mener la résolution d'un problème complet et le déboguer."],
    modules: [
      { slug: "modularite", title: "Sous-programmes et récursivité", lessons: ["fonctions-procedures", "recursivite"] },
      { slug: "algorithmes-classiques", title: "Algorithmes classiques et résolution de problèmes", lessons: ["recherche-tri", "resolution-problemes"] },
    ],
    plannedChapters: ["Débogage méthodique et invariants de boucle", "Tri fusion et tri rapide"],
    exam: levelExam("algorithmique-examen-niveau-3", "Examen du niveau 3 — Décomposer et résoudre", [
      qcm("Quelle est la différence entre une fonction et une procédure ?", ["La fonction retourne une valeur", "La procédure est récursive", "La fonction n'a pas de paramètres", "Aucune"], 0),
      qcm("Que permet le mot-clé VAR devant un paramètre ?", ["Le rendre constant", "Le passer par référence", "Le rendre facultatif", "Le déclarer global"], 1),
      qcm("Que se passe-t-il si une fonction récursive n'atteint jamais son cas de base ?", ["Elle retourne 0", "Les appels s'accumulent jusqu'à l'erreur", "Elle s'arrête après 10 appels", "Rien"], 1),
      qcm("Que retourne fact(4) avec fact(0) = 1 et fact(n) = n × fact(n − 1) ?", ["4", "10", "24", "16"], 2),
      vraiFaux("La recherche dichotomique exige un tableau trié.", true),
      qcm("Combien de comparaisons au plus pour une dichotomie sur 1 000 éléments ?", ["environ 10", "environ 100", "500", "1 000"], 0),
      qcm("Dans le tri à bulles, après le premier passage…", ["le plus petit élément est en première position", "le plus grand élément est en dernière position", "le tableau est trié", "rien n'est garanti"], 1),
      qcm("Quelle est la bonne méthode face à un problème complexe ?", ["Écrire tout le code d'un coup", "Comprendre, décomposer, tester avec des cas limites", "Copier une solution", "Commencer par l'affichage"], 1),
      qcm("Une variable déclarée dans une fonction est…", ["visible partout", "locale à la fonction", "constante", "globale"], 1),
      qcm("Quel cas limite tester en priorité pour un tri ?", ["Un tableau de 1 000 éléments", "Un tableau d'un seul élément ou déjà trié", "Un tableau de 10 éléments", "Aucun"], 1),
    ]),
  },
  {
    number: 4,
    title: "Niveau 4 — Professionnel : efficacité et grands problèmes",
    description: "Complexité, optimisation, structures de données avancées et projets de synthèse : les outils pour concevoir des solutions efficaces à des problèmes de grande taille.",
    objectives: ["Analyser la complexité d'un algorithme.", "Optimiser un algorithme et justifier le gain.", "Choisir et implémenter des structures de données adaptées.", "Réaliser un projet algorithmique de synthèse."],
    modules: [{ slug: "efficacite", title: "Efficacité des algorithmes", lessons: ["complexite"] }],
    plannedChapters: [
      "Structures de données : piles, files et listes chaînées",
      "Optimisation d'algorithmes",
      "Introduction aux graphes et aux parcours",
      "Preuve de correction et invariants",
      "Projet de synthèse",
    ],
  },
];

export const algorithmiquePlacement = placement("algorithmique-positionnement", "Test de positionnement — Algorithmique", {
  1: [
    qcm("Qu'est-ce qu'une variable ?", ["Un emplacement mémoire nommé dont la valeur peut changer", "Un mot-clé", "Une condition", "Un fichier"], 0),
    qcm("Que vaut 17 MOD 5 ?", ["3", "2", "3.4", "12"], 1),
    qcm("Que vaut (VRAI OU FAUX) ET FAUX ?", ["VRAI", "FAUX"], 1),
  ],
  2: [
    qcm("Combien de fois s'exécute POUR i DE 1 A 10 PAS 2 FAIRE ?", ["5", "10", "4", "6"], 0),
    qcm("Quelle est la valeur finale de s ? s ← 0 ; POUR i DE 1 A 4 FAIRE s ← s + i FINPOUR", ["4", "10", "16", "0"], 1),
    qcm("Que vaut le 3e caractère de \"ALGO\" (indices à partir de 1) ?", ["L", "G", "O", "A"], 1),
  ],
  3: [
    qcm("Quel est le rôle du cas de base d'une fonction récursive ?", ["Accélérer le calcul", "Arrêter la suite des appels", "Déclarer les variables", "Afficher le résultat"], 1),
    qcm("Une procédure qui doit modifier une variable de l'appelant prend un paramètre…", ["par valeur", "par référence (VAR)", "constant", "global"], 1),
    vraiFaux("La recherche dichotomique fonctionne sur un tableau non trié.", false),
  ],
  4: [
    qcm("Quelle est la complexité du tri par sélection ?", ["O(n)", "O(log n)", "O(n²)", "O(1)"], 2),
    qcm("Quelle structure respecte « dernier entré, premier sorti » ?", ["La file", "La pile", "Le tableau trié", "La liste"], 1),
    qcm("Passer de O(n²) à O(n log n) pour n = 1 000 000 réduit le nombre d'opérations d'environ…", ["2 fois", "10 fois", "50 000 fois", "rien"], 2),
  ],
});

// =====================================================================
// Python
// =====================================================================
export const pythonLevels: LevelPlan[] = [
  {
    number: 1,
    title: "Niveau 1 — Très débutant : premiers pas en Python",
    description: "Écrire et exécuter ses premiers programmes : syntaxe, variables, opérateurs, conditions et boucles.",
    objectives: ["Écrire et exécuter un programme Python.", "Utiliser variables, types et opérateurs.", "Écrire des conditions et des boucles."],
    modules: [{ slug: "bases", title: "Les bases du langage", lessons: ["syntaxe-fondamentale", "variables-types", "operateurs", "conditions", "boucles"] }],
    exam: levelExam("python-examen-niveau-1", "Examen du niveau 1 — Bases de Python", [
      qcm("Que renvoie input() ?", ["un int", "une str", "un float", "cela dépend"], 1),
      qcm("Que vaut 17 // 5 ?", ["3.4", "3", "2", "4"], 1),
      qcm("Que vaut 2 ** 3 ?", ["6", "8", "9", "5"], 1),
      qcm("Quel mot-clé correspond à SINON SI ?", ["else if", "elif", "elseif", "sinon"], 1),
      qcm("Quelles valeurs produit range(1, 5) ?", ["1, 2, 3, 4, 5", "1, 2, 3, 4", "0, 1, 2, 3, 4", "1, 5"], 1),
      vraiFaux("Python délimite les blocs par l'indentation.", true),
      qcm("Que vaut int(\"4\") + 1 ?", ["\"41\"", "5", "erreur", "\"5\""], 1),
      qcm("Que fait break dans une boucle ?", ["passe au tour suivant", "sort de la boucle", "arrête le programme", "recommence"], 1),
    ]),
  },
  {
    number: 2,
    title: "Niveau 2 — Débutant : collections et fonctions",
    description: "Listes, tuples, dictionnaires, ensembles, fonctions et modules : écrire de petits programmes structurés.",
    objectives: ["Manipuler les collections Python.", "Écrire des fonctions réutilisables.", "Utiliser la bibliothèque standard."],
    modules: [
      { slug: "structures-donnees", title: "Collections", lessons: ["listes-tuples", "dictionnaires-ensembles"] },
      { slug: "fonctions-modules", title: "Fonctions et modules", lessons: ["fonctions", "modules"] },
    ],
    exam: levelExam("python-examen-niveau-2", "Examen du niveau 2 — Collections et fonctions", [
      qcm("L = [3, 6, 9]. Que vaut L[-1] ?", ["3", "9", "6", "erreur"], 1),
      qcm("Que vaut len({1, 1, 2, 3}) ?", ["4", "3", "2", "1"], 1),
      qcm("Comment obtenir une valeur par défaut si la clé k est absente de d ?", ["d[k]", "d.get(k, defaut)", "d.find(k)", "d.value(k)"], 1),
      qcm("Que renvoie une fonction sans return ?", ["0", "None", "False", "une erreur"], 1),
      vraiFaux("Un tuple est modifiable.", false),
      qcm("Que vaut [x * x for x in range(3)] ?", ["[1, 4, 9]", "[0, 1, 4]", "[0, 2, 4]", "[0, 1, 2]"], 1),
    ]),
  },
  {
    number: 3,
    title: "Niveau 3 — Intermédiaire : programmes robustes et objets",
    description: "Exceptions, fichiers, programmation orientée objet, structures de données et algorithmes : des programmes complets et fiables.",
    objectives: ["Gérer les erreurs et les fichiers.", "Concevoir des classes.", "Implémenter des structures et des algorithmes classiques."],
    modules: [
      { slug: "structuration", title: "Programmes robustes", lessons: ["exceptions", "fichiers"] },
      { slug: "poo-algorithmes", title: "Objets et algorithmes", lessons: ["programmation-orientee-objet", "structures-de-donnees", "recherche-tri"] },
    ],
    plannedChapters: ["Débogage avec pdb et journalisation"],
  },
  {
    number: 4,
    title: "Niveau 4 — Professionnel : Python en production",
    description: "Science des données, architecture, tests, performances et sécurité : réaliser des projets Python professionnels.",
    objectives: PRO_OBJECTIVES("Python"),
    modules: [{ slug: "professionnel", title: "Python professionnel", lessons: ["science-donnees-ia"] }],
    plannedChapters: ["Architecture d'une application Python", "Tests automatisés avec pytest", "Performance et profilage", "Sécurité des programmes Python", "Projet professionnel"],
  },
];

export const pythonPlacement = placement("python-positionnement", "Test de positionnement — Python", {
  1: [
    qcm("Comment affiche-t-on du texte en Python ?", ["echo", "print()", "ECRIRE", "console.log()"], 1),
    qcm("Que vaut 7 % 3 ?", ["2", "1", "2.33", "0"], 1),
  ],
  2: [
    qcm("Comment ajoute-t-on 5 à la fin de la liste L ?", ["L.add(5)", "L.append(5)", "L.push(5)", "L + 5"], 1),
    qcm("Quel mot-clé définit une fonction ?", ["function", "def", "fun", "lambda seulement"], 1),
  ],
  3: [
    qcm("Quelle exception provoque int(\"abc\") ?", ["TypeError", "ValueError", "KeyError", "NameError"], 1),
    qcm("Que désigne self dans une méthode ?", ["la classe", "l'objet courant", "le module", "le parent"], 1),
  ],
  4: [
    qcm("Quel outil sert à écrire des tests automatisés en Python ?", ["pip", "pytest", "venv", "pdb"], 1),
    qcm("Quelle structure offre un test d'appartenance en O(1) en moyenne ?", ["list", "tuple", "set", "str"], 2),
  ],
});

// =====================================================================
// Langage C, JavaScript, Java
// =====================================================================
export const cLevels: LevelPlan[] = [
  {
    number: 1,
    title: "Niveau 1 — Très débutant : écrire et compiler",
    description: "Structure d'un programme, variables, entrées-sorties, conditions et boucles.",
    objectives: ["Écrire, compiler et exécuter un programme C.", "Utiliser printf et scanf.", "Écrire des conditions et des boucles."],
    modules: [{ slug: "bases", title: "Les bases", lessons: ["structure-programme", "variables-types", "entrees-sorties", "conditions", "boucles"] }],
    exam: levelExam("c-examen-niveau-1", "Examen du niveau 1 — Bases du C", [
      qcm("Par quelle fonction commence l'exécution ?", ["start", "main", "init", "printf"], 1),
      qcm("Que vaut 7 / 2 entre deux int ?", ["3.5", "3", "4", "erreur"], 1),
      qcm("Quel format lit un double avec scanf ?", ["%d", "%f", "%lf", "%s"], 2),
      qcm("Pourquoi écrit-on &n dans scanf(\"%d\", &n) ?", ["pour multiplier", "pour donner l'adresse de n", "par convention", "pour convertir"], 1),
      vraiFaux("if (x = 5) compare x à 5.", false),
      qcm("Que se passe-t-il sans break dans un case de switch ?", ["erreur", "l'exécution continue dans le case suivant", "le switch s'arrête", "rien"], 1),
    ]),
  },
  {
    number: 2,
    title: "Niveau 2 — Débutant : fonctions, tableaux et chaînes",
    description: "Découper son programme, manipuler des tableaux et des chaînes.",
    objectives: ["Écrire des fonctions.", "Parcourir des tableaux.", "Manipuler des chaînes avec string.h."],
    modules: [{ slug: "modularite", title: "Fonctions et tableaux", lessons: ["fonctions", "tableaux", "chaines"] }],
  },
  {
    number: 3,
    title: "Niveau 3 — Intermédiaire : la mémoire",
    description: "Pointeurs, allocation dynamique, structures et fichiers.",
    objectives: ["Maîtriser les pointeurs.", "Allouer et libérer la mémoire.", "Organiser des données avec struct et des fichiers."],
    modules: [{ slug: "memoire", title: "Mémoire et données", lessons: ["pointeurs", "allocation-dynamique", "structures", "fichiers"] }],
  },
  {
    number: 4,
    title: "Niveau 4 — Professionnel : C robuste",
    description: "Structures de données, modularité en plusieurs fichiers, sécurité mémoire, tests et performance.",
    objectives: PRO_OBJECTIVES("C"),
    modules: [{ slug: "professionnel", title: "C professionnel", lessons: ["structures-donnees"] }],
    plannedChapters: ["Compilation séparée et Makefile", "Sécurité mémoire (débordements, Valgrind)", "Tests unitaires en C", "Projet professionnel"],
  },
];

export const javascriptLevels: LevelPlan[] = [
  {
    number: 1,
    title: "Niveau 1 — Très débutant : le langage",
    description: "Variables, types, opérateurs, conditions et boucles.",
    objectives: ["Écrire et exécuter du JavaScript.", "Utiliser let, const et les types.", "Écrire conditions et boucles."],
    modules: [{ slug: "langage", title: "Le langage", lessons: ["introduction", "variables-constantes", "operateurs-conditions", "boucles"] }],
    exam: levelExam("javascript-examen-niveau-1", "Examen du niveau 1 — Bases de JavaScript", [
      qcm("Que vaut \"3\" + 4 ?", ["7", "\"34\"", "erreur", "NaN"], 1),
      qcm("Quel mot-clé déclare une variable non réaffectable ?", ["var", "let", "const"], 2),
      vraiFaux("=== compare la valeur et le type.", true),
      qcm("Comment obtenir la division entière de 17 par 5 ?", ["17 // 5", "Math.floor(17 / 5)", "17 DIV 5", "int(17 / 5)"], 1),
      qcm("Que parcourt for (const x of tableau) ?", ["les indices", "les valeurs", "les clés", "rien"], 1),
      qcm("Que vaut typeof 3.5 ?", ["\"float\"", "\"number\"", "\"double\"", "\"real\""], 1),
    ]),
  },
  {
    number: 2,
    title: "Niveau 2 — Débutant : fonctions, données et page web",
    description: "Fonctions, tableaux et objets, DOM et événements.",
    objectives: ["Écrire des fonctions.", "Manipuler tableaux et objets.", "Modifier une page et réagir aux actions."],
    modules: [
      { slug: "fonctions-donnees", title: "Fonctions et données", lessons: ["fonctions", "tableaux-objets"] },
      { slug: "web", title: "JavaScript dans la page", lessons: ["dom", "evenements"] },
    ],
  },
  {
    number: 3,
    title: "Niveau 3 — Intermédiaire : asynchronisme et API",
    description: "Promesses, async/await et consommation d'API.",
    objectives: ["Comprendre l'asynchronisme.", "Consommer une API web."],
    modules: [{ slug: "asynchrone", title: "Asynchronisme et API", lessons: ["asynchronisme-promesses", "api"] }],
    plannedChapters: ["Modules ES et organisation du code", "Débogage dans le navigateur"],
  },
  {
    number: 4,
    title: "Niveau 4 — Professionnel : applications web",
    description: "Architecture d'une application, tests, sécurité web et performances.",
    objectives: PRO_OBJECTIVES("JavaScript"),
    modules: [{ slug: "professionnel", title: "Projets web", lessons: ["projets-web"] }],
    plannedChapters: ["Architecture d'une application front-end", "Tests automatisés", "Sécurité web (XSS, CSRF)", "Performances web", "Projet professionnel"],
  },
];

export const javaLevels: LevelPlan[] = [
  {
    number: 1,
    title: "Niveau 1 — Très débutant : les bases",
    description: "Présentation, variables, conditions, boucles et méthodes.",
    objectives: ["Écrire et exécuter un programme Java.", "Utiliser types, conditions et boucles.", "Écrire des méthodes."],
    modules: [{ slug: "bases", title: "Les bases", lessons: ["presentation", "variables-types", "conditions-boucles", "methodes"] }],
    exam: levelExam("java-examen-niveau-1", "Examen du niveau 1 — Bases de Java", [
      qcm("Comment compare-t-on le contenu de deux String ?", ["==", "equals", "=", "compare"], 1),
      qcm("Que vaut 7 / 2 entre deux int ?", ["3.5", "3", "4", "erreur"], 1),
      qcm("Quel mot-clé déclare une constante ?", ["const", "final", "static", "let"], 1),
      qcm("Que vaut \"Somme : \" + 2 + 3 ?", ["\"Somme : 5\"", "\"Somme : 23\"", "erreur", "5"], 1),
      vraiFaux("La surcharge permet plusieurs méthodes de même nom avec des paramètres différents.", true),
      qcm("Où commence l'exécution d'un programme Java ?", ["la méthode main", "le constructeur", "la première classe", "la méthode start"], 0),
    ]),
  },
  {
    number: 2,
    title: "Niveau 2 — Débutant : objets et collections",
    description: "Classes, encapsulation, collections et exceptions.",
    objectives: ["Concevoir des classes encapsulées.", "Utiliser les collections.", "Gérer les exceptions."],
    modules: [{ slug: "objets", title: "Objets et collections", lessons: ["classes-objets", "encapsulation", "collections", "exceptions"] }],
  },
  {
    number: 3,
    title: "Niveau 3 — Intermédiaire : conception orientée objet",
    description: "Héritage, polymorphisme, interfaces et fichiers.",
    objectives: ["Exploiter héritage et polymorphisme.", "Définir des interfaces.", "Lire et écrire des fichiers."],
    modules: [{ slug: "conception", title: "Conception orientée objet", lessons: ["heritage-polymorphisme", "interfaces", "fichiers"] }],
  },
  {
    number: 4,
    title: "Niveau 4 — Professionnel : Java en entreprise",
    description: "Structures de données, architecture, tests et performances.",
    objectives: PRO_OBJECTIVES("Java"),
    modules: [{ slug: "professionnel", title: "Java professionnel", lessons: ["structures-donnees"] }],
    plannedChapters: ["Architecture en couches", "Tests unitaires avec JUnit", "Gestion de projet avec Maven", "Projet professionnel"],
  },
];

export const cPlacement = placement("c-positionnement", "Test de positionnement — Langage C", {
  1: [
    qcm("Quelle fonction affiche du texte formaté en C ?", ["print", "printf", "echo", "cout"], 1),
    qcm("Que vaut 7 / 2 entre deux int ?", ["3.5", "3", "4", "erreur"], 1),
  ],
  2: [
    qcm("Quel caractère termine une chaîne en C ?", ["'\\n'", "'\\0'", "' '", "EOF"], 1),
    qcm("Quel est l'indice du dernier élément de int t[10] ?", ["10", "9", "11", "1"], 1),
  ],
  3: [
    qcm("Que contient un pointeur ?", ["une valeur entière quelconque", "une adresse mémoire", "un tableau", "une fonction"], 1),
    qcm("Quelle fonction libère une zone allouée par malloc ?", ["delete", "free", "release", "dispose"], 1),
  ],
  4: [
    qcm("Quel outil détecte les fuites mémoire d'un programme C ?", ["Valgrind", "gzip", "grep", "make"], 0),
    qcm("Quel fichier décrit la compilation d'un projet avec make ?", ["Makefile", "package.json", "build.txt", "main.h"], 0),
  ],
});

export const javascriptPlacement = placement("javascript-positionnement", "Test de positionnement — JavaScript", {
  1: [
    qcm("Quel mot-clé déclare une variable réaffectable ?", ["const", "let", "final", "def"], 1),
    qcm("Que vaut 2 === \"2\" ?", ["true", "false"], 1),
  ],
  2: [
    qcm("Quelle méthode ajoute un élément à la fin d'un tableau ?", ["add", "push", "append", "insert"], 1),
    qcm("Quelle méthode réagit à un clic sur un élément ?", ["onClick()", "addEventListener(\"click\", …)", "listen(\"click\")", "click.on()"], 1),
  ],
  3: [
    qcm("Que renvoie une fonction déclarée async ?", ["une valeur", "une Promise", "un callback", "undefined"], 1),
    qcm("Quelle fonction effectue une requête HTTP ?", ["fetch", "request", "http", "ajax"], 0),
  ],
  4: [
    qcm("Quelle faille consiste à injecter du script dans une page ?", ["CSRF", "XSS", "DDoS", "SQLi"], 1),
    qcm("Quel outil sert aux tests automatisés en JavaScript ?", ["Vitest", "Webpack", "ESLint", "Prettier"], 0),
  ],
});

export const javaPlacement = placement("java-positionnement", "Test de positionnement — Java", {
  1: [
    qcm("Quelle méthode est le point d'entrée d'un programme Java ?", ["start", "main", "run", "init"], 1),
    qcm("Quel type stocke un nombre à virgule ?", ["int", "double", "char", "boolean"], 1),
  ],
  2: [
    qcm("Quel mot-clé crée un objet ?", ["new", "create", "make", "object"], 0),
    qcm("Quelle collection stocke des paires clé → valeur ?", ["ArrayList", "HashMap", "HashSet", "LinkedList"], 1),
  ],
  3: [
    qcm("Quel mot-clé exprime l'héritage d'une classe ?", ["implements", "extends", "inherits", "super"], 1),
    vraiFaux("Une classe peut implémenter plusieurs interfaces.", true),
  ],
  4: [
    qcm("Quelle bibliothèque est la référence des tests unitaires en Java ?", ["JUnit", "Maven", "Spring", "Log4j"], 0),
    qcm("Quel outil gère les dépendances d'un projet Java ?", ["Maven", "javac", "jar", "javadoc"], 0),
  ],
});
