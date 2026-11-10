import type { Exercise } from "../types";
import { makeExercise, type ExInput } from "../helpers";

const ex = (input: ExInput) => makeExercise({ language: "kplus", courseSlug: "kplus" }, input);

/** Explication commune aux exercices de sites web (correction par scénario). */
const SCENARIO = `
  ### Comment votre site est corrigé

  Un **visiteur simulé** utilise votre page : il tape dans les champs (\`saisir "Étiquette" "texte"\`), clique (\`cliquer "Texte"\`) ou laisse passer le temps (\`minuterie 3\`). Le correcteur compare ensuite la **description de la page** obtenue, un élément par ligne, au résultat attendu. Les lignes d'une liste sont décalées de deux espaces.
`;

/**
 * Exercices du parcours K+. Les solutions sont exécutées par le vrai moteur
 * K+ dans les tests de contenu ; les exercices de sites web sont corrigés
 * par des scénarios (pont.executer_test).
 */
export const kplusExercises: Exercise[] = [
  // ------------------------------------------------------------------ bases
  ex({
    slug: "kplus-bonjour",
    lessonSlug: "kplus-introduction",
    title: "Bonjour en K+",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: `
      Lisez un prénom avec \`demander()\` et affichez :

      ~~~text
      Bonjour <prénom>, bienvenue dans K+ !
      ~~~
    `,
    examples: [{ input: "Amani", output: "Bonjour Amani, bienvenue dans K+ !" }],
    starterCode: `
      variable prenom = demander()
      # Affichez le message
    `,
    hints: ["Assemblez les textes avec +.", "afficher(\"Bonjour \" + prenom + \", bienvenue dans K+ !\")"],
    tests: [
      { input: "Amani", expected: "Bonjour Amani, bienvenue dans K+ !" },
      { input: "Grâce", expected: "Bonjour Grâce, bienvenue dans K+ !", hidden: true },
    ],
    solution: `
      variable prenom = demander()
      afficher("Bonjour " + prenom + ", bienvenue dans K+ !")
    `,
    correction: `
      Le signe + assemble les textes. Avec afficher("Bonjour", prenom, …), K+ ajouterait une espace entre chaque valeur, y compris avant la virgule.
    `,
    points: 5,
  }),
  ex({
    slug: "kplus-presentation",
    lessonSlug: "kplus-variables",
    title: "Se présenter",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: `
      Lisez un nom puis un âge (un par ligne) et affichez :

      ~~~text
      <nom> a <âge> ans.
      Dans 10 ans, <nom> aura <âge + 10> ans.
      ~~~
    `,
    examples: [{ input: "Awa\n20", output: "Awa a 20 ans.\nDans 10 ans, Awa aura 30 ans." }],
    starterCode: `
      variable nom = demander()
      variable age = demander()
    `,
    hints: ["demander renvoie un texte : convertissez l'âge avec entier(…).", "Pour assembler un nombre et un texte, utilisez texte(…) ou plusieurs valeurs dans afficher."],
    tests: [
      { input: "Awa\n20", expected: "Awa a 20 ans.\nDans 10 ans, Awa aura 30 ans." },
      { input: "Koffi\n7", expected: "Koffi a 7 ans.\nDans 10 ans, Koffi aura 17 ans.", hidden: true },
    ],
    solution: `
      variable nom = demander()
      variable age = entier(demander())
      afficher(nom + " a " + texte(age) + " ans.")
      afficher("Dans 10 ans, " + nom + " aura " + texte(age + 10) + " ans.")
    `,
    correction: `
      Sans entier(…), l'âge reste un texte et age + 10 provoque une erreur de type : K+ ne mélange pas texte et nombre sans conversion.
    `,
    points: 5,
  }),
  ex({
    slug: "kplus-moyenne",
    lessonSlug: "kplus-calculs",
    title: "Moyenne de trois notes",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: `
      Lisez trois notes entières (une par ligne) et affichez leur moyenne arrondie à 2 chiffres après la virgule :

      ~~~text
      Moyenne : <moyenne>
      ~~~
    `,
    examples: [{ input: "12\n15\n10", output: "Moyenne : 12.33" }],
    hints: ["La division / donne un décimal.", "arrondir(x, 2) garde deux chiffres après la virgule."],
    tests: [
      { input: "12\n15\n10", expected: "Moyenne : 12.33" },
      { input: "10\n10\n10", expected: "Moyenne : 10.0" },
      { input: "20\n19\n0", expected: "Moyenne : 13.0", hidden: true },
    ],
    solution: `
      variable a = entier(demander())
      variable b = entier(demander())
      variable c = entier(demander())
      afficher("Moyenne :", arrondir((a + b + c) / 3, 2))
    `,
    correction: `
      Les parenthèses sont indispensables : a + b + c / 3 ne diviserait que c. La division / donne toujours un décimal, d'où 10.0.
    `,
    points: 10,
  }),
  ex({
    slug: "kplus-mention",
    lessonSlug: "kplus-conditions",
    title: "Mention au bac",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: `
      Lisez une note entière sur 20 et affichez la mention :

      - moins de 0 ou plus de 20 : \`Note invalide\` ;
      - 16 ou plus : \`Très bien\` ;
      - 14 ou plus : \`Bien\` ;
      - 12 ou plus : \`Assez bien\` ;
      - 10 ou plus : \`Admis\` ;
      - sinon : \`Ajourné\`.
    `,
    examples: [{ input: "15", output: "Bien" }],
    hints: ["Testez d'abord la note invalide, puis du plus grand au plus petit.", "Utilisez sinon si pour enchaîner les cas avec un seul fin."],
    tests: [
      { input: "15", expected: "Bien" },
      { input: "16", expected: "Très bien" },
      { input: "9", expected: "Ajourné" },
      { input: "12", expected: "Assez bien", hidden: true },
      { input: "10", expected: "Admis", hidden: true },
      { input: "21", expected: "Note invalide", hidden: true },
      { input: "-1", expected: "Note invalide", hidden: true },
    ],
    solution: `
      variable note = entier(demander())
      si note < 0 ou note > 20 alors
          afficher("Note invalide")
      sinon si note >= 16 alors
          afficher("Très bien")
      sinon si note >= 14 alors
          afficher("Bien")
      sinon si note >= 12 alors
          afficher("Assez bien")
      sinon si note >= 10 alors
          afficher("Admis")
      sinon
          afficher("Ajourné")
      fin
    `,
    correction: `
      L'ordre compte : si l'on testait note >= 10 en premier, une note de 18 afficherait « Admis ». Les limites (16, 14, 12, 10) appartiennent à la mention supérieure : on utilise >=.
    `,
    points: 10,
  }),
  ex({
    slug: "kplus-table",
    lessonSlug: "kplus-boucles",
    title: "Table de multiplication",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: `
      Lisez un entier n et affichez sa table de multiplication de 1 à 10, une ligne par opération :

      ~~~text
      n x 1 = …
      …
      n x 10 = …
      ~~~
    `,
    examples: [{ input: "3", output: "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30" }],
    hints: ["pour i de 1 à 10 faire … fin : les deux bornes sont incluses.", "afficher(n, \"x\", i, \"=\", n * i) sépare les valeurs par des espaces."],
    tests: [
      { input: "3", expected: "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30" },
      { input: "0", expected: "0 x 1 = 0\n0 x 2 = 0\n0 x 3 = 0\n0 x 4 = 0\n0 x 5 = 0\n0 x 6 = 0\n0 x 7 = 0\n0 x 8 = 0\n0 x 9 = 0\n0 x 10 = 0", hidden: true },
      { input: "-2", expected: "-2 x 1 = -2\n-2 x 2 = -4\n-2 x 3 = -6\n-2 x 4 = -8\n-2 x 5 = -10\n-2 x 6 = -12\n-2 x 7 = -14\n-2 x 8 = -16\n-2 x 9 = -18\n-2 x 10 = -20", hidden: true },
    ],
    solution: `
      variable n = entier(demander())
      pour i de 1 à 10 faire
          afficher(n, "x", i, "=", n * i)
      fin
    `,
    correction: `
      La boucle pour compte de 1 à 10 inclus. afficher sépare ses valeurs par une espace, ce qui donne exactement le format demandé.
    `,
    points: 10,
  }),
  ex({
    slug: "kplus-maximum",
    lessonSlug: "kplus-fonctions-listes",
    title: "Plus grande note",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: `
      Lisez un entier n, puis n notes entières (une par ligne). Écrivez une **fonction** \`maximum(liste)\` qui renvoie la plus grande valeur d'une liste, puis affichez :

      ~~~text
      Plus grande note : <maximum>
      ~~~

      Si n vaut 0, affichez \`Aucune note\`.
    `,
    examples: [{ input: "3\n12\n17\n9", output: "Plus grande note : 17" }],
    starterCode: `
      fonction maximum(liste)
          # À compléter
      fin

      variable n = entier(demander())
      variable notes = []
    `,
    hints: ["Remplissez la liste avec ajouter(notes, …) dans une boucle.", "Partez du premier élément (liste[0]) et comparez-le aux suivants."],
    tests: [
      { input: "3\n12\n17\n9", expected: "Plus grande note : 17" },
      { input: "0", expected: "Aucune note" },
      { input: "4\n-5\n-2\n-9\n-3", expected: "Plus grande note : -2", hidden: true },
      { input: "1\n14", expected: "Plus grande note : 14", hidden: true },
    ],
    solution: `
      fonction maximum(liste)
          variable max = liste[0]
          pour chaque x dans liste faire
              si x > max alors
                  max = x
              fin
          fin
          retourner max
      fin

      variable n = entier(demander())
      variable notes = []
      pour i de 1 à n faire
          ajouter(notes, entier(demander()))
      fin
      si n == 0 alors
          afficher("Aucune note")
      sinon
          afficher("Plus grande note :", maximum(notes))
      fin
    `,
    correction: `
      Partir de 0 au lieu de liste[0] donnerait un résultat faux pour des notes toutes négatives. Le cas n = 0 est traité à part : liste[0] provoquerait une erreur d'indice sur une liste vide.
    `,
    points: 15,
  }),

  // ------------------------------------------------------- sites web dynamiques
  ex({
    slug: "kplus-web-page",
    lessonSlug: "kplus-web-premiere-page",
    title: "Page de présentation",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: `
      Créez une page web (\`utiliser web\`) qui contient, dans cet ordre :

      1. le titre **Mon école** ;
      2. le paragraphe **Bienvenue sur notre site.** ;
      3. le sous-titre **Nos matières** ;
      4. une liste avec les lignes **Mathématiques**, **Français** et **Informatique** ;
      5. un lien **Le langage K+** vers \`https://manassekito17-star.github.io/K-/\`.

      Description attendue :

      ~~~text
      titre: Mon école
      paragraphe: Bienvenue sur notre site.
      sous_titre: Nos matières
      liste:
        ligne: Mathématiques
        ligne: Français
        ligne: Informatique
      lien: Le langage K+ -> https://manassekito17-star.github.io/K-/
      ~~~
      ${SCENARIO}
      Ici, le visiteur ne fait rien : seule la page de départ est vérifiée.
    `,
    examples: [{ input: "", output: "titre: Mon école\nparagraphe: Bienvenue sur notre site.\nsous_titre: Nos matières\nliste:\n  ligne: Mathématiques\n  ligne: Français\n  ligne: Informatique\nlien: Le langage K+ -> https://manassekito17-star.github.io/K-/" }],
    starterCode: `
      utiliser web

      titre("Mon école")
    `,
    hints: ["variable matieres = liste() crée la liste ; ajouter_ligne(matieres, …) ajoute une ligne.", "lien(texte, adresse)."],
    tests: [
      { input: "", expected: "titre: Mon école\nparagraphe: Bienvenue sur notre site.\nsous_titre: Nos matières\nliste:\n  ligne: Mathématiques\n  ligne: Français\n  ligne: Informatique\nlien: Le langage K+ -> https://manassekito17-star.github.io/K-/" },
    ],
    solution: `
      utiliser web

      titre("Mon école")
      paragraphe("Bienvenue sur notre site.")
      sous_titre("Nos matières")
      variable matieres = liste()
      ajouter_ligne(matieres, "Mathématiques")
      ajouter_ligne(matieres, "Français")
      ajouter_ligne(matieres, "Informatique")
      lien("Le langage K+", "https://manassekito17-star.github.io/K-/")
    `,
    correction: `
      Les éléments apparaissent dans l'ordre où le programme les crée. Les lignes sont rangées dans la liste qu'on donne à ajouter_ligne.
    `,
    points: 10,
  }),
  ex({
    slug: "kplus-web-salutation",
    lessonSlug: "kplus-web-interactions",
    title: "Formulaire de salutation",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: `
      Créez une page avec :

      - le titre **Salutation** ;
      - un champ d'étiquette **Votre nom** ;
      - un paragraphe vide (\`paragraphe("")\`) qui affichera la réponse ;
      - un bouton **Saluer**.

      Quand on clique sur **Saluer** :

      - si le champ est vide, le paragraphe affiche \`Écrivez votre nom.\` ;
      - sinon, il affiche \`Bonjour <nom> !\`.

      Exemple de visite :

      ~~~text
      saisir "Votre nom" "Awa"
      cliquer "Saluer"
      ~~~

      Description attendue :

      ~~~text
      titre: Salutation
      champ: Votre nom = "Awa"
      paragraphe: Bonjour Awa !
      bouton: Saluer
      ~~~
      ${SCENARIO}
    `,
    examples: [{ input: "saisir \"Votre nom\" \"Awa\"\ncliquer \"Saluer\"", output: "titre: Salutation\nchamp: Votre nom = \"Awa\"\nparagraphe: Bonjour Awa !\nbouton: Saluer" }],
    starterCode: `
      utiliser web

      titre("Salutation")
      variable nom = champ("Votre nom")
      variable reponse = paragraphe("")

      fonction saluer()
          # À compléter
      fin

      bouton("Saluer", saluer)
    `,
    hints: ["valeur(nom) donne le texte tapé.", "changer_texte(reponse, …) modifie le paragraphe."],
    tests: [
      { input: "saisir \"Votre nom\" \"Awa\"\ncliquer \"Saluer\"", expected: "titre: Salutation\nchamp: Votre nom = \"Awa\"\nparagraphe: Bonjour Awa !\nbouton: Saluer" },
      { input: "cliquer \"Saluer\"", expected: "titre: Salutation\nchamp: Votre nom = \"\"\nparagraphe: Écrivez votre nom.\nbouton: Saluer" },
      { input: "saisir \"Votre nom\" \"Awa\"\ncliquer \"Saluer\"\nsaisir \"Votre nom\" \"Koffi\"\ncliquer \"Saluer\"", expected: "titre: Salutation\nchamp: Votre nom = \"Koffi\"\nparagraphe: Bonjour Koffi !\nbouton: Saluer", hidden: true },
      { input: "", expected: "titre: Salutation\nchamp: Votre nom = \"\"\nparagraphe: \nbouton: Saluer", hidden: true },
    ],
    solution: `
      utiliser web

      titre("Salutation")
      variable nom = champ("Votre nom")
      variable reponse = paragraphe("")

      fonction saluer()
          si valeur(nom) == "" alors
              changer_texte(reponse, "Écrivez votre nom.")
          sinon
              changer_texte(reponse, "Bonjour " + valeur(nom) + " !")
          fin
      fin

      bouton("Saluer", saluer)
    `,
    correction: `
      On lit le champ **au moment du clic**, dans la fonction : lu au début du programme, il serait toujours vide. Le bouton reçoit le nom de la fonction, sans parenthèses.
    `,
    points: 10,
  }),
  ex({
    slug: "kplus-web-compteur",
    lessonSlug: "kplus-web-listes",
    title: "Liste de courses",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: `
      Créez une page de liste de courses avec, dans cet ordre :

      - le titre **Courses** ;
      - un champ **Article** ;
      - un bouton **Ajouter** ;
      - un paragraphe compteur qui affiche \`0 article(s)\` au départ ;
      - une liste (vide au départ).

      Un clic sur **Ajouter** ajoute le texte du champ comme nouvelle ligne de la liste (sauf s'il est vide), vide le champ et met à jour le compteur. Un clic sur une **ligne** la supprime et met à jour le compteur.

      Exemple de visite :

      ~~~text
      saisir "Article" "Riz"
      cliquer "Ajouter"
      saisir "Article" "Huile"
      cliquer "Ajouter"
      cliquer "Riz"
      ~~~

      Description attendue :

      ~~~text
      titre: Courses
      champ: Article = ""
      bouton: Ajouter
      paragraphe: 1 article(s)
      liste:
        ligne: Huile
      ~~~
      ${SCENARIO}
    `,
    examples: [{ input: "saisir \"Article\" \"Riz\"\ncliquer \"Ajouter\"\nsaisir \"Article\" \"Huile\"\ncliquer \"Ajouter\"\ncliquer \"Riz\"", output: "titre: Courses\nchamp: Article = \"\"\nbouton: Ajouter\nparagraphe: 1 article(s)\nliste:\n  ligne: Huile" }],
    hints: [
      "Gardez le nombre d'articles dans une variable du programme : elle reste en mémoire entre deux clics.",
      "ajouter_ligne renvoie la ligne : quand_clic(ligne, retirer) ; la fonction retirer(ligne) reçoit la ligne cliquée.",
    ],
    tests: [
      { input: "saisir \"Article\" \"Riz\"\ncliquer \"Ajouter\"\nsaisir \"Article\" \"Huile\"\ncliquer \"Ajouter\"\ncliquer \"Riz\"", expected: "titre: Courses\nchamp: Article = \"\"\nbouton: Ajouter\nparagraphe: 1 article(s)\nliste:\n  ligne: Huile" },
      { input: "cliquer \"Ajouter\"", expected: "titre: Courses\nchamp: Article = \"\"\nbouton: Ajouter\nparagraphe: 0 article(s)\nliste:" },
      { input: "saisir \"Article\" \"Sel\"\ncliquer \"Ajouter\"\nsaisir \"Article\" \"Sucre\"\ncliquer \"Ajouter\"\nsaisir \"Article\" \"Pain\"\ncliquer \"Ajouter\"", expected: "titre: Courses\nchamp: Article = \"\"\nbouton: Ajouter\nparagraphe: 3 article(s)\nliste:\n  ligne: Sel\n  ligne: Sucre\n  ligne: Pain", hidden: true },
      { input: "saisir \"Article\" \"Sel\"\ncliquer \"Ajouter\"\ncliquer \"Sel\"", expected: "titre: Courses\nchamp: Article = \"\"\nbouton: Ajouter\nparagraphe: 0 article(s)\nliste:", hidden: true },
    ],
    solution: `
      utiliser web

      titre("Courses")
      variable article = champ("Article")
      variable nombre = 0

      fonction afficher_nombre()
          changer_texte(compteur, texte(nombre) + " article(s)")
      fin

      fonction retirer(ligne)
          supprimer(ligne)
          nombre = nombre - 1
          afficher_nombre()
      fin

      fonction ajouter_article()
          si valeur(article) == "" alors
              retourner
          fin
          variable ligne = ajouter_ligne(courses, valeur(article))
          quand_clic(ligne, retirer)
          changer_valeur(article, "")
          nombre = nombre + 1
          afficher_nombre()
      fin

      bouton("Ajouter", ajouter_article)
      variable compteur = paragraphe("0 article(s)")
      variable courses = liste()
    `,
    correction: `
      Le compteur est une variable du programme, modifiée à chaque ajout et à chaque suppression. Les fonctions peuvent utiliser compteur et courses, créés plus bas : elles ne sont appelées qu'au moment des clics, quand la page est déjà construite.
    `,
    points: 15,
  }),
  ex({
    slug: "kplus-web-minuteur",
    lessonSlug: "kplus-web-minuteries",
    title: "Minuteur",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: `
      Créez un minuteur de 3 secondes :

      - le titre **Minuteur** ;
      - un paragraphe qui affiche \`3\` au départ ;
      - un bouton **Démarrer**.

      Un clic sur **Démarrer** lance une minuterie d'une seconde (\`toutes_les(1000, …)\`) qui diminue le nombre de 1 à chaque tour. Quand il atteint 0, la minuterie s'arrête et le paragraphe affiche \`Terminé !\`. Cliquer plusieurs fois sur Démarrer ne doit pas lancer plusieurs minuteries.

      Exemple de visite (\`minuterie 2\` = deux tours de minuterie) :

      ~~~text
      cliquer "Démarrer"
      minuterie 2
      ~~~

      Description attendue :

      ~~~text
      titre: Minuteur
      paragraphe: 1
      bouton: Démarrer
      ~~~
      ${SCENARIO}
    `,
    examples: [{ input: "cliquer \"Démarrer\"\nminuterie 2", output: "titre: Minuteur\nparagraphe: 1\nbouton: Démarrer" }],
    hints: [
      "Gardez la minuterie dans une variable initialisée à nul, et ne la lancez que si elle vaut nul.",
      "arreter_minuterie(m) arrête la minuterie.",
    ],
    tests: [
      { input: "cliquer \"Démarrer\"\nminuterie 2", expected: "titre: Minuteur\nparagraphe: 1\nbouton: Démarrer" },
      { input: "cliquer \"Démarrer\"\nminuterie 3", expected: "titre: Minuteur\nparagraphe: Terminé !\nbouton: Démarrer" },
      { input: "minuterie 2", expected: "titre: Minuteur\nparagraphe: 3\nbouton: Démarrer", hidden: true },
      { input: "cliquer \"Démarrer\"\ncliquer \"Démarrer\"\nminuterie 1", expected: "titre: Minuteur\nparagraphe: 2\nbouton: Démarrer", hidden: true },
      { input: "cliquer \"Démarrer\"\nminuterie 10", expected: "titre: Minuteur\nparagraphe: Terminé !\nbouton: Démarrer", hidden: true },
    ],
    solution: `
      utiliser web

      titre("Minuteur")
      variable affichage = paragraphe("3")
      variable reste = 3
      variable minuterie = nul

      fonction tic()
          reste = reste - 1
          changer_texte(affichage, texte(reste))
          si reste == 0 alors
              arreter_minuterie(minuterie)
              changer_texte(affichage, "Terminé !")
          fin
      fin

      fonction demarrer()
          si minuterie == nul alors
              minuterie = toutes_les(1000, tic)
          fin
      fin

      bouton("Démarrer", demarrer)
    `,
    correction: `
      La variable minuterie vaut nul tant que rien n'est lancé : le test si minuterie == nul empêche un second clic de lancer une deuxième minuterie, qui ferait descendre le nombre deux fois plus vite. arreter_minuterie évite de passer sous zéro.
    `,
    points: 15,
  }),
];
