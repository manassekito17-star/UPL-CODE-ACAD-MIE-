import { makeExercise, type ExInput } from "../helpers";
import type { Exercise } from "../types";

const ex = (input: ExInput) => makeExercise({ language: "pseudocode", courseSlug: "algorithmique" }, input);

export const algorithmiqueExercises: Exercise[] = [
  ex({
    slug: "algo-bonjour",
    lessonSlug: "introduction-algorithmique",
    title: "Bonjour UPL",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Écrivez un algorithme qui affiche exactement la ligne suivante :

      ~~~text
      Bonjour UPL
      ~~~
    `,
    objectives: ["Écrire la structure d'un algorithme.", "Utiliser ECRIRE."],
    examples: [{ input: "", output: "Bonjour UPL" }],
    starterCode: `
      ALGORITHME Bonjour
      DEBUT
        // Votre code ici
      FIN
    `,
    hints: [
      "L'instruction qui affiche du texte s'appelle ECRIRE.",
      "Le texte doit être placé entre guillemets : ECRIRE(\"…\").",
    ],
    tests: [{ input: "", expected: "Bonjour UPL" }],
    solution: `
      ALGORITHME Bonjour
      DEBUT
        ECRIRE("Bonjour UPL")
      FIN
    `,
    correction: `
      Il suffit d'une seule instruction **ECRIRE** placée entre DEBUT et FIN. Le texte est écrit entre guillemets et doit être identique au caractère près (majuscules comprises).
    `,
    points: 5,
  }),
  ex({
    slug: "algo-echange",
    lessonSlug: "variables-constantes",
    title: "Échanger deux valeurs",
    difficulty: "debutant",
    type: "completer",
    statement: `
      Complétez l'algorithme pour **échanger** les valeurs de a et b, lues au clavier, puis afficher :

      ~~~text
      a = <nouvelle valeur de a>
      b = <nouvelle valeur de b>
      ~~~
    `,
    examples: [{ input: "3\n8", output: "a = 8\nb = 3" }],
    constraints: ["Utiliser une variable intermédiaire.", "Ne pas réécrire les valeurs à la main."],
    starterCode: `
      ALGORITHME Echange
      VARIABLES
        a, b, temp : ENTIER
      DEBUT
        LIRE(a)
        LIRE(b)
        // Échangez a et b ici

        ECRIRE("a = ", a)
        ECRIRE("b = ", b)
      FIN
    `,
    hints: [
      "Si vous écrivez directement a ← b, l'ancienne valeur de a est perdue.",
      "Sauvegardez d'abord a dans temp.",
      "L'ordre est : temp ← a, puis a ← b, puis b ← temp.",
    ],
    tests: [
      { input: "3\n8", expected: "a = 8\nb = 3" },
      { input: "-1\n0", expected: "a = 0\nb = -1" },
      { input: "5\n5", expected: "a = 5\nb = 5", hidden: true },
    ],
    solution: `
      ALGORITHME Echange
      VARIABLES
        a, b, temp : ENTIER
      DEBUT
        LIRE(a)
        LIRE(b)
        temp ← a
        a ← b
        b ← temp
        ECRIRE("a = ", a)
        ECRIRE("b = ", b)
      FIN
    `,
    correction: `
      L'affectation **écrase** l'ancienne valeur. On sauvegarde donc a dans temp avant de le remplacer :

      1. temp ← a (temp garde l'ancienne valeur de a)
      2. a ← b
      3. b ← temp
    `,
  }),
  ex({
    slug: "algo-somme-deux-nombres",
    lessonSlug: "entrees-sorties",
    title: "Somme de deux nombres",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez deux entiers puis affichez leur somme sous la forme :

      ~~~text
      Somme : <résultat>
      ~~~
    `,
    examples: [{ input: "4\n9", output: "Somme : 13" }],
    starterCode: `
      ALGORITHME Somme
      VARIABLES
        a, b : ENTIER
      DEBUT

      FIN
    `,
    hints: ["Utilisez LIRE deux fois.", "ECRIRE(\"Somme : \", a + b) affiche le texte suivi du résultat."],
    tests: [
      { input: "4\n9", expected: "Somme : 13" },
      { input: "-5\n5", expected: "Somme : 0" },
      { input: "1000\n2345", expected: "Somme : 3345", hidden: true },
    ],
    solution: `
      ALGORITHME Somme
      VARIABLES
        a, b : ENTIER
      DEBUT
        LIRE(a)
        LIRE(b)
        ECRIRE("Somme : ", a + b)
      FIN
    `,
    correction: `
      On lit les deux valeurs, puis on affiche l'expression a + b directement dans ECRIRE. Attention à l'espace après les deux-points dans « Somme : ».
    `,
    points: 5,
  }),
  ex({
    slug: "algo-moyenne-trois-notes",
    lessonSlug: "entrees-sorties",
    title: "Moyenne de trois notes",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez trois notes (réels) et affichez leur moyenne :

      ~~~text
      Moyenne : <valeur>
      ~~~
    `,
    examples: [{ input: "12\n15\n9", output: "Moyenne : 12" }],
    hints: [
      "Les notes peuvent être décimales : quel type choisir ?",
      "Attention aux priorités : a + b + c / 3 ne divise que c !",
    ],
    tests: [
      { input: "12\n15\n9", expected: "Moyenne : 12" },
      { input: "10\n11\n12.5", expected: "Moyenne : 11.1666666667" },
      { input: "0\n0\n20", expected: "Moyenne : 6.66666666667", hidden: true },
    ],
    solution: `
      ALGORITHME Moyenne
      VARIABLES
        a, b, c, moy : REEL
      DEBUT
        LIRE(a)
        LIRE(b)
        LIRE(c)
        moy ← (a + b + c) / 3
        ECRIRE("Moyenne : ", moy)
      FIN
    `,
    correction: `
      Les parenthèses sont indispensables : **(a + b + c) / 3**. Sans elles, seule c serait divisée par 3. Les variables sont de type REEL car une moyenne peut être décimale.
    `,
  }),
  ex({
    slug: "algo-conversion-temps",
    lessonSlug: "operateurs",
    title: "Conversion de secondes",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez une durée en secondes (entier positif) et affichez-la en heures, minutes et secondes :

      ~~~text
      <h> h <m> min <s> s
      ~~~
    `,
    examples: [{ input: "3725", output: "1 h 2 min 5 s" }],
    hints: [
      "Une heure vaut 3600 secondes.",
      "DIV donne le quotient, MOD le reste.",
      "h ← total DIV 3600, puis travaillez sur le reste total MOD 3600.",
    ],
    tests: [
      { input: "3725", expected: "1 h 2 min 5 s" },
      { input: "59", expected: "0 h 0 min 59 s" },
      { input: "86399", expected: "23 h 59 min 59 s", hidden: true },
    ],
    solution: `
      ALGORITHME ConversionTemps
      VARIABLES
        total, h, m, s : ENTIER
      DEBUT
        LIRE(total)
        h ← total DIV 3600
        m ← (total MOD 3600) DIV 60
        s ← total MOD 60
        ECRIRE(h, " h ", m, " min ", s, " s")
      FIN
    `,
    correction: `
      - **h** : nombre d'heures complètes = total DIV 3600.
      - **m** : dans le reste (total MOD 3600), nombre de minutes complètes = DIV 60.
      - **s** : secondes restantes = total MOD 60.
    `,
  }),
  ex({
    slug: "algo-pair-impair",
    lessonSlug: "structures-conditionnelles",
    title: "Pair ou impair",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez un entier et affichez **pair** ou **impair**.
    `,
    examples: [
      { input: "4", output: "pair" },
      { input: "7", output: "impair" },
    ],
    hints: ["Un nombre est pair si le reste de sa division par 2 vaut 0.", "Utilisez MOD dans la condition d'un SI."],
    tests: [
      { input: "4", expected: "pair" },
      { input: "7", expected: "impair" },
      { input: "0", expected: "pair", hidden: true },
      { input: "-3", expected: "impair", hidden: true },
    ],
    solution: `
      ALGORITHME PairImpair
      VARIABLES
        n : ENTIER
      DEBUT
        LIRE(n)
        SI n MOD 2 = 0 ALORS
          ECRIRE("pair")
        SINON
          ECRIRE("impair")
        FINSI
      FIN
    `,
    correction: `
      On teste le reste de la division par 2. Remarque : pour un nombre négatif impair, n MOD 2 vaut -1, d'où l'intérêt de tester « = 0 » plutôt que « = 1 ».
    `,
    points: 5,
  }),
  ex({
    slug: "algo-mention",
    lessonSlug: "structures-conditionnelles",
    title: "Mention au diplôme",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez une note sur 20 et affichez :

      - **Note invalide** si la note n'est pas entre 0 et 20 ;
      - **Excellent** si note ≥ 18 ;
      - **Très bien** si note ≥ 16 ;
      - **Bien** si note ≥ 14 ;
      - **Assez bien** si note ≥ 12 ;
      - **Passable** si note ≥ 10 ;
      - **Ajourné** sinon.
    `,
    examples: [{ input: "15", output: "Bien" }],
    hints: [
      "Commencez par traiter le cas invalide.",
      "Testez les mentions de la plus haute à la plus basse avec SINON SI.",
    ],
    tests: [
      { input: "15", expected: "Bien" },
      { input: "9.5", expected: "Ajourné" },
      { input: "18", expected: "Excellent" },
      { input: "21", expected: "Note invalide", hidden: true },
      { input: "12", expected: "Assez bien", hidden: true },
      { input: "10", expected: "Passable", hidden: true },
    ],
    solution: `
      ALGORITHME Mention
      VARIABLES
        note : REEL
      DEBUT
        LIRE(note)
        SI note < 0 OU note > 20 ALORS
          ECRIRE("Note invalide")
        SINON SI note >= 18 ALORS
          ECRIRE("Excellent")
        SINON SI note >= 16 ALORS
          ECRIRE("Très bien")
        SINON SI note >= 14 ALORS
          ECRIRE("Bien")
        SINON SI note >= 12 ALORS
          ECRIRE("Assez bien")
        SINON SI note >= 10 ALORS
          ECRIRE("Passable")
        SINON
          ECRIRE("Ajourné")
        FINSI
      FIN
    `,
    correction: `
      Les tests sont effectués **dans l'ordre**. En partant de la mention la plus haute, chaque SINON SI n'a besoin que d'une seule comparaison : si l'on arrive à « note >= 14 », on sait déjà que note < 16.
    `,
  }),
  ex({
    slug: "algo-annee-bissextile",
    lessonSlug: "conditions-imbriquees",
    title: "Année bissextile",
    difficulty: "intermediaire",
    type: "probleme",
    statement: `
      Une année est **bissextile** si elle est divisible par 4 mais pas par 100, **ou** si elle est divisible par 400.

      Lisez une année et affichez **bissextile** ou **non bissextile**.
    `,
    examples: [
      { input: "2024", output: "bissextile" },
      { input: "1900", output: "non bissextile" },
    ],
    hints: [
      "« divisible par 4 » se teste avec annee MOD 4 = 0.",
      "La condition complète combine ET, OU et NON… ou des SI imbriqués.",
      "(annee MOD 4 = 0 ET annee MOD 100 <> 0) OU annee MOD 400 = 0",
    ],
    tests: [
      { input: "2024", expected: "bissextile" },
      { input: "1900", expected: "non bissextile" },
      { input: "2000", expected: "bissextile" },
      { input: "2023", expected: "non bissextile", hidden: true },
      { input: "2400", expected: "bissextile", hidden: true },
    ],
    solution: `
      ALGORITHME Bissextile
      VARIABLES
        annee : ENTIER
      DEBUT
        LIRE(annee)
        SI (annee MOD 4 = 0 ET annee MOD 100 <> 0) OU annee MOD 400 = 0 ALORS
          ECRIRE("bissextile")
        SINON
          ECRIRE("non bissextile")
        FINSI
      FIN
    `,
    correction: `
      La règle se traduit directement en une condition combinée. Vérifiez les trois cas pièges : 2024 (divisible par 4), 1900 (divisible par 100 mais pas 400) et 2000 (divisible par 400).
    `,
  }),
  ex({
    slug: "algo-table-multiplication",
    lessonSlug: "boucles",
    title: "Table de multiplication",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez un entier n et affichez sa table de multiplication de 1 à 10, au format :

      ~~~text
      n x 1 = …
      …
      n x 10 = …
      ~~~
    `,
    examples: [{ input: "3", output: "3 x 1 = 3\n3 x 2 = 6\n…\n3 x 10 = 30" }],
    hints: ["Le nombre de lignes est connu : 10. Quelle boucle choisir ?", "ECRIRE(n, \" x \", i, \" = \", n * i)"],
    tests: [
      { input: "3", expected: Array.from({ length: 10 }, (_, k) => `3 x ${k + 1} = ${3 * (k + 1)}`).join("\n") },
      { input: "12", expected: Array.from({ length: 10 }, (_, k) => `12 x ${k + 1} = ${12 * (k + 1)}`).join("\n"), hidden: true },
    ],
    solution: `
      ALGORITHME Table
      VARIABLES
        n, i : ENTIER
      DEBUT
        LIRE(n)
        POUR i DE 1 A 10 FAIRE
          ECRIRE(n, " x ", i, " = ", n * i)
        FINPOUR
      FIN
    `,
    correction: `
      Le nombre de répétitions étant connu à l'avance, la boucle **POUR** est la plus adaptée. Le compteur i sert à la fois de multiplicateur et d'affichage.
    `,
  }),
  ex({
    slug: "algo-somme-n-premiers",
    lessonSlug: "boucles",
    title: "Somme des n premiers entiers",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez un entier n ≥ 0 et affichez la somme 1 + 2 + … + n (0 si n = 0).
    `,
    examples: [{ input: "10", output: "55" }],
    hints: ["Utilisez un accumulateur initialisé à 0.", "Une boucle POUR de 1 à n ajoute i à la somme."],
    tests: [
      { input: "10", expected: "55" },
      { input: "0", expected: "0" },
      { input: "100", expected: "5050", hidden: true },
    ],
    solution: `
      ALGORITHME SommeN
      VARIABLES
        n, i, s : ENTIER
      DEBUT
        LIRE(n)
        s ← 0
        POUR i DE 1 A n FAIRE
          s ← s + i
        FINPOUR
        ECRIRE(s)
      FIN
    `,
    correction: `
      L'accumulateur s est initialisé à 0 avant la boucle. Si n = 0, la boucle POUR de 1 à 0 ne s'exécute pas et s reste à 0. Pour aller plus loin : la formule n × (n + 1) / 2 donne le résultat sans boucle.
    `,
  }),
  ex({
    slug: "algo-compter-positifs",
    lessonSlug: "compteurs-accumulateurs",
    title: "Compter les nombres positifs",
    difficulty: "intermediaire",
    type: "ecrire_algorithme",
    statement: `
      Lisez des entiers jusqu'à la valeur sentinelle **0** (non comptée). Affichez :

      ~~~text
      Positifs : <nombre de valeurs strictement positives>
      Négatifs : <nombre de valeurs strictement négatives>
      ~~~
    `,
    examples: [{ input: "5\n-2\n8\n-1\n3\n0", output: "Positifs : 3\nNégatifs : 2" }],
    hints: [
      "Le nombre de valeurs n'est pas connu : utilisez TANT QUE.",
      "Lisez une première valeur avant la boucle, puis relisez à la fin du corps de boucle.",
    ],
    tests: [
      { input: "5\n-2\n8\n-1\n3\n0", expected: "Positifs : 3\nNégatifs : 2" },
      { input: "0", expected: "Positifs : 0\nNégatifs : 0" },
      { input: "-4\n-4\n-4\n0", expected: "Positifs : 0\nNégatifs : 3", hidden: true },
    ],
    solution: `
      ALGORITHME CompterSignes
      VARIABLES
        x, pos, neg : ENTIER
      DEBUT
        pos ← 0
        neg ← 0
        LIRE(x)
        TANT QUE x <> 0 FAIRE
          SI x > 0 ALORS
            pos ← pos + 1
          SINON
            neg ← neg + 1
          FINSI
          LIRE(x)
        FINTANTQUE
        ECRIRE("Positifs : ", pos)
        ECRIRE("Négatifs : ", neg)
      FIN
    `,
    correction: `
      C'est le schéma classique de la **valeur sentinelle** : une lecture avant la boucle, une lecture à la fin de chaque tour. Ainsi la valeur 0 n'est jamais comptée.
    `,
  }),
  ex({
    slug: "algo-factorielle",
    lessonSlug: "compteurs-accumulateurs",
    title: "Factorielle",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez un entier n (0 ≤ n ≤ 15) et affichez n! = 1 × 2 × … × n (avec 0! = 1).
    `,
    examples: [{ input: "5", output: "120" }],
    hints: ["C'est un accumulateur de produit : à quelle valeur l'initialiser ?", "Un produit s'initialise à 1, pas à 0."],
    tests: [
      { input: "5", expected: "120" },
      { input: "0", expected: "1" },
      { input: "10", expected: "3628800", hidden: true },
    ],
    solution: `
      ALGORITHME Factorielle
      VARIABLES
        n, i, f : ENTIER
      DEBUT
        LIRE(n)
        f ← 1
        POUR i DE 2 A n FAIRE
          f ← f * i
        FINPOUR
        ECRIRE(f)
      FIN
    `,
    correction: `
      L'accumulateur de produit est initialisé à **1** (élément neutre de la multiplication). Initialisé à 0, le résultat serait toujours 0.
    `,
  }),
  ex({
    slug: "algo-inverser-tableau",
    lessonSlug: "tableaux",
    title: "Afficher un tableau à l'envers",
    difficulty: "intermediaire",
    type: "ecrire_algorithme",
    statement: `
      Lisez un entier n (1 ≤ n ≤ 100), puis n entiers que vous rangez dans un tableau. Affichez-les dans l'ordre inverse, **un par ligne**.
    `,
    examples: [{ input: "3\n10\n20\n30", output: "30\n20\n10" }],
    hints: ["Déclarez un tableau de 100 cases.", "Une boucle POUR avec PAS -1 parcourt de n à 1."],
    tests: [
      { input: "3\n10\n20\n30", expected: "30\n20\n10" },
      { input: "1\n42", expected: "42" },
      { input: "5\n1\n2\n3\n4\n5", expected: "5\n4\n3\n2\n1", hidden: true },
    ],
    solution: `
      ALGORITHME Inverser
      VARIABLES
        T : TABLEAU[1..100] DE ENTIER
        n, i : ENTIER
      DEBUT
        LIRE(n)
        POUR i DE 1 A n FAIRE
          LIRE(T[i])
        FINPOUR
        POUR i DE n A 1 PAS -1 FAIRE
          ECRIRE(T[i])
        FINPOUR
      FIN
    `,
    correction: `
      Le tableau est déclaré avec la taille maximale (100) ; seules les n premières cases sont utilisées. La seconde boucle utilise un **pas négatif**.
    `,
  }),
  ex({
    slug: "algo-maximum-tableau",
    lessonSlug: "tableaux",
    title: "Maximum et sa position",
    difficulty: "intermediaire",
    type: "ecrire_algorithme",
    statement: `
      Lisez n (1 ≤ n ≤ 100) puis n entiers. Affichez la plus grande valeur et la position de sa **première** apparition :

      ~~~text
      Maximum : <valeur> en position <indice>
      ~~~
    `,
    examples: [{ input: "5\n4\n9\n2\n9\n1", output: "Maximum : 9 en position 2" }],
    hints: [
      "Initialisez le maximum avec la première case.",
      "Gardez aussi en mémoire l'indice du maximum.",
      "Comparez avec > (strictement) pour conserver la première position.",
    ],
    tests: [
      { input: "5\n4\n9\n2\n9\n1", expected: "Maximum : 9 en position 2" },
      { input: "1\n-7", expected: "Maximum : -7 en position 1" },
      { input: "4\n-5\n-2\n-9\n-2", expected: "Maximum : -2 en position 2", hidden: true },
    ],
    solution: `
      ALGORITHME MaxTableau
      VARIABLES
        T : TABLEAU[1..100] DE ENTIER
        n, i, iMax : ENTIER
      DEBUT
        LIRE(n)
        POUR i DE 1 A n FAIRE
          LIRE(T[i])
        FINPOUR
        iMax ← 1
        POUR i DE 2 A n FAIRE
          SI T[i] > T[iMax] ALORS
            iMax ← i
          FINSI
        FINPOUR
        ECRIRE("Maximum : ", T[iMax], " en position ", iMax)
      FIN
    `,
    correction: `
      Il suffit de mémoriser l'**indice** du maximum : la valeur s'obtient par T[iMax]. Initialiser le maximum à 0 serait une erreur si toutes les valeurs sont négatives.
    `,
  }),
  ex({
    slug: "algo-compter-voyelles",
    lessonSlug: "chaines-caracteres",
    title: "Compter les voyelles",
    difficulty: "intermediaire",
    type: "ecrire_algorithme",
    statement: `
      Lisez une phrase et affichez le nombre de voyelles qu'elle contient (a, e, i, o, u, y, en majuscules ou minuscules, sans accents).
    `,
    examples: [{ input: "Bonjour UPL", output: "4" }],
    hints: [
      "Parcourez la chaîne avec POUR i DE 1 A LONGUEUR(phrase).",
      "MINUSCULE(phrase) évite de tester les majuscules.",
      "Une condition avec plusieurs OU teste chaque voyelle.",
    ],
    tests: [
      { input: "Bonjour UPL", expected: "4" },
      { input: "rythme", expected: "2" },
      { input: "AEIOUY aeiouy", expected: "12", hidden: true },
      { input: "xyz", expected: "1", hidden: true },
    ],
    solution: `
      ALGORITHME Voyelles
      VARIABLES
        phrase : CHAINE
        c : CARACTERE
        i, nb : ENTIER
      DEBUT
        LIRE(phrase)
        phrase ← MINUSCULE(phrase)
        nb ← 0
        POUR i DE 1 A LONGUEUR(phrase) FAIRE
          c ← phrase[i]
          SI c = "a" OU c = "e" OU c = "i" OU c = "o" OU c = "u" OU c = "y" ALORS
            nb ← nb + 1
          FINSI
        FINPOUR
        ECRIRE(nb)
      FIN
    `,
    correction: `
      On convertit d'abord la phrase en minuscules pour n'avoir que six cas à tester. Le compteur nb est augmenté à chaque voyelle rencontrée.
    `,
  }),
  ex({
    slug: "algo-fonction-puissance",
    lessonSlug: "fonctions-procedures",
    title: "Fonction puissance",
    difficulty: "intermediaire",
    type: "ecrire_algorithme",
    statement: `
      Écrivez une **fonction** puissance(x : ENTIER, n : ENTIER) : ENTIER qui calcule x^n **avec une boucle** (sans utiliser ^). Le programme principal lit x puis n (n ≥ 0) et affiche le résultat.
    `,
    examples: [{ input: "2\n10", output: "1024" }],
    constraints: ["Ne pas utiliser l'opérateur ^ ni la fonction PUISSANCE."],
    starterCode: `
      ALGORITHME Puissance

      FONCTION puissance(x : ENTIER, n : ENTIER) : ENTIER
      VARIABLES
        i, r : ENTIER
      DEBUT
        // À compléter
      FIN

      VARIABLES
        a, b : ENTIER
      DEBUT
        LIRE(a)
        LIRE(b)
        ECRIRE(puissance(a, b))
      FIN
    `,
    hints: ["x^n = x × x × … × x (n fois).", "Initialisez r à 1, multipliez-le n fois par x, puis RETOURNER r."],
    tests: [
      { input: "2\n10", expected: "1024" },
      { input: "5\n0", expected: "1" },
      { input: "-3\n3", expected: "-27", hidden: true },
    ],
    solution: `
      ALGORITHME Puissance

      FONCTION puissance(x : ENTIER, n : ENTIER) : ENTIER
      VARIABLES
        i, r : ENTIER
      DEBUT
        r ← 1
        POUR i DE 1 A n FAIRE
          r ← r * x
        FINPOUR
        RETOURNER r
      FIN

      VARIABLES
        a, b : ENTIER
      DEBUT
        LIRE(a)
        LIRE(b)
        ECRIRE(puissance(a, b))
      FIN
    `,
    correction: `
      La fonction utilise un accumulateur de produit r initialisé à 1. Pour n = 0, la boucle ne s'exécute pas et la fonction retourne 1, ce qui est correct (x^0 = 1).
    `,
  }),
  ex({
    slug: "algo-somme-chiffres-recursive",
    lessonSlug: "recursivite",
    title: "Somme des chiffres (récursive)",
    difficulty: "avance",
    type: "ecrire_algorithme",
    statement: `
      Écrivez une fonction **récursive** sommeChiffres(n : ENTIER) : ENTIER qui retourne la somme des chiffres d'un entier n ≥ 0. Le programme lit n et affiche le résultat.
    `,
    examples: [{ input: "4096", output: "19" }],
    constraints: ["La fonction doit être récursive (pas de boucle)."],
    hints: [
      "Le dernier chiffre de n est n MOD 10 ; le reste du nombre est n DIV 10.",
      "Cas de base : si n < 10, la somme des chiffres est n lui-même.",
      "Cas récursif : (n MOD 10) + sommeChiffres(n DIV 10).",
    ],
    tests: [
      { input: "4096", expected: "19" },
      { input: "7", expected: "7" },
      { input: "0", expected: "0", hidden: true },
      { input: "999999", expected: "54", hidden: true },
    ],
    solution: `
      ALGORITHME SommeChiffres

      FONCTION sommeChiffres(n : ENTIER) : ENTIER
      DEBUT
        SI n < 10 ALORS
          RETOURNER n
        FINSI
        RETOURNER (n MOD 10) + sommeChiffres(n DIV 10)
      FIN

      VARIABLES
        n : ENTIER
      DEBUT
        LIRE(n)
        ECRIRE(sommeChiffres(n))
      FIN
    `,
    correction: `
      - **Cas de base** : un nombre à un seul chiffre.
      - **Cas récursif** : on isole le dernier chiffre (MOD 10) et on rappelle la fonction sur le nombre privé de ce chiffre (DIV 10), qui est plus petit : on se rapproche du cas de base.
    `,
    isEvaluated: true,
  }),
  ex({
    slug: "algo-recherche-sequentielle",
    lessonSlug: "recherche-tri",
    title: "Recherche séquentielle",
    difficulty: "intermediaire",
    type: "ecrire_algorithme",
    statement: `
      Lisez n (1 ≤ n ≤ 100), puis n entiers, puis une valeur x. Affichez la position de la **première** occurrence de x, ou **absent** si x n'est pas dans le tableau.
    `,
    examples: [{ input: "4\n7\n3\n9\n3\n3", output: "2" }],
    hints: [
      "Parcourez le tableau tant que vous n'avez pas trouvé et que vous n'êtes pas à la fin.",
      "Une boucle TANT QUE avec deux conditions combinées par ET convient bien.",
    ],
    tests: [
      { input: "4\n7\n3\n9\n3\n3", expected: "2" },
      { input: "3\n1\n2\n3\n5", expected: "absent" },
      { input: "1\n8\n8", expected: "1", hidden: true },
    ],
    solution: `
      ALGORITHME Recherche
      VARIABLES
        T : TABLEAU[1..100] DE ENTIER
        n, i, x : ENTIER
      DEBUT
        LIRE(n)
        POUR i DE 1 A n FAIRE
          LIRE(T[i])
        FINPOUR
        LIRE(x)
        i ← 1
        TANT QUE i <= n ET T[i] <> x FAIRE
          i ← i + 1
        FINTANTQUE
        SI i <= n ALORS
          ECRIRE(i)
        SINON
          ECRIRE("absent")
        FINSI
      FIN
    `,
    correction: `
      La condition **i <= n ET T[i] <> x** est évaluée de gauche à droite : si i dépasse n, la seconde partie n'est pas évaluée, ce qui évite un accès hors limites. À la sortie, i <= n signifie que x a été trouvé.
    `,
  }),
  ex({
    slug: "algo-tri-bulles",
    lessonSlug: "recherche-tri",
    title: "Tri à bulles",
    difficulty: "avance",
    type: "ecrire_algorithme",
    statement: `
      Lisez n (1 ≤ n ≤ 100) puis n entiers. Triez-les par ordre croissant avec le **tri à bulles** et affichez-les sur une seule ligne, séparés par un espace.
    `,
    examples: [{ input: "5\n5\n1\n4\n2\n8", output: "1 2 4 5 8" }],
    hints: [
      "Comparez chaque paire de voisins T[j] et T[j + 1] ; échangez-les s'ils sont mal ordonnés.",
      "Après le passage numéro i, les i plus grands éléments sont à leur place.",
      "Construisez la ligne de sortie avec une chaîne : ligne ← ligne + CHAINE(T[i]).",
    ],
    tests: [
      { input: "5\n5\n1\n4\n2\n8", expected: "1 2 4 5 8" },
      { input: "1\n3", expected: "3" },
      { input: "6\n3\n3\n-1\n0\n10\n-5", expected: "-5 -1 0 3 3 10", hidden: true },
    ],
    solution: `
      ALGORITHME TriBulles
      VARIABLES
        T : TABLEAU[1..100] DE ENTIER
        n, i, j, tmp : ENTIER
        ligne : CHAINE
      DEBUT
        LIRE(n)
        POUR i DE 1 A n FAIRE
          LIRE(T[i])
        FINPOUR
        POUR i DE 1 A n - 1 FAIRE
          POUR j DE 1 A n - i FAIRE
            SI T[j] > T[j + 1] ALORS
              tmp ← T[j]
              T[j] ← T[j + 1]
              T[j + 1] ← tmp
            FINSI
          FINPOUR
        FINPOUR
        ligne ← CHAINE(T[1])
        POUR i DE 2 A n FAIRE
          ligne ← ligne + " " + CHAINE(T[i])
        FINPOUR
        ECRIRE(ligne)
      FIN
    `,
    correction: `
      La boucle interne s'arrête à n - i car les i derniers éléments sont déjà triés. Pour l'affichage, on commence la ligne par le premier élément afin d'éviter un espace en trop.
    `,
    isEvaluated: true,
  }),
  ex({
    slug: "algo-nombres-premiers",
    lessonSlug: "resolution-problemes",
    title: "Nombres premiers",
    difficulty: "avance",
    type: "probleme",
    statement: `
      Lisez un entier n ≥ 2 et affichez tous les nombres premiers inférieurs ou égaux à n, séparés par un espace, sur une seule ligne.

      Un nombre est premier s'il a exactement deux diviseurs : 1 et lui-même.
    `,
    examples: [{ input: "20", output: "2 3 5 7 11 13 17 19" }],
    hints: [
      "Écrivez d'abord une fonction estPremier(k : ENTIER) : BOOLEEN.",
      "Il suffit de tester les diviseurs d de 2 tant que d * d <= k.",
      "Construisez la ligne de résultat avec une chaîne.",
    ],
    tests: [
      { input: "20", expected: "2 3 5 7 11 13 17 19" },
      { input: "2", expected: "2" },
      { input: "50", expected: "2 3 5 7 11 13 17 19 23 29 31 37 41 43 47", hidden: true },
    ],
    solution: `
      ALGORITHME Premiers

      FONCTION estPremier(k : ENTIER) : BOOLEEN
      VARIABLES
        d : ENTIER
      DEBUT
        SI k < 2 ALORS
          RETOURNER FAUX
        FINSI
        d ← 2
        TANT QUE d * d <= k FAIRE
          SI k MOD d = 0 ALORS
            RETOURNER FAUX
          FINSI
          d ← d + 1
        FINTANTQUE
        RETOURNER VRAI
      FIN

      VARIABLES
        n, k : ENTIER
        ligne : CHAINE
      DEBUT
        LIRE(n)
        ligne ← ""
        POUR k DE 2 A n FAIRE
          SI estPremier(k) ALORS
            SI ligne = "" ALORS
              ligne ← CHAINE(k)
            SINON
              ligne ← ligne + " " + CHAINE(k)
            FINSI
          FINSI
        FINPOUR
        ECRIRE(ligne)
      FIN
    `,
    correction: `
      La décomposition en une fonction **estPremier** rend le programme lisible. Tester les diviseurs jusqu'à la racine carrée (d × d <= k) suffit : si k = a × b avec a <= b, alors a <= √k.
    `,
  }),
  ex({
    slug: "algo-projet-caisse",
    lessonSlug: "resolution-problemes",
    title: "Mini-projet : caisse de la cafétéria",
    difficulty: "avance",
    type: "mini_projet",
    statement: `
      La cafétéria de l'université veut un programme de caisse.

      **Entrées** : une suite de lignes, chacune contenant un prix unitaire (réel) puis, sur la ligne suivante, une quantité (entier). La saisie se termine par un prix égal à **0**.

      **Sorties** :

      ~~~text
      Articles : <quantité totale>
      Total : <montant total>
      Remise : <montant de la remise>
      A payer : <montant final>
      ~~~

      Une remise de **10 %** est accordée si le total dépasse **strictement 50**.
    `,
    examples: [{ input: "2.5\n4\n30\n1\n0", output: "Articles : 5\nTotal : 40\nRemise : 0\nA payer : 40" }],
    hints: [
      "Utilisez une valeur sentinelle (prix = 0) avec TANT QUE.",
      "Deux accumulateurs : la quantité totale et le montant total.",
      "Calculez la remise après la boucle, avec un SI.",
    ],
    tests: [
      { input: "2.5\n4\n30\n1\n0", expected: "Articles : 5\nTotal : 40\nRemise : 0\nA payer : 40" },
      { input: "20\n3\n0", expected: "Articles : 3\nTotal : 60\nRemise : 6\nA payer : 54" },
      { input: "0", expected: "Articles : 0\nTotal : 0\nRemise : 0\nA payer : 0", hidden: true },
      { input: "50\n1\n0", expected: "Articles : 1\nTotal : 50\nRemise : 0\nA payer : 50", hidden: true },
    ],
    solution: `
      ALGORITHME Caisse
      VARIABLES
        prix, total, remise : REEL
        qte, articles : ENTIER
      DEBUT
        total ← 0
        articles ← 0
        LIRE(prix)
        TANT QUE prix <> 0 FAIRE
          LIRE(qte)
          total ← total + prix * qte
          articles ← articles + qte
          LIRE(prix)
        FINTANTQUE
        SI total > 50 ALORS
          remise ← total * 0.1
        SINON
          remise ← 0
        FINSI
        ECRIRE("Articles : ", articles)
        ECRIRE("Total : ", total)
        ECRIRE("Remise : ", remise)
        ECRIRE("A payer : ", total - remise)
      FIN
    `,
    correction: `
      Le programme combine une **boucle à sentinelle**, deux **accumulateurs** et une **condition** finale. Le cas limite « total = 50 » ne donne pas de remise car la condition est « strictement supérieur ».
    `,
    isEvaluated: true,
    points: 30,
  }),
];
