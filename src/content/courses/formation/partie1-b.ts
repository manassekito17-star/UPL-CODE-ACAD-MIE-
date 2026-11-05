import { annotated, chapterEvaluation, commonError, example, interrogation, lesson, qcm, quiz, solved, vraiFaux } from "../../helpers";
import type { Lesson } from "../../types";

const P = "pseudocode" as const;

// =====================================================================
// Chapitre 4 — Variables et constantes
// =====================================================================
export const variables: Lesson = lesson({
  slug: "variables-constantes",
  title: "Variables et constantes",
  durationMinutes: 120,
  objectives: [
    "Déclarer des variables et des constantes avec un type.",
    "Utiliser l'affectation ← et comprendre qu'elle écrase l'ancienne valeur.",
    "Suivre l'état de la mémoire avec un tableau de suivi (trace).",
    "Choisir des noms de variables corrects et parlants.",
  ],
  prerequisites: ["Chapitre 3 — Analyse et résolution des problèmes."],
  content: `
    ## 1. La mémoire et les variables

    Pendant l'exécution, l'ordinateur range les données dans sa **mémoire**. Une **variable** est un emplacement de cette mémoire auquel on donne un **nom**. Elle possède trois caractéristiques :

    - un **nom** (ou identificateur), pour la désigner : **age**, **total** ;
    - un **type**, qui fixe les valeurs autorisées : ENTIER, REEL… (chapitre 5) ;
    - une **valeur**, qui peut **changer** au cours de l'exécution.

    Image utile : une boîte étiquetée. L'étiquette est le nom, la forme de la boîte est le type, le contenu est la valeur. Une boîte ne contient **qu'une seule valeur à la fois**.

    ## 2. Déclarer avant d'utiliser

    Toute variable est **déclarée** dans la section VARIABLES, avant DEBUT. Plusieurs variables de même type peuvent être déclarées sur une ligne :

    ~~~pseudocode
    VARIABLES
      age : ENTIER
      prix, total : REEL
      nom : CHAINE
    ~~~

    La déclaration réserve la place, mais **ne donne pas de valeur** : juste après la déclaration, la variable est « indéfinie ». L'utiliser dans un calcul provoque une erreur (« utilisée avant d'avoir reçu une valeur »). Il faut d'abord l'**initialiser**.

    ## 3. L'affectation

    L'affectation range une valeur dans une variable. Elle s'écrit avec la flèche **←** (on peut taper **<-**) :

    ~~~pseudocode
    age ← 19
    total ← prix * 2
    compteur ← compteur + 1
    ~~~

    Elle se lit « **age reçoit 19** » et s'exécute en deux temps :

    1. la partie **droite** est calculée avec les valeurs **actuelles** des variables ;
    2. le résultat est rangé dans la variable de **gauche** ; son ancienne valeur est **perdue**.

    Ainsi « compteur ← compteur + 1 » n'a rien d'absurde : on calcule l'ancienne valeur plus 1, puis on la range dans compteur. À gauche de la flèche, il y a toujours **une seule variable** ; « a + b ← 5 » n'a pas de sens.

    > Le signe **=** sert à **comparer** (x = 5 est VRAI ou FAUX). Il ne sert jamais à affecter.

    ## 4. Les constantes

    Une **constante** est une valeur nommée qui ne change jamais pendant l'exécution :

    ~~~pseudocode
    CONSTANTES
      PI = 3.14159
      TAUX_TVA = 0.16
      NB_ETUDIANTS_MAX = 120
    ~~~

    Avantages : l'algorithme est **plus lisible** (TAUX_TVA plutôt que 0.16), **plus sûr** (toute tentative de modification est une erreur) et **plus facile à faire évoluer** (si le taux change, on modifie une seule ligne). Par convention, on écrit les constantes en MAJUSCULES.

    ## 5. Choisir les noms

    Règles imposées : commencer par une lettre ; n'utiliser que des lettres, des chiffres et « _ » ; pas d'espace ; pas de mot-clé (SI, POUR, FIN, DEBUT…). Bonnes pratiques : des noms **parlants** (**moyenneGenerale** plutôt que **m**), cohérents, sans accents si l'on veut traduire facilement en C ou en Java.

    | Nom | Valide ? | Pourquoi |
    |---|---|---|
    | note_finale | oui | lettres et « _ » |
    | 2emeNote | non | commence par un chiffre |
    | note finale | non | contient un espace |
    | fin | non | mot réservé |

    ## 6. Le tableau de suivi (trace)

    Pour comprendre ou vérifier un algorithme, on suit l'évolution des variables **instruction par instruction** dans un tableau : une colonne par variable, une ligne par instruction exécutée. C'est l'outil n°1 pour trouver une erreur.

    | Instruction | a | b | c |
    |---|---|---|---|
    | a ← 5 | 5 | ? | ? |
    | b ← a + 2 | 5 | 7 | ? |
    | c ← a * b | 5 | 7 | 35 |
    | a ← c - b | 28 | 7 | 35 |

    Sur la plateforme, l'onglet **Tableau de suivi** des algorithmes commentés est calculé par l'interpréteur lui-même : il montre l'état réel des variables avant chaque ligne.
  `,
  examples: [
    example(P, "Échanger deux variables", `
      ALGORITHME Echange
      VARIABLES
        a, b, temp : ENTIER
      DEBUT
        a ← 5
        b ← 8
        ECRIRE("Avant : a = ", a, ", b = ", b)
        temp ← a
        a ← b
        b ← temp
        ECRIRE("Après : a = ", a, ", b = ", b)
      FIN
    `, { explanation: "Sans temp, la valeur de a serait écrasée et perdue." }),
    example(P, "Constantes et surface d'un cercle", `
      ALGORITHME Cercle
      CONSTANTES
        PI = 3.14159
      VARIABLES
        rayon, surface : REEL
      DEBUT
        LIRE(rayon)
        surface ← PI * rayon * rayon
        ECRIRE("Surface : ", surface)
      FIN
    `, { stdin: "2" }),
  ],
  summary: [
    "Une variable a un nom, un type et une valeur qui peut changer ; elle ne contient qu'une valeur à la fois.",
    "Toute variable est déclarée, puis initialisée avant d'être utilisée.",
    "L'affectation ← calcule la partie droite puis écrase la valeur de la variable de gauche.",
    "Une constante ne change jamais ; on l'écrit en majuscules.",
    "Le tableau de suivi permet de vérifier un algorithme instruction par instruction.",
  ],
  exerciseSlugs: ["algo-echange"],
  pedagogy: {
    competences: [
      "Déclarer et initialiser des variables",
      "Utiliser correctement l'affectation",
      "Utiliser des constantes nommées",
      "Réaliser la trace d'un algorithme",
    ],
    definitions: [
      { term: "Variable", definition: "Emplacement mémoire nommé, d'un type donné, dont la valeur peut changer pendant l'exécution." },
      { term: "Déclaration", definition: "Annonce du nom et du type d'une variable, dans la section VARIABLES, avant son utilisation." },
      { term: "Initialisation", definition: "Première affectation d'une valeur à une variable." },
      { term: "Affectation", definition: "Instruction **v ← expression** : l'expression est évaluée puis sa valeur remplace celle de v." },
      { term: "Constante", definition: "Valeur nommée fixée dans la section CONSTANTES et qui ne peut pas être modifiée." },
      { term: "Trace", definition: "Tableau de l'évolution des variables, instruction après instruction." },
    ],
    commentedAlgorithms: [
      annotated(
        "Permutation circulaire de trois variables",
        [
          ["ALGORITHME Rotation", "Objectif : a reçoit b, b reçoit c, c reçoit l'ancienne valeur de a."],
          ["VARIABLES"],
          ["  a, b, c, temp : ENTIER", "temp est une variable auxiliaire pour ne rien perdre."],
          ["DEBUT"],
          ["  LIRE(a)", "Lecture des trois valeurs initiales."],
          ["  LIRE(b)"],
          ["  LIRE(c)"],
          ["  temp ← a", "On sauvegarde a AVANT de l'écraser."],
          ["  a ← b", "a prend la valeur de b ; l'ancienne valeur de a est dans temp."],
          ["  b ← c", "b prend la valeur de c."],
          ["  c ← temp", "c reçoit l'ancienne valeur de a, sauvegardée."],
          ["  ECRIRE(a, \" \", b, \" \", c)", "Pour 1, 2, 3 on obtient 2 3 1."],
          ["FIN"],
        ],
        { stdin: "1\n2\n3", showTrace: true, showFlowchart: true },
      ),
    ],
    commonErrors: [
      commonError(
        "Utiliser = pour affecter",
        `
        VARIABLES
          x : ENTIER
        DEBUT
          x = 3
        FIN
        `,
        `
        VARIABLES
          x : ENTIER
        DEBUT
          x ← 3
        FIN
        `,
        "**=** compare deux valeurs ; **←** range une valeur dans une variable.",
        true,
      ),
      commonError(
        "Échanger sans variable auxiliaire",
        `
        VARIABLES
          a, b : ENTIER
        DEBUT
          a ← 5
          b ← 8
          a ← b
          b ← a
          ECRIRE(a, " ", b)
        FIN
        `,
        `
        VARIABLES
          a, b, temp : ENTIER
        DEBUT
          a ← 5
          b ← 8
          temp ← a
          a ← b
          b ← temp
          ECRIRE(a, " ", b)
        FIN
        `,
        "Après **a ← b**, l'ancienne valeur de a (5) est perdue : la version fautive affiche « 8 8 ». Faites la trace pour le constater.",
        true,
      ),
      commonError(
        "Modifier une constante",
        `
        CONSTANTES
          TVA = 0.16
        DEBUT
          TVA ← 0.18
        FIN
        `,
        `
        CONSTANTES
          TVA = 0.18
        DEBUT
          ECRIRE(TVA)
        FIN
        `,
        "Une constante ne peut pas recevoir de nouvelle valeur pendant l'exécution : si la règle change, on modifie sa définition.",
        true,
      ),
    ],
    solvedExercises: [
      solved(
        "Trace à la main",
        "Donnez la valeur finale de x, y et z :\n\n~~~pseudocode\nx ← 4\ny ← x * 2\nz ← y - x\nx ← z + y\ny ← y + 1\n~~~",
        "| Instruction | x | y | z |\n|---|---|---|---|\n| x ← 4 | 4 | ? | ? |\n| y ← x * 2 | 4 | 8 | ? |\n| z ← y - x | 4 | 8 | 4 |\n| x ← z + y | 12 | 8 | 4 |\n| y ← y + 1 | 12 | 9 | 4 |",
        "Valeurs finales : **x = 12, y = 9, z = 4**. À chaque ligne, on utilise les valeurs de la ligne précédente du tableau.",
      ),
      solved(
        "Mise à jour d'un compteur",
        "Écrivez un algorithme qui lit le nombre de visiteurs du matin et celui de l'après-midi, les cumule dans une seule variable total en deux affectations, puis l'affiche.",
        `
        ALGORITHME Visiteurs
        VARIABLES
          matin, apresMidi, total : ENTIER
        DEBUT
          LIRE(matin)
          LIRE(apresMidi)
          total ← 0
          total ← total + matin
          total ← total + apresMidi
          ECRIRE("Total : ", total)
        FIN
        `,
        "total est **initialisé à 0**, puis chaque affectation ajoute une valeur à l'ancienne. C'est le principe de l'**accumulateur**, que nous généraliserons avec les boucles.",
      ),
    ],
    td: {
      title: "TD 4 — Variables, affectations et traces",
      instructions: "Faites d'abord la trace de votre algorithme sur l'exemple de l'énoncé, puis soumettez-le.",
      exerciseSlugs: ["algo-permutation-circulaire", "algo-solde-compte"],
    },
    interrogation: interrogation("variables-interrogation", "Interrogation — Variables et constantes", [
      qcm("Après a ← 3 ; b ← a ; a ← 10, que vaut b ?", ["3", "10", "13", "indéfini"], 0),
      qcm("Quel nom de variable est valide ?", ["2nombre", "note finale", "note_finale", "SI"], 2),
      vraiFaux("On peut modifier une constante dans le programme principal.", false),
      qcm("Que vaut x après x ← 5 ; x ← x * x - 1 ?", ["4", "24", "25", "9"], 1),
      qcm("Que contient une variable juste après sa déclaration ?", ["0", "une valeur indéfinie", "une chaîne vide", "1"], 1),
    ]),
    evaluation: chapterEvaluation("variables-evaluation", "Évaluation du chapitre 4", [
      qcm("Que fait l'instruction total ← total + 5 ?", ["Compare total et total + 5", "Ajoute 5 à la valeur de total", "Provoque toujours une erreur", "Remet total à 5"], 1),
      qcm("Après a ← 2 ; b ← 3 ; a ← a + b ; b ← a - b ; a ← a - b, que valent a et b ?", ["a = 2, b = 3", "a = 3, b = 2", "a = 5, b = 2", "a = 5, b = 3"], 1, "Ce procédé échange a et b sans variable auxiliaire (avec des nombres)."),
      vraiFaux("« a + b ← 7 » est une affectation correcte.", false),
      qcm("Pourquoi utiliser une constante TAUX_TVA plutôt que 0.16 ?", ["Le calcul est plus rapide", "Lisibilité, sécurité et facilité de modification", "C'est obligatoire", "Pour économiser la mémoire"], 1),
      qcm("Lequel est un mot réservé, interdit comme nom de variable ?", ["total", "FIN", "prix_ht", "n1"], 1),
      qcm("Une variable peut-elle contenir deux valeurs en même temps ?", ["Oui", "Non"], 1),
      qcm("Après x ← 1 ; y ← x + 1 ; x ← y * 3 ; y ← x - y, que vaut y ?", ["2", "4", "6", "1"], 1, "x = 1, y = 2, x = 6, y = 6 − 2 = 4."),
      qcm("Que signale l'interpréteur si une variable est lue dans un calcul avant toute affectation ?", ["Rien, elle vaut 0", "Une erreur : utilisée avant d'avoir reçu une valeur", "Un avertissement seulement", "Il ignore l'instruction"], 1),
    ]),
  },
});

