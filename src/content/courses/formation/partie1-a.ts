import { annotated, chapterEvaluation, commonError, example, interrogation, lesson, qcm, solved, vraiFaux } from "../../helpers";
import type { Lesson } from "../../types";

const P = "pseudocode" as const;

// =====================================================================
// Chapitre 1 — Introduction à l'algorithmique
// =====================================================================
export const introduction: Lesson = lesson({
  slug: "introduction-algorithmique",
  title: "Introduction à l'algorithmique",
  durationMinutes: 90,
  objectives: [
    "Définir les notions de problème, d'algorithme et de programme.",
    "Citer et expliquer les propriétés d'un bon algorithme.",
    "Identifier les entrées, le traitement et les sorties d'un algorithme.",
    "Lire, écrire et exécuter un premier algorithme en pseudocode.",
  ],
  prerequisites: ["Aucun : ce chapitre est le point de départ de la formation."],
  content: `
    ## 1. Pourquoi étudier l'algorithmique ?

    Un ordinateur ne « comprend » rien : il exécute, très vite et sans jamais se tromper, des opérations **élémentaires** (ranger une valeur en mémoire, additionner deux nombres, comparer deux valeurs, afficher un caractère). Pour qu'il résolve un problème, quelqu'un doit lui décrire, étape par étape, **exactement** ce qu'il doit faire. Cette description est un **algorithme**.

    L'algorithmique est la discipline qui étudie la conception de ces méthodes : comment les construire, comment s'assurer qu'elles sont **correctes**, et comment les rendre **efficaces**. C'est la compétence centrale de l'informaticien : les langages changent (Python, C, Java…), la manière de raisonner reste.

    > L'informaticien commence par réfléchir à la méthode (l'algorithme), puis la traduit dans un langage (le programme).

    ## 2. Problème, algorithme, programme

    | Notion | Définition | Exemple |
    |---|---|---|
    | Problème | Ce que l'on veut obtenir, à partir de données | Calculer la moyenne de trois notes |
    | Algorithme | La méthode, décrite indépendamment de tout langage | Additionner les trois notes, puis diviser la somme par 3 |
    | Programme | L'algorithme traduit dans un langage compris par la machine | Le même calcul écrit en Python ou en C |

    Un même problème peut être résolu par **plusieurs algorithmes** (certains plus rapides que d'autres), et un même algorithme peut être traduit en **plusieurs programmes** (un par langage).

    Le mot « algorithme » vient du nom du mathématicien persan **Al-Khwârizmî** (IXᵉ siècle), auteur de méthodes de calcul systématiques. L'algorithme d'**Euclide** (vers 300 av. J.-C.), qui calcule le plus grand diviseur commun de deux nombres, est l'un des plus anciens connus.

    ## 3. Les propriétés d'un bon algorithme

    1. **Finitude** : il se termine toujours, après un nombre fini d'étapes.
    2. **Précision** (absence d'ambiguïté) : chaque étape n'a qu'une seule interprétation possible. « Ajouter un peu de sel » n'est pas précis ; « ajouter 5 g de sel » l'est.
    3. **Entrées et sorties définies** : on sait quelles données il reçoit et quels résultats il produit.
    4. **Correction** : pour toute entrée valide, il produit le résultat attendu.
    5. **Efficacité** : il n'utilise pas plus de temps ni de mémoire que nécessaire.

    Ces propriétés ne sont pas décoratives : un algorithme qui ne se termine pas « bloque » l'ordinateur ; un algorithme ambigu sera traduit différemment par deux programmeurs ; un algorithme incorrect pour une seule entrée (par exemple une note égale à 0) est un algorithme faux.

    ## 4. Le schéma entrée → traitement → sortie

    Presque tout algorithme suit le même schéma :

    - **Entrées** : les données fournies (lues au clavier, dans un fichier…).
    - **Traitement** : les calculs et les décisions.
    - **Sorties** : les résultats communiqués (affichés à l'écran, enregistrés…).

    Exemple : pour convertir une durée en minutes, l'entrée est le nombre d'heures, le traitement est la multiplication par 60, la sortie est le nombre de minutes.

    ## 5. L'ordre des instructions compte

    Les instructions d'un algorithme s'exécutent **de haut en bas, une par une**, dans l'ordre où elles sont écrites (on parle d'exécution **séquentielle**). Échanger deux lignes change souvent le résultat : verser l'eau avant de la faire bouillir ne donne pas un thé chaud. Dans les chapitres suivants, nous verrons comment rompre cet ordre (conditions, boucles), toujours de façon contrôlée.

    ## 6. Le pseudocode utilisé sur la plateforme

    Le **pseudocode** est une écriture structurée, proche du français, assez précise pour être exécutée, assez simple pour se concentrer sur la logique. Sur UPL CODE ACADEMY MK, il est **réellement interprété** : chaque exemple peut être exécuté avec le bouton **Exécuter**.

    ~~~pseudocode
    ALGORITHME NomDeLAlgorithme
    VARIABLES
      // déclaration des variables (chapitre 4)
    DEBUT
      // instructions, exécutées de haut en bas
    FIN
    ~~~

    - Les mots-clés (ALGORITHME, DEBUT, ECRIRE…) s'écrivent indifféremment en majuscules ou minuscules, avec ou sans accents.
    - Les commentaires commencent par **//** : ils sont destinés au lecteur et ignorés à l'exécution.
    - **ECRIRE(…)** affiche des valeurs puis passe à la ligne.

    Les conventions de pseudocode varient d'un enseignant à l'autre ; celles de la plateforme sont décrites dans la référence du pseudocode et restent proches des usages universitaires francophones.
  `,
  examples: [
    example(P, "Premier algorithme", `
      ALGORITHME Bonjour
      DEBUT
        ECRIRE("Bonjour et bienvenue à UPL CODE ACADEMY MK !")
        ECRIRE("Je suis votre premier algorithme.")
      FIN
    `, { explanation: "Deux instructions ECRIRE, exécutées dans l'ordre : deux lignes s'affichent." }),
    example(P, "Entrée, traitement, sortie", `
      ALGORITHME HeuresEnMinutes
      VARIABLES
        heures, minutes : ENTIER
      DEBUT
        LIRE(heures)
        minutes ← heures * 60
        ECRIRE(heures, " heure(s) = ", minutes, " minutes")
      FIN
    `, { stdin: "3", explanation: "LIRE prend la valeur 3 dans la zone « Entrée »." }),
  ],
  summary: [
    "Un algorithme est une suite finie et non ambiguë d'instructions qui résout un problème.",
    "Le programme est la traduction d'un algorithme dans un langage de programmation.",
    "Un bon algorithme est fini, précis, correct, et si possible efficace.",
    "La plupart des algorithmes suivent le schéma entrée → traitement → sortie.",
    "Les instructions s'exécutent dans l'ordre, de haut en bas.",
  ],
  quiz: undefined,
  exerciseSlugs: ["algo-bonjour"],
  pedagogy: {
    competences: [
      "Distinguer problème, algorithme et programme",
      "Reconnaître les propriétés d'un algorithme correct",
      "Identifier entrées, traitement et sorties",
      "Écrire et exécuter un algorithme séquentiel simple",
    ],
    definitions: [
      { term: "Algorithme", definition: "Suite **finie** d'instructions **non ambiguës** qui, appliquée à des données d'entrée, produit un résultat en un temps fini." },
      { term: "Programme", definition: "Traduction d'un algorithme dans un langage de programmation, exécutable par un ordinateur." },
      { term: "Instruction", definition: "Ordre élémentaire donné à la machine : lire, écrire, calculer, ranger une valeur, tester une condition." },
      { term: "Pseudocode", definition: "Écriture structurée d'un algorithme en langage proche du naturel, indépendante de tout langage de programmation." },
      { term: "Exécution séquentielle", definition: "Exécution des instructions une par une, dans l'ordre où elles sont écrites." },
    ],
    commentedAlgorithms: [
      annotated(
        "Calcul de la moyenne de trois notes",
        [
          ["ALGORITHME MoyenneTroisNotes", "En-tête : le nom décrit ce que fait l'algorithme."],
          ["VARIABLES", "Début de la zone de déclaration."],
          ["  n1, n2, n3, moyenne : REEL", "Quatre boîtes en mémoire pouvant contenir des nombres à virgule."],
          ["DEBUT", "Début des instructions exécutables."],
          ["  LIRE(n1)", "Entrée : la première note est lue et rangée dans n1."],
          ["  LIRE(n2)", "Entrée : deuxième note."],
          ["  LIRE(n3)", "Entrée : troisième note."],
          ["  moyenne ← (n1 + n2 + n3) / 3", "Traitement : les parenthèses imposent d'additionner avant de diviser."],
          ["  ECRIRE(\"Moyenne : \", moyenne)", "Sortie : le texte puis la valeur calculée."],
          ["FIN", "Fin de l'algorithme : il se termine toujours (finitude)."],
        ],
        { stdin: "12\n15\n9", showTrace: true, showFlowchart: true },
      ),
    ],
    commonErrors: [
      commonError(
        "Oublier le bloc DEBUT … FIN",
        `
        ALGORITHME Salut
        VARIABLES
          x : ENTIER
        ECRIRE("Salut")
        `,
        `
        ALGORITHME Salut
        DEBUT
          ECRIRE("Salut")
        FIN
        `,
        "Dès qu'un algorithme a une structure (ALGORITHME, VARIABLES…), ses instructions doivent être placées entre **DEBUT** et **FIN**.",
        true,
      ),
      commonError(
        "Inverser l'ordre des instructions",
        `
        ALGORITHME Double
        VARIABLES
          n, d : ENTIER
        DEBUT
          d ← n * 2
          LIRE(n)
          ECRIRE(d)
        FIN
        `,
        `
        ALGORITHME Double
        VARIABLES
          n, d : ENTIER
        DEBUT
          LIRE(n)
          d ← n * 2
          ECRIRE(d)
        FIN
        `,
        "Les instructions s'exécutent dans l'ordre : on ne peut pas calculer avec **n** avant de l'avoir lu. L'interpréteur signale que la variable est utilisée avant d'avoir reçu une valeur.",
        true,
        "5",
      ),
    ],
    solvedExercises: [
      solved(
        "Identifier entrées et sorties",
        "Pour le problème « calculer le prix à payer pour n cahiers vendus 1 500 FC l'unité », indiquez les entrées, le traitement et la sortie, puis écrivez l'algorithme.",
        `
        ALGORITHME PrixCahiers
        CONSTANTES
          PRIX_UNITAIRE = 1500
        VARIABLES
          n, total : ENTIER
        DEBUT
          LIRE(n)
          total ← n * PRIX_UNITAIRE
          ECRIRE("A payer : ", total, " FC")
        FIN
        `,
        "- **Entrée** : le nombre de cahiers n.\n- **Traitement** : multiplier n par le prix unitaire.\n- **Sortie** : le montant total.\n\nLe prix unitaire est une **constante** : il ne dépend pas de l'utilisateur.",
      ),
      solved(
        "Une recette est-elle un algorithme ?",
        "« Mettre de l'eau à chauffer. Ajouter du riz. Laisser cuire un moment. Saler à votre goût. » Cette recette respecte-t-elle les propriétés d'un algorithme ? Corrigez-la.",
        "1. Faire chauffer 1 litre d'eau jusqu'à ébullition.\n2. Ajouter 250 g de riz.\n3. Laisser cuire 12 minutes.\n4. Ajouter 5 g de sel.\n5. Égoutter.",
        "La recette initiale n'est **pas précise** : « un moment » et « à votre goût » admettent plusieurs interprétations. Un algorithme doit indiquer des quantités et des durées exactes pour que deux personnes obtiennent le même résultat.",
      ),
    ],
    td: {
      title: "TD 1 — Premiers algorithmes séquentiels",
      instructions: "Pour chaque exercice : identifiez d'abord les entrées et les sorties, écrivez l'algorithme, puis soumettez-le. La correction s'affiche après réussite.",
      exerciseSlugs: ["algo-trois-lignes", "algo-carre-perimetre"],
    },
    interrogation: interrogation("introduction-interrogation", "Interrogation — Introduction à l'algorithmique", [
      qcm("Qu'est-ce qu'un algorithme ?", ["Un langage de programmation", "Une suite finie d'instructions précises qui résout un problème", "Un composant électronique", "Un logiciel de traitement de texte"], 1),
      vraiFaux("Un même algorithme peut être traduit dans plusieurs langages de programmation.", true),
      qcm("« Laisser cuire un moment » viole quelle propriété ?", ["La finitude", "La précision", "L'efficacité", "Aucune"], 1, "« Un moment » n'a pas une interprétation unique."),
      qcm("Dans « convertir des heures en minutes », quelle est la sortie ?", ["Le nombre d'heures", "La multiplication par 60", "Le nombre de minutes", "Le chiffre 60"], 2),
      vraiFaux("Les instructions d'un algorithme séquentiel peuvent être écrites dans n'importe quel ordre.", false),
    ]),
    evaluation: chapterEvaluation("introduction-evaluation", "Évaluation du chapitre 1", [
      qcm("Lequel de ces éléments est un programme ?", ["Une méthode de calcul écrite en français", "Un algorithme traduit en Python", "Un organigramme", "Un énoncé d'exercice"], 1),
      qcm("Quelle propriété garantit qu'un algorithme s'arrête ?", ["La correction", "La finitude", "La précision", "L'efficacité"], 1),
      qcm("Un algorithme donne un résultat faux uniquement quand une note vaut 0. Il est…", ["correct", "incorrect", "inefficace mais correct", "ambigu"], 1, "La correction exige un bon résultat pour toutes les entrées valides."),
      qcm("Que fait ECRIRE(\"A = \", 5) ?", ["Affiche A = 5", "Range 5 dans A", "Lit une valeur", "Provoque une erreur"], 0),
      vraiFaux("Un commentaire // est exécuté par l'interpréteur.", false),
      qcm("Que contient le schéma entrée → traitement → sortie pour « calculer l'aire d'un carré de côté c » ?", ["Entrée : aire ; sortie : c", "Entrée : c ; traitement : c × c ; sortie : aire", "Entrée : c × c ; sortie : c", "Il n'y a pas d'entrée"], 1),
      qcm("Pourquoi écrire d'abord un algorithme avant le programme ?", ["Parce que l'ordinateur exécute le pseudocode plus vite", "Pour se concentrer sur la méthode, indépendamment du langage", "Parce que c'est obligatoire en Python", "Pour éviter d'utiliser des variables"], 1),
      vraiFaux("Plusieurs algorithmes différents peuvent résoudre le même problème.", true),
    ]),
  },
});

