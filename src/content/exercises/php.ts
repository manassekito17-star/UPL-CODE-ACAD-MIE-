import { makeExercise, type ExInput } from "../helpers";
import type { Exercise } from "../types";

const r = String.raw;
const php = (input: ExInput) => makeExercise({ language: "php", courseSlug: "php" }, input);

/** Lecture d'une ligne de l'entrée (zone « Entrée » de l'éditeur, ou données du test). */
const LIRE = r`trim((string) fgets(STDIN))`;

export const phpExercises: Exercise[] = [
  // ---------------------------------------------------------------- Niveau 1
  php({
    slug: "php-bonjour",
    lessonSlug: "php-introduction",
    title: "Bonjour en PHP",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: r`
      Affichez exactement deux lignes :

      ~~~text
      Bonjour UPL
      Je programme en PHP
      ~~~
    `,
    examples: [{ input: "", output: "Bonjour UPL\nJe programme en PHP" }],
    starterCode: r`
      <?php
      // Votre code ici
    `,
    hints: ["echo affiche du texte : echo \"Bonjour UPL\\n\";", "\\n passe à la ligne entre guillemets doubles."],
    tests: [{ input: "", expected: "Bonjour UPL\nJe programme en PHP" }],
    solution: r`
      <?php
      echo "Bonjour UPL\n";
      echo "Je programme en PHP\n";
    `,
    correction: r`Deux instructions **echo**, chacune terminée par un point-virgule. Le **\n** entre guillemets doubles passe à la ligne.`,
    points: 5,
  }),
  php({
    slug: "php-presentation",
    lessonSlug: "php-variables-types",
    title: "Fiche de présentation",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: r`
      Lisez un **prénom** puis un **âge** (une valeur par ligne) et affichez :

      ~~~text
      Je m'appelle <prénom> et j'ai <âge> ans.
      Dans 5 ans, j'aurai <âge + 5> ans.
      ~~~
    `,
    examples: [{ input: "Grace\n19", output: "Je m'appelle Grace et j'ai 19 ans.\nDans 5 ans, j'aurai 24 ans." }],
    starterCode: r`
      <?php
      $prenom = ${LIRE};
      $age = (int) ${LIRE};
      // Affichez la fiche
    `,
    hints: ["Entre guillemets doubles, $prenom est remplacé par sa valeur.", "Calculez $age + 5 avant de l'afficher, ou utilisez la concaténation."],
    tests: [
      { input: "Grace\n19", expected: "Je m'appelle Grace et j'ai 19 ans.\nDans 5 ans, j'aurai 24 ans." },
      { input: "Kito\n21", expected: "Je m'appelle Kito et j'ai 21 ans.\nDans 5 ans, j'aurai 26 ans." },
      { input: "Ana\n0", expected: "Je m'appelle Ana et j'ai 0 ans.\nDans 5 ans, j'aurai 5 ans.", hidden: true },
    ],
    solution: r`
      <?php
      $prenom = ${LIRE};
      $age = (int) ${LIRE};
      echo "Je m'appelle $prenom et j'ai $age ans.\n";
      echo "Dans 5 ans, j'aurai " . ($age + 5) . " ans.\n";
    `,
    correction: "L'âge lu est une chaîne : **(int)** le convertit. Les parenthèses autour de **$age + 5** sont nécessaires avec la concaténation.",
    points: 10,
  }),
  php({
    slug: "php-calculs",
    lessonSlug: "php-operateurs",
    title: "Quatre opérations",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: r`
      Lisez deux entiers **a** et **b** (b différent de 0) et affichez :

      ~~~text
      Somme : <a + b>
      Produit : <a × b>
      Quotient entier : <quotient>
      Reste : <reste>
      ~~~
    `,
    examples: [{ input: "17\n5", output: "Somme : 22\nProduit : 85\nQuotient entier : 3\nReste : 2" }],
    hints: ["intdiv(a, b) donne le quotient entier.", "% donne le reste."],
    tests: [
      { input: "17\n5", expected: "Somme : 22\nProduit : 85\nQuotient entier : 3\nReste : 2" },
      { input: "20\n4", expected: "Somme : 24\nProduit : 80\nQuotient entier : 5\nReste : 0" },
      { input: "7\n9", expected: "Somme : 16\nProduit : 63\nQuotient entier : 0\nReste : 7", hidden: true },
    ],
    solution: r`
      <?php
      $a = (int) ${LIRE};
      $b = (int) ${LIRE};
      echo "Somme : ", $a + $b, "\n";
      echo "Produit : ", $a * $b, "\n";
      echo "Quotient entier : ", intdiv($a, $b), "\n";
      echo "Reste : ", $a % $b, "\n";
    `,
    correction: "**/** donnerait 3.4 : pour le quotient entier on utilise **intdiv()**, et **%** pour le reste.",
    points: 10,
  }),
  php({
    slug: "php-admis",
    lessonSlug: "php-conditions-simples",
    title: "Admis ou ajourné",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Lisez une note sur 20 et affichez **Admis** si elle est supérieure ou égale à 10, sinon **Ajourné**.",
    examples: [{ input: "12", output: "Admis" }],
    hints: ["Convertissez la note avec (float).", "if ($note >= 10) { … } else { … }"],
    tests: [
      { input: "12", expected: "Admis" },
      { input: "9.5", expected: "Ajourné" },
      { input: "10", expected: "Admis", hidden: true },
    ],
    solution: r`
      <?php
      $note = (float) ${LIRE};
      echo $note >= 10 ? "Admis" : "Ajourné", "\n";
    `,
    correction: "Attention au cas limite **10** : la condition est **>=**, pas **>**.",
    points: 10,
  }),
  php({
    slug: "php-page-personnalisee",
    lessonSlug: "php-conditions-simples",
    title: "Projet : page personnalisée",
    difficulty: "debutant",
    type: "mini_projet",
    statement: r`
      Lisez un **prénom** et une **heure** (0 à 23). Générez ce fragment HTML :

      ~~~html
      <h1>Bonjour, Grace !</h1>
      <p>Bonne journée à l'UPL.</p>
      ~~~

      - « Bonjour » si l'heure est avant 18, sinon « Bonsoir » ;
      - « Bonne journée à l'UPL. » si l'heure est avant 18, sinon « Bonne soirée à l'UPL. » ;
      - le prénom doit être **échappé** avec htmlspecialchars (un prénom peut contenir des caractères spéciaux).
    `,
    examples: [{ input: "Grace\n9", output: "<h1>Bonjour, Grace !</h1>\n<p>Bonne journée à l'UPL.</p>" }],
    hints: ["$jour = $heure < 18;", "htmlspecialchars(\"<b>\") donne &lt;b&gt;"],
    tests: [
      { input: "Grace\n9", expected: "<h1>Bonjour, Grace !</h1>\n<p>Bonne journée à l'UPL.</p>" },
      { input: "Kito\n20", expected: "<h1>Bonsoir, Kito !</h1>\n<p>Bonne soirée à l'UPL.</p>" },
      { input: "<b>Ana</b>\n18", expected: "<h1>Bonsoir, &lt;b&gt;Ana&lt;/b&gt; !</h1>\n<p>Bonne soirée à l'UPL.</p>", hidden: true },
    ],
    solution: r`
      <?php
      $prenom = ${LIRE};
      $heure = (int) ${LIRE};
      $jour = $heure < 18;
      echo "<h1>", $jour ? "Bonjour" : "Bonsoir", ", ", htmlspecialchars($prenom), " !</h1>\n";
      echo "<p>", $jour ? "Bonne journée" : "Bonne soirée", " à l'UPL.</p>\n";
    `,
    correction: "Le test caché envoie un prénom contenant du HTML : sans **htmlspecialchars**, la page serait vulnérable au XSS.",
    points: 20,
  }),
  // ---------------------------------------------------------------- Niveau 2
  php({
    slug: "php-mention",
    lessonSlug: "php-conditions-switch-match",
    title: "Mention avec match",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Lisez une moyenne sur 20 et affichez la mention : **Très bien** (≥ 16), **Bien** (≥ 14), **Assez bien** (≥ 12), **Passable** (≥ 10), sinon **Ajourné**.",
    examples: [{ input: "14.5", output: "Bien" }],
    hints: ["match (true) { $m >= 16 => \"Très bien\", … default => \"Ajourné\" }", "Testez de la plus haute mention à la plus basse."],
    tests: [
      { input: "14.5", expected: "Bien" },
      { input: "17", expected: "Très bien" },
      { input: "9.99", expected: "Ajourné" },
      { input: "12", expected: "Assez bien", hidden: true },
      { input: "10", expected: "Passable", hidden: true },
    ],
    solution: r`
      <?php
      $m = (float) ${LIRE};
      echo match (true) {
          $m >= 16 => "Très bien",
          $m >= 14 => "Bien",
          $m >= 12 => "Assez bien",
          $m >= 10 => "Passable",
          default => "Ajourné",
      }, "\n";
    `,
    correction: "Avec **match (true)**, la première branche vraie est retenue : l'ordre des conditions est essentiel.",
    points: 10,
  }),
  php({
    slug: "php-table-multiplication",
    lessonSlug: "php-boucles",
    title: "Table de multiplication",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Lisez un entier **n** et affichez sa table de 1 à 10, une ligne par produit : **n x i = résultat**.",
    examples: [{ input: "7", output: "7 x 1 = 7\n7 x 2 = 14\n…\n7 x 10 = 70" }],
    hints: ["for ($i = 1; $i <= 10; $i++)", "echo \"$n x $i = \", $n * $i, \"\\n\";"],
    tests: [
      { input: "7", expected: Array.from({ length: 10 }, (_, i) => `7 x ${i + 1} = ${7 * (i + 1)}`).join("\n") },
      { input: "12", expected: Array.from({ length: 10 }, (_, i) => `12 x ${i + 1} = ${12 * (i + 1)}`).join("\n"), hidden: true },
    ],
    solution: r`
      <?php
      $n = (int) ${LIRE};
      for ($i = 1; $i <= 10; $i++) {
          echo "$n x $i = ", $n * $i, "\n";
      }
    `,
    correction: "Une boucle **for** de 1 à 10 inclus ; l'interpolation affiche $n et $i.",
    points: 10,
  }),
  php({
    slug: "php-somme-entiers",
    lessonSlug: "php-boucles",
    title: "Somme jusqu'à zéro",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Lisez des entiers, un par ligne, jusqu'à lire **0** (non compté). Affichez **Somme : …** puis **Nombre : …** (le nombre de valeurs lues avant 0).",
    examples: [{ input: "4\n7\n1\n0", output: "Somme : 12\nNombre : 3" }],
    hints: ["Une boucle while qui s'arrête quand la valeur lue vaut 0.", "Un compteur et un accumulateur initialisés à 0."],
    tests: [
      { input: "4\n7\n1\n0", expected: "Somme : 12\nNombre : 3" },
      { input: "0", expected: "Somme : 0\nNombre : 0" },
      { input: "-5\n5\n10\n0", expected: "Somme : 10\nNombre : 3", hidden: true },
    ],
    solution: r`
      <?php
      $somme = 0;
      $nombre = 0;
      while (($x = (int) ${LIRE}) !== 0) {
          $somme += $x;
          $nombre++;
      }
      echo "Somme : $somme\n";
      echo "Nombre : $nombre\n";
    `,
    correction: "Le motif « lire puis tester » dans la condition du while évite de compter la valeur d'arrêt.",
    points: 10,
  }),
  php({
    slug: "php-moyenne-notes",
    lessonSlug: "php-tableaux",
    title: "Moyenne, minimum et maximum",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Lisez une ligne de notes séparées par des espaces. Affichez **Moyenne : x** (2 décimales), **Minimum : x** et **Maximum : x**.",
    examples: [{ input: "12 15 9 18", output: "Moyenne : 13.50\nMinimum : 9\nMaximum : 18" }],
    hints: ["explode(\" \", $ligne) découpe la ligne.", "array_sum, count, min, max ; sprintf(\"%.2f\", …)."],
    tests: [
      { input: "12 15 9 18", expected: "Moyenne : 13.50\nMinimum : 9\nMaximum : 18" },
      { input: "10", expected: "Moyenne : 10.00\nMinimum : 10\nMaximum : 10" },
      { input: "7 8 8", expected: "Moyenne : 7.67\nMinimum : 7\nMaximum : 8", hidden: true },
    ],
    solution: r`
      <?php
      $notes = array_map("intval", explode(" ", ${LIRE}));
      echo "Moyenne : ", sprintf("%.2f", array_sum($notes) / count($notes)), "\n";
      echo "Minimum : ", min($notes), "\n";
      echo "Maximum : ", max($notes), "\n";
    `,
    correction: "explode découpe, array_map(\"intval\", …) convertit chaque élément ; sprintf(\"%.2f\") impose deux décimales.",
    points: 10,
  }),
  php({
    slug: "php-plus-grand",
    lessonSlug: "php-tableaux",
    title: "Meilleur étudiant (tableau associatif)",
    difficulty: "intermediaire",
    type: "probleme",
    statement: r`
      Chaque ligne contient **nom;moyenne**. La dernière ligne est **FIN**. Affichez le meilleur étudiant puis la liste triée par moyenne décroissante :

      ~~~text
      Meilleur : Kito (15.5)
      1. Kito 15.5
      2. Mbuyi 12
      ~~~
    `,
    examples: [{ input: "Mbuyi;12\nKito;15.5\nFIN", output: "Meilleur : Kito (15.5)\n1. Kito 15.5\n2. Mbuyi 12" }],
    hints: ["Rangez les moyennes dans $t[$nom] = (float) $moyenne.", "arsort($t) trie par valeur décroissante en gardant les clés.", "array_key_first donne la première clé."],
    tests: [
      { input: "Mbuyi;12\nKito;15.5\nFIN", expected: "Meilleur : Kito (15.5)\n1. Kito 15.5\n2. Mbuyi 12" },
      { input: "Ana;9\nBeni;14\nCarl;11.25\nFIN", expected: "Meilleur : Beni (14)\n1. Beni 14\n2. Carl 11.25\n3. Ana 9", hidden: true },
    ],
    solution: r`
      <?php
      $t = [];
      while (($ligne = ${LIRE}) !== "FIN" && $ligne !== "") {
          [$nom, $moyenne] = explode(";", $ligne);
          $t[$nom] = (float) $moyenne;
      }
      arsort($t);
      $premier = array_key_first($t);
      echo "Meilleur : $premier ({$t[$premier]})\n";
      $rang = 1;
      foreach ($t as $nom => $moyenne) {
          echo $rang++, ". $nom $moyenne\n";
      }
    `,
    correction: "Un tableau associatif nom ⇒ moyenne, trié avec **arsort** (et non sort, qui perdrait les noms).",
    points: 15,
  }),
  php({
    slug: "php-fonction-mention",
    lessonSlug: "php-fonctions-chaines-dates",
    title: "Fonctions typées : bulletin",
    difficulty: "intermediaire",
    type: "completer",
    statement: r`
      Complétez les fonctions **moyenne(array $notes): float** et **mention(float $m): string** (mêmes seuils que l'exercice « Mention ») puis affichez pour la ligne de notes lue :

      ~~~text
      Moyenne : 13.67
      Mention : Assez bien
      ~~~
    `,
    examples: [{ input: "12 14 15", output: "Moyenne : 13.67\nMention : Assez bien" }],
    starterCode: r`
      <?php
      declare(strict_types=1);

      function moyenne(array $notes): float
      {
          // à compléter
      }

      function mention(float $m): string
      {
          // à compléter
      }

      $notes = array_map("floatval", explode(" ", ${LIRE}));
      $m = moyenne($notes);
      echo "Moyenne : ", sprintf("%.2f", $m), "\n";
      echo "Mention : ", mention($m), "\n";
    `,
    hints: ["return array_sum($notes) / count($notes);", "Réutilisez un match (true)."],
    tests: [
      { input: "12 14 15", expected: "Moyenne : 13.67\nMention : Assez bien" },
      { input: "16 18", expected: "Moyenne : 17.00\nMention : Très bien" },
      { input: "8 11", expected: "Moyenne : 9.50\nMention : Ajourné", hidden: true },
    ],
    solution: r`
      <?php
      declare(strict_types=1);

      function moyenne(array $notes): float
      {
          return array_sum($notes) / count($notes);
      }

      function mention(float $m): string
      {
          return match (true) {
              $m >= 16 => "Très bien",
              $m >= 14 => "Bien",
              $m >= 12 => "Assez bien",
              $m >= 10 => "Passable",
              default => "Ajourné",
          };
      }

      $notes = array_map("floatval", explode(" ", ${LIRE}));
      $m = moyenne($notes);
      echo "Moyenne : ", sprintf("%.2f", $m), "\n";
      echo "Mention : ", mention($m), "\n";
    `,
    correction: "Deux fonctions courtes, chacune avec une seule responsabilité ; le type de retour **float** / **string** est vérifié par PHP.",
    points: 15,
  }),
  php({
    slug: "php-chaines",
    lessonSlug: "php-fonctions-chaines-dates",
    title: "Nom d'utilisateur et initiales",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: r`
      Lisez un nom complet (prénom puis nom, en lettres sans accent, avec d'éventuels espaces en trop). Affichez :

      ~~~text
      Nom : Jean Paul Kabila
      Initiales : J.P.K.
      Identifiant : jean.kabila
      ~~~

      - **Nom** : chaque mot avec une majuscule initiale, séparés par un seul espace ;
      - **Identifiant** : premier mot et dernier mot en minuscules, séparés par un point.
    `,
    examples: [{ input: "  jean  paul KABILA ", output: "Nom : Jean Paul Kabila\nInitiales : J.P.K.\nIdentifiant : jean.kabila" }],
    hints: ["preg_split('/\\s+/', trim($texte)) découpe sur un ou plusieurs espaces.", "ucfirst(strtolower($mot))", "end($mots) ou $mots[count($mots) - 1]."],
    tests: [
      { input: "  jean  paul KABILA ", expected: "Nom : Jean Paul Kabila\nInitiales : J.P.K.\nIdentifiant : jean.kabila" },
      { input: "grace mbuyi", expected: "Nom : Grace Mbuyi\nInitiales : G.M.\nIdentifiant : grace.mbuyi" },
      { input: "ANA", expected: "Nom : Ana\nInitiales : A.\nIdentifiant : ana.ana", hidden: true },
    ],
    solution: r`
      <?php
      $mots = preg_split('/\s+/', trim(${LIRE}));
      $mots = array_map(fn(string $m): string => ucfirst(strtolower($m)), $mots);
      echo "Nom : ", implode(" ", $mots), "\n";
      echo "Initiales : ", implode("", array_map(fn(string $m): string => $m[0] . ".", $mots)), "\n";
      echo "Identifiant : ", strtolower($mots[0] . "." . $mots[count($mots) - 1]), "\n";
    `,
    correction: "explode(\" \") laisserait des mots vides à cause des espaces multiples : **preg_split('/\\s+/')** après **trim** est plus robuste.",
    points: 15,
  }),
  php({
    slug: "php-validation-age",
    lessonSlug: "php-formulaires",
    title: "Valider un formulaire d'inscription",
    difficulty: "intermediaire",
    type: "probleme",
    statement: r`
      Les trois lignes de l'entrée simulent les champs **nom**, **email** et **age** d'un formulaire. Affichez chaque erreur détectée, dans cet ordre :

      - **Erreur : nom obligatoire** si le nom (sans espaces autour) est vide ;
      - **Erreur : email invalide** si filter_var(…, FILTER_VALIDATE_EMAIL) échoue ;
      - **Erreur : âge entre 16 et 99** si l'âge n'est pas un entier dans cet intervalle.

      S'il n'y a aucune erreur, affichez **Inscription valide : <nom échappé>**.
    `,
    examples: [{ input: "Kito\nkito@upl.cd\n21", output: "Inscription valide : Kito" }],
    hints: ["filter_var($age, FILTER_VALIDATE_INT, [\"options\" => [\"min_range\" => 16, \"max_range\" => 99]])", "Accumulez les erreurs dans un tableau."],
    tests: [
      { input: "Kito\nkito@upl.cd\n21", expected: "Inscription valide : Kito" },
      { input: "  \nkito@\n15", expected: "Erreur : nom obligatoire\nErreur : email invalide\nErreur : âge entre 16 et 99" },
      { input: "Ana\nana@upl.cd\nvingt", expected: "Erreur : âge entre 16 et 99", hidden: true },
      { input: "<i>Bo</i>\nbo@upl.cd\n30", expected: "Inscription valide : &lt;i&gt;Bo&lt;/i&gt;", hidden: true },
    ],
    solution: r`
      <?php
      $nom = ${LIRE};
      $email = ${LIRE};
      $age = ${LIRE};
      $erreurs = [];
      if ($nom === "") {
          $erreurs[] = "nom obligatoire";
      }
      if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
          $erreurs[] = "email invalide";
      }
      if (filter_var($age, FILTER_VALIDATE_INT, ["options" => ["min_range" => 16, "max_range" => 99]]) === false) {
          $erreurs[] = "âge entre 16 et 99";
      }
      if ($erreurs) {
          foreach ($erreurs as $e) {
              echo "Erreur : $e\n";
          }
      } else {
          echo "Inscription valide : ", htmlspecialchars($nom), "\n";
      }
    `,
    correction: "On valide **toutes** les données et on échappe le nom à l'affichage : le test caché contient du HTML.",
    points: 20,
  }),
  php({
    slug: "php-calculatrice",
    lessonSlug: "php-formulaires",
    title: "Projet : calculatrice",
    difficulty: "intermediaire",
    type: "mini_projet",
    statement: r`
      L'entrée simule un formulaire : **a**, **operation** (+, -, *, /) et **b**, une valeur par ligne. Affichez **a op b = résultat** (résultat arrondi à 2 décimales au plus, sans zéros inutiles grâce à round). Cas d'erreur :

      - **Erreur : nombres invalides** si a ou b n'est pas numérique ;
      - **Erreur : division par zéro** ;
      - **Erreur : opération inconnue**.
    `,
    examples: [{ input: "7\n/\n2", output: "7 / 2 = 3.5" }],
    hints: ["is_numeric() vérifie une saisie.", "match ($op) { \"+\" => $a + $b, … }", "round($resultat, 2)"],
    tests: [
      { input: "7\n/\n2", expected: "7 / 2 = 3.5" },
      { input: "3\n*\n4", expected: "3 * 4 = 12" },
      { input: "1\n/\n0", expected: "Erreur : division par zéro" },
      { input: "a\n+\n2", expected: "Erreur : nombres invalides", hidden: true },
      { input: "2\n%\n2", expected: "Erreur : opération inconnue", hidden: true },
      { input: "10\n/\n3", expected: "10 / 3 = 3.33", hidden: true },
    ],
    solution: r`
      <?php
      $a = ${LIRE};
      $op = ${LIRE};
      $b = ${LIRE};
      if (!is_numeric($a) || !is_numeric($b)) {
          echo "Erreur : nombres invalides\n";
      } elseif (!in_array($op, ["+", "-", "*", "/"], true)) {
          echo "Erreur : opération inconnue\n";
      } elseif ($op === "/" && (float) $b == 0) {
          echo "Erreur : division par zéro\n";
      } else {
          $x = (float) $a;
          $y = (float) $b;
          $resultat = match ($op) {
              "+" => $x + $y,
              "-" => $x - $y,
              "*" => $x * $y,
              "/" => $x / $y,
          };
          echo "$a $op $b = ", round($resultat, 2), "\n";
      }
    `,
    correction: "Valider d'abord (nombres, opération, division par zéro), calculer ensuite : chaque cas d'erreur a son message.",
    points: 25,
  }),
  php({
    slug: "php-erreurs-corriger",
    lessonSlug: "php-sessions-cookies-include",
    title: "Corriger un script (Parse error et Fatal error)",
    difficulty: "intermediaire",
    type: "corriger",
    statement: r`
      Le script ci-dessous contient **trois erreurs** (une erreur de syntaxe, une fonction mal nommée et une variable mal orthographiée). Exécutez-le, lisez les messages de PHP et corrigez-le pour qu'il affiche, pour l'entrée **3** :

      ~~~text
      Panier : 3 article(s)
      Total : 4500 FC
      ~~~
    `,
    examples: [{ input: "3", output: "Panier : 3 article(s)\nTotal : 4500 FC" }],
    starterCode: r`
      <?php
      $prixUnitaire = 1500
      $quantite = (int) ${LIRE};
      $total = $prixUnitaire * $quantite;
      echo "Panier : $quantite article(s)\n";
      ecrire("Total : $totale FC\n");
    `,
    hints: ["Parse error : regardez la fin de la ligne 2.", "La fonction d'affichage s'appelle echo.", "Warning : Undefined variable $totale."],
    tests: [
      { input: "3", expected: "Panier : 3 article(s)\nTotal : 4500 FC" },
      { input: "1", expected: "Panier : 1 article(s)\nTotal : 1500 FC", hidden: true },
    ],
    solution: r`
      <?php
      $prixUnitaire = 1500;
      $quantite = (int) ${LIRE};
      $total = $prixUnitaire * $quantite;
      echo "Panier : $quantite article(s)\n";
      echo "Total : $total FC\n";
    `,
    correction: "Point-virgule manquant ligne 2 (Parse error signalée ligne 3), **ecrire** n'existe pas en PHP (Fatal error : Call to undefined function), et **$totale** n'existe pas (Warning : Undefined variable).",
    points: 10,
  }),
  // ---------------------------------------------------------------- Niveau 3
  php({
    slug: "php-classe-compte",
    lessonSlug: "php-classes-objets",
    title: "Classe CompteBancaire",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: r`
      Écrivez une classe **CompteBancaire** avec un titulaire et un solde **privé** (initialisé à 0), et les méthodes **deposer(float $m)**, **retirer(float $m): bool** (refuse si le solde est insuffisant ou le montant ≤ 0) et **getSolde()**.

      L'entrée contient le titulaire, puis des opérations **D montant** ou **R montant**, puis **FIN**. Affichez une ligne par opération (**Dépôt : 100**, **Retrait : 30**, **Retrait refusé : 500**) puis **Solde de <titulaire> : <solde>**.
    `,
    examples: [{ input: "Kito\nD 100\nR 30\nR 500\nFIN", output: "Dépôt : 100\nRetrait : 30\nRetrait refusé : 500\nSolde de Kito : 70" }],
    hints: ["private float $solde = 0;", "Le constructeur reçoit le titulaire.", "[$type, $montant] = explode(\" \", $ligne);"],
    tests: [
      { input: "Kito\nD 100\nR 30\nR 500\nFIN", expected: "Dépôt : 100\nRetrait : 30\nRetrait refusé : 500\nSolde de Kito : 70" },
      { input: "Ana\nR 10\nD 50.5\nFIN", expected: "Retrait refusé : 10\nDépôt : 50.5\nSolde de Ana : 50.5", hidden: true },
    ],
    solution: r`
      <?php
      class CompteBancaire
      {
          private float $solde = 0;

          public function __construct(private string $titulaire) {}

          public function deposer(float $m): void
          {
              if ($m > 0) {
                  $this->solde += $m;
              }
          }

          public function retirer(float $m): bool
          {
              if ($m <= 0 || $m > $this->solde) {
                  return false;
              }
              $this->solde -= $m;
              return true;
          }

          public function getSolde(): float
          {
              return $this->solde;
          }

          public function getTitulaire(): string
          {
              return $this->titulaire;
          }
      }

      $compte = new CompteBancaire(${LIRE});
      while (($ligne = ${LIRE}) !== "FIN" && $ligne !== "") {
          [$type, $montant] = explode(" ", $ligne);
          if ($type === "D") {
              $compte->deposer((float) $montant);
              echo "Dépôt : $montant\n";
          } else {
              echo $compte->retirer((float) $montant) ? "Retrait : $montant\n" : "Retrait refusé : $montant\n";
          }
      }
      echo "Solde de ", $compte->getTitulaire(), " : ", $compte->getSolde(), "\n";
    `,
    correction: "Le solde est **private** : seules les méthodes peuvent le modifier, et **retirer** garantit qu'il ne devient jamais négatif.",
    points: 20,
  }),
  php({
    slug: "php-formes-polymorphisme",
    lessonSlug: "php-heritage-interfaces",
    title: "Formes géométriques (interface et polymorphisme)",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: r`
      Définissez une interface **Forme** (méthodes **aire(): float** et **nom(): string**) et deux classes **Rectangle** et **Cercle**. Chaque ligne de l'entrée est **R largeur hauteur** ou **C rayon**, jusqu'à **FIN**. Affichez pour chaque forme **<nom> : <aire à 2 décimales>** puis **Total : …**.
    `,
    examples: [{ input: "R 3 4\nC 1\nFIN", output: "Rectangle : 12.00\nCercle : 3.14\nTotal : 15.14" }],
    hints: ["interface Forme { public function aire(): float; public function nom(): string; }", "M_PI vaut π.", "number_format($x, 2, \".\", \"\") ou sprintf(\"%.2f\", $x)."],
    tests: [
      { input: "R 3 4\nC 1\nFIN", expected: "Rectangle : 12.00\nCercle : 3.14\nTotal : 15.14" },
      { input: "C 2\nC 0.5\nR 1 1\nFIN", expected: "Cercle : 12.57\nCercle : 0.79\nRectangle : 1.00\nTotal : 14.35", hidden: true },
    ],
    solution: r`
      <?php
      interface Forme
      {
          public function aire(): float;
          public function nom(): string;
      }

      class Rectangle implements Forme
      {
          public function __construct(private float $l, private float $h) {}
          public function aire(): float { return $this->l * $this->h; }
          public function nom(): string { return "Rectangle"; }
      }

      class Cercle implements Forme
      {
          public function __construct(private float $r) {}
          public function aire(): float { return M_PI * $this->r ** 2; }
          public function nom(): string { return "Cercle"; }
      }

      $formes = [];
      while (($ligne = ${LIRE}) !== "FIN" && $ligne !== "") {
          $p = explode(" ", $ligne);
          $formes[] = $p[0] === "R" ? new Rectangle((float) $p[1], (float) $p[2]) : new Cercle((float) $p[1]);
      }
      $total = 0;
      foreach ($formes as $f) {
          echo $f->nom(), " : ", sprintf("%.2f", $f->aire()), "\n";
          $total += $f->aire();
      }
      echo "Total : ", sprintf("%.2f", $total), "\n";
    `,
    correction: "La boucle d'affichage ignore le type réel de chaque forme : elle appelle **aire()** et **nom()**, garantis par l'interface (polymorphisme).",
    points: 20,
  }),
  php({
    slug: "php-exception-retrait",
    lessonSlug: "php-exceptions",
    title: "Exceptions personnalisées",
    difficulty: "intermediaire",
    type: "completer",
    statement: r`
      Complétez la fonction **retirer** : elle lève une **MontantInvalideException** si le montant est ≤ 0 et une **SoldeInsuffisantException** s'il dépasse le solde, sinon elle renvoie le nouveau solde. Le programme principal (fourni) affiche le résultat de chaque retrait.
    `,
    examples: [{ input: "100\n30\n-5\n500", output: "Nouveau solde : 70\nMontant invalide : -5\nSolde insuffisant : 500 > 70" }],
    starterCode: r`
      <?php
      class MontantInvalideException extends InvalidArgumentException {}
      class SoldeInsuffisantException extends RuntimeException {}

      function retirer(float $solde, float $montant): float
      {
          // à compléter
      }

      $solde = (float) ${LIRE};
      while (($ligne = ${LIRE}) !== "") {
          try {
              $solde = retirer($solde, (float) $ligne);
              echo "Nouveau solde : $solde\n";
          } catch (MontantInvalideException $e) {
              echo "Montant invalide : ", $e->getMessage(), "\n";
          } catch (SoldeInsuffisantException $e) {
              echo "Solde insuffisant : ", $e->getMessage(), "\n";
          }
      }
    `,
    hints: ["throw new MontantInvalideException((string) $montant);", "Le message attendu du solde insuffisant est « 500 > 70 »."],
    tests: [
      { input: "100\n30\n-5\n500", expected: "Nouveau solde : 70\nMontant invalide : -5\nSolde insuffisant : 500 > 70" },
      { input: "10\n0\n10\n1", expected: "Montant invalide : 0\nNouveau solde : 0\nSolde insuffisant : 1 > 0", hidden: true },
    ],
    solution: r`
      <?php
      class MontantInvalideException extends InvalidArgumentException {}
      class SoldeInsuffisantException extends RuntimeException {}

      function retirer(float $solde, float $montant): float
      {
          if ($montant <= 0) {
              throw new MontantInvalideException((string) $montant);
          }
          if ($montant > $solde) {
              throw new SoldeInsuffisantException("$montant > $solde");
          }
          return $solde - $montant;
      }

      $solde = (float) ${LIRE};
      while (($ligne = ${LIRE}) !== "") {
          try {
              $solde = retirer($solde, (float) $ligne);
              echo "Nouveau solde : $solde\n";
          } catch (MontantInvalideException $e) {
              echo "Montant invalide : ", $e->getMessage(), "\n";
          } catch (SoldeInsuffisantException $e) {
              echo "Solde insuffisant : ", $e->getMessage(), "\n";
          }
      }
    `,
    correction: "Chaque situation anormale a sa propre exception : l'appelant réagit précisément avec un **catch** par type.",
    points: 15,
  }),
  php({
    slug: "php-pdo-liste",
    lessonSlug: "php-pdo",
    title: "PDO : étudiants d'une filière",
    difficulty: "intermediaire",
    type: "completer",
    statement: r`
      La base (SQLite en mémoire) est créée par le code de départ. Lisez le nom d'une **filière** et affichez ses étudiants triés par nom, au format **nom (âge ans)**, avec une **requête préparée**. Si aucun étudiant ne correspond, affichez **Aucun étudiant**. Terminez par **Total : n**.
    `,
    examples: [{ input: "Informatique", output: "Kabila (21 ans)\nKito (23 ans)\nTotal : 2" }],
    starterCode: r`
      <?php
      $pdo = new PDO("sqlite::memory:", null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
      $pdo->exec("CREATE TABLE etudiants (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT, age INTEGER, filiere TEXT)");
      $pdo->exec("INSERT INTO etudiants (nom, age, filiere) VALUES ('Kito', 23, 'Informatique'), ('Mbuyi', 19, 'Droit'), ('Kabila', 21, 'Informatique')");

      $filiere = ${LIRE};
      // Requête préparée, puis affichage
    `,
    hints: ["$stmt = $pdo->prepare(\"SELECT nom, age FROM etudiants WHERE filiere = ? ORDER BY nom\");", "$stmt->execute([$filiere]); $lignes = $stmt->fetchAll();"],
    tests: [
      { input: "Informatique", expected: "Kabila (21 ans)\nKito (23 ans)\nTotal : 2" },
      { input: "Droit", expected: "Mbuyi (19 ans)\nTotal : 1" },
      { input: "' OR '1'='1", expected: "Aucun étudiant\nTotal : 0", hidden: true },
    ],
    solution: r`
      <?php
      $pdo = new PDO("sqlite::memory:", null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
      $pdo->exec("CREATE TABLE etudiants (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT, age INTEGER, filiere TEXT)");
      $pdo->exec("INSERT INTO etudiants (nom, age, filiere) VALUES ('Kito', 23, 'Informatique'), ('Mbuyi', 19, 'Droit'), ('Kabila', 21, 'Informatique')");

      $filiere = ${LIRE};
      $stmt = $pdo->prepare("SELECT nom, age FROM etudiants WHERE filiere = ? ORDER BY nom");
      $stmt->execute([$filiere]);
      $lignes = $stmt->fetchAll();
      if (!$lignes) {
          echo "Aucun étudiant\n";
      }
      foreach ($lignes as $e) {
          echo $e["nom"], " (", $e["age"], " ans)\n";
      }
      echo "Total : ", count($lignes), "\n";
    `,
    correction: "Le test caché tente une **injection SQL** : avec une requête préparée, elle est traitée comme un nom de filière inexistant.",
    points: 20,
  }),
  php({
    slug: "php-json-resume",
    lessonSlug: "php-json-api",
    title: "Décoder du JSON",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: r`
      L'entrée est un tableau JSON d'étudiants (**nom**, **notes**). Affichez un objet JSON (sur une ligne, accents non échappés) donnant pour chaque nom sa moyenne arrondie à 2 décimales, puis le nombre d'étudiants. Si le JSON est invalide, affichez **{"erreur":"JSON invalide"}**.
    `,
    examples: [{ input: '[{"nom":"Kito","notes":[12,15]},{"nom":"Élise","notes":[18]}]', output: '{"moyennes":{"Kito":13.5,"Élise":18},"nombre":2}' }],
    hints: ["json_decode($texte, true) ; null si invalide.", "json_encode($donnees, JSON_UNESCAPED_UNICODE)."],
    tests: [
      { input: '[{"nom":"Kito","notes":[12,15]},{"nom":"Élise","notes":[18]}]', expected: '{"moyennes":{"Kito":13.5,"Élise":18},"nombre":2}' },
      { input: "{pas du json", expected: '{"erreur":"JSON invalide"}' },
      { input: '[{"nom":"Ana","notes":[10,11,11]}]', expected: '{"moyennes":{"Ana":10.67},"nombre":1}', hidden: true },
    ],
    solution: r`
      <?php
      $donnees = json_decode(${LIRE}, true);
      if (!is_array($donnees)) {
          echo json_encode(["erreur" => "JSON invalide"]), "\n";
      } else {
          $moyennes = [];
          foreach ($donnees as $e) {
              $moyennes[$e["nom"]] = round(array_sum($e["notes"]) / count($e["notes"]), 2);
          }
          echo json_encode(["moyennes" => $moyennes, "nombre" => count($moyennes)], JSON_UNESCAPED_UNICODE), "\n";
      }
    `,
    correction: "json_decode renvoie **null** pour un JSON invalide ; **JSON_UNESCAPED_UNICODE** garde « Élise » lisible au lieu de \\u00c9lise.",
    points: 15,
  }),
  // ---------------------------------------------------------------- Niveau 4
  php({
    slug: "php-mot-de-passe-robuste",
    lessonSlug: "php-securite",
    title: "Politique de mots de passe et hachage",
    difficulty: "avance",
    type: "probleme",
    statement: r`
      Lisez un mot de passe. Vérifiez qu'il a **au moins 10 caractères**, **une majuscule**, **une minuscule**, **un chiffre** et **un caractère spécial**. Affichez chaque règle non respectée (dans cet ordre) :

      ~~~text
      Refusé : 10 caractères minimum
      Refusé : une majuscule
      Refusé : une minuscule
      Refusé : un chiffre
      Refusé : un caractère spécial
      ~~~

      Sinon, hachez-le avec **password_hash** et affichez **Accepté** puis **Vérification : oui** (résultat de password_verify) — jamais le mot de passe lui-même.
    `,
    examples: [{ input: "Kinshasa2026!", output: "Accepté\nVérification : oui" }],
    hints: ["preg_match('/[A-Z]/', $mdp)", "preg_match('/[^A-Za-z0-9]/', $mdp) pour un caractère spécial."],
    tests: [
      { input: "Kinshasa2026!", expected: "Accepté\nVérification : oui" },
      { input: "abc", expected: "Refusé : 10 caractères minimum\nRefusé : une majuscule\nRefusé : un chiffre\nRefusé : un caractère spécial" },
      { input: "MOTDEPASSE123", expected: "Refusé : une minuscule\nRefusé : un caractère spécial", hidden: true },
    ],
    solution: r`
      <?php
      $mdp = ${LIRE};
      $regles = [
          "10 caractères minimum" => strlen($mdp) >= 10,
          "une majuscule" => (bool) preg_match('/[A-Z]/', $mdp),
          "une minuscule" => (bool) preg_match('/[a-z]/', $mdp),
          "un chiffre" => (bool) preg_match('/[0-9]/', $mdp),
          "un caractère spécial" => (bool) preg_match('/[^A-Za-z0-9]/', $mdp),
      ];
      $refus = array_keys(array_filter($regles, fn(bool $ok): bool => !$ok));
      if ($refus) {
          foreach ($refus as $r) {
              echo "Refusé : $r\n";
          }
      } else {
          $empreinte = password_hash($mdp, PASSWORD_DEFAULT);
          echo "Accepté\n";
          echo "Vérification : ", password_verify($mdp, $empreinte) ? "oui" : "non", "\n";
      }
    `,
    correction: "Les règles sont décrites dans un tableau (lisible et facile à étendre). Le mot de passe n'est stocké que sous forme d'empreinte **password_hash**.",
    points: 20,
  }),
  php({
    slug: "php-panier-tests",
    lessonSlug: "php-architecture-tests",
    title: "Projet : panier testé automatiquement",
    difficulty: "avance",
    type: "mini_projet",
    statement: r`
      Écrivez une classe **Panier** : **ajouter(string $article, float $prix, int $quantite = 1)**, **total(): float**, **appliquerRemise(int $pourcent)** (refuse hors de 0–50 avec une InvalidArgumentException) et **nombreArticles(): int**.

      Le code de départ contient une petite suite de tests : votre classe doit les faire **tous réussir** (« 5/5 tests réussis »).
    `,
    examples: [{ input: "", output: "✓ panier vide\n✓ total\n✓ quantités\n✓ remise\n✓ remise refusée\n5/5 tests réussis" }],
    starterCode: r`
      <?php
      declare(strict_types=1);

      final class Panier
      {
          // à compléter
      }

      // ---- Tests (ne pas modifier) ----
      $reussis = 0;
      function test(string $nom, bool $ok, int &$reussis): void { echo $ok ? "✓" : "✗", " $nom\n"; $reussis += (int) $ok; }
      $p = new Panier();
      test("panier vide", $p->total() === 0.0 && $p->nombreArticles() === 0, $reussis);
      $p->ajouter("Cahier", 1500);
      $p->ajouter("Stylo", 500, 3);
      test("total", $p->total() === 3000.0, $reussis);
      test("quantités", $p->nombreArticles() === 4, $reussis);
      $p->appliquerRemise(10);
      test("remise", abs($p->total() - 2700.0) < 0.001, $reussis);
      try { $p->appliquerRemise(80); $refus = false; } catch (InvalidArgumentException) { $refus = true; }
      test("remise refusée", $refus, $reussis);
      echo "$reussis/5 tests réussis\n";
    `,
    hints: ["Stockez les lignes : [article, prix, quantité].", "total = somme(prix × quantité) × (1 − remise / 100).", "throw new InvalidArgumentException(\"Remise invalide\");"],
    tests: [{ input: "", expected: "✓ panier vide\n✓ total\n✓ quantités\n✓ remise\n✓ remise refusée\n5/5 tests réussis" }],
    solution: r`
      <?php
      declare(strict_types=1);

      final class Panier
      {
          private array $lignes = [];
          private int $remise = 0;

          public function ajouter(string $article, float $prix, int $quantite = 1): void
          {
              $this->lignes[] = ["article" => $article, "prix" => $prix, "quantite" => $quantite];
          }

          public function total(): float
          {
              $brut = array_sum(array_map(fn(array $l): float => $l["prix"] * $l["quantite"], $this->lignes));
              return (float) $brut * (1 - $this->remise / 100);
          }

          public function appliquerRemise(int $pourcent): void
          {
              if ($pourcent < 0 || $pourcent > 50) {
                  throw new InvalidArgumentException("Remise invalide");
              }
              $this->remise = $pourcent;
          }

          public function nombreArticles(): int
          {
              return array_sum(array_column($this->lignes, "quantite"));
          }
      }

      // ---- Tests (ne pas modifier) ----
      $reussis = 0;
      function test(string $nom, bool $ok, int &$reussis): void { echo $ok ? "✓" : "✗", " $nom\n"; $reussis += (int) $ok; }
      $p = new Panier();
      test("panier vide", $p->total() === 0.0 && $p->nombreArticles() === 0, $reussis);
      $p->ajouter("Cahier", 1500);
      $p->ajouter("Stylo", 500, 3);
      test("total", $p->total() === 3000.0, $reussis);
      test("quantités", $p->nombreArticles() === 4, $reussis);
      $p->appliquerRemise(10);
      test("remise", abs($p->total() - 2700.0) < 0.001, $reussis);
      try { $p->appliquerRemise(80); $refus = false; } catch (InvalidArgumentException) { $refus = true; }
      test("remise refusée", $refus, $reussis);
      echo "$reussis/5 tests réussis\n";
    `,
    correction: "C'est le principe du développement piloté par les tests : la spécification est écrite sous forme de tests, la classe est terminée quand ils réussissent tous.",
    points: 25,
  }),
];