// =====================================================================
// Chapitre 5 — Types de données
// =====================================================================
export const types: Lesson = lesson({
  slug: "types-donnees",
  title: "Types de données",
  durationMinutes: 100,
  objectives: [
    "Connaître les types ENTIER, REEL, CHAINE, CARACTERE et BOOLEEN.",
    "Choisir le type adapté à chaque donnée d'un problème.",
    "Comprendre la vérification des types et les conversions.",
  ],
  prerequisites: ["Chapitre 4 — Variables et constantes."],
  content: `
    ## 1. Pourquoi des types ?

    Le **type** d'une donnée indique l'ensemble des valeurs qu'elle peut prendre et les **opérations** autorisées. On peut multiplier deux nombres, mais pas deux prénoms ; on peut mettre un texte en majuscules, mais pas un nombre. Déclarer le type permet à la machine de réserver la bonne place en mémoire et de **détecter des erreurs** de raisonnement.

    ## 2. Les types simples

    | Type | Valeurs | Exemples | Opérations typiques |
    |---|---|---|---|
    | ENTIER | nombres sans partie décimale | -3, 0, 42 | + - * DIV MOD, comparaisons |
    | REEL | nombres à virgule | 3.14, -0.5, 12.0 | + - * /, comparaisons |
    | CHAINE | suite de caractères (texte) | "Lubumbashi", "" | concaténation +, LONGUEUR |
    | CARACTERE | un seul caractère | 'A', '7', '?' | comparaison, ORD |
    | BOOLEEN | VRAI ou FAUX | VRAI | ET, OU, NON |

    Remarques :

    - En pseudocode comme dans la plupart des langages, la virgule décimale s'écrit avec un **point** : 3.14.
    - Une chaîne s'écrit entre guillemets doubles, un caractère entre apostrophes. "7" (texte) et 7 (nombre) sont **différents**.
    - La chaîne vide "" ne contient aucun caractère ; elle est très utile pour construire un texte morceau par morceau.

    ## 3. Choisir le bon type

    La question à se poser : **quelles valeurs** cette donnée peut-elle prendre, et **quels calculs** fera-t-on dessus ?

    | Donnée | Type | Justification |
    |---|---|---|
    | nombre d'étudiants | ENTIER | on compte des unités entières |
    | moyenne, prix, température | REEL | peut avoir une partie décimale |
    | nom, adresse, matricule « UPL-2026-17 » | CHAINE | texte, même s'il contient des chiffres |
    | réponse oui/non, « est admis » | BOOLEEN | deux valeurs possibles |
    | initiale, mention (A, B, C) | CARACTERE | un seul symbole |

    Un numéro de téléphone se déclare en CHAINE : on ne fait aucun calcul dessus, et un 0 initial serait perdu dans un ENTIER.

    ## 4. La vérification des types

    L'interpréteur de la plateforme **vérifie les types** à chaque affectation, comme le font C et Java :

    - ranger 7 / 2 (= 3.5, un REEL) dans un ENTIER est une **erreur** : il faut soit déclarer un REEL, soit utiliser la division entière DIV ;
    - ranger un texte dans une variable numérique est une erreur ;
    - en revanche, un ENTIER peut être rangé dans un REEL (5 devient 5.0).

    Ces erreurs ne sont pas des tracasseries : elles signalent presque toujours un **défaut de raisonnement**.

    ## 5. Conversions

    Les fonctions prédéfinies permettent de convertir explicitement :

    | Fonction | Rôle | Exemple | Résultat |
    |---|---|---|---|
    | ENTIER(x) | partie entière (tronque) | ENTIER(7.9) | 7 |
    | ARRONDI(x) | arrondi au plus proche | ARRONDI(7.5) | 8 |
    | REEL(s) | texte → réel | REEL("2.5") | 2.5 |
    | CHAINE(x) | valeur → texte | CHAINE(15) | "15" |

    CHAINE est indispensable pour coller un nombre à un texte avec + : "Note : " + CHAINE(15). (Avec ECRIRE, il suffit de séparer les éléments par des virgules.)

    ## 6. Et en mémoire ?

    Dans un ordinateur, tout est codé en **binaire**. Un ENTIER occupe en général 4 octets (de −2 147 483 648 à 2 147 483 647 en C) ; un REEL est stocké de façon approchée, ce qui explique que 0.1 + 0.2 ne vaut pas exactement 0.3 dans la plupart des langages. La plateforme arrondit l'affichage pour le pseudocode, mais vous retrouverez ce phénomène en Python, C et Java : on ne compare jamais deux réels avec = sans précaution.
  `,
  examples: [
    example(P, "Les cinq types", `
      ALGORITHME Types
      VARIABLES
        annee : ENTIER
        moyenne : REEL
        ville : CHAINE
        initiale : CARACTERE
        admis : BOOLEEN
      DEBUT
        annee ← 2026
        moyenne ← 14.5
        ville ← "Lubumbashi"
        initiale ← 'U'
        admis ← moyenne >= 10
        ECRIRE(annee, " | ", moyenne, " | ", ville, " | ", initiale, " | ", admis)
      FIN
    `),
    example(P, "Conversions", `
      ALGORITHME Conversions
      VARIABLES
        x : REEL
        texte : CHAINE
      DEBUT
        x ← 7.6
        ECRIRE("ENTIER(7.6) = ", ENTIER(x), " ; ARRONDI(7.6) = ", ARRONDI(x))
        texte ← "Note : " + CHAINE(15)
        ECRIRE(texte)
        ECRIRE("Longueur du texte : ", LONGUEUR(texte))
      FIN
    `),
  ],
  summary: [
    "Cinq types simples : ENTIER, REEL, CHAINE, CARACTERE, BOOLEEN.",
    "Le type fixe les valeurs possibles et les opérations autorisées.",
    "Un REEL ne peut pas être rangé dans un ENTIER ; un ENTIER peut l'être dans un REEL.",
    "On convertit explicitement avec ENTIER, ARRONDI, REEL, CHAINE.",
    "Un numéro (téléphone, matricule) se stocke en CHAINE : on ne calcule pas dessus.",
  ],
  exerciseSlugs: ["algo-celsius-fahrenheit"],
  pedagogy: {
    competences: [
      "Choisir le type de chaque donnée",
      "Interpréter une erreur de type",
      "Convertir entre types",
    ],
    definitions: [
      { term: "Type", definition: "Ensemble de valeurs possibles et d'opérations autorisées pour une donnée." },
      { term: "ENTIER", definition: "Type des nombres sans partie décimale : …, −2, −1, 0, 1, 2, …" },
      { term: "REEL", definition: "Type des nombres pouvant avoir une partie décimale, représentés de façon approchée en machine." },
      { term: "CHAINE", definition: "Type des textes : suite (éventuellement vide) de caractères, écrite entre guillemets." },
      { term: "Conversion", definition: "Transformation explicite d'une valeur d'un type vers un autre (ENTIER, REEL, CHAINE…)." },
    ],
    commentedAlgorithms: [
      annotated(
        "Fiche de résultat d'un étudiant",
        [
          ["ALGORITHME FicheResultat"],
          ["VARIABLES"],
          ["  nom : CHAINE", "Un texte : le nom de l'étudiant."],
          ["  note1, note2, moyenne : REEL", "Des notes décimales : type REEL."],
          ["  initiale : CARACTERE", "Un seul caractère."],
          ["  admis : BOOLEEN", "Deux valeurs possibles : VRAI ou FAUX."],
          ["DEBUT"],
          ["  LIRE(nom)", "La ligne lue est rangée telle quelle (CHAINE)."],
          ["  LIRE(note1)", "La valeur lue est convertie en REEL."],
          ["  LIRE(note2)"],
          ["  moyenne ← (note1 + note2) / 2", "La division / produit un REEL : compatible avec moyenne."],
          ["  initiale ← nom[1]", "nom[1] est le premier caractère du nom."],
          ["  admis ← moyenne >= 10", "Une comparaison produit un BOOLEEN."],
          ["  ECRIRE(initiale, \". \", nom, \" : \", moyenne, \" - admis : \", admis)"],
          ["FIN"],
        ],
        { stdin: "Mwamba\n12\n15.5", showTrace: true },
      ),
    ],
    commonErrors: [
      commonError(
        "Ranger une division réelle dans un ENTIER",
        `
        VARIABLES
          moyenne : ENTIER
        DEBUT
          moyenne ← 27 / 2
        FIN
        `,
        `
        VARIABLES
          moyenne : REEL
        DEBUT
          moyenne ← 27 / 2
        FIN
        `,
        "27 / 2 vaut 13.5, un REEL. Déclarez la variable en REEL, ou utilisez **DIV** si vous voulez réellement le quotient entier (13).",
        true,
      ),
      commonError(
        "Additionner un texte et un nombre",
        `
        VARIABLES
          message : CHAINE
        DEBUT
          message ← "Total : " + 15
        FIN
        `,
        `
        VARIABLES
          message : CHAINE
        DEBUT
          message ← "Total : " + CHAINE(15)
        FIN
        `,
        "L'opérateur + additionne deux nombres **ou** concatène deux chaînes. Pour coller un nombre à un texte, convertissez-le avec CHAINE.",
        true,
      ),
    ],
    solvedExercises: [
      solved(
        "Choisir les types",
        "Proposez un type pour : (a) le nombre d'heures de cours, (b) le prix d'un livre, (c) le numéro de téléphone +243 99 000 0000, (d) « l'étudiant est boursier », (e) la mention A/B/C.",
        "(a) ENTIER  (b) REEL  (c) CHAINE  (d) BOOLEEN  (e) CARACTERE",
        "Le numéro de téléphone est un **texte** : il commence par « + », contient des espaces et on ne fait aucun calcul dessus.",
      ),
      solved(
        "Prévoir le résultat",
        "Quelles instructions provoquent une erreur si x est un ENTIER ? (1) x ← 10 DIV 4 ; (2) x ← 10 / 4 ; (3) x ← ARRONDI(2.6) ; (4) x ← \"3\".",
        "(2) et (4) provoquent une erreur.",
        "(1) DIV donne l'entier 2. (2) 10 / 4 = 2.5 est un REEL. (3) ARRONDI(2.6) = 3, un entier. (4) \"3\" est un texte, pas un nombre.",
      ),
    ],
    td: {
      title: "TD 5 — Types et conversions",
      instructions: "Déclarez chaque variable avec le type le plus adapté. Une erreur de type signalée par l'interpréteur indique souvent un mauvais choix.",
      exerciseSlugs: ["algo-initiales", "algo-majeur"],
    },
    interrogation: interrogation("types-interrogation", "Interrogation — Types de données", [
      qcm("Quel type pour le prix d'un livre (12.50) ?", ["ENTIER", "REEL", "BOOLEEN", "CARACTERE"], 1),
      qcm("Que vaut 15 >= 10 ?", ["15", "10", "VRAI", "FAUX"], 2),
      vraiFaux("Une variable CARACTERE peut contenir \"Bonjour\".", false),
      qcm("Que vaut ENTIER(9.99) ?", ["10", "9", "9.99", "erreur"], 1),
      qcm("Quel type pour un numéro de téléphone ?", ["ENTIER", "REEL", "CHAINE", "BOOLEEN"], 2),
    ]),
    evaluation: chapterEvaluation("types-evaluation", "Évaluation du chapitre 5", [
      qcm("Laquelle de ces affectations est correcte si n est un ENTIER ?", ["n ← 7 / 2", "n ← 7 DIV 2", "n ← \"7\"", "n ← 3.5"], 1),
      qcm("Que produit \"UPL\" + \" Academy\" ?", ["Une erreur", "\"UPL Academy\"", "\"UPL\"", "6"], 1),
      vraiFaux("Un ENTIER peut être rangé dans une variable REEL.", true),
      qcm("Que vaut LONGUEUR(\"\") ?", ["1", "0", "indéfini", "erreur"], 1),
      qcm("Quelle est la différence entre 7 et \"7\" ?", ["Aucune", "7 est un nombre, \"7\" est un texte", "\"7\" est plus grand", "7 est un caractère"], 1),
      qcm("Que vaut ARRONDI(4.5) ?", ["4", "5", "4.5", "erreur"], 1),
      qcm("Quel type pour « le paiement des frais a été effectué » ?", ["CHAINE", "ENTIER", "BOOLEEN", "REEL"], 2),
      qcm("Pourquoi éviter de comparer deux réels avec = ?", ["C'est interdit", "Les réels sont stockés de façon approchée", "Les réels n'ont pas de valeur", "Cela ralentit"], 1),
    ]),
  },
});