// =====================================================================
// Chapitre 2 — Logique mathématique et raisonnement
// =====================================================================
export const logique: Lesson = lesson({
  slug: "logique-raisonnement",
  title: "Logique mathématique et raisonnement",
  durationMinutes: 120,
  objectives: [
    "Définir une proposition et sa valeur de vérité.",
    "Utiliser les connecteurs NON, ET, OU et construire leurs tables de vérité.",
    "Appliquer les lois de De Morgan pour transformer une condition.",
    "Traduire une phrase en condition logique et raisonner par cas.",
  ],
  prerequisites: ["Chapitre 1 — Introduction à l'algorithmique."],
  content: `
    ## 1. Propositions et valeurs de vérité

    Une **proposition** est un énoncé qui est soit **vrai**, soit **faux**, sans autre possibilité. « 7 est un nombre pair » est une proposition (fausse) ; « 10 > 3 » est une proposition (vraie). En revanche « Quelle heure est-il ? » ou « x + 1 » ne sont pas des propositions.

    Dans un algorithme, une **condition** est une proposition dont la valeur dépend des variables : « note ≥ 10 » est vraie si la note vaut 12, fausse si elle vaut 8. Le résultat d'une condition est une valeur **booléenne** : VRAI ou FAUX (du nom du mathématicien George Boole).

    ## 2. Les connecteurs logiques

    On combine des propositions avec trois connecteurs :

    - **NON p** (négation) : vrai quand p est faux.
    - **p ET q** (conjonction) : vrai seulement quand p et q sont **tous les deux** vrais.
    - **p OU q** (disjonction) : vrai quand **au moins un** des deux est vrai. Le OU logique est **inclusif** : « p OU q » est vrai aussi quand les deux sont vrais.

    ### Tables de vérité

    | p | q | NON p | p ET q | p OU q |
    |---|---|---|---|---|
    | VRAI | VRAI | FAUX | VRAI | VRAI |
    | VRAI | FAUX | FAUX | FAUX | VRAI |
    | FAUX | VRAI | VRAI | FAUX | VRAI |
    | FAUX | FAUX | VRAI | FAUX | FAUX |

    Avec n propositions, une table de vérité compte 2ⁿ lignes : 4 lignes pour 2 propositions, 8 pour 3.

    ## 3. Priorités et parenthèses

    Comme × passe avant +, **NON** s'applique avant **ET**, qui s'applique avant **OU**. Ainsi « NON a ET b OU c » se lit « ((NON a) ET b) OU c ». En cas de doute — et pour être lu facilement — on met des **parenthèses**. Les comparaisons (=, <, ≥…) sont évaluées avant les connecteurs : « x > 0 ET x < 10 » se lit « (x > 0) ET (x < 10) ».

    ## 4. Lois de De Morgan et équivalences utiles

    Deux conditions sont **équivalentes** si elles ont la même table de vérité. Les lois de De Morgan permettent de « faire entrer » une négation dans une parenthèse :

    - NON (p ET q) ⇔ (NON p) OU (NON q)
    - NON (p OU q) ⇔ (NON p) ET (NON q)

    Exemple : « la note n'est PAS comprise entre 0 et 20 » s'écrit NON ((note ≥ 0) ET (note ≤ 20)), c'est-à-dire (note < 0) OU (note > 20).

    Autres équivalences courantes : NON (NON p) ⇔ p ; NON (x < y) ⇔ x ≥ y ; NON (x = y) ⇔ x ≠ y.

    ## 5. L'implication et le raisonnement

    « Si p alors q » (**implication**) n'est faux que dans un cas : p vrai et q faux. « S'il pleut, alors le sol est mouillé » n'est pas contredit par un sol mouillé sans pluie. L'implication p ⇒ q est équivalente à (NON p) OU q. Elle n'est pas un opérateur du pseudocode, mais elle sert à **raisonner** sur les algorithmes : « si l'entrée est positive, alors le résultat est positif ».

    Deux techniques de raisonnement reviennent sans cesse :

    1. **Le raisonnement par cas** : on découpe les situations possibles (n pair / n impair ; x < 0, x = 0, x > 0) et on vérifie chaque cas. C'est exactement ce que fera une structure SI … SINON.
    2. **Le contre-exemple** : pour montrer qu'une affirmation générale est fausse, un seul cas suffit. « Tout nombre premier est impair » est faux : 2 est premier et pair.

    ## 6. Traduire une phrase en condition

    | Phrase | Condition |
    |---|---|
    | x est compris entre 10 et 20 (inclus) | (x ≥ 10) ET (x ≤ 20) |
    | x est en dehors de [10 ; 20] | (x < 10) OU (x > 20) |
    | n est pair | n MOD 2 = 0 |
    | l'étudiant est admis s'il a au moins 10 de moyenne et aucune note éliminatoire | (moyenne ≥ 10) ET NON eliminatoire |

    Piège classique : on n'écrit **jamais** 10 ≤ x ≤ 20 en pseudocode ; il faut deux comparaisons reliées par ET.
  `,
  examples: [
    example(P, "Tables de vérité calculées par la machine", `
      ALGORITHME TableDeVerite
      VARIABLES
        p, q : BOOLEEN
      DEBUT
        ECRIRE("p | q | p ET q | p OU q | NON p")
        p ← VRAI
        q ← VRAI
        ECRIRE(p, " | ", q, " | ", p ET q, " | ", p OU q, " | ", NON p)
        q ← FAUX
        ECRIRE(p, " | ", q, " | ", p ET q, " | ", p OU q, " | ", NON p)
        p ← FAUX
        q ← VRAI
        ECRIRE(p, " | ", q, " | ", p ET q, " | ", p OU q, " | ", NON p)
        q ← FAUX
        ECRIRE(p, " | ", q, " | ", p ET q, " | ", p OU q, " | ", NON p)
      FIN
    `),
    example(P, "Vérifier une loi de De Morgan", `
      ALGORITHME DeMorgan
      VARIABLES
        note : REEL
        dedans, dehors : BOOLEEN
      DEBUT
        LIRE(note)
        dedans ← (note >= 0) ET (note <= 20)
        dehors ← (note < 0) OU (note > 20)
        ECRIRE("Note valide : ", dedans)
        ECRIRE("NON valide = invalide ? ", (NON dedans) = dehors)
      FIN
    `, { stdin: "25" }),
  ],
  summary: [
    "Une proposition est vraie ou fausse ; une condition est une proposition qui dépend des variables.",
    "NON inverse, ET exige les deux, OU (inclusif) en exige au moins un.",
    "Priorités : comparaisons, puis NON, puis ET, puis OU ; les parenthèses lèvent toute ambiguïté.",
    "De Morgan : NON (p ET q) = NON p OU NON q ; NON (p OU q) = NON p ET NON q.",
    "On ne peut pas enchaîner deux comparaisons : 10 ≤ x ≤ 20 s'écrit (x ≥ 10) ET (x ≤ 20).",
  ],
  exerciseSlugs: ["algo-intervalle"],
  pedagogy: {
    competences: [
      "Évaluer une expression booléenne",
      "Construire une table de vérité",
      "Transformer une condition avec les lois de De Morgan",
      "Traduire un énoncé en condition logique",
    ],
    definitions: [
      { term: "Proposition", definition: "Énoncé qui est soit vrai, soit faux." },
      { term: "Booléen", definition: "Type dont les seules valeurs sont **VRAI** et **FAUX**." },
      { term: "Conjonction (ET)", definition: "p ET q est vrai si et seulement si p et q sont vrais tous les deux." },
      { term: "Disjonction (OU)", definition: "p OU q est vrai si et seulement si au moins l'une des deux propositions est vraie (OU inclusif)." },
      { term: "Négation (NON)", definition: "NON p est vrai si et seulement si p est faux." },
      { term: "Équivalence de conditions", definition: "Deux conditions sont équivalentes si elles ont la même valeur pour toutes les valeurs possibles de leurs variables (même table de vérité)." },
    ],
    commentedAlgorithms: [
      annotated(
        "Admission d'un étudiant",
        [
          ["ALGORITHME Admission", "Problème : décider de l'admission à partir de la moyenne et d'une note éliminatoire."],
          ["VARIABLES"],
          ["  moyenne : REEL", "Moyenne générale sur 20."],
          ["  eliminatoire, admis : BOOLEEN", "eliminatoire : VRAI si l'étudiant a une note éliminatoire."],
          ["DEBUT"],
          ["  LIRE(moyenne)", "Première entrée : la moyenne."],
          ["  LIRE(eliminatoire)", "Deuxième entrée : VRAI ou FAUX."],
          ["  admis ← (moyenne >= 10) ET (NON eliminatoire)", "La condition traduit la règle : les deux exigences doivent être vraies."],
          ["  ECRIRE(\"Admis : \", admis)", "Un booléen s'affiche VRAI ou FAUX."],
          ["FIN"],
        ],
        { stdin: "13.5\nFAUX", showTrace: true },
      ),
    ],
    commonErrors: [
      commonError(
        "Enchaîner deux comparaisons",
        `
        DEBUT
          ECRIRE(0 <= 15 <= 20)
        FIN
        `,
        `
        DEBUT
          ECRIRE((15 >= 0) ET (15 <= 20))
        FIN
        `,
        "En mathématiques, 0 ≤ x ≤ 20 est une abréviation. En algorithmique, chaque comparaison produit un booléen : il faut deux comparaisons reliées par **ET**.",
        true,
      ),
      commonError(
        "Mal nier une condition",
        `
        // « la note n'est pas valide »
        invalide ← (note < 0) ET (note > 20)
        `,
        `
        // « la note n'est pas valide »
        invalide ← (note < 0) OU (note > 20)
        `,
        "D'après De Morgan, NON (a ET b) devient (NON a) **OU** (NON b). Une note ne peut pas être à la fois négative et supérieure à 20 : la version fautive vaut toujours FAUX.",
      ),
    ],
    solvedExercises: [
      solved(
        "Table de vérité à trois variables",
        "Construisez la table de vérité de (p OU q) ET NON r. Combien de lignes contient-elle ? Pour quelles valeurs est-elle vraie ?",
        "| p | q | r | p OU q | NON r | résultat |\n|---|---|---|---|---|---|\n| V | V | V | V | F | F |\n| V | V | F | V | V | **V** |\n| V | F | V | V | F | F |\n| V | F | F | V | V | **V** |\n| F | V | V | V | F | F |\n| F | V | F | V | V | **V** |\n| F | F | V | F | F | F |\n| F | F | F | F | V | F |",
        "Avec 3 variables : 2³ = 8 lignes. Le résultat est vrai lorsque r est faux **et** qu'au moins une de p, q est vraie : 3 lignes sur 8.",
      ),
      solved(
        "Simplifier avec De Morgan",
        "Simplifiez la condition NON ((age < 18) OU (age > 25)) et traduisez-la en français.",
        "NON ((age < 18) OU (age > 25))\n= (NON (age < 18)) ET (NON (age > 25))\n= (age >= 18) ET (age <= 25)",
        "La négation d'un OU devient un ET des négations ; la négation de « < » est « ≥ ». La condition signifie : « l'âge est compris entre 18 et 25 ans inclus ».",
      ),
    ],
    td: {
      title: "TD 2 — Conditions et tables de vérité",
      instructions: "Chaque programme doit afficher exactement les valeurs demandées (VRAI ou FAUX). Testez plusieurs combinaisons d'entrées avant de soumettre.",
      exerciseSlugs: ["algo-table-verite", "algo-de-morgan"],
    },
    interrogation: interrogation("logique-interrogation", "Interrogation — Logique", [
      qcm("Que vaut VRAI ET FAUX ?", ["VRAI", "FAUX"], 1),
      qcm("Que vaut FAUX OU VRAI ?", ["VRAI", "FAUX"], 0),
      qcm("NON (a OU b) est équivalent à…", ["NON a OU NON b", "NON a ET NON b", "a ET b", "a OU NON b"], 1),
      qcm("Combien de lignes compte la table de vérité d'une expression à 3 variables ?", ["3", "6", "8", "9"], 2),
      qcm("Quelle condition traduit « x n'est pas compris entre 1 et 9 (inclus) » ?", ["(x < 1) ET (x > 9)", "(x < 1) OU (x > 9)", "(x <= 1) OU (x >= 9)", "NON x"], 1),
    ]),
    evaluation: chapterEvaluation("logique-evaluation", "Évaluation du chapitre 2", [
      vraiFaux("« x + 2 » est une proposition.", false, "Ce n'est ni vrai ni faux : c'est une expression numérique."),
      qcm("Avec a = VRAI et b = FAUX, que vaut NON a OU b ?", ["VRAI", "FAUX"], 1, "NON a = FAUX, puis FAUX OU FAUX = FAUX."),
      qcm("Comment se lit NON a ET b OU c ?", ["NON (a ET (b OU c))", "((NON a) ET b) OU c", "NON ((a ET b) OU c)", "(NON a) ET (b OU c)"], 1),
      qcm("Quelle est la négation de (n MOD 2 = 0) ET (n > 0) ?", ["(n MOD 2 <> 0) ET (n <= 0)", "(n MOD 2 <> 0) OU (n <= 0)", "(n MOD 2 = 0) OU (n > 0)", "n MOD 2 <> 0"], 1),
      vraiFaux("« p OU q » est faux lorsque p et q sont vrais tous les deux.", false, "Le OU logique est inclusif."),
      qcm("Quel contre-exemple réfute « tout multiple de 3 est impair » ?", ["9", "15", "6", "21"], 2),
      qcm("Quelle condition est toujours fausse, quelle que soit la valeur de x ?", ["(x > 5) OU (x <= 5)", "(x > 5) ET (x < 3)", "NON (x = x + 1)", "(x >= 0) OU (x < 0)"], 1),
      qcm("« Si p alors q » est faux uniquement quand…", ["p est faux", "q est vrai", "p est vrai et q est faux", "p et q sont faux"], 2),
    ]),
  },
});

