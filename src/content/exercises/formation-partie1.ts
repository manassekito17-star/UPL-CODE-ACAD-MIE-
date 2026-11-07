import { makeExercise, type ExInput } from "../helpers";
import type { Exercise } from "../types";

/** Exercices notés de la Partie 1 de la Formation (application et TD). */
const ex = (input: ExInput) => makeExercise({ language: "pseudocode", courseSlug: "algorithmique" }, input);

export const formationPartie1Exercises: Exercise[] = [
  // ---------- Chapitre 1 ----------
  ex({
    slug: "algo-trois-lignes",
    lessonSlug: "introduction-algorithmique",
    title: "Présentation en trois lignes",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez un prénom puis une filière et affichez exactement ces trois lignes :

      ~~~text
      Bienvenue <prénom> !
      Filière : <filière>
      Bon courage pour cette année.
      ~~~
    `,
    examples: [{ input: "Amani\nInformatique", output: "Bienvenue Amani !\nFilière : Informatique\nBon courage pour cette année." }],
    hints: ["Deux LIRE, puis trois ECRIRE, dans cet ordre.", "Attention à l'espace avant le point d'exclamation : ECRIRE(\"Bienvenue \", prenom, \" !\")."],
    tests: [
      { input: "Amani\nInformatique", expected: "Bienvenue Amani !\nFilière : Informatique\nBon courage pour cette année." },
      { input: "Grâce\nIntelligence Artificielle", expected: "Bienvenue Grâce !\nFilière : Intelligence Artificielle\nBon courage pour cette année.", hidden: true },
    ],
    solution: `
      ALGORITHME Presentation
      VARIABLES
        prenom, filiere : CHAINE
      DEBUT
        LIRE(prenom)
        LIRE(filiere)
        ECRIRE("Bienvenue ", prenom, " !")
        ECRIRE("Filière : ", filiere)
        ECRIRE("Bon courage pour cette année.")
      FIN
    `,
    correction: "Exécution séquentielle : les deux lectures d'abord, puis les trois affichages dans l'ordre demandé. Une filière peut contenir des espaces : une variable CHAINE reçoit toute la ligne.",
    points: 5,
  }),
  ex({
    slug: "algo-carre-perimetre",
    lessonSlug: "introduction-algorithmique",
    title: "Périmètre et aire d'un carré",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez la longueur du côté d'un carré (un réel) et affichez :

      ~~~text
      Périmètre : <4 × côté>
      Aire : <côté × côté>
      ~~~
    `,
    examples: [{ input: "3", output: "Périmètre : 12\nAire : 9" }],
    hints: ["Entrée : le côté. Sorties : le périmètre et l'aire.", "Le côté peut être décimal : choisissez le type REEL."],
    tests: [
      { input: "3", expected: "Périmètre : 12\nAire : 9" },
      { input: "2.5", expected: "Périmètre : 10\nAire : 6.25" },
      { input: "0", expected: "Périmètre : 0\nAire : 0", hidden: true },
    ],
    solution: `
      ALGORITHME Carre
      VARIABLES
        cote : REEL
      DEBUT
        LIRE(cote)
        ECRIRE("Périmètre : ", 4 * cote)
        ECRIRE("Aire : ", cote * cote)
      FIN
    `,
    correction: "Les expressions sont calculées directement dans ECRIRE. Le cas limite côté = 0 est valide et donne 0 pour les deux résultats.",
    points: 5,
  }),
  // ---------- Chapitre 2 ----------
  ex({
    slug: "algo-intervalle",
    lessonSlug: "logique-raisonnement",
    title: "Appartenance à un intervalle",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez un nombre x (réel). Affichez **VRAI** si x appartient à l'intervalle [10 ; 20] (bornes incluses), **FAUX** sinon. N'utilisez pas de structure SI : affichez directement la valeur d'une condition.
    `,
    examples: [{ input: "15", output: "VRAI" }],
    constraints: ["Ne pas utiliser SI."],
    hints: ["Une condition a une valeur VRAI ou FAUX : on peut l'afficher avec ECRIRE.", "Deux comparaisons reliées par ET : (x >= 10) ET (x <= 20)."],
    tests: [
      { input: "15", expected: "VRAI" },
      { input: "25", expected: "FAUX" },
      { input: "10", expected: "VRAI", hidden: true },
      { input: "20", expected: "VRAI", hidden: true },
      { input: "9.99", expected: "FAUX", hidden: true },
    ],
    solution: `
      ALGORITHME Intervalle
      VARIABLES
        x : REEL
      DEBUT
        LIRE(x)
        ECRIRE((x >= 10) ET (x <= 20))
      FIN
    `,
    correction: "Les bornes sont incluses : on utilise >= et <=. Les tests cachés vérifient précisément les cas limites 10 et 20.",
  }),
  ex({
    slug: "algo-table-verite",
    lessonSlug: "logique-raisonnement",
    title: "Calculateur de connecteurs logiques",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez deux booléens a et b (saisis VRAI ou FAUX) et affichez :

      ~~~text
      a ET b : <valeur>
      a OU b : <valeur>
      NON a : <valeur>
      ~~~
    `,
    examples: [{ input: "VRAI\nFAUX", output: "a ET b : FAUX\na OU b : VRAI\nNON a : FAUX" }],
    hints: ["Déclarez a et b de type BOOLEEN : LIRE convertit VRAI/FAUX.", "ECRIRE(\"a ET b : \", a ET b)"],
    tests: [
      { input: "VRAI\nFAUX", expected: "a ET b : FAUX\na OU b : VRAI\nNON a : FAUX" },
      { input: "VRAI\nVRAI", expected: "a ET b : VRAI\na OU b : VRAI\nNON a : FAUX" },
      { input: "FAUX\nFAUX", expected: "a ET b : FAUX\na OU b : FAUX\nNON a : VRAI", hidden: true },
      { input: "FAUX\nVRAI", expected: "a ET b : FAUX\na OU b : VRAI\nNON a : VRAI", hidden: true },
    ],
    solution: `
      ALGORITHME Connecteurs
      VARIABLES
        a, b : BOOLEEN
      DEBUT
        LIRE(a)
        LIRE(b)
        ECRIRE("a ET b : ", a ET b)
        ECRIRE("a OU b : ", a OU b)
        ECRIRE("NON a : ", NON a)
      FIN
    `,
    correction: "Les quatre tests correspondent aux quatre lignes de la table de vérité : c'est un jeu d'essai **exhaustif**.",
  }),
  ex({
    slug: "algo-de-morgan",
    lessonSlug: "logique-raisonnement",
    title: "Vérifier une loi de De Morgan",
    difficulty: "intermediaire",
    type: "ecrire_algorithme",
    statement: `
      Lisez deux booléens a et b. Affichez la valeur de NON (a ET b), puis celle de (NON a) OU (NON b), puis si les deux sont égales :

      ~~~text
      NON (a ET b) : <valeur>
      NON a OU NON b : <valeur>
      Égales : <valeur>
      ~~~
    `,
    examples: [{ input: "VRAI\nFAUX", output: "NON (a ET b) : VRAI\nNON a OU NON b : VRAI\nÉgales : VRAI" }],
    hints: ["Deux booléens se comparent avec =.", "Mettez des parenthèses : (NON (a ET b)) = ((NON a) OU (NON b))."],
    tests: [
      { input: "VRAI\nFAUX", expected: "NON (a ET b) : VRAI\nNON a OU NON b : VRAI\nÉgales : VRAI" },
      { input: "VRAI\nVRAI", expected: "NON (a ET b) : FAUX\nNON a OU NON b : FAUX\nÉgales : VRAI" },
      { input: "FAUX\nFAUX", expected: "NON (a ET b) : VRAI\nNON a OU NON b : VRAI\nÉgales : VRAI", hidden: true },
    ],
    solution: `
      ALGORITHME VerifDeMorgan
      VARIABLES
        a, b, g, d : BOOLEEN
      DEBUT
        LIRE(a)
        LIRE(b)
        g ← NON (a ET b)
        d ← (NON a) OU (NON b)
        ECRIRE("NON (a ET b) : ", g)
        ECRIRE("NON a OU NON b : ", d)
        ECRIRE("Égales : ", g = d)
      FIN
    `,
    correction: "Pour toutes les entrées, les deux expressions sont égales : c'est exactement ce qu'affirme la loi de De Morgan. Ranger chaque expression dans une variable rend l'algorithme plus lisible.",
  }),
  // ---------- Chapitre 3 ----------
  ex({
    slug: "algo-prix-ttc",
    lessonSlug: "analyse-problemes",
    title: "Prix toutes taxes comprises",
    difficulty: "debutant",
    type: "probleme",
    statement: `
      Un magasin applique une TVA de **16 %**. Lisez le prix unitaire hors taxes (réel) puis la quantité (entier) et affichez :

      ~~~text
      Total HT : <prix × quantité>
      TVA : <16 % du total HT>
      Total TTC : <total HT + TVA>
      ~~~
    `,
    examples: [{ input: "1000\n3", output: "Total HT : 3000\nTVA : 480\nTotal TTC : 3480" }],
    hints: ["Commencez par écrire les données, les résultats et un jeu d'essai.", "Déclarez TAUX_TVA = 0.16 dans la section CONSTANTES.", "Calculez d'abord le total HT, puis la TVA à partir de ce total."],
    tests: [
      { input: "1000\n3", expected: "Total HT : 3000\nTVA : 480\nTotal TTC : 3480" },
      { input: "2500\n0", expected: "Total HT : 0\nTVA : 0\nTotal TTC : 0" },
      { input: "125\n4", expected: "Total HT : 500\nTVA : 80\nTotal TTC : 580", hidden: true },
    ],
    solution: `
      ALGORITHME PrixTTC
      CONSTANTES
        TAUX_TVA = 0.16
      VARIABLES
        prix, totalHT, tva : REEL
        quantite : ENTIER
      DEBUT
        LIRE(prix)
        LIRE(quantite)
        totalHT ← prix * quantite
        tva ← totalHT * TAUX_TVA
        ECRIRE("Total HT : ", totalHT)
        ECRIRE("TVA : ", tva)
        ECRIRE("Total TTC : ", totalHT + tva)
      FIN
    `,
    correction: "Décomposition : total HT, puis TVA, puis total TTC. La constante TAUX_TVA permet de changer le taux en une seule ligne. Le cas quantité = 0 est un cas limite valide.",
  }),
  ex({
    slug: "algo-rendu-monnaie",
    lessonSlug: "analyse-problemes",
    title: "Rendu de monnaie",
    difficulty: "intermediaire",
    type: "probleme",
    statement: `
      Lisez un montant m en francs congolais (entier, multiple de 100). Décomposez-le avec le moins de coupures possible en billets de 5 000, 1 000 et 500 FC et en pièces de 100 FC. Affichez :

      ~~~text
      5000 FC : <nombre>
      1000 FC : <nombre>
      500 FC : <nombre>
      100 FC : <nombre>
      ~~~
    `,
    examples: [{ input: "7600", output: "5000 FC : 1\n1000 FC : 2\n500 FC : 1\n100 FC : 1" }],
    hints: [
      "Le nombre de billets de 5 000 est le quotient m DIV 5000.",
      "Il reste alors m MOD 5000 à rendre : recommencez avec 1 000.",
      "Utilisez une variable reste mise à jour après chaque coupure.",
    ],
    tests: [
      { input: "7600", expected: "5000 FC : 1\n1000 FC : 2\n500 FC : 1\n100 FC : 1" },
      { input: "0", expected: "5000 FC : 0\n1000 FC : 0\n500 FC : 0\n100 FC : 0" },
      { input: "5000", expected: "5000 FC : 1\n1000 FC : 0\n500 FC : 0\n100 FC : 0", hidden: true },
      { input: "400", expected: "5000 FC : 0\n1000 FC : 0\n500 FC : 0\n100 FC : 4", hidden: true },
      { input: "23900", expected: "5000 FC : 4\n1000 FC : 3\n500 FC : 1\n100 FC : 4", hidden: true },
    ],
    solution: `
      ALGORITHME Monnaie
      VARIABLES
        m, reste : ENTIER
      DEBUT
        LIRE(m)
        ECRIRE("5000 FC : ", m DIV 5000)
        reste ← m MOD 5000
        ECRIRE("1000 FC : ", reste DIV 1000)
        reste ← reste MOD 1000
        ECRIRE("500 FC : ", reste DIV 500)
        reste ← reste MOD 500
        ECRIRE("100 FC : ", reste DIV 100)
      FIN
    `,
    correction: "À chaque étape, le quotient donne le nombre de coupures et le reste ce qu'il reste à rendre. Le jeu d'essai du cours (0, 5 000, 400) couvre les cas limites.",
    isEvaluated: true,
  }),
  ex({
    slug: "algo-semaines-jours",
    lessonSlug: "analyse-problemes",
    title: "Semaines, jours et heures",
    difficulty: "intermediaire",
    type: "probleme",
    statement: `
      Lisez une durée en heures (entier ≥ 0) et affichez-la en semaines, jours et heures :

      ~~~text
      <s> semaine(s) <j> jour(s) <h> heure(s)
      ~~~
    `,
    examples: [{ input: "200", output: "1 semaine(s) 1 jour(s) 8 heure(s)" }],
    hints: ["Une semaine = 168 heures, un jour = 24 heures.", "Semaines : total DIV 168 ; il reste total MOD 168 heures."],
    tests: [
      { input: "200", expected: "1 semaine(s) 1 jour(s) 8 heure(s)" },
      { input: "23", expected: "0 semaine(s) 0 jour(s) 23 heure(s)" },
      { input: "168", expected: "1 semaine(s) 0 jour(s) 0 heure(s)", hidden: true },
      { input: "0", expected: "0 semaine(s) 0 jour(s) 0 heure(s)", hidden: true },
    ],
    solution: `
      ALGORITHME DureeHeures
      CONSTANTES
        H_SEMAINE = 168
        H_JOUR = 24
      VARIABLES
        total, s, j, h : ENTIER
      DEBUT
        LIRE(total)
        s ← total DIV H_SEMAINE
        j ← (total MOD H_SEMAINE) DIV H_JOUR
        h ← total MOD H_JOUR
        ECRIRE(s, " semaine(s) ", j, " jour(s) ", h, " heure(s)")
      FIN
    `,
    correction: "Les heures restantes se calculent directement par total MOD 24, car 168 est un multiple de 24.",
  }),
  // ---------- Chapitre 4 ----------
  ex({
    slug: "algo-permutation-circulaire",
    lessonSlug: "variables-constantes",
    title: "Permutation circulaire",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez trois entiers a, b et c. Faites tourner leurs valeurs : a reçoit l'ancienne valeur de b, b celle de c, c celle de a. Affichez ensuite a, b et c séparés par un espace.
    `,
    examples: [{ input: "1\n2\n3", output: "2 3 1" }],
    constraints: ["Utilisez exactement une variable auxiliaire.", "Les valeurs doivent réellement être échangées dans les variables (pas seulement affichées dans un autre ordre)."],
    hints: ["Sauvegardez d'abord la valeur qui va être écrasée en premier.", "temp ← a, puis a ← b, b ← c, c ← temp."],
    tests: [
      { input: "1\n2\n3", expected: "2 3 1" },
      { input: "7\n7\n0", expected: "7 0 7" },
      { input: "-5\n10\n20", expected: "10 20 -5", hidden: true },
    ],
    solution: `
      ALGORITHME Rotation
      VARIABLES
        a, b, c, temp : ENTIER
      DEBUT
        LIRE(a)
        LIRE(b)
        LIRE(c)
        temp ← a
        a ← b
        b ← c
        c ← temp
        ECRIRE(a, " ", b, " ", c)
      FIN
    `,
    correction: "Chaque affectation écrase une valeur : on sauvegarde **a** avant tout. Faites la trace : avec 1, 2, 3, temp = 1, puis a = 2, b = 3, c = 1.",
  }),
  ex({
    slug: "algo-solde-compte",
    lessonSlug: "variables-constantes",
    title: "Suivi d'un compte",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez le solde initial d'un compte, puis le montant d'un dépôt, puis le montant d'un retrait (des réels). Mettez à jour **une seule variable solde** après chaque opération et affichez :

      ~~~text
      Après dépôt : <solde>
      Après retrait : <solde>
      ~~~
    `,
    examples: [{ input: "10000\n2500\n4000", output: "Après dépôt : 12500\nAprès retrait : 8500" }],
    hints: ["solde ← solde + depot", "Affichez le solde juste après chaque mise à jour."],
    tests: [
      { input: "10000\n2500\n4000", expected: "Après dépôt : 12500\nAprès retrait : 8500" },
      { input: "0\n0\n0", expected: "Après dépôt : 0\nAprès retrait : 0" },
      { input: "150.5\n49.5\n200", expected: "Après dépôt : 200\nAprès retrait : 0", hidden: true },
    ],
    solution: `
      ALGORITHME Compte
      VARIABLES
        solde, depot, retrait : REEL
      DEBUT
        LIRE(solde)
        LIRE(depot)
        LIRE(retrait)
        solde ← solde + depot
        ECRIRE("Après dépôt : ", solde)
        solde ← solde - retrait
        ECRIRE("Après retrait : ", solde)
      FIN
    `,
    correction: "La même variable évolue : sa valeur dépend du moment où on l'affiche. C'est ce que montre un tableau de suivi.",
  }),
  // ---------- Chapitre 5 ----------
  ex({
    slug: "algo-celsius-fahrenheit",
    lessonSlug: "types-donnees",
    title: "Conversion Celsius → Fahrenheit",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez une température en degrés Celsius (réel) et affichez-la en degrés Fahrenheit, sachant que F = C × 9 / 5 + 32 :

      ~~~text
      <F> °F
      ~~~
    `,
    examples: [{ input: "100", output: "212 °F" }],
    hints: ["La division produit un réel : déclarez des variables REEL.", "ECRIRE(f, \" °F\")"],
    tests: [
      { input: "100", expected: "212 °F" },
      { input: "0", expected: "32 °F" },
      { input: "-40", expected: "-40 °F", hidden: true },
      { input: "36.6", expected: "97.88 °F", hidden: true },
    ],
    solution: `
      ALGORITHME Fahrenheit
      VARIABLES
        c, f : REEL
      DEBUT
        LIRE(c)
        f ← c * 9 / 5 + 32
        ECRIRE(f, " °F")
      FIN
    `,
    correction: "Avec des variables ENTIER, 36.6 ne pourrait pas être lu et c × 9 / 5 ne pourrait pas être rangé : le type REEL s'impose. −40 est la température où les deux échelles coïncident.",
  }),
  ex({
    slug: "algo-initiales",
    lessonSlug: "types-donnees",
    title: "Initiales",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez un prénom puis un nom et affichez les initiales en majuscules, chacune suivie d'un point (exemple : « Grâce » et « mutombo » → **G.M.**).
    `,
    examples: [{ input: "Grâce\nmutombo", output: "G.M." }],
    hints: ["Le premier caractère d'une chaîne s s'obtient par s[1].", "MAJUSCULE transforme un texte en majuscules ; + concatène des chaînes."],
    tests: [
      { input: "Grâce\nmutombo", expected: "G.M." },
      { input: "jean\nKabila", expected: "J.K." },
      { input: "élise\nngoy", expected: "É.N.", hidden: true },
    ],
    solution: `
      ALGORITHME Initiales
      VARIABLES
        prenom, nom : CHAINE
      DEBUT
        LIRE(prenom)
        LIRE(nom)
        ECRIRE(MAJUSCULE(prenom[1] + "." + nom[1] + "."))
      FIN
    `,
    correction: "prenom[1] est un caractère, que l'on concatène avec \".\" pour former une chaîne, puis MAJUSCULE s'applique à l'ensemble.",
  }),
  ex({
    slug: "algo-majeur",
    lessonSlug: "types-donnees",
    title: "Majeur ou mineur ?",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez l'année de naissance d'une personne. Calculez son âge en 2026 et rangez dans une variable **BOOLEEN** le fait qu'elle soit majeure (18 ans ou plus). Affichez :

      ~~~text
      Âge : <âge>
      Majeur : <VRAI ou FAUX>
      ~~~
    `,
    examples: [{ input: "2005", output: "Âge : 21\nMajeur : VRAI" }],
    hints: ["majeur ← age >= 18", "Pas besoin de SI : une comparaison produit déjà un booléen."],
    tests: [
      { input: "2005", expected: "Âge : 21\nMajeur : VRAI" },
      { input: "2010", expected: "Âge : 16\nMajeur : FAUX" },
      { input: "2008", expected: "Âge : 18\nMajeur : VRAI", hidden: true },
    ],
    solution: `
      ALGORITHME Majorite
      CONSTANTES
        ANNEE = 2026
      VARIABLES
        naissance, age : ENTIER
        majeur : BOOLEEN
      DEBUT
        LIRE(naissance)
        age ← ANNEE - naissance
        majeur ← age >= 18
        ECRIRE("Âge : ", age)
        ECRIRE("Majeur : ", majeur)
      FIN
    `,
    correction: "Le cas limite 18 ans doit donner VRAI : la comparaison est **>=**.",
  }),
  // ---------- Chapitre 6 ----------
  ex({
    slug: "algo-chiffres",
    lessonSlug: "operateurs",
    title: "Somme et inversion des chiffres",
    difficulty: "intermediaire",
    type: "ecrire_algorithme",
    statement: `
      Lisez un entier n compris entre 100 et 999. Affichez la somme de ses chiffres, puis le nombre obtenu en inversant ses chiffres :

      ~~~text
      Somme : <somme>
      Inversé : <nombre inversé>
      ~~~
    `,
    examples: [{ input: "375", output: "Somme : 15\nInversé : 573" }],
    hints: ["Unités : n MOD 10 ; dizaines : (n DIV 10) MOD 10 ; centaines : n DIV 100.", "Nombre inversé : u × 100 + d × 10 + c."],
    tests: [
      { input: "375", expected: "Somme : 15\nInversé : 573" },
      { input: "100", expected: "Somme : 1\nInversé : 1" },
      { input: "999", expected: "Somme : 27\nInversé : 999", hidden: true },
      { input: "120", expected: "Somme : 3\nInversé : 21", hidden: true },
    ],
    solution: `
      ALGORITHME Chiffres
      VARIABLES
        n, c, d, u : ENTIER
      DEBUT
        LIRE(n)
        u ← n MOD 10
        d ← (n DIV 10) MOD 10
        c ← n DIV 100
        ECRIRE("Somme : ", c + d + u)
        ECRIRE("Inversé : ", u * 100 + d * 10 + c)
      FIN
    `,
    correction: "DIV et MOD par 10 isolent les chiffres. Pour 100, l'inversé est 001, c'est-à-dire le nombre 1 : un entier n'a pas de zéros en tête.",
    isEvaluated: true,
  }),
  ex({
    slug: "algo-divisibilite",
    lessonSlug: "operateurs",
    title: "Tests de divisibilité",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez un entier n et affichez, sans structure SI :

      ~~~text
      Pair : <VRAI/FAUX>
      Multiple de 3 : <VRAI/FAUX>
      Multiple de 6 : <VRAI/FAUX>
      ~~~
    `,
    examples: [{ input: "12", output: "Pair : VRAI\nMultiple de 3 : VRAI\nMultiple de 6 : VRAI" }],
    constraints: ["Ne pas utiliser SI."],
    hints: ["n est un multiple de k si n MOD k = 0.", "Un multiple de 6 est un nombre pair ET multiple de 3 (ou simplement n MOD 6 = 0)."],
    tests: [
      { input: "12", expected: "Pair : VRAI\nMultiple de 3 : VRAI\nMultiple de 6 : VRAI" },
      { input: "9", expected: "Pair : FAUX\nMultiple de 3 : VRAI\nMultiple de 6 : FAUX" },
      { input: "0", expected: "Pair : VRAI\nMultiple de 3 : VRAI\nMultiple de 6 : VRAI", hidden: true },
      { input: "-4", expected: "Pair : VRAI\nMultiple de 3 : FAUX\nMultiple de 6 : FAUX", hidden: true },
    ],
    solution: `
      ALGORITHME Divisibilite
      VARIABLES
        n : ENTIER
      DEBUT
        LIRE(n)
        ECRIRE("Pair : ", n MOD 2 = 0)
        ECRIRE("Multiple de 3 : ", n MOD 3 = 0)
        ECRIRE("Multiple de 6 : ", (n MOD 2 = 0) ET (n MOD 3 = 0))
      FIN
    `,
    correction: "0 est un multiple de tous les entiers (0 MOD k = 0). Pour −4, le reste de la division par 2 est 0 : on teste « = 0 », ce qui fonctionne quel que soit le signe.",
  }),
  // ---------- Chapitre 7 ----------
  ex({
    slug: "algo-facture",
    lessonSlug: "entrees-sorties",
    title: "Facture formatée",
    difficulty: "debutant",
    type: "ecrire_algorithme",
    statement: `
      Lisez le nom d'un article, son prix unitaire (réel) et la quantité (entier). Affichez exactement :

      ~~~text
      ===== FACTURE =====
      Article : <nom>
      Quantité : <quantité> x <prix> FC
      Total : <total> FC
      ===================
      ~~~
    `,
    examples: [{ input: "Cahier\n1500\n4", output: "===== FACTURE =====\nArticle : Cahier\nQuantité : 4 x 1500 FC\nTotal : 6000 FC\n===================" }],
    hints: ["Cinq ECRIRE ; respectez les espaces autour de « : » et de « x ».", "Le total est prix × quantité."],
    tests: [
      { input: "Cahier\n1500\n4", expected: "===== FACTURE =====\nArticle : Cahier\nQuantité : 4 x 1500 FC\nTotal : 6000 FC\n===================" },
      { input: "Stylo bleu\n250.5\n2", expected: "===== FACTURE =====\nArticle : Stylo bleu\nQuantité : 2 x 250.5 FC\nTotal : 501 FC\n===================", hidden: true },
    ],
    solution: `
      ALGORITHME Facture
      VARIABLES
        article : CHAINE
        prix : REEL
        quantite : ENTIER
      DEBUT
        LIRE(article)
        LIRE(prix)
        LIRE(quantite)
        ECRIRE("===== FACTURE =====")
        ECRIRE("Article : ", article)
        ECRIRE("Quantité : ", quantite, " x ", prix, " FC")
        ECRIRE("Total : ", prix * quantite, " FC")
        ECRIRE("===================")
      FIN
    `,
    correction: "L'essentiel est le **format** : la sortie est comparée ligne par ligne. Le nom de l'article peut contenir des espaces.",
  }),
  ex({
    slug: "algo-fiche-etudiant",
    lessonSlug: "entrees-sorties",
    title: "Fiche étudiant",
    difficulty: "intermediaire",
    type: "ecrire_algorithme",
    statement: `
      Lisez un nom, un prénom, une année de naissance et une moyenne (réel). Affichez :

      ~~~text
      NOM : <nom en majuscules>
      Prénom : <prénom>
      Âge en 2026 : <âge>
      Moyenne : <moyenne>/20
      Admis : <VRAI si moyenne >= 10, sinon FAUX>
      ~~~
    `,
    examples: [{ input: "Kalenga\nRuth\n2006\n13.5", output: "NOM : KALENGA\nPrénom : Ruth\nÂge en 2026 : 20\nMoyenne : 13.5/20\nAdmis : VRAI" }],
    hints: ["MAJUSCULE(nom) met le nom en majuscules.", "« /20 » est un texte collé juste après la moyenne."],
    tests: [
      { input: "Kalenga\nRuth\n2006\n13.5", expected: "NOM : KALENGA\nPrénom : Ruth\nÂge en 2026 : 20\nMoyenne : 13.5/20\nAdmis : VRAI" },
      { input: "ilunga\nJosué\n2007\n9.99", expected: "NOM : ILUNGA\nPrénom : Josué\nÂge en 2026 : 19\nMoyenne : 9.99/20\nAdmis : FAUX", hidden: true },
      { input: "Banza\nMarie\n2004\n10", expected: "NOM : BANZA\nPrénom : Marie\nÂge en 2026 : 22\nMoyenne : 10/20\nAdmis : VRAI", hidden: true },
    ],
    solution: `
      ALGORITHME Fiche
      VARIABLES
        nom, prenom : CHAINE
        annee : ENTIER
        moyenne : REEL
      DEBUT
        LIRE(nom)
        LIRE(prenom)
        LIRE(annee)
        LIRE(moyenne)
        ECRIRE("NOM : ", MAJUSCULE(nom))
        ECRIRE("Prénom : ", prenom)
        ECRIRE("Âge en 2026 : ", 2026 - annee)
        ECRIRE("Moyenne : ", moyenne, "/20")
        ECRIRE("Admis : ", moyenne >= 10)
      FIN
    `,
    correction: "Quatre lectures typées, cinq affichages. Le test caché avec la moyenne 10 vérifie la borne : 10 est admis.",
  }),
];