// =====================================================================
// Chapitre 6 — Opérateurs et expressions
// =====================================================================
export const operateurs: Lesson = lesson({
  slug: "operateurs",
  title: "Opérateurs et expressions",
  durationMinutes: 110,
  objectives: [
    "Évaluer des expressions arithmétiques, de comparaison et logiques.",
    "Utiliser DIV et MOD pour les problèmes de quotient, de reste et de chiffres.",
    "Appliquer les règles de priorité et utiliser les parenthèses.",
  ],
  prerequisites: ["Chapitre 2 — Logique et raisonnement.", "Chapitre 5 — Types de données."],
  content: `
    ## 1. Expressions et opérateurs

    Une **expression** est une combinaison de valeurs, de variables et d'**opérateurs** qui produit une valeur : 2 * x + 1, (a + b) / 2, note >= 10. Évaluer une expression, c'est calculer cette valeur avec le contenu actuel des variables.

    ## 2. Opérateurs arithmétiques

    | Opérateur | Rôle | Exemple | Résultat | Type du résultat |
    |---|---|---|---|---|
    | + | addition | 7 + 2 | 9 | entier si les deux le sont |
    | - | soustraction | 7 - 2 | 5 | idem |
    | * | multiplication | 7 * 2 | 14 | idem |
    | / | division réelle | 7 / 2 | 3.5 | toujours REEL |
    | DIV | quotient entier | 7 DIV 2 | 3 | ENTIER |
    | MOD | reste de la division entière | 7 MOD 2 | 1 | ENTIER |
    | ^ | puissance | 2 ^ 3 | 8 | nombre |

    La division par zéro (x / 0, x DIV 0, x MOD 0) est une **erreur d'exécution** : il faut l'empêcher par une condition.

    ## 3. DIV et MOD : des outils fondamentaux

    Pour deux entiers a et b (b > 0), on a toujours : **a = b × (a DIV b) + (a MOD b)**, avec 0 ≤ a MOD b < b.

    Applications classiques :

    - **parité** : n est pair si n MOD 2 = 0 ;
    - **divisibilité** : n est un multiple de k si n MOD k = 0 ;
    - **chiffres** d'un nombre : le chiffre des unités de n est n MOD 10, et n DIV 10 « efface » ce chiffre ; pour 375 : unités 375 MOD 10 = 5, dizaines (375 DIV 10) MOD 10 = 7, centaines 375 DIV 100 = 3 ;
    - **conversions** : 200 secondes = 200 DIV 60 = 3 minutes et 200 MOD 60 = 20 secondes ;
    - **cycles** : le jour de la semaine dans k jours est (jour + k) MOD 7.

    ## 4. Opérateurs de comparaison

    =, <> (différent), <, >, <= (≤), >= (≥). Ils s'appliquent aux nombres et aux chaînes (ordre alphabétique) et produisent un **booléen**. On compare des valeurs de même nature : comparer un nombre et un texte est une erreur.

    ## 5. Opérateurs logiques

    ET, OU, NON combinent des booléens (chapitre 2). La plateforme les évalue **en court-circuit** : dans « a ET b », si a est FAUX, b n'est pas évalué (le résultat est déjà connu). C'est utile pour se protéger : (d <> 0) ET (n MOD d = 0) n'évalue jamais n MOD 0.

    ## 6. Priorités

    Du plus prioritaire au moins prioritaire :

    1. parenthèses ;
    2. ^ (puissance) ;
    3. signe moins unaire (−x) ;
    4. *, /, DIV, MOD (de gauche à droite) ;
    5. +, − (de gauche à droite) ;
    6. comparaisons ;
    7. NON, puis ET, puis OU.

    Exemples : 2 + 3 * 4 vaut 14 ; (2 + 3) * 4 vaut 20 ; 20 - 6 - 2 vaut 12 (et non 16) ; 2 ^ 3 ^ 2 se calcule de droite à gauche : 2 ^ 9 = 512. En cas de doute, **ajoutez des parenthèses** : elles ne coûtent rien et rendent l'algorithme lisible.

    ## 7. Évaluer une expression pas à pas

    Évaluons (a + b) MOD 3 = 0 OU a > 10 avec a = 4, b = 5 :

    1. a + b = 9 ;
    2. 9 MOD 3 = 0 ;
    3. 0 = 0 → VRAI ;
    4. VRAI OU … → **VRAI** (a > 10 n'est même pas évalué).

    ## 8. Type du résultat d'une expression

    Le type du résultat dépend des opérandes et de l'opérateur, et il doit être compatible avec la variable qui le reçoit :

    | Expression | Résultat | Type |
    |---|---|---|
    | 7 + 2 | 9 | ENTIER |
    | 7 + 2.5 | 9.5 | REEL (un réel « contamine » le calcul) |
    | 9 / 3 | 3 | REEL, même si la valeur est « ronde » |
    | 9 DIV 3 | 3 | ENTIER |
    | "a" + "b" | "ab" | CHAINE |
    | 3 < 5 | VRAI | BOOLEEN |

    Retenez surtout que **/ produit toujours un réel** : c'est la source de l'erreur « type incompatible » la plus fréquente chez les débutants. Si le résultat doit être entier, utilisez DIV, ou convertissez explicitement avec ENTIER ou ARRONDI.
  `,
  examples: [
    example(P, "Quotient et reste", `
      ALGORITHME Conversion
      VARIABLES
        secondes, minutes, reste : ENTIER
      DEBUT
        LIRE(secondes)
        minutes ← secondes DIV 60
        reste ← secondes MOD 60
        ECRIRE(secondes, " s = ", minutes, " min ", reste, " s")
      FIN
    `, { stdin: "200" }),
    example(P, "Priorités", `
      ECRIRE(2 + 3 * 4)
      ECRIRE((2 + 3) * 4)
      ECRIRE(20 - 6 - 2)
      ECRIRE(17 DIV 5, " ", 17 MOD 5, " ", 17 / 5)
      ECRIRE(2 ^ 10)
    `),
  ],
  summary: [
    "/ donne toujours un réel ; DIV donne le quotient entier, MOD le reste.",
    "a = b × (a DIV b) + (a MOD b) : base des problèmes de chiffres, de parité et de conversion.",
    "Les comparaisons produisent des booléens ; ET, OU, NON les combinent (évaluation en court-circuit).",
    "Priorités : parenthèses, ^, *, / DIV MOD, + −, comparaisons, NON, ET, OU.",
    "La division par zéro est une erreur d'exécution à prévenir.",
  ],
  exerciseSlugs: ["algo-conversion-temps"],
  pedagogy: {
    competences: [
      "Évaluer une expression en respectant les priorités",
      "Utiliser DIV et MOD",
      "Extraire les chiffres d'un nombre",
      "Prévenir la division par zéro",
    ],
    definitions: [
      { term: "Expression", definition: "Combinaison de valeurs, de variables et d'opérateurs qui produit une valeur." },
      { term: "DIV", definition: "Quotient de la division entière : 17 DIV 5 = 3." },
      { term: "MOD", definition: "Reste de la division entière : 17 MOD 5 = 2. Pour b > 0, 0 ≤ a MOD b < b." },
      { term: "Priorité", definition: "Ordre dans lequel les opérateurs d'une expression sont appliqués en l'absence de parenthèses." },
      { term: "Évaluation en court-circuit", definition: "Arrêt de l'évaluation d'un ET (ou d'un OU) dès que le premier opérande suffit à connaître le résultat." },
    ],
    commentedAlgorithms: [
      annotated(
        "Chiffres d'un nombre de trois chiffres",
        [
          ["ALGORITHME Chiffres", "Précondition : n est compris entre 100 et 999."],
          ["VARIABLES"],
          ["  n, c, d, u : ENTIER", "c, d, u : centaines, dizaines, unités."],
          ["DEBUT"],
          ["  LIRE(n)", "Lecture du nombre, par exemple 375."],
          ["  u ← n MOD 10", "Le reste de la division par 10 est le dernier chiffre."],
          ["  d ← (n DIV 10) MOD 10", "n DIV 10 retire les unités ; MOD 10 isole alors les dizaines."],
          ["  c ← n DIV 100", "Le quotient par 100 donne les centaines."],
          ["  ECRIRE(\"Centaines : \", c)", "Affichage des trois chiffres, du plus grand rang au plus petit."],
          ["  ECRIRE(\"Dizaines : \", d)"],
          ["  ECRIRE(\"Unités : \", u)"],
          ["  ECRIRE(\"Vérification : \", c * 100 + d * 10 + u)", "Postcondition : on retrouve n."],
          ["FIN"],
        ],
        { stdin: "375", showTrace: true, showFlowchart: true },
      ),
    ],
    commonErrors: [
      commonError(
        "Oublier les parenthèses dans une moyenne",
        `
        ECRIRE(12 + 14 + 16 / 3)
        `,
        `
        ECRIRE((12 + 14 + 16) / 3)
        `,
        "La division est prioritaire sur l'addition : la version fautive calcule 12 + 14 + 5.33 = 31.33 au lieu de 14.",
        true,
      ),
      commonError(
        "Diviser par zéro",
        `
        VARIABLES
          a, b : ENTIER
        DEBUT
          a ← 10
          b ← 0
          ECRIRE(a MOD b)
        FIN
        `,
        `
        VARIABLES
          a, b : ENTIER
        DEBUT
          a ← 10
          b ← 0
          SI b <> 0 ALORS
            ECRIRE(a MOD b)
          SINON
            ECRIRE("Diviseur nul")
          FINSI
        FIN
        `,
        "Toute division (/, DIV, MOD) par une variable qui peut valoir 0 doit être protégée par une condition.",
        true,
      ),
    ],
    solvedExercises: [
      solved(
        "Évaluer des expressions",
        "Avec a = 7 et b = 3, évaluez : (1) a DIV b * b + a MOD b ; (2) a / b > 2 ET a MOD 2 = 1 ; (3) -a MOD b + 2 ^ b.",
        "(1) 7 DIV 3 = 2 ; 2 × 3 = 6 ; 7 MOD 3 = 1 ; 6 + 1 = **7**\n(2) 7 / 3 ≈ 2.33 > 2 → VRAI ; 7 MOD 2 = 1 → VRAI ; **VRAI**\n(3) −7 MOD 3 = −1 (signe du dividende) ; 2 ^ 3 = 8 ; **7**",
        "La première expression illustre la relation a = b × (a DIV b) + (a MOD b). Attention au reste d'un nombre négatif : en pseudocode comme en C, Java et JavaScript, il a le signe du dividende (en Python, il a celui du diviseur).",
      ),
      solved(
        "Jour de la semaine",
        "Les jours sont numérotés de 0 (lundi) à 6 (dimanche). Écrivez un algorithme qui lit le numéro du jour actuel et un nombre de jours k, puis affiche le numéro du jour dans k jours.",
        `
        ALGORITHME JourFutur
        VARIABLES
          jour, k, futur : ENTIER
        DEBUT
          LIRE(jour)
          LIRE(k)
          futur ← (jour + k) MOD 7
          ECRIRE("Jour : ", futur)
        FIN
        `,
        "MOD 7 « boucle » sur la semaine : depuis jeudi (3), dans 10 jours on obtient (3 + 10) MOD 7 = 6, un dimanche.",
      ),
    ],
    td: {
      title: "TD 6 — DIV, MOD et priorités",
      instructions: "Vérifiez vos calculs sur un exemple à la main avant de soumettre ; les tests cachés contiennent des cas limites.",
      exerciseSlugs: ["algo-chiffres", "algo-divisibilite"],
    },
    interrogation: interrogation("operateurs-interrogation", "Interrogation — Opérateurs", [
      qcm("Que vaut 17 MOD 5 ?", ["3", "2", "3.4", "12"], 1),
      qcm("Que vaut 2 + 3 * 4 ?", ["20", "14", "24", "9"], 1),
      qcm("Que vaut 20 - 6 - 2 ?", ["16", "12", "10", "18"], 1),
      qcm("Quel est le chiffre des dizaines de 4 829 ?", ["(4829 DIV 10) MOD 10 = 2", "4829 MOD 100 = 29", "4829 DIV 100 = 48", "4829 MOD 10 = 9"], 0),
      vraiFaux("7 / 2 donne 3 en pseudocode.", false, "/ est la division réelle : 3.5. C'est 7 DIV 2 qui vaut 3."),
    ]),
    evaluation: chapterEvaluation("operateurs-evaluation", "Évaluation du chapitre 6", [
      qcm("Que vaut 45 DIV 7 ?", ["6", "6.43", "3", "7"], 0),
      qcm("Que vaut 45 MOD 7 ?", ["6", "3", "2", "0"], 1),
      qcm("Comment tester qu'un nombre n est un multiple de 4 ?", ["n DIV 4 = 0", "n MOD 4 = 0", "n / 4 = 0", "n MOD 4 = 4"], 1),
      qcm("Que vaut (2 + 3) * 4 - 6 / 2 ?", ["17", "7", "20", "2"], 0, "(2 + 3) × 4 = 20, 6 / 2 = 3, 20 − 3 = 17."),
      qcm("Combien de minutes complètes dans 365 secondes ?", ["6", "5", "6.08", "65"], 0),
      vraiFaux("Dans (d <> 0) ET (n MOD d = 0), si d vaut 0, n MOD d n'est pas calculé.", true),
      qcm("Que vaut 2 ^ 3 ^ 2 ?", ["64", "512", "36", "12"], 1, "La puissance s'évalue de droite à gauche : 2 ^ 9."),
      qcm("Quel est le chiffre des centaines de 375 ?", ["375 DIV 100 = 3", "375 MOD 100 = 75", "375 MOD 10 = 5", "375 / 100 = 3.75"], 0),
    ]),
  },
});