// =====================================================================
// Chapitre 3 — Analyse et résolution des problèmes
// =====================================================================
export const analyse: Lesson = lesson({
  slug: "analyse-problemes",
  title: "Analyse et résolution des problèmes",
  durationMinutes: 120,
  objectives: [
    "Appliquer une méthode d'analyse : données, résultats, contraintes.",
    "Rédiger une spécification avec préconditions et postconditions.",
    "Décomposer un problème en étapes simples.",
    "Construire un jeu d'essai, y compris des cas limites, avant de programmer.",
  ],
  prerequisites: ["Chapitre 1 — Introduction à l'algorithmique.", "Chapitre 2 — Logique et raisonnement."],
  content: `
    ## 1. Pourquoi analyser avant d'écrire ?

    Face à un exercice, la tentation est d'écrire immédiatement des instructions. C'est la principale cause d'algorithmes faux : on résout un autre problème que celui posé, on oublie un cas, on se perd. Un informaticien passe souvent **plus de temps à comprendre** qu'à écrire. Ce chapitre donne une méthode que nous appliquerons dans toute la formation.

    ## 2. Étape 1 — Comprendre l'énoncé

    Lisez l'énoncé au moins deux fois, puis répondez par écrit à trois questions :

    1. **Quelles sont les données ?** (ce que l'on connaît ou ce qui sera lu) — avec leur nature : entier, réel, texte.
    2. **Quels sont les résultats ?** (ce que l'on doit produire et sous quelle forme).
    3. **Quelles sont les contraintes ?** (valeurs autorisées, format d'affichage, règles de calcul).

    Puis **traitez un exemple à la main**. Si vous n'êtes pas capable de résoudre le problème avec un crayon pour un cas précis, vous ne pourrez pas l'expliquer à une machine.

    ## 3. Étape 2 — Spécifier

    La **spécification** décrit ce que fait l'algorithme, sans dire comment :

    - **Précondition** : ce qui doit être vrai sur les entrées pour que l'algorithme fonctionne (« n ≥ 0 », « le prix est positif »).
    - **Postcondition** : ce qui est vrai à la fin (« total = n × prix »).

    Exemple — rendu de monnaie :
    *Entrée* : un montant m (entier, m ≥ 0, multiple de 100). *Sortie* : le nombre de billets de 5 000, 1 000 et 500 FC et de pièces de 100 FC, en utilisant le moins de billets possible. *Postcondition* : 5000 × b5000 + 1000 × b1000 + 500 × b500 + 100 × p100 = m.

    ## 4. Étape 3 — Décomposer

    On découpe le problème en **sous-problèmes** assez simples pour être résolus directement. Pour le rendu de monnaie :

    1. Calculer le nombre de billets de 5 000 : quotient de m par 5 000 ; il reste le reste.
    2. Recommencer avec 1 000 sur ce reste, puis avec 500, puis avec 100.

    Chaque étape utilise le **quotient** (DIV) et le **reste** (MOD), que nous étudierons en détail au chapitre 6. On choisit ensuite les **variables** : une par donnée, une par résultat, et des variables intermédiaires (ici, le reste à rendre).

    ## 5. Étape 4 — Construire un jeu d'essai

    Avant même d'écrire l'algorithme, on prépare des **tests** : des entrées et les sorties attendues, calculées à la main.

    | Entrée m | 5000 | 1000 | 500 | 100 | Pourquoi ce test ? |
    |---|---|---|---|---|---|
    | 7 600 | 1 | 2 | 1 | 1 | cas normal |
    | 0 | 0 | 0 | 0 | 0 | cas limite : rien à rendre |
    | 5 000 | 1 | 0 | 0 | 0 | valeur exacte d'un billet |
    | 400 | 0 | 0 | 0 | 4 | uniquement des pièces |

    Les **cas limites** (zéro, valeur minimale ou maximale, égalités) sont ceux où se cachent la plupart des erreurs. C'est aussi ce que font les tests automatiques de la plateforme, dont certains sont cachés.

    ## 6. Étape 5 — Écrire, exécuter, vérifier

    On écrit l'algorithme étape par étape, en respectant la décomposition, puis on l'exécute sur **chaque** ligne du jeu d'essai. Si un résultat diffère, on fait une **trace** (tableau de suivi des variables) pour trouver la première instruction fautive. Enfin, on se relit : noms de variables parlants, commentaires utiles, affichage conforme à l'énoncé.

    > Résumé de la méthode : **Comprendre → Spécifier → Décomposer → Tester (jeu d'essai) → Écrire → Vérifier.**
  `,
  examples: [
    example(P, "Rendu de monnaie", `
      ALGORITHME RenduMonnaie
      VARIABLES
        m, reste, b5000, b1000, b500, p100 : ENTIER
      DEBUT
        LIRE(m)
        b5000 ← m DIV 5000
        reste ← m MOD 5000
        b1000 ← reste DIV 1000
        reste ← reste MOD 1000
        b500 ← reste DIV 500
        reste ← reste MOD 500
        p100 ← reste DIV 100
        ECRIRE("5000 FC : ", b5000)
        ECRIRE("1000 FC : ", b1000)
        ECRIRE("500 FC : ", b500)
        ECRIRE("100 FC : ", p100)
      FIN
    `, { stdin: "7600" }),
  ],
  summary: [
    "Analyser avant d'écrire : données, résultats, contraintes, exemple traité à la main.",
    "La spécification fixe les préconditions (entrées valides) et les postconditions (résultat garanti).",
    "Décomposer en sous-problèmes simples, puis choisir les variables.",
    "Préparer un jeu d'essai avec des cas normaux et des cas limites avant de programmer.",
    "Vérifier sur chaque test ; en cas d'écart, faire une trace des variables.",
  ],
  exerciseSlugs: ["algo-prix-ttc"],
  pedagogy: {
    competences: [
      "Identifier données, résultats et contraintes",
      "Rédiger préconditions et postconditions",
      "Décomposer un problème en étapes",
      "Construire un jeu d'essai avec des cas limites",
    ],
    definitions: [
      { term: "Spécification", definition: "Description précise de ce que doit faire un algorithme (entrées, sorties, conditions), sans dire comment." },
      { term: "Précondition", definition: "Propriété que les entrées doivent vérifier pour que l'algorithme donne un résultat correct." },
      { term: "Postcondition", definition: "Propriété vérifiée par les résultats à la fin de l'exécution." },
      { term: "Jeu d'essai", definition: "Ensemble d'entrées accompagnées des sorties attendues, calculées à l'avance, qui sert à tester un algorithme." },
      { term: "Cas limite", definition: "Entrée située à la frontière du domaine (zéro, minimum, maximum, égalité) où les erreurs sont fréquentes." },
    ],
    commentedAlgorithms: [
      annotated(
        "Convertir une durée en semaines et jours",
        [
          ["ALGORITHME SemainesJours", "Données : un nombre de jours (entier ≥ 0). Résultats : semaines et jours restants."],
          ["CONSTANTES"],
          ["  JOURS_PAR_SEMAINE = 7", "Une constante nommée rend la règle lisible."],
          ["VARIABLES"],
          ["  total, semaines, jours : ENTIER", "Une variable pour la donnée, une par résultat."],
          ["DEBUT"],
          ["  LIRE(total)", "Précondition supposée : total ≥ 0."],
          ["  semaines ← total DIV JOURS_PAR_SEMAINE", "Quotient entier : nombre de semaines complètes."],
          ["  jours ← total MOD JOURS_PAR_SEMAINE", "Reste : jours qui ne forment pas une semaine."],
          ["  ECRIRE(semaines, \" semaine(s) et \", jours, \" jour(s)\")", "Postcondition : 7 × semaines + jours = total."],
          ["FIN"],
        ],
        { stdin: "45", showTrace: true, showFlowchart: true },
      ),
    ],
    commonErrors: [
      commonError(
        "Programmer avant de comprendre : ignorer les cas limites",
        `
        // Moyenne d'une liste de n notes
        moyenne ← somme / n
        `,
        `
        SI n > 0 ALORS
          moyenne ← somme / n
        SINON
          ECRIRE("Aucune note")
        FINSI
        `,
        "Le jeu d'essai aurait révélé le cas **n = 0** : une division par zéro. Précisez la précondition (n > 0) ou traitez le cas explicitement.",
      ),
      commonError(
        "Confondre l'exemple et le problème",
        `
        // Énoncé : afficher le double du nombre lu.
        // Exemple de l'énoncé : entrée 4, sortie 8.
        ECRIRE(8)
        `,
        `
        LIRE(n)
        ECRIRE(n * 2)
        `,
        "L'exemple sert à comprendre ; l'algorithme doit fonctionner pour **toutes** les entrées valides. Les tests cachés de la plateforme utilisent d'autres valeurs.",
      ),
    ],
    solvedExercises: [
      solved(
        "Analyser un problème de facturation",
        "Une connexion internet coûte 2 000 FC de frais fixes plus 150 FC par heure. Écrivez la spécification puis l'algorithme qui lit le nombre d'heures et affiche le montant. Proposez un jeu d'essai.",
        `
        ALGORITHME FactureInternet
        CONSTANTES
          FRAIS_FIXES = 2000
          PRIX_HEURE = 150
        VARIABLES
          heures, montant : ENTIER
        DEBUT
          LIRE(heures)
          montant ← FRAIS_FIXES + heures * PRIX_HEURE
          ECRIRE("Montant : ", montant, " FC")
        FIN
        `,
        "- **Précondition** : heures ≥ 0, entier.\n- **Postcondition** : montant = 2000 + 150 × heures.\n- **Jeu d'essai** : 0 h → 2 000 FC (cas limite) ; 10 h → 3 500 FC ; 1 h → 2 150 FC.",
      ),
      solved(
        "Décomposer un problème",
        "On veut afficher l'âge exact (en années) d'une personne à partir de son année de naissance et de l'année en cours, puis indiquer combien d'années il lui reste avant 60 ans. Décomposez le problème.",
        `
        ALGORITHME AgeEtRetraite
        VARIABLES
          naissance, annee, age, reste : ENTIER
        DEBUT
          LIRE(naissance)
          LIRE(annee)
          age ← annee - naissance
          reste ← 60 - age
          ECRIRE("Age : ", age)
          ECRIRE("Années avant 60 ans : ", reste)
        FIN
        `,
        "Sous-problèmes : (1) lire les deux années, (2) calculer l'âge, (3) calculer l'écart avec 60, (4) afficher. Cas limite à discuter : une personne de plus de 60 ans obtient un nombre négatif — il faudra une condition (chapitre 8) pour l'afficher proprement.",
      ),
    ],
    td: {
      title: "TD 3 — Analyser, spécifier, tester",
      instructions: "Avant d'écrire chaque algorithme, notez ses données, ses résultats et un jeu d'essai d'au moins trois cas (dont un cas limite).",
      exerciseSlugs: ["algo-rendu-monnaie", "algo-semaines-jours"],
    },
    interrogation: interrogation("analyse-interrogation", "Interrogation — Analyse des problèmes", [
      qcm("Que décrit une précondition ?", ["Le résultat final", "Les conditions que doivent vérifier les entrées", "La liste des variables", "Le nom de l'algorithme"], 1),
      qcm("Pour « afficher la moyenne de n notes », quel est le cas limite le plus important ?", ["n = 5", "n = 0", "une note de 15", "n = 20"], 1),
      vraiFaux("Un jeu d'essai se prépare après avoir écrit le programme seulement.", false),
      qcm("Quelle est la bonne suite d'étapes ?", ["Écrire, tester, comprendre", "Comprendre, spécifier, décomposer, tester, écrire, vérifier", "Décomposer, écrire, comprendre", "Tester, écrire"], 1),
      qcm("Pour 45 jours, combien de semaines complètes ?", ["5", "6", "7", "3"], 1),
    ]),
    evaluation: chapterEvaluation("analyse-evaluation", "Évaluation du chapitre 3", [
      qcm("Dans « calculer le prix TTC à partir du prix HT et du taux de TVA », quelles sont les données ?", ["Le prix TTC", "Le prix HT et le taux de TVA", "Seulement le taux", "Aucune"], 1),
      qcm("Quelle postcondition convient à un algorithme d'échange de deux variables a et b ?", ["a = b", "La nouvelle valeur de a est l'ancienne de b, et inversement", "a > b", "a et b valent 0"], 1),
      qcm("Pour rendre 7 600 FC, combien de billets de 1 000 FC (méthode du chapitre) ?", ["7", "2", "1", "0"], 1),
      vraiFaux("Un algorithme qui affiche directement la sortie de l'exemple de l'énoncé est correct.", false),
      qcm("Pourquoi les tests cachés existent-ils sur la plateforme ?", ["Pour piéger l'étudiant", "Pour vérifier que l'algorithme marche pour d'autres entrées que l'exemple", "Pour accélérer l'exécution", "Ils n'ont pas d'utilité"], 1),
      qcm("Quelle entrée est un cas limite pour « nombre de jours → semaines et jours » ?", ["45", "100", "0", "13"], 2),
      qcm("Si un résultat de test est faux, quelle est la démarche la plus efficace ?", ["Réécrire tout l'algorithme", "Faire une trace des variables pour trouver la première instruction fautive", "Changer les tests", "Ajouter des variables au hasard"], 1),
      qcm("Que vaut 5000 × b5000 + 1000 × b1000 + 500 × b500 + 100 × p100 à la fin du rendu de monnaie ?", ["Toujours 0", "Le montant m", "5000", "Cela dépend"], 1),
    ]),
  },
});