// =====================================================================
// Chapitre 7 — Entrées et sorties
// =====================================================================
export const entreesSorties: Lesson = lesson({
  slug: "entrees-sorties",
  title: "Entrées et sorties",
  durationMinutes: 90,
  objectives: [
    "Lire des données de différents types avec LIRE.",
    "Produire un affichage clair et conforme à un format imposé avec ECRIRE.",
    "Comprendre la conversion des données lues et les erreurs de saisie.",
  ],
  prerequisites: ["Chapitre 5 — Types de données."],
  content: `
    ## 1. Communiquer avec l'utilisateur

    Un algorithme utile **reçoit** des données et **communique** ses résultats. En pseudocode, deux instructions suffisent :

    - **LIRE(variable)** : attend une donnée et la range dans la variable (entrée) ;
    - **ECRIRE(…)** : affiche des valeurs à l'écran puis passe à la ligne (sortie).

    ## 2. LIRE : obtenir des données

    ~~~pseudocode
    LIRE(nom)
    LIRE(age)
    LIRE(a, b)        // lit deux valeurs, une par ligne
    ~~~

    Sur la plateforme, les données sont saisies à l'avance dans la zone **Entrée**, **une valeur par ligne** : chaque LIRE consomme la ligne suivante. Ce fonctionnement est exactement celui des tests automatiques des exercices.

    La valeur lue est **convertie dans le type de la variable** :

    | Type de la variable | Saisie | Résultat |
    |---|---|---|
    | ENTIER | 42 | 42 |
    | ENTIER | 4.5 ou abc | **erreur** de saisie |
    | REEL | 12,5 ou 12.5 | 12.5 |
    | CHAINE | Jean Mukendi | "Jean Mukendi" (toute la ligne) |
    | BOOLEEN | VRAI, FAUX, 1 ou 0 | VRAI / FAUX |

    S'il n'y a plus de donnée à lire, l'exécution s'arrête avec un message clair.

    ## 3. ECRIRE : afficher des résultats

    ECRIRE accepte plusieurs éléments séparés par des virgules ; ils sont affichés **collés**, sans espace ajouté :

    ~~~pseudocode
    ECRIRE("La moyenne de ", nom, " est ", moyenne, "/20")
    ~~~

    - Les textes entre guillemets sont affichés tels quels ;
    - les variables et expressions sont **évaluées** puis affichées ;
    - les booléens s'affichent VRAI ou FAUX ;
    - chaque ECRIRE se termine par un **retour à la ligne**.

    Pour afficher une ligne vide : ECRIRE(""). Pour construire une ligne morceau par morceau (par exemple dans une boucle), on concatène dans une variable CHAINE puis on l'affiche une fois.

    ## 4. Guider l'utilisateur

    Dans un vrai programme, on affiche un message **avant** chaque lecture : ECRIRE("Votre âge ?") puis LIRE(age). Dans les exercices corrigés automatiquement, au contraire, on n'affiche **que** ce que demande l'énoncé : un message en trop rendrait la sortie différente de la sortie attendue.

    ## 5. Respecter un format de sortie

    Les tests comparent la sortie **caractère par caractère** (les espaces en fin de ligne sont tolérés). Avant de soumettre, vérifiez : majuscules et accents, espaces autour des deux-points, ordre des lignes, nombre de décimales. Exemple : si l'énoncé demande « Somme : 13 », les sorties « somme : 13 », « Somme: 13 » et « Somme : 13.0 » sont toutes **incorrectes**.

    ## 6. L'ordre des lectures

    Les données sont consommées **dans l'ordre** des instructions LIRE. Si l'énoncé fournit d'abord le prix puis la quantité, il faut lire le prix en premier : inverser les deux LIRE ne provoque pas toujours d'erreur, mais produit un résultat faux. Avant d'écrire vos LIRE, recopiez l'exemple d'entrée de l'énoncé et associez chaque ligne à une variable.

    ## 7. Les entrées : jamais de confiance aveugle

    Un utilisateur peut saisir n'importe quoi. Un programme robuste **vérifie** ses entrées (une note entre 0 et 20, un âge positif) et redemande si nécessaire : nous apprendrons à le faire avec les structures conditionnelles (chapitre 8) et la boucle RÉPÉTER (chapitre 10). C'est aussi une règle de **sécurité** fondamentale en programmation : toute donnée venant de l'extérieur doit être validée.
  `,
  examples: [
    example(P, "Saluer l'utilisateur", `
      ALGORITHME Salutation
      VARIABLES
        nom : CHAINE
        annee, age : ENTIER
      DEBUT
        ECRIRE("Quel est votre nom ?")
        LIRE(nom)
        ECRIRE("Votre année de naissance ?")
        LIRE(annee)
        age ← 2026 - annee
        ECRIRE("Bonjour ", nom, ", vous avez environ ", age, " ans.")
      FIN
    `, { stdin: "Grâce\n2005" }),
    example(P, "Construire une ligne avant de l'afficher", `
      ALGORITHME Ligne
      VARIABLES
        a, b, c : ENTIER
        ligne : CHAINE
      DEBUT
        LIRE(a, b, c)
        ligne ← CHAINE(a) + " - " + CHAINE(b) + " - " + CHAINE(c)
        ECRIRE("Valeurs : ", ligne)
      FIN
    `, { stdin: "4\n8\n15" }),
  ],
  summary: [
    "LIRE range dans une variable la donnée suivante, convertie dans son type.",
    "Sur la plateforme, une valeur par ligne dans la zone Entrée.",
    "ECRIRE affiche ses éléments collés, puis passe à la ligne.",
    "Dans les exercices, respectez exactement le format de sortie demandé.",
    "Toute entrée doit être vérifiée avant d'être utilisée.",
  ],
  exerciseSlugs: ["algo-somme-deux-nombres", "algo-moyenne-trois-notes"],
  pedagogy: {
    competences: [
      "Lire des données de types variés",
      "Produire un affichage conforme à un format",
      "Interpréter une erreur de saisie",
    ],
    definitions: [
      { term: "Entrée", definition: "Donnée fournie à l'algorithme depuis l'extérieur (clavier, fichier) et obtenue avec LIRE." },
      { term: "Sortie", definition: "Résultat communiqué par l'algorithme, produit avec ECRIRE." },
      { term: "Format de sortie", definition: "Forme exacte attendue de l'affichage : textes, espaces, ordre, nombre de décimales." },
      { term: "Validation d'entrée", definition: "Vérification qu'une donnée saisie respecte les contraintes attendues avant de l'utiliser." },
    ],
    commentedAlgorithms: [
      annotated(
        "Bulletin simplifié",
        [
          ["ALGORITHME Bulletin"],
          ["VARIABLES"],
          ["  nom : CHAINE"],
          ["  note1, note2 : REEL"],
          ["DEBUT"],
          ["  LIRE(nom)", "1re ligne d'entrée : tout le texte de la ligne."],
          ["  LIRE(note1, note2)", "Deux valeurs : 2e et 3e lignes d'entrée."],
          ["  ECRIRE(\"Étudiant : \", nom)", "Texte et variable affichés collés."],
          ["  ECRIRE(\"Notes : \", note1, \" et \", note2)", "Les espaces doivent être écrits dans les textes."],
          ["  ECRIRE(\"Moyenne : \", (note1 + note2) / 2)", "Une expression est évaluée avant d'être affichée."],
          ["  ECRIRE(\"Admis : \", (note1 + note2) / 2 >= 10)", "Un booléen s'affiche VRAI ou FAUX."],
          ["FIN"],
        ],
        { stdin: "Kasongo Amani\n11\n14", showTrace: true, showFlowchart: true },
      ),
    ],
    commonErrors: [
      commonError(
        "Lire un texte dans un ENTIER",
        `
        VARIABLES
          age : ENTIER
        DEBUT
          LIRE(age)
          ECRIRE(age)
        FIN
        // Entrée saisie : vingt
        `,
        `
        VARIABLES
          age : ENTIER
        DEBUT
          LIRE(age)
          ECRIRE(age)
        FIN
        // Entrée saisie : 20
        `,
        "LIRE convertit la saisie dans le type de la variable : « vingt » n'est pas un entier. Sur la plateforme, l'erreur indique la variable concernée et la valeur reçue.",
      ),
      commonError(
        "Ne pas respecter le format demandé",
        `
        // Énoncé : afficher « Somme : 13 »
        ECRIRE("La somme vaut ", a + b)
        `,
        `
        // Énoncé : afficher « Somme : 13 »
        ECRIRE("Somme : ", a + b)
        `,
        "Le résultat est juste, mais la sortie ne correspond pas à l'énoncé : le test automatique échoue. Copiez le format exact, espaces compris.",
      ),
    ],
    solvedExercises: [
      solved(
        "Prévoir l'affichage",
        "Qu'affiche ce programme avec les entrées 3 et 4 ?\n\n~~~pseudocode\nLIRE(a, b)\nECRIRE(a, \"+\", b, \"=\", a + b)\nECRIRE(\"\")\nECRIRE(a * b > 10)\n~~~",
        "3+4=7\n\nVRAI",
        "Les éléments sont collés sans espace ; ECRIRE(\"\") produit une ligne vide ; 3 × 4 = 12 > 10 donne VRAI.",
      ),
      solved(
        "Carte d'identité",
        "Lisez un nom, un prénom et une année de naissance, puis affichez exactement :\n\n~~~text\nNom : <NOM>\nPrénom : <prénom>\nÂge en 2026 : <âge>\n~~~\n(le nom en majuscules).",
        `
        ALGORITHME Carte
        VARIABLES
          nom, prenom : CHAINE
          annee : ENTIER
        DEBUT
          LIRE(nom)
          LIRE(prenom)
          LIRE(annee)
          ECRIRE("Nom : ", MAJUSCULE(nom))
          ECRIRE("Prénom : ", prenom)
          ECRIRE("Âge en 2026 : ", 2026 - annee)
        FIN
        `,
        "Trois lectures, trois écritures. MAJUSCULE transforme la chaîne ; l'âge est une expression calculée directement dans ECRIRE.",
      ),
    ],
    td: {
      title: "TD 7 — Entrées, sorties et formats",
      instructions: "Copiez exactement le format de l'énoncé (majuscules, espaces, accents). Les tests comparent la sortie ligne par ligne.",
      exerciseSlugs: ["algo-facture", "algo-fiche-etudiant"],
    },
    interrogation: interrogation("entrees-sorties-interrogation", "Interrogation — Entrées et sorties", [
      qcm("Qu'affiche ECRIRE(\"A\", 1, \"B\") ?", ["A 1 B", "A1B", "A, 1, B", "erreur"], 1),
      qcm("Sur la plateforme, comment saisir deux valeurs pour LIRE(a, b) ?", ["Sur une même ligne séparées par une virgule", "Une valeur par ligne", "Entre guillemets", "Ce n'est pas possible"], 1),
      vraiFaux("Dans un exercice corrigé automatiquement, il faut afficher « Entrez un nombre » avant LIRE.", false),
      qcm("Que se passe-t-il si l'on saisit « abc » pour une variable ENTIER ?", ["La variable vaut 0", "Erreur de saisie", "La variable vaut \"abc\"", "Rien"], 1),
      qcm("Que vaut l'affichage de ECRIRE(5 > 3) ?", ["5 > 3", "VRAI", "1", "TRUE"], 1),
    ]),
    evaluation: chapterEvaluation("entrees-sorties-evaluation", "Évaluation du chapitre 7", [
      qcm("Que fait LIRE(x) ?", ["Affiche x", "Range dans x la donnée suivante", "Compare x à une saisie", "Efface x"], 1),
      qcm("Quelle instruction affiche « Total : 12 » si t vaut 12 ?", ["ECRIRE(\"Total :\", t)", "ECRIRE(\"Total : \", t)", "ECRIRE(Total, t)", "ECRIRE(\"Total : t\")"], 1),
      qcm("Une variable CHAINE reçoit « Jean Mukendi » par LIRE. Que contient-elle ?", ["\"Jean\"", "\"Jean Mukendi\"", "\"Mukendi\"", "une erreur"], 1),
      vraiFaux("Chaque ECRIRE se termine par un retour à la ligne.", true),
      qcm("Quelle saisie est acceptée pour une variable REEL ?", ["douze", "12,5", "12 et demi", "\"12\""], 1),
      qcm("Pourquoi valider les entrées d'un programme ?", ["Pour ralentir l'utilisateur", "Parce qu'une donnée extérieure peut être invalide ou malveillante", "Ce n'est jamais utile", "Pour économiser la mémoire"], 1),
      qcm("Qu'affiche ECRIRE(\"x = \", 2 * 3, \";\") ?", ["x = 6;", "x = 2 * 3;", "x = 6 ;", "x=6;"], 0),
      qcm("Un exercice attend « Moyenne : 12 ». Votre programme affiche « Moyenne : 12.0 ». Le test…", ["réussit", "échoue", "dépend de l'enseignant", "n'est pas exécuté"], 1),
    ]),
  },
});

// =====================================================================
// Ancien chapitre « Notion d'algorithme » : fusionné dans le chapitre 1.
// Conservé (archivé) pour ne pas perdre l'historique ni les liens existants.
// =====================================================================
export const notionArchivee: Lesson = lesson({
  slug: "notion-algorithme",
  title: "Notion d'algorithme (fusionné dans le chapitre 1)",
  durationMinutes: 25,
  status: "archive",
  objectives: ["Connaître les propriétés d'un bon algorithme.", "Identifier entrées, traitement et sorties."],
  content: "Ce contenu fait désormais partie du chapitre « Introduction à l'algorithmique ».",
  summary: ["Voir le chapitre 1."],
  quiz: quiz("notion-algo-quiz", "Propriétés d'un algorithme", [
    qcm("Laquelle de ces propriétés n'est PAS exigée d'un algorithme ?", ["Se terminer en un temps fini", "Être écrit en anglais", "Être non ambigu", "Produire un résultat correct"], 1),
  ]),
});
