import { example, lesson, qcm, quiz, vraiFaux } from "../helpers";
import type { Course } from "../types";

const PHP = "php" as const;
/** Le code PHP est écrit tel quel (les « \n » restent des « \n » dans le code). */
const r = String.raw;

/**
 * Formation complète PHP — du débutant au professionnel.
 * Tous les exemples s'exécutent avec le vrai PHP 8.3 (WebAssembly) dans le
 * navigateur de l'étudiant ; ils sont aussi vérifiés par les tests avec PHP 8.3.
 */
export const php: Course = {
  slug: "php",
  code: "Parcours H",
  language: "php",
  category: "web",
  title: "Formation complète PHP — du débutant au professionnel",
  tagline: "Le langage serveur qui fait tourner une grande partie du web.",
  description:
    "PHP génère des pages web dynamiques, traite les formulaires, gère les sessions et dialogue avec les bases de données. Cette formation va des premières lignes (echo, variables, conditions) jusqu'à la programmation orientée objet, PDO, les API JSON, la sécurité et l'architecture professionnelle. Chaque exemple est exécuté par le vrai PHP 8.3 dans votre navigateur.",
  level: "debutant",
  prerequisites: ["Bases de HTML (parcours HTML, niveau 1).", "Notions d'algorithmique : variables, conditions, boucles (parcours Algorithmique, niveau 2)."],
  objectives: [
    "Écrire des pages PHP dynamiques et traiter des formulaires en toute sécurité.",
    "Structurer un programme avec des fonctions, des tableaux et des classes.",
    "Accéder à une base de données avec PDO et des requêtes préparées.",
    "Appliquer les règles de sécurité professionnelles (XSS, injection SQL, mots de passe, sessions).",
  ],
  durationHours: 60,
  status: "publie",
  modules: [
    // =====================================================================
    // NIVEAU 1
    // =====================================================================
    {
      slug: "php-premiers-pas",
      title: "Premiers pas en PHP",
      lessons: [
        lesson({
          slug: "php-introduction",
          title: "Qu'est-ce que PHP ? Le fonctionnement côté serveur",
          durationMinutes: 30,
          objectives: ["Expliquer le rôle d'un langage côté serveur.", "Écrire un premier script avec echo et print.", "Mélanger HTML et PHP dans une page."],
          content: r`
            ## PHP, un langage côté serveur

            **PHP** (PHP: Hypertext Preprocessor) est un langage de programmation créé en 1994 pour fabriquer des **pages web dynamiques**. Il fait fonctionner WordPress, de nombreux sites d'universités, de boutiques et d'administrations.

            Contrairement à JavaScript dans le navigateur, le code PHP s'exécute **sur le serveur** :

            1. le navigateur demande une page, par exemple **index.php** ;
            2. le serveur web (Apache, Nginx…) confie le fichier à l'**interpréteur PHP** ;
            3. PHP exécute le code et **produit du HTML** ;
            4. le serveur renvoie ce HTML au navigateur, qui l'affiche.

            Le visiteur ne voit **jamais** le code PHP : seulement le résultat. C'est ce qui permet de cacher les mots de passe de la base de données ou les règles de calcul.

            ## Les balises PHP

            Le code PHP se place entre **<?php** et **?>**. Tout ce qui est en dehors est envoyé tel quel au navigateur.

            ~~~php
            <?php
            echo "Bonjour UPL !";
            ~~~

            Dans un fichier qui ne contient que du PHP, on **omet** la balise fermante ?> : cela évite d'envoyer par erreur des espaces ou des lignes vides.

            ## Afficher avec echo et print

            - **echo** affiche une ou plusieurs valeurs, séparées par des virgules ;
            - **print** affiche une seule valeur (et renvoie 1) ;
            - le caractère **\n** passe à la ligne dans la console ; dans une page HTML, on utilise la balise **<br>** ou des paragraphes.

            Chaque instruction se termine par un **point-virgule**. L'oublier est l'erreur la plus fréquente : PHP signale alors une **Parse error** avec le numéro de ligne.

            ## Les commentaires

            ~~~php
            <?php
            // commentaire sur une ligne
            # autre commentaire sur une ligne
            /* commentaire
               sur plusieurs lignes */
            ~~~

            ## Mélanger HTML et PHP

            On peut ouvrir et fermer PHP au milieu d'une page. La forme courte **<?= expression ?>** affiche directement une valeur :

            ~~~php
            <h1>Bienvenue</h1>
            <p>Nous sommes le <?= date("d/m/Y") ?>.</p>
            ~~~

            ## Exécuter PHP sur UPL CODE ACADEMY MK

            Sur la plateforme, votre code est exécuté par le **vrai PHP 8.3**, compilé en WebAssembly, **dans votre navigateur** : rien n'est envoyé au serveur. Si le programme produit du HTML, l'éditeur affiche aussi l'**aperçu de la page**. En entreprise, on installe PHP sur un serveur (ou localement avec XAMPP, WAMP, Laragon ou la commande **php -S localhost:8000**).
          `,
          examples: [
            example(PHP, "Premier programme", r`
              <?php
              echo "Bonjour UPL !\n";
              echo "PHP version ", PHP_VERSION, "\n";
              print "Bienvenue à l'université\n";
            `),
            example(PHP, "Une page HTML générée par PHP", r`
              <?php $universite = "UPL"; ?>
              <!DOCTYPE html>
              <html lang="fr">
              <body>
                <h1>Bienvenue à l'<?= $universite ?></h1>
                <p>Page générée le <?= date("d/m/Y") ?> à <?= date("H:i") ?>.</p>
              </body>
              </html>
            `),
          ],
          summary: [
            "PHP s'exécute sur le serveur et renvoie du HTML au navigateur.",
            "Le code se place entre <?php et ?> ; chaque instruction finit par un point-virgule.",
            "echo et print affichent ; <?= ?> affiche une valeur au milieu du HTML.",
          ],
          quiz: quiz("php-introduction-quiz", "Vérification — Introduction à PHP", [
            qcm("Où le code PHP est-il exécuté sur un site classique ?", ["Dans le navigateur du visiteur", "Sur le serveur web", "Dans la base de données", "Dans le fichier CSS"], 1),
            vraiFaux("Le visiteur d'un site peut lire le code PHP avec « Afficher la source ».", false, "Il ne reçoit que le HTML produit par PHP."),
            qcm("Quelle balise ouvre un bloc PHP ?", ["<php>", "<?php", "<script php>", "{php}"], 1),
            qcm("Que produit l'oubli d'un point-virgule ?", ["Un avertissement ignoré", "Une Parse error avec le numéro de ligne", "Rien", "Une page blanche sans message"], 1),
          ]),
          exerciseSlugs: ["php-bonjour"],
        }),
        lesson({
          slug: "php-variables-types",
          title: "Variables, types et constantes",
          durationMinutes: 35,
          prerequisites: ["Qu'est-ce que PHP ?"],
          objectives: ["Déclarer et utiliser des variables.", "Reconnaître les types de PHP.", "Définir des constantes.", "Concaténer et insérer des variables dans une chaîne."],
          content: r`
            ## Les variables

            Une variable est un **nom associé à une valeur**. En PHP, son nom commence toujours par **$** :

            ~~~php
            <?php
            $nom = "Kito";
            $age = 21;
            ~~~

            Règles : le nom commence par une lettre ou _, puis lettres, chiffres ou _ ; il est **sensible à la casse** ($age et $Age sont deux variables). Il n'y a pas de déclaration de type : la variable prend le type de la valeur qu'on lui donne (typage **dynamique**).

            ## Les types

            | Type | Exemple | Rôle |
            |---|---|---|
            | int | 42, -7 | nombres entiers |
            | float | 3.14, 12.5 | nombres à virgule |
            | string | "UPL", 'Kinshasa' | texte |
            | bool | true, false | vrai ou faux |
            | null | null | absence de valeur |
            | array | [1, 2, 3] | liste ou tableau associatif |

            **var_dump()** affiche le type et la valeur : c'est l'outil de débogage le plus utile. **gettype()** renvoie le nom du type.

            ## Chaînes : guillemets doubles ou simples

            - entre **guillemets doubles**, les variables sont remplacées par leur valeur et **\n** est un retour à la ligne : "Bonjour $nom\n" ;
            - entre **apostrophes**, le texte est pris tel quel : 'Bonjour $nom' affiche littéralement $nom.

            Pour coller une variable à du texte, on l'entoure d'accolades : "{$nom}s".

            ## La concaténation

            L'opérateur **.** (point) colle deux chaînes ; **.=** ajoute à la fin d'une variable :

            ~~~php
            <?php
            $message = "Bonjour " . $nom;
            $message .= " !";
            ~~~

            Attention : en PHP, **+** additionne des nombres, il ne concatène pas.

            ## Les constantes

            Une constante ne change jamais. Son nom s'écrit sans $, en majuscules par convention :

            ~~~php
            <?php
            const TAUX_TVA = 0.16;
            define("UNIVERSITE", "UPL");
            ~~~

            PHP fournit aussi des constantes prédéfinies : **PHP_VERSION**, **PHP_EOL** (fin de ligne), **PHP_INT_MAX**.

            ## Conversions

            On convertit avec **(int)**, **(float)**, **(string)**, **(bool)** : (int) "25 ans" vaut 25. Les données lues au clavier ou dans un formulaire sont **toujours des chaînes** : il faut les convertir avant de calculer.
          `,
          examples: [
            example(PHP, "Types et var_dump", r`
              <?php
              $nom = "Kito";
              $age = 21;
              $moyenne = 14.5;
              $inscrit = true;
              var_dump($nom, $age, $moyenne, $inscrit);
              echo gettype($moyenne), "\n";
            `),
            example(PHP, "Concaténation, interpolation et constantes", r`
              <?php
              const UNIVERSITE = "UPL";
              $prenom = "Grace";
              $annee = 2;
              echo "Étudiante : " . $prenom . "\n";
              echo "$prenom est en {$annee}e année à " . UNIVERSITE . "\n";
              echo 'Entre apostrophes : $prenom', "\n";
              $age = (int) "19 ans";
              echo "Dans un an : ", $age + 1, " ans\n";
            `),
          ],
          summary: [
            "Une variable commence par $ et prend le type de sa valeur.",
            "Guillemets doubles : variables remplacées ; apostrophes : texte brut.",
            "Le point concatène ; const et define créent des constantes.",
            "Les entrées utilisateur sont des chaînes : on les convertit avant de calculer.",
          ],
          quiz: quiz("php-variables-quiz", "Vérification — Variables et types", [
            qcm("Quel nom de variable est valide ?", ["$2nom", "$nom_etudiant", "nom", "$nom-etudiant"], 1),
            qcm("Qu'affiche echo 'Total : $x'; ?", ["Total : suivi de la valeur de $x", "Total : $x", "Une erreur", "Rien"], 1),
            qcm("Quel opérateur concatène deux chaînes ?", ["+", ".", "&", ","], 1),
            qcm("Que vaut (int) \"12abc\" ?", ["0", "12", "une erreur", "12abc"], 1),
          ]),
          exerciseSlugs: ["php-presentation"],
        }),
        lesson({
          slug: "php-operateurs",
          title: "Opérateurs et expressions",
          durationMinutes: 30,
          prerequisites: ["Variables et types"],
          objectives: ["Calculer avec les opérateurs arithmétiques.", "Comparer avec == et ===.", "Combiner des conditions avec les opérateurs logiques."],
          content: r`
            ## Opérateurs arithmétiques

            | Opérateur | Sens | Exemple | Résultat |
            |---|---|---|---|
            | + - * | addition, soustraction, multiplication | 7 * 3 | 21 |
            | / | division (toujours exacte) | 7 / 2 | 3.5 |
            | % | reste de la division entière | 17 % 5 | 2 |
            | ** | puissance | 2 ** 10 | 1024 |
            | intdiv() | quotient entier | intdiv(17, 5) | 3 |

            Les priorités sont celles des mathématiques : * / % avant + -. Utilisez des parenthèses en cas de doute.

            ## Affectation combinée et incrémentation

            **$x += 5** équivaut à **$x = $x + 5** (de même -=, *=, /=, .=). **$i++** ajoute 1, **$i--** retire 1.

            ## Comparaison : == ou === ?

            - **==** compare les valeurs après conversion : "5" == 5 est **vrai** ;
            - **===** compare la valeur **et** le type : "5" === 5 est **faux**.

            En pratique, préférez **===** et **!==** : ils évitent des surprises. Les autres comparateurs sont < > <= >= et **<=>** (« vaisseau spatial ») qui renvoie -1, 0 ou 1, très utile pour trier.

            ## Opérateurs logiques

            | Opérateur | Vrai si… |
            |---|---|
            | && (et) | les deux conditions sont vraies |
            | \|\| (ou) | au moins une condition est vraie |
            | ! (non) | la condition est fausse |

            ## L'opérateur ?? (fusion null)

            **$a ?? $b** vaut $a s'il existe et n'est pas null, sinon $b. Il est très utilisé avec les formulaires : **$_GET["page"] ?? "accueil"**.

            ## Arrondir et formater

            **round($x, 2)** arrondit à 2 décimales ; **number_format($x, 2, ",", " ")** affiche 1 234,50 ; **sprintf("%.1f", $x)** formate avec une décimale.
          `,
          examples: [
            example(PHP, "Calculs et comparaisons", r`
              <?php
              $a = 17;
              $b = 5;
              echo "Somme : ", $a + $b, "\n";
              echo "Division : ", $a / $b, "\n";
              echo "Quotient entier : ", intdiv($a, $b), "\n";
              echo "Reste : ", $a % $b, "\n";
              echo "Puissance : ", 2 ** 8, "\n";
              var_dump("5" == 5, "5" === 5);
              echo "Moyenne : ", number_format(13.456, 2, ",", " "), "\n";
            `),
          ],
          summary: ["/ donne un résultat exact ; % le reste ; intdiv le quotient entier.", "=== compare valeur et type : à préférer à ==.", "&&, || et ! combinent des conditions ; ?? donne une valeur par défaut."],
          quiz: quiz("php-operateurs-quiz", "Vérification — Opérateurs", [
            qcm("Que vaut 17 % 5 ?", ["3", "2", "3.4", "12"], 1),
            qcm("Que vaut 7 / 2 en PHP ?", ["3", "3.5", "4", "une erreur"], 1),
            qcm("\"10\" === 10 vaut…", ["true", "false"], 1),
            qcm("Que vaut $x ?? \"défaut\" si $x n'existe pas ?", ["null", "une erreur", "\"défaut\"", "false"], 2),
          ]),
          exerciseSlugs: ["php-calculs"],
        }),
        lesson({
          slug: "php-conditions-simples",
          title: "Premières conditions et page dynamique",
          durationMinutes: 35,
          prerequisites: ["Opérateurs et expressions"],
          objectives: ["Écrire if / else.", "Utiliser l'opérateur ternaire.", "Construire une page personnalisée selon des données."],
          content: r`
            ## if et else

            ~~~php
            <?php
            $note = 12;
            if ($note >= 10) {
                echo "Admis";
            } else {
                echo "Ajourné";
            }
            ~~~

            La condition est entre **parenthèses**, le bloc entre **accolades**. Même pour une seule instruction, gardez les accolades : le code reste lisible et sans piège.

            ## Conditions composées

            ~~~php
            <?php
            if ($age >= 18 && $inscrit) {
                echo "Accès autorisé";
            }
            ~~~

            ## L'opérateur ternaire

            Pour choisir entre deux valeurs en une ligne : **condition ? valeur_si_vrai : valeur_si_faux**.

            ~~~php
            <?php
            $statut = $note >= 10 ? "Admis" : "Ajourné";
            ~~~

            ## Valeurs considérées comme fausses

            Dans une condition, sont fausses : **false**, **0**, **0.0**, **""**, **"0"**, **null** et le tableau vide **[]**. Tout le reste est vrai. Pour éviter les surprises, comparez explicitement : if ($texte !== "").

            ## Syntaxe alternative dans le HTML

            Dans une page, la forme **if (...): … endif;** se lit mieux :

            ~~~php
            <?php if ($connecte): ?>
              <p>Bonjour !</p>
            <?php else: ?>
              <p>Veuillez vous connecter.</p>
            <?php endif; ?>
            ~~~

            ## Projet : page personnalisée

            On combine variables, conditions et HTML : la page salue l'étudiant selon l'heure, affiche sa filière et un message adapté à sa moyenne. C'est le principe de toute page dynamique : **les mêmes fichiers produisent un affichage différent selon les données**.
          `,
          examples: [
            example(PHP, "Page personnalisée", r`
              <?php
              $prenom = "Grace";
              $filiere = "Informatique";
              $moyenne = 15.5;
              $heure = 9;
              $salutation = $heure < 12 ? "Bonjour" : "Bonsoir";
              ?>
              <h1><?= $salutation ?>, <?= htmlspecialchars($prenom) ?> !</h1>
              <p>Filière : <?= htmlspecialchars($filiere) ?></p>
              <?php if ($moyenne >= 14): ?>
                <p>Excellent travail : mention Bien.</p>
              <?php elseif ($moyenne >= 10): ?>
                <p>Vous êtes admise.</p>
              <?php else: ?>
                <p>Courage pour la session de rattrapage.</p>
              <?php endif; ?>
            `),
          ],
          summary: ["if / else choisit entre deux blocs ; les accolades sont recommandées.", "Le ternaire choisit une valeur en une ligne.", "La syntaxe if: … endif; rend les pages HTML lisibles."],
          quiz: quiz("php-conditions-simples-quiz", "Vérification — Conditions", [
            qcm("Que vaut $x = 8 >= 10 ? \"A\" : \"B\"; ?", ["A", "B", "true", "false"], 1),
            qcm("Laquelle de ces valeurs est considérée comme vraie ?", ["0", "\"\"", "\"0\"", "\"non\""], 3),
            vraiFaux("La condition d'un if s'écrit entre parenthèses.", true),
          ]),
          exerciseSlugs: ["php-admis", "php-page-personnalisee"],
        }),
      ],
    },
    // =====================================================================
    // NIVEAU 2
    // =====================================================================
    {
      slug: "php-controle-donnees",
      title: "Structures de contrôle, tableaux et fonctions",
      lessons: [
        lesson({
          slug: "php-conditions-switch-match",
          title: "if / elseif, switch et match",
          durationMinutes: 30,
          prerequisites: ["Premières conditions"],
          objectives: ["Enchaîner plusieurs cas avec elseif.", "Utiliser switch.", "Utiliser l'expression match de PHP 8."],
          content: r`
            ## elseif

            ~~~php
            <?php
            if ($note >= 16) {
                $mention = "Très bien";
            } elseif ($note >= 14) {
                $mention = "Bien";
            } elseif ($note >= 12) {
                $mention = "Assez bien";
            } elseif ($note >= 10) {
                $mention = "Passable";
            } else {
                $mention = "Ajourné";
            }
            ~~~

            Les conditions sont testées **dans l'ordre** : la première vraie l'emporte. Placez donc les cas les plus restrictifs en premier.

            ## switch

            **switch** compare une valeur à une liste de cas. N'oubliez pas **break**, sinon l'exécution continue dans le cas suivant :

            ~~~php
            <?php
            switch ($jour) {
                case "samedi":
                case "dimanche":
                    echo "Week-end";
                    break;
                default:
                    echo "Jour de cours";
            }
            ~~~

            ## match (PHP 8)

            **match** est une expression : elle **renvoie** une valeur, compare avec **===**, n'a pas besoin de break et lève une erreur si aucun cas ne correspond (sauf default).

            ~~~php
            <?php
            $libelle = match ($code) {
                "INF" => "Informatique",
                "DRT" => "Droit",
                "ECO", "GES" => "Économie et gestion",
                default => "Filière inconnue",
            };
            ~~~

            Avec **match (true)**, chaque branche peut être une condition : c'est une autre façon d'écrire le calcul d'une mention.
          `,
          examples: [
            example(PHP, "Mention avec match (true)", r`
              <?php
              foreach ([17, 13, 9] as $note) {
                  $mention = match (true) {
                      $note >= 16 => "Très bien",
                      $note >= 14 => "Bien",
                      $note >= 12 => "Assez bien",
                      $note >= 10 => "Passable",
                      default => "Ajourné",
                  };
                  echo "$note/20 : $mention\n";
              }
            `),
          ],
          summary: ["elseif enchaîne les cas, testés dans l'ordre.", "switch exige break à la fin de chaque cas.", "match renvoie une valeur, compare avec === et n'a pas besoin de break."],
          quiz: quiz("php-switch-match-quiz", "Vérification — elseif, switch et match", [
            qcm("Que se passe-t-il si on oublie break dans un switch ?", ["Erreur de syntaxe", "L'exécution continue dans le cas suivant", "Rien", "Le switch recommence"], 1),
            qcm("Quelle comparaison utilise match ?", ["==", "===", "<=>", "aucune"], 1),
            vraiFaux("match peut renvoyer une valeur directement dans une variable.", true),
          ]),
          exerciseSlugs: ["php-mention"],
        }),
        lesson({
          slug: "php-boucles",
          title: "Les boucles : while, for et foreach",
          durationMinutes: 35,
          prerequisites: ["if / elseif, switch et match"],
          objectives: ["Répéter des instructions avec while, do…while et for.", "Parcourir un tableau avec foreach.", "Contrôler une boucle avec break et continue."],
          content: r`
            ## while

            Répète tant que la condition est vraie. La condition est testée **avant** chaque tour :

            ~~~php
            <?php
            $i = 1;
            while ($i <= 5) {
                echo $i, " ";
                $i++;
            }
            ~~~

            Oublier **$i++** crée une **boucle infinie** : sur la plateforme, l'exécution est arrêtée au bout de 10 secondes.

            ## do … while

            Le corps s'exécute **au moins une fois**, la condition est testée après.

            ## for

            Idéal quand on connaît le nombre de tours : **for (initialisation; condition; pas)**.

            ~~~php
            <?php
            for ($i = 1; $i <= 10; $i++) {
                echo "7 x $i = ", 7 * $i, "\n";
            }
            ~~~

            ## foreach

            La boucle la plus utilisée en PHP : elle parcourt un tableau élément par élément.

            ~~~php
            <?php
            foreach ($etudiants as $nom) { … }
            foreach ($notes as $matiere => $note) { … }
            ~~~

            ## break et continue

            **break** sort de la boucle ; **continue** passe directement au tour suivant.

            ## Générer du HTML avec une boucle

            Une boucle permet de produire une liste ou un tableau HTML à partir de données : c'est ainsi qu'un site affiche la liste des étudiants, des produits ou des articles.
          `,
          examples: [
            example(PHP, "Table de multiplication et liste HTML", r`
              <?php
              for ($i = 1; $i <= 5; $i++) {
                  echo "3 x $i = ", 3 * $i, "\n";
              }
              $filieres = ["Informatique", "Droit", "Médecine"];
              echo "<ul>\n";
              foreach ($filieres as $f) {
                  echo "  <li>", htmlspecialchars($f), "</li>\n";
              }
              echo "</ul>\n";
            `),
          ],
          summary: ["while teste avant, do…while après (au moins un tour).", "for convient quand le nombre de tours est connu.", "foreach parcourt un tableau, avec ou sans les clés."],
          quiz: quiz("php-boucles-quiz", "Vérification — Boucles", [
            qcm("Combien de tours fait for ($i = 0; $i < 5; $i++) ?", ["4", "5", "6", "infini"], 1),
            qcm("Quelle boucle s'exécute au moins une fois ?", ["while", "for", "do … while", "foreach"], 2),
            qcm("Que fait continue ?", ["Sort de la boucle", "Passe au tour suivant", "Recommence au premier tour", "Arrête le script"], 1),
          ]),
          exerciseSlugs: ["php-table-multiplication", "php-somme-entiers"],
        }),
        lesson({
          slug: "php-tableaux",
          title: "Tableaux simples et associatifs",
          durationMinutes: 40,
          prerequisites: ["Les boucles"],
          objectives: ["Créer et modifier un tableau indexé.", "Utiliser un tableau associatif clé ⇒ valeur.", "Employer les fonctions de tableaux courantes."],
          content: r`
            ## Tableaux indexés

            ~~~php
            <?php
            $notes = [12, 15, 9];
            echo $notes[0];      // 12 : les indices commencent à 0
            $notes[] = 18;       // ajoute à la fin
            echo count($notes);  // 4
            ~~~

            ## Tableaux associatifs

            Chaque valeur est rangée sous une **clé** (souvent un texte) :

            ~~~php
            <?php
            $etudiant = [
                "nom" => "Kito",
                "filiere" => "Informatique",
                "age" => 21,
            ];
            echo $etudiant["nom"];
            ~~~

            ## Tableaux à plusieurs dimensions

            Une liste d'étudiants est un tableau de tableaux associatifs — exactement ce que renvoie une base de données :

            ~~~php
            <?php
            $etudiants = [
                ["nom" => "Kito", "moyenne" => 14.5],
                ["nom" => "Mbuyi", "moyenne" => 11.0],
            ];
            echo $etudiants[1]["nom"]; // Mbuyi
            ~~~

            ## Fonctions utiles

            | Fonction | Rôle |
            |---|---|
            | count($t) | nombre d'éléments |
            | in_array($v, $t, true) | la valeur est-elle présente ? |
            | array_key_exists($k, $t) | la clé existe-t-elle ? |
            | array_sum($t), max($t), min($t) | somme, maximum, minimum |
            | sort / rsort | trie les valeurs (croissant / décroissant) |
            | asort / arsort | trie en gardant les clés |
            | ksort | trie par clé |
            | implode(", ", $t) | joint en une chaîne |
            | explode(" ", $texte) | découpe une chaîne en tableau |
            | array_map / array_filter | transforme / filtre |

            ## Afficher un tableau pour déboguer

            **print_r($t)** affiche la structure lisiblement ; **var_dump($t)** donne en plus les types.
          `,
          examples: [
            example(PHP, "Notes d'un étudiant", r`
              <?php
              $notes = ["Algorithmique" => 15, "Mathématiques" => 11, "Anglais" => 13];
              foreach ($notes as $matiere => $note) {
                  echo str_pad($matiere, 15), " : $note\n";
              }
              $moyenne = array_sum($notes) / count($notes);
              echo "Moyenne : ", round($moyenne, 2), "\n";
              arsort($notes);
              echo "Meilleure matière : ", array_key_first($notes), "\n";
              echo "Liste : ", implode(", ", array_keys($notes)), "\n";
            `),
          ],
          summary: ["Les indices commencent à 0 ; $t[] = … ajoute à la fin.", "Un tableau associatif range les valeurs sous des clés.", "count, in_array, sort, implode et explode sont à connaître."],
          quiz: quiz("php-tableaux-quiz", "Vérification — Tableaux", [
            qcm("Avec $t = [4, 8, 15], que vaut $t[1] ?", ["4", "8", "15", "erreur"], 1),
            qcm("Quelle fonction donne le nombre d'éléments ?", ["length()", "size()", "count()", "len()"], 2),
            qcm("Que renvoie explode(\",\", \"a,b,c\") ?", ["\"abc\"", "[\"a\", \"b\", \"c\"]", "3", "\"a b c\""], 1),
          ]),
          exerciseSlugs: ["php-moyenne-notes", "php-plus-grand"],
        }),
        lesson({
          slug: "php-fonctions-chaines-dates",
          title: "Fonctions, chaînes de caractères et dates",
          durationMinutes: 45,
          prerequisites: ["Tableaux simples et associatifs"],
          objectives: ["Écrire des fonctions typées avec paramètres et valeur de retour.", "Manipuler les chaînes avec les fonctions natives.", "Afficher et calculer des dates."],
          content: r`
            ## Déclarer une fonction

            ~~~php
            <?php
            function moyenne(array $notes): float
            {
                return array_sum($notes) / count($notes);
            }
            echo moyenne([12, 14, 16]); // 14
            ~~~

            - les **paramètres** reçoivent les valeurs passées à l'appel ;
            - **return** renvoie le résultat et termine la fonction ;
            - les **types** (array, float, int, string, bool, ?string pour « chaîne ou null ») documentent le code et détectent les erreurs. Avec **declare(strict_types=1);** en première ligne, PHP refuse les conversions implicites.

            ## Valeurs par défaut et paramètres nommés

            ~~~php
            <?php
            function saluer(string $nom, string $formule = "Bonjour"): string
            {
                return "$formule, $nom !";
            }
            echo saluer("Kito");
            echo saluer(nom: "Grace", formule: "Bonsoir");
            ~~~

            ## Portée des variables

            Une variable créée dans une fonction est **locale** : elle n'existe pas à l'extérieur, et la fonction ne voit pas les variables extérieures. On transmet les données par **paramètres**, pas par variables globales.

            ## Fonctions anonymes et fléchées

            ~~~php
            <?php
            $carres = array_map(fn($x) => $x * $x, [1, 2, 3]);
            ~~~

            ## Fonctions de chaînes

            | Fonction | Exemple | Résultat |
            |---|---|---|
            | strlen | strlen("UPL") | 3 (en octets) |
            | strtoupper / strtolower | strtoupper("upl") | UPL |
            | ucfirst / ucwords | ucwords("jean paul") | Jean Paul |
            | trim | trim("  a  ") | a |
            | str_replace | str_replace("a", "o", "papa") | popo |
            | substr | substr("Kinshasa", 0, 4) | Kins |
            | str_contains | str_contains("UPL Code", "Code") | true |
            | strrev, str_repeat | str_repeat("-", 5) | ----- |
            | sprintf | sprintf("%05.1f", 3.14159) | 003.1 |

            Les accents comptent pour plusieurs octets : strlen("é") vaut 2. Les fonctions **mb_strlen**, **mb_strtoupper** (extension mbstring) comptent les caractères ; elles existent sur la plupart des serveurs, mais pas dans le PHP du navigateur de la plateforme.

            ## Dates

            **date("d/m/Y H:i")** formate la date courante. La classe **DateTime** calcule : ajout de jours, différence entre deux dates.

            ~~~php
            <?php
            $debut = new DateTime("2026-10-01");
            $fin = new DateTime("2026-12-20");
            echo $debut->diff($fin)->days, " jours";
            ~~~
          `,
          examples: [
            example(PHP, "Fonctions et chaînes", r`
              <?php
              declare(strict_types=1);

              function initiales(string $nomComplet): string
              {
                  $mots = explode(" ", trim($nomComplet));
                  $lettres = array_map(fn(string $m): string => strtoupper(substr($m, 0, 1)), $mots);
                  return implode(".", $lettres) . ".";
              }

              function mention(float $moyenne): string
              {
                  return match (true) {
                      $moyenne >= 14 => "Bien",
                      $moyenne >= 10 => "Passable",
                      default => "Ajourné",
                  };
              }

              echo initiales("jean paul kabila"), "\n";
              echo mention(15.2), "\n";
              echo sprintf("Moyenne : %.2f/20", 13.456), "\n";
            `),
            example(PHP, "Calculer avec des dates", r`
              <?php
              $rentree = new DateTime("2026-10-05");
              $examens = new DateTime("2027-01-18");
              $jours = $rentree->diff($examens)->days;
              echo "Rentrée : ", $rentree->format("d/m/Y"), "\n";
              echo "Il reste $jours jours avant les examens.\n";
              $rentree->modify("+7 days");
              echo "Une semaine après la rentrée : ", $rentree->format("l d/m/Y"), "\n";
            `),
          ],
          summary: [
            "function nom(type $param): typeRetour { … return … }",
            "Les variables d'une fonction sont locales ; on passe les données en paramètres.",
            "strlen, strtoupper, str_replace, substr, trim, sprintf manipulent les chaînes.",
            "date() formate ; DateTime calcule des écarts et des décalages.",
          ],
          quiz: quiz("php-fonctions-quiz", "Vérification — Fonctions", [
            qcm("Que renvoie une fonction sans return ?", ["0", "false", "null", "une erreur"], 2),
            qcm("Une variable créée dans une fonction est…", ["globale", "locale à la fonction", "constante", "partagée"], 1),
            qcm("Que vaut substr(\"Kinshasa\", 0, 3) ?", ["Kin", "Kins", "asa", "Kinshasa"], 0),
            qcm("Que vaut ucfirst(\"upl\") ?", ["UPL", "Upl", "upL", "upl"], 1),
          ]),
          exerciseSlugs: ["php-fonction-mention", "php-chaines"],
        }),
        lesson({
          slug: "php-formulaires",
          title: "Formulaires GET et POST, validation et sécurité",
          durationMinutes: 45,
          prerequisites: ["Fonctions, chaînes et dates", "Formulaires HTML (parcours HTML)"],
          objectives: ["Recevoir des données avec $_GET et $_POST.", "Valider et nettoyer les entrées.", "Protéger l'affichage contre le XSS avec htmlspecialchars."],
          content: r`
            ## Le cycle d'un formulaire

            ~~~html
            <form method="post" action="inscription.php">
              <input name="nom">
              <input name="age" type="number">
              <button>Envoyer</button>
            </form>
            ~~~

            À l'envoi, le navigateur transmet les champs au fichier **action**. PHP les range dans des **tableaux superglobaux** :

            - **$_GET** : données dans l'adresse (inscription.php?nom=Kito) — pour rechercher, filtrer, paginer ;
            - **$_POST** : données dans le corps de la requête — pour créer, modifier, se connecter ;
            - **$_SERVER["REQUEST_METHOD"]** indique la méthode utilisée.

            ## Ne jamais faire confiance aux données reçues

            Un utilisateur peut envoyer **n'importe quoi** : champ vide, texte au lieu d'un nombre, code HTML ou JavaScript. Trois règles :

            1. **vérifier la présence** : $_POST["nom"] ?? "" ;
            2. **valider** : longueur, format, plage de valeurs ; **filter_var($email, FILTER_VALIDATE_EMAIL)**, **filter_var($age, FILTER_VALIDATE_INT, ["options" => ["min_range" => 15]])** ;
            3. **échapper à l'affichage** : **htmlspecialchars($texte)** transforme < > " ' & en entités HTML. Sans cela, un visiteur peut injecter un script dans votre page : c'est la faille **XSS**.

            ## Collecter les erreurs

            On accumule les messages d'erreur dans un tableau ; si le tableau est vide, le formulaire est valide :

            ~~~php
            <?php
            $erreurs = [];
            if ($nom === "") {
                $erreurs["nom"] = "Le nom est obligatoire.";
            }
            if (!$erreurs) {
                // enregistrer, puis rediriger
            }
            ~~~

            ## Rediriger après un POST

            Après un traitement réussi, on redirige avec **header("Location: merci.php"); exit;** : actualiser la page ne renverra pas le formulaire une deuxième fois (motif « Post/Redirect/Get »).

            ## Sur la plateforme

            Dans l'éditeur, il n'y a pas de vrai navigateur qui envoie le formulaire : les exemples **simulent** les données reçues en remplissant $_POST au début du script. Sur un vrai serveur, PHP remplit ces tableaux tout seul. Dans UPL IDE, les paramètres d'adresse peuvent aussi être fournis à $_GET.
          `,
          examples: [
            example(PHP, "Validation d'un formulaire d'inscription", r`
              <?php
              // Simulation des données envoyées par le formulaire (sur un vrai serveur, PHP les remplit).
              $_POST = ["nom" => "  Kito  ", "email" => "kito@exemple", "age" => "17", "commentaire" => "<script>alert(1)</script>"];

              $nom = trim($_POST["nom"] ?? "");
              $email = trim($_POST["email"] ?? "");
              $age = filter_var($_POST["age"] ?? "", FILTER_VALIDATE_INT, ["options" => ["min_range" => 18, "max_range" => 99]]);
              $erreurs = [];
              if ($nom === "") {
                  $erreurs[] = "Le nom est obligatoire.";
              }
              if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                  $erreurs[] = "Adresse e-mail invalide.";
              }
              if ($age === false) {
                  $erreurs[] = "L'âge doit être un entier entre 18 et 99.";
              }
              foreach ($erreurs as $e) {
                  echo "Erreur : $e\n";
              }
              echo "Commentaire affiché sans danger : ", htmlspecialchars($_POST["commentaire"]), "\n";
            `),
          ],
          summary: [
            "$_GET lit l'adresse, $_POST le corps de la requête.",
            "Toujours vérifier, valider (filter_var) puis échapper (htmlspecialchars).",
            "Après un POST réussi : redirection avec header(\"Location: …\").",
          ],
          quiz: quiz("php-formulaires-quiz", "Vérification — Formulaires", [
            qcm("Quelle méthode utiliser pour envoyer un mot de passe ?", ["GET", "POST"], 1),
            qcm("Quelle fonction protège l'affichage contre le XSS ?", ["trim", "htmlspecialchars", "strip", "addslashes"], 1),
            vraiFaux("Un champ number du navigateur garantit que $_POST contient un nombre.", false, "Les données peuvent être modifiées avant l'envoi : on valide toujours côté serveur."),
            qcm("Que renvoie filter_var(\"abc\", FILTER_VALIDATE_INT) ?", ["0", "false", "null", "\"abc\""], 1),
          ]),
          exerciseSlugs: ["php-validation-age", "php-calculatrice"],
        }),
        lesson({
          slug: "php-sessions-cookies-include",
          title: "Sessions, cookies, include et gestion des erreurs",
          durationMinutes: 40,
          prerequisites: ["Formulaires GET et POST"],
          objectives: ["Conserver des informations entre les pages avec les sessions.", "Utiliser les cookies à bon escient.", "Découper un site en fichiers avec include et require.", "Lire et corriger les messages d'erreur de PHP."],
          content: r`
            ## Pourquoi les sessions ?

            HTTP « oublie » tout entre deux pages. Pour qu'un étudiant reste connecté, PHP crée une **session** : un identifiant aléatoire est stocké dans un cookie du navigateur, et les données restent **sur le serveur**.

            ~~~php
            <?php
            session_start();                 // au tout début, avant tout affichage
            $_SESSION["utilisateur"] = "Kito";
            echo $_SESSION["utilisateur"] ?? "invité";
            ~~~

            Pour se déconnecter : **session_destroy()** (et vider $_SESSION). Après une connexion réussie, appelez **session_regenerate_id(true)** pour changer l'identifiant (protection contre la fixation de session).

            ## Les cookies

            Un cookie est un petit texte stocké **dans le navigateur** : **setcookie("theme", "sombre", ["expires" => time() + 86400, "httponly" => true, "samesite" => "Lax"])**. On le relit avec **$_COOKIE["theme"]**. Ne stockez jamais d'information sensible dans un cookie : l'utilisateur peut le lire et le modifier.

            ## Découper avec include et require

            Un site réel répète l'en-tête, le menu et le pied de page sur chaque page. On les place dans des fichiers séparés :

            ~~~php
            <?php
            require __DIR__ . "/includes/config.php";
            include __DIR__ . "/includes/entete.php";
            ~~~

            - **require** arrête le script si le fichier manque (pour les fichiers indispensables) ;
            - **include** affiche seulement un avertissement ;
            - **require_once** évite de charger deux fois le même fichier (fonctions, classes).

            Dans UPL IDE, créez un projet **Site PHP** : index.php inclut includes/config.php, includes/functions.php et includes/database.php.

            ## Les erreurs de PHP

            | Message | Signification |
            |---|---|
            | Parse error | erreur de syntaxe (point-virgule, accolade, guillemet manquant) — le script ne démarre pas |
            | Fatal error | erreur grave pendant l'exécution (fonction inconnue, division par zéro) — le script s'arrête |
            | Warning | problème non bloquant (fichier introuvable avec include) |
            | Notice / Deprecated | variable inconnue, fonction dépréciée |

            Le message donne toujours le **fichier** et la **ligne** : commencez par lire la ligne indiquée et celle d'avant. En production, on n'affiche pas les erreurs aux visiteurs (**display_errors = Off**) : on les écrit dans un journal.

            ## Sur la plateforme

            Chaque exécution est une **nouvelle requête** : les sessions et cookies ne sont donc pas conservés d'une exécution à l'autre dans l'éditeur. Les exemples montrent le fonctionnement à l'intérieur d'une seule exécution.
          `,
          examples: [
            example(PHP, "Panier en session (une requête)", r`
              <?php
              session_start();
              $_SESSION["panier"] ??= [];
              $_SESSION["panier"][] = ["article" => "Cahier", "prix" => 1500];
              $_SESSION["panier"][] = ["article" => "Stylo", "prix" => 500];
              $total = array_sum(array_column($_SESSION["panier"], "prix"));
              echo count($_SESSION["panier"]), " articles, total : $total FC\n";
            `),
          ],
          summary: [
            "session_start() puis $_SESSION conserve des données côté serveur.",
            "Les cookies sont stockés dans le navigateur : jamais de données sensibles.",
            "require (indispensable), include (facultatif), *_once (une seule fois).",
            "Parse error = syntaxe ; Fatal error = exécution ; lire la ligne indiquée.",
          ],
          quiz: quiz("php-sessions-quiz", "Vérification — Sessions et include", [
            qcm("Où sont stockées les données de $_SESSION ?", ["Dans le navigateur", "Sur le serveur", "Dans l'adresse", "Dans le HTML"], 1),
            qcm("Quelle instruction arrête le script si le fichier est absent ?", ["include", "require", "import", "use"], 1),
            qcm("Quand appeler session_start() ?", ["À la fin du script", "Avant tout affichage", "Seulement à la déconnexion", "Jamais"], 1),
          ]),
          exerciseSlugs: ["php-erreurs-corriger"],
        }),
      ],
    },
    // =====================================================================
    // NIVEAU 3
    // =====================================================================
    {
      slug: "php-objet",
      title: "Programmation orientée objet",
      lessons: [
        lesson({
          slug: "php-classes-objets",
          title: "Classes, objets, constructeurs et encapsulation",
          level: "intermediaire",
          durationMinutes: 45,
          prerequisites: ["Fonctions (niveau 2)"],
          objectives: ["Définir une classe avec propriétés et méthodes.", "Créer des objets avec un constructeur.", "Protéger les données avec private et des méthodes d'accès."],
          content: r`
            ## Classe et objet

            Une **classe** est un modèle (le plan d'une maison) ; un **objet** est un exemplaire construit à partir de ce modèle. La classe regroupe des **propriétés** (données) et des **méthodes** (fonctions qui agissent sur ces données).

            ~~~php
            <?php
            class Etudiant
            {
                public string $nom;
                public array $notes = [];

                public function moyenne(): float
                {
                    return $this->notes ? array_sum($this->notes) / count($this->notes) : 0.0;
                }
            }

            $e = new Etudiant();
            $e->nom = "Kito";
            $e->notes = [12, 16];
            echo $e->moyenne();
            ~~~

            **$this** désigne l'objet courant ; **->** accède à une propriété ou appelle une méthode.

            ## Le constructeur

            **__construct** s'exécute à la création de l'objet. Depuis PHP 8, la **promotion des propriétés** déclare et remplit les propriétés directement dans les paramètres :

            ~~~php
            <?php
            class Etudiant
            {
                public function __construct(
                    private string $matricule,
                    private string $nom,
                ) {}
            }
            ~~~

            ## Encapsulation et visibilité

            | Mot-clé | Accessible depuis |
            |---|---|
            | public | partout |
            | protected | la classe et ses classes filles |
            | private | la classe seulement |

            On rend les propriétés **private** et on expose des **méthodes** qui contrôlent les modifications : une note doit rester entre 0 et 20, un solde ne peut pas devenir négatif. L'objet garantit ainsi sa propre cohérence.

            ## Membres statiques et constantes de classe

            Une propriété **static** appartient à la classe (compteur d'objets créés) ; on y accède avec **self::$compteur** ou **NomClasse::$compteur**. Les constantes de classe s'écrivent **const NOTE_MAX = 20;**.

            ## Propriétés en lecture seule

            **readonly** (PHP 8.1) interdit de modifier une propriété après la construction : idéal pour un matricule.
          `,
          examples: [
            example(PHP, "Classe Etudiant encapsulée", r`
              <?php
              declare(strict_types=1);

              class Etudiant
              {
                  public const NOTE_MAX = 20;
                  private array $notes = [];

                  public function __construct(public readonly string $matricule, private string $nom) {}

                  public function ajouterNote(float $note): void
                  {
                      if ($note < 0 || $note > self::NOTE_MAX) {
                          throw new InvalidArgumentException("Note invalide : $note");
                      }
                      $this->notes[] = $note;
                  }

                  public function moyenne(): float
                  {
                      return $this->notes ? array_sum($this->notes) / count($this->notes) : 0.0;
                  }

                  public function getNom(): string
                  {
                      return $this->nom;
                  }
              }

              $e = new Etudiant("UPL-2026-001", "Kito");
              $e->ajouterNote(14);
              $e->ajouterNote(17);
              echo $e->getNom(), " (", $e->matricule, ") : ", $e->moyenne(), "/20\n";
              try {
                  $e->ajouterNote(25);
              } catch (InvalidArgumentException $ex) {
                  echo "Refusé : ", $ex->getMessage(), "\n";
              }
            `),
          ],
          summary: ["Une classe décrit, un objet existe (new).", "Le constructeur initialise l'objet ; la promotion évite la répétition.", "private + méthodes de contrôle = encapsulation."],
          quiz: quiz("php-classes-quiz", "Vérification — Classes et objets", [
            qcm("Que désigne $this dans une méthode ?", ["La classe", "L'objet courant", "La classe mère", "Le fichier"], 1),
            qcm("Quelle visibilité limite l'accès à la classe elle-même ?", ["public", "protected", "private", "static"], 2),
            qcm("Quand s'exécute __construct ?", ["À la destruction", "À la création avec new", "À chaque appel de méthode", "Jamais automatiquement"], 1),
          ]),
          exerciseSlugs: ["php-classe-compte"],
        }),
        lesson({
          slug: "php-heritage-interfaces",
          title: "Héritage, polymorphisme, interfaces, traits et namespaces",
          level: "intermediaire",
          durationMinutes: 45,
          prerequisites: ["Classes et objets"],
          objectives: ["Réutiliser du code par héritage.", "Exploiter le polymorphisme.", "Définir des contrats avec les interfaces.", "Partager du code avec les traits et organiser avec les namespaces."],
          content: r`
            ## Héritage

            Une classe **fille** hérite des propriétés et méthodes de sa classe **mère** avec **extends**. Elle peut ajouter des éléments ou **redéfinir** une méthode ; **parent::methode()** appelle la version de la mère.

            ~~~php
            <?php
            class Personne
            {
                public function __construct(protected string $nom) {}
                public function presenter(): string { return "Je suis {$this->nom}"; }
            }

            class Enseignant extends Personne
            {
                public function __construct(string $nom, private string $cours) { parent::__construct($nom); }
                public function presenter(): string { return parent::presenter() . ", j'enseigne {$this->cours}"; }
            }
            ~~~

            ## Classes abstraites

            Une classe **abstract** ne peut pas être instanciée ; elle peut déclarer des méthodes **abstract** que chaque fille doit écrire.

            ## Polymorphisme

            Des objets de classes différentes répondent au **même appel** chacun à leur manière. Une boucle peut appeler **->presenter()** sur une liste mêlant étudiants et enseignants : chaque objet utilise sa propre version.

            ## Interfaces

            Une **interface** est un contrat : la liste des méthodes qu'une classe s'engage à fournir (**implements**). Une classe peut implémenter plusieurs interfaces. Le code qui reçoit un objet typé par l'interface fonctionne avec toutes les implémentations : c'est la base des architectures professionnelles (un « dépôt » de données en mémoire pour les tests, en base de données en production).

            ## Traits

            Un **trait** regroupe des méthodes à copier dans plusieurs classes sans lien d'héritage (par exemple un horodatage de création) : **use Horodatable;** dans la classe.

            ## Namespaces

            Les **espaces de noms** évitent les conflits de noms entre bibliothèques : **namespace App\Modeles;** en tête du fichier, puis **use App\Modeles\Etudiant;** ailleurs. Composer s'appuie dessus pour charger automatiquement les classes (norme PSR-4).
          `,
          examples: [
            example(PHP, "Polymorphisme avec une interface", r`
              <?php
              interface Payable
              {
                  public function montant(): float;
              }

              abstract class Personne implements Payable
              {
                  public function __construct(protected string $nom) {}
                  abstract public function role(): string;
                  public function fiche(): string
                  {
                      return sprintf("%-8s %-12s %8.2f $", $this->nom, $this->role(), $this->montant());
                  }
              }

              trait Prime
              {
                  public function prime(float $base): float { return $base * 0.1; }
              }

              class Enseignant extends Personne
              {
                  use Prime;
                  public function __construct(string $nom, private float $salaire) { parent::__construct($nom); }
                  public function role(): string { return "enseignant"; }
                  public function montant(): float { return $this->salaire + $this->prime($this->salaire); }
              }

              class Etudiant extends Personne
              {
                  public function __construct(string $nom, private float $frais) { parent::__construct($nom); }
                  public function role(): string { return "étudiant"; }
                  public function montant(): float { return -$this->frais; }
              }

              $personnes = [new Enseignant("Mukendi", 800), new Etudiant("Kito", 450)];
              foreach ($personnes as $p) {
                  echo $p->fiche(), "\n";
              }
            `),
          ],
          summary: ["extends hérite ; parent:: appelle la version de la mère.", "Une interface est un contrat ; implements s'y engage.", "Polymorphisme : même appel, comportements différents.", "Traits : partage de méthodes ; namespaces : organisation des classes."],
          quiz: quiz("php-heritage-quiz", "Vérification — Héritage et interfaces", [
            qcm("Quel mot-clé crée une classe fille ?", ["implements", "extends", "use", "inherits"], 1),
            qcm("Peut-on instancier une classe abstraite ?", ["Oui", "Non"], 1),
            qcm("Combien d'interfaces une classe peut-elle implémenter ?", ["Une seule", "Deux au plus", "Plusieurs", "Aucune"], 2),
          ]),
          exerciseSlugs: ["php-formes-polymorphisme"],
        }),
        lesson({
          slug: "php-exceptions",
          title: "Exceptions et gestion des erreurs",
          level: "intermediaire",
          durationMinutes: 30,
          prerequisites: ["Héritage et interfaces"],
          objectives: ["Lever et intercepter des exceptions.", "Créer ses propres exceptions.", "Utiliser finally pour libérer les ressources."],
          content: r`
            ## Lever une exception

            Quand une situation empêche une fonction de faire son travail, elle **lève** une exception avec **throw** :

            ~~~php
            <?php
            function diviser(float $a, float $b): float
            {
                if ($b == 0) {
                    throw new DivisionByZeroError("Division par zéro");
                }
                return $a / $b;
            }
            ~~~

            ## Intercepter avec try / catch

            ~~~php
            <?php
            try {
                echo diviser(10, 0);
            } catch (DivisionByZeroError $e) {
                echo "Erreur : ", $e->getMessage();
            } finally {
                echo "Toujours exécuté";
            }
            ~~~

            Le bloc **finally** s'exécute dans tous les cas (fermeture d'un fichier, d'une transaction…).

            ## La hiérarchie

            Tout ce qui peut être levé implémente **Throwable**. Deux familles : **Exception** (erreurs prévisibles de l'application : donnée invalide, ressource introuvable) et **Error** (erreurs du moteur : TypeError, DivisionByZeroError). On intercepte du plus précis au plus général.

            ## Exceptions personnalisées

            ~~~php
            <?php
            class NoteInvalideException extends InvalidArgumentException {}
            ~~~

            Une exception propre au métier rend le code lisible et permet de réagir précisément (afficher un message à l'utilisateur, journaliser, annuler une transaction).

            ## En production

            Les messages techniques (requête SQL, chemin des fichiers) ne doivent pas être montrés aux visiteurs : on affiche un message générique et on enregistre le détail dans un journal (**error_log**).
          `,
          examples: [
            example(PHP, "Exception personnalisée", r`
              <?php
              class NoteInvalideException extends InvalidArgumentException {}

              function verifierNote(mixed $saisie): float
              {
                  if (!is_numeric($saisie)) {
                      throw new NoteInvalideException("« $saisie » n'est pas un nombre");
                  }
                  $note = (float) $saisie;
                  if ($note < 0 || $note > 20) {
                      throw new NoteInvalideException("$note est hors de l'intervalle 0–20");
                  }
                  return $note;
              }

              foreach (["15", "abc", "23", "9.5"] as $saisie) {
                  try {
                      echo "Note acceptée : ", verifierNote($saisie), "\n";
                  } catch (NoteInvalideException $e) {
                      echo "Refusée : ", $e->getMessage(), "\n";
                  }
              }
            `),
          ],
          summary: ["throw lève, try/catch intercepte, finally s'exécute toujours.", "Exception = erreurs de l'application ; Error = erreurs du moteur.", "Créer ses exceptions rend le traitement précis."],
          quiz: quiz("php-exceptions-quiz", "Vérification — Exceptions", [
            qcm("Quel bloc s'exécute même si une exception est levée ?", ["catch", "finally", "else", "default"], 1),
            qcm("Quelle interface est commune à Exception et Error ?", ["Countable", "Throwable", "Stringable", "Iterator"], 1),
            vraiFaux("On peut afficher le message SQL complet d'une exception aux visiteurs en production.", false),
          ]),
          exerciseSlugs: ["php-exception-retrait"],
        }),
      ],
    },
    {
      slug: "php-donnees-api",
      title: "Bases de données avec PDO, JSON et API",
      lessons: [
        lesson({
          slug: "php-pdo",
          title: "PDO : se connecter et interroger une base de données",
          level: "intermediaire",
          durationMinutes: 50,
          prerequisites: ["Exceptions", "Parcours SQL, niveau 1"],
          objectives: ["Se connecter à une base avec PDO.", "Exécuter des requêtes préparées (CRUD).", "Comprendre et empêcher l'injection SQL.", "Utiliser les transactions."],
          content: r`
            ## PDO, une interface unique

            **PDO** (PHP Data Objects) dialogue avec MySQL, MariaDB, PostgreSQL, SQLite… avec le même code. Seule la **chaîne de connexion** (DSN) change :

            ~~~php
            <?php
            // MySQL / MariaDB sur un serveur
            $pdo = new PDO("mysql:host=localhost;dbname=universite;charset=utf8mb4", "utilisateur", "mot_de_passe");
            // SQLite (fichier ou mémoire) — utilisé sur la plateforme
            $pdo = new PDO("sqlite::memory:");
            ~~~

            Options recommandées : **PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION** (les erreurs SQL deviennent des exceptions) et **PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC** (lignes sous forme de tableaux associatifs).

            Sur la plateforme, PHP tourne dans votre navigateur : il n'y a pas de serveur MySQL. Les exemples utilisent **SQLite** avec PDO. Le code PDO est identique ; seules quelques syntaxes SQL diffèrent (AUTO_INCREMENT en MySQL, AUTOINCREMENT en SQLite).

            ## L'injection SQL

            Ne construisez **jamais** une requête en collant une donnée de l'utilisateur :

            ~~~php
            <?php
            // DANGEREUX
            $sql = "SELECT * FROM utilisateurs WHERE email = '" . $_POST["email"] . "'";
            ~~~

            Avec l'e-mail **' OR '1'='1**, la condition devient toujours vraie : l'attaquant lit toute la table, voire la supprime.

            ## Les requêtes préparées

            La requête et les données voyagent **séparément** : la donnée ne peut jamais être interprétée comme du SQL.

            ~~~php
            <?php
            $stmt = $pdo->prepare("SELECT * FROM etudiants WHERE filiere = :filiere AND age >= :age");
            $stmt->execute(["filiere" => $filiere, "age" => 18]);
            $lignes = $stmt->fetchAll();
            ~~~

            **fetch()** lit une ligne, **fetchAll()** toutes, **fetchColumn()** une seule valeur ; **rowCount()** donne le nombre de lignes modifiées et **lastInsertId()** l'identifiant créé.

            ## CRUD

            | Opération | SQL | Méthode PDO |
            |---|---|---|
            | Créer | INSERT | prepare + execute, lastInsertId |
            | Lire | SELECT | prepare + execute, fetch / fetchAll |
            | Modifier | UPDATE | prepare + execute, rowCount |
            | Supprimer | DELETE | prepare + execute, rowCount |

            ## Transactions

            Plusieurs requêtes qui doivent réussir **ensemble** (virement : débit puis crédit) se placent dans une transaction : **beginTransaction()**, puis **commit()** si tout va bien, **rollBack()** en cas d'exception.
          `,
          examples: [
            example(PHP, "CRUD complet avec PDO et SQLite", r`
              <?php
              $pdo = new PDO("sqlite::memory:", null, null, [
                  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
              ]);
              $pdo->exec("CREATE TABLE etudiants (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, filiere TEXT NOT NULL, moyenne REAL)");

              $ajout = $pdo->prepare("INSERT INTO etudiants (nom, filiere, moyenne) VALUES (:nom, :filiere, :moyenne)");
              foreach ([["Kito", "Informatique", 14.5], ["Mbuyi", "Droit", 11], ["Kabila", "Informatique", 9.5]] as [$nom, $filiere, $moyenne]) {
                  $ajout->execute(compact("nom", "filiere", "moyenne"));
              }
              echo "Dernier identifiant : ", $pdo->lastInsertId(), "\n";

              $maj = $pdo->prepare("UPDATE etudiants SET moyenne = :m WHERE nom = :n");
              $maj->execute(["m" => 10.5, "n" => "Kabila"]);
              echo "Lignes modifiées : ", $maj->rowCount(), "\n";

              $liste = $pdo->prepare("SELECT nom, moyenne FROM etudiants WHERE filiere = ? ORDER BY moyenne DESC");
              $liste->execute(["Informatique"]);
              foreach ($liste->fetchAll() as $e) {
                  echo $e["nom"], " : ", $e["moyenne"], "\n";
              }

              // Tentative d'injection : traitée comme un simple texte
              $liste->execute(["' OR '1'='1"]);
              echo "Résultats de l'injection : ", count($liste->fetchAll()), "\n";
            `),
            example(PHP, "Transaction : tout ou rien", r`
              <?php
              $pdo = new PDO("sqlite::memory:", null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
              $pdo->exec("CREATE TABLE comptes (nom TEXT PRIMARY KEY, solde INTEGER NOT NULL CHECK (solde >= 0))");
              $pdo->exec("INSERT INTO comptes VALUES ('A', 100), ('B', 50)");

              function virement(PDO $pdo, string $de, string $vers, int $montant): void
              {
                  $pdo->beginTransaction();
                  try {
                      $pdo->prepare("UPDATE comptes SET solde = solde + ? WHERE nom = ?")->execute([$montant, $vers]);
                      $pdo->prepare("UPDATE comptes SET solde = solde - ? WHERE nom = ?")->execute([$montant, $de]);
                      $pdo->commit();
                      echo "Virement de $montant réussi\n";
                  } catch (PDOException $e) {
                      $pdo->rollBack();
                      echo "Virement de $montant annulé (solde insuffisant)\n";
                  }
              }

              virement($pdo, "A", "B", 30);
              virement($pdo, "A", "B", 500);
              foreach ($pdo->query("SELECT nom, solde FROM comptes") as $c) {
                  echo $c["nom"], " : ", $c["solde"], "\n";
              }
            `),
          ],
          summary: [
            "PDO : même code pour MySQL, PostgreSQL, SQLite ; seule la DSN change.",
            "Jamais de donnée collée dans le SQL : requêtes préparées obligatoires.",
            "fetch, fetchAll, fetchColumn, rowCount, lastInsertId.",
            "beginTransaction / commit / rollBack : tout ou rien.",
          ],
          quiz: quiz("php-pdo-quiz", "Vérification — PDO", [
            qcm("Qu'est-ce qui protège contre l'injection SQL ?", ["htmlspecialchars", "Les requêtes préparées", "trim", "Un mot de passe long"], 1),
            qcm("Quelle méthode renvoie l'identifiant de la dernière ligne insérée ?", ["rowCount()", "lastInsertId()", "fetch()", "insertId"], 1),
            qcm("Que fait rollBack() ?", ["Valide la transaction", "Annule les modifications de la transaction", "Ferme la connexion", "Supprime la table"], 1),
            vraiFaux("Le code PDO change complètement entre MySQL et SQLite.", false, "Seules la chaîne de connexion et quelques syntaxes SQL changent."),
          ]),
          exerciseSlugs: ["php-pdo-liste"],
        }),
        lesson({
          slug: "php-json-api",
          title: "JSON et API REST en PHP",
          level: "intermediaire",
          durationMinutes: 35,
          prerequisites: ["PDO"],
          objectives: ["Encoder et décoder du JSON.", "Comprendre les principes d'une API REST.", "Produire une réponse d'API avec le bon code HTTP."],
          content: r`
            ## JSON

            **JSON** est le format d'échange des API : objets {"cle": valeur}, listes [ … ], nombres, textes, true/false/null.

            - **json_encode($tableau)** produit du JSON ; l'option **JSON_PRETTY_PRINT** l'indente, **JSON_UNESCAPED_UNICODE** garde les accents lisibles ;
            - **json_decode($texte, true)** renvoie un tableau associatif ; avec **JSON_THROW_ON_ERROR**, un JSON invalide lève une exception.

            ## Une API REST

            Une API expose des **ressources** (étudiants, produits) à des adresses, et l'action dépend de la **méthode HTTP** :

            | Méthode | Adresse | Action | Code de réponse |
            |---|---|---|---|
            | GET | /api/etudiants | liste | 200 |
            | GET | /api/etudiants/7 | détail | 200 ou 404 |
            | POST | /api/etudiants | création | 201 |
            | PUT / PATCH | /api/etudiants/7 | modification | 200 |
            | DELETE | /api/etudiants/7 | suppression | 204 |

            Codes d'erreur courants : **400** (données invalides), **401** (non connecté), **403** (interdit), **404** (introuvable), **422** (validation), **500** (erreur serveur).

            ## Répondre en JSON

            ~~~php
            <?php
            header("Content-Type: application/json; charset=utf-8");
            http_response_code(201);
            echo json_encode(["id" => 7, "nom" => "Kito"]);
            ~~~

            Le corps d'une requête POST en JSON se lit avec **file_get_contents("php://input")** puis json_decode. On valide ces données exactement comme un formulaire.

            ## Routage simple

            Un **routeur** associe méthode + chemin à une fonction. Les frameworks (Laravel, Symfony, Slim) fournissent des routeurs complets ; écrire le sien une fois aide à comprendre leur fonctionnement.
          `,
          examples: [
            example(PHP, "Mini API avec routeur", r`
              <?php
              $etudiants = [1 => ["id" => 1, "nom" => "Kito"], 2 => ["id" => 2, "nom" => "Mbuyi"]];

              function repondre(int $code, mixed $donnees): void
              {
                  echo "HTTP $code\n", json_encode($donnees, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), "\n\n";
              }

              function traiter(string $methode, string $chemin, array &$etudiants, ?string $corps = null): void
              {
                  if ($methode === "GET" && $chemin === "/api/etudiants") {
                      repondre(200, array_values($etudiants));
                  } elseif ($methode === "GET" && preg_match("#^/api/etudiants/(\d+)$#", $chemin, $m)) {
                      isset($etudiants[(int) $m[1]]) ? repondre(200, $etudiants[(int) $m[1]]) : repondre(404, ["erreur" => "Étudiant introuvable"]);
                  } elseif ($methode === "POST" && $chemin === "/api/etudiants") {
                      $donnees = json_decode($corps ?? "", true);
                      if (!is_array($donnees) || trim($donnees["nom"] ?? "") === "") {
                          repondre(422, ["erreur" => "Le nom est obligatoire"]);
                          return;
                      }
                      $id = max(array_keys($etudiants)) + 1;
                      $etudiants[$id] = ["id" => $id, "nom" => trim($donnees["nom"])];
                      repondre(201, $etudiants[$id]);
                  } else {
                      repondre(404, ["erreur" => "Route inconnue"]);
                  }
              }

              traiter("GET", "/api/etudiants/2", $etudiants);
              traiter("POST", "/api/etudiants", $etudiants, '{"nom": "Kabila"}');
              traiter("POST", "/api/etudiants", $etudiants, '{"nom": ""}');
              traiter("GET", "/api/etudiants/9", $etudiants);
            `),
          ],
          summary: ["json_encode / json_decode(…, true).", "REST : ressource + méthode HTTP + code de réponse.", "Content-Type: application/json et http_response_code()."],
          quiz: quiz("php-json-quiz", "Vérification — JSON et API", [
            qcm("Quel code HTTP pour une ressource créée ?", ["200", "201", "204", "404"], 1),
            qcm("Que renvoie json_decode('{\"a\":1}', true) ?", ["un objet stdClass", "un tableau associatif", "une chaîne", "null"], 1),
            qcm("Quelle méthode HTTP pour supprimer ?", ["GET", "POST", "DELETE", "PATCH"], 2),
          ]),
          exerciseSlugs: ["php-json-resume"],
        }),
      ],
    },
    // =====================================================================
    // NIVEAU 4
    // =====================================================================
    {
      slug: "php-professionnel",
      title: "PHP professionnel : sécurité, architecture et tests",
      lessons: [
        lesson({
          slug: "php-securite",
          title: "Sécurité d'une application PHP",
          level: "avance",
          durationMinutes: 50,
          prerequisites: ["PDO", "Formulaires et sessions"],
          objectives: ["Stocker les mots de passe avec password_hash.", "Se protéger du XSS, de l'injection SQL et du CSRF.", "Sécuriser les sessions et les téléversements de fichiers."],
          content: r`
            ## Les mots de passe

            On ne stocke **jamais** un mot de passe en clair, ni avec md5 ou sha1 (trop rapides à casser). On utilise :

            ~~~php
            <?php
            $empreinte = password_hash($motDePasse, PASSWORD_DEFAULT); // bcrypt ou argon2, avec sel aléatoire
            if (password_verify($saisie, $empreinte)) { /* connecté */ }
            ~~~

            **password_needs_rehash()** permet de renforcer l'empreinte lorsque l'algorithme évolue.

            ## Les principales failles

            | Faille | Principe | Protection |
            |---|---|---|
            | Injection SQL | une donnée modifie la requête | requêtes préparées (PDO) |
            | XSS | un script injecté s'exécute chez les visiteurs | htmlspecialchars à l'affichage, en-tête Content-Security-Policy |
            | CSRF | un autre site fait envoyer un formulaire à la victime connectée | jeton aléatoire en session, vérifié à chaque POST ; cookies SameSite |
            | Fixation / vol de session | l'identifiant de session est deviné ou volé | session_regenerate_id(true) à la connexion ; cookies httponly, secure, samesite |
            | Téléversement malveillant | un fichier .php déguisé est envoyé puis exécuté | vérifier taille et type réel, renommer avec un nom aléatoire, stocker hors du dossier public |
            | Force brute | essais répétés de mots de passe | limiter les tentatives, délai progressif |

            ## Le jeton CSRF

            ~~~php
            <?php
            $_SESSION["csrf"] ??= bin2hex(random_bytes(32));
            // dans le formulaire : <input type="hidden" name="csrf" value="…">
            if (!hash_equals($_SESSION["csrf"], $_POST["csrf"] ?? "")) {
                http_response_code(403);
                exit("Requête refusée");
            }
            ~~~

            **hash_equals** compare en temps constant ; **random_bytes** produit un aléa cryptographique (jamais rand()).

            ## Téléversement de fichiers

            Avec **$_FILES** : vérifier **error === UPLOAD_ERR_OK**, la **taille**, le **type réel** (extension fileinfo : finfo_file), générer un nom aléatoire et déplacer avec **move_uploaded_file** dans un dossier où PHP ne s'exécute pas. Ne jamais faire confiance au nom ni au type envoyés par le navigateur.

            ## Principes généraux

            - **moindre privilège** : l'utilisateur de la base n'a que les droits nécessaires ;
            - **défense en profondeur** : plusieurs protections indépendantes ;
            - **secrets hors du code** : mots de passe de base et clés dans des variables d'environnement, jamais dans Git ;
            - **mises à jour** : PHP et les dépendances (composer audit).
          `,
          examples: [
            example(PHP, "Inscription et connexion sécurisées", r`
              <?php
              $pdo = new PDO("sqlite::memory:", null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
              $pdo->exec("CREATE TABLE utilisateurs (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, mot_de_passe TEXT NOT NULL)");

              function inscrire(PDO $pdo, string $email, string $mdp): string
              {
                  if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($mdp) < 10) {
                      return "Inscription refusée : e-mail invalide ou mot de passe trop court";
                  }
                  $pdo->prepare("INSERT INTO utilisateurs (email, mot_de_passe) VALUES (?, ?)")->execute([$email, password_hash($mdp, PASSWORD_DEFAULT)]);
                  return "Compte créé pour $email";
              }

              function connecter(PDO $pdo, string $email, string $mdp): string
              {
                  $stmt = $pdo->prepare("SELECT mot_de_passe FROM utilisateurs WHERE email = ?");
                  $stmt->execute([$email]);
                  $empreinte = $stmt->fetchColumn();
                  // Même message dans les deux cas : on ne révèle pas si l'e-mail existe.
                  return $empreinte !== false && password_verify($mdp, $empreinte) ? "Connexion réussie" : "Identifiants incorrects";
              }

              echo inscrire($pdo, "kito@upl.cd", "court"), "\n";
              echo inscrire($pdo, "kito@upl.cd", "Un-mot-de-passe-solide"), "\n";
              echo connecter($pdo, "kito@upl.cd", "mauvais"), "\n";
              echo connecter($pdo, "kito@upl.cd", "Un-mot-de-passe-solide"), "\n";
              $stocke = $pdo->query("SELECT mot_de_passe FROM utilisateurs")->fetchColumn();
              echo "Stocké en base : ", substr($stocke, 0, 7), "… (", strlen($stocke), " caractères, jamais le mot de passe)\n";
              echo "Jeton CSRF : ", strlen(bin2hex(random_bytes(32))), " caractères aléatoires\n";
            `),
          ],
          summary: ["password_hash / password_verify, jamais md5 ni mot de passe en clair.", "Préparer (SQL), échapper (HTML), jeton (CSRF), régénérer (session).", "Fichiers téléversés : taille, type réel, nom aléatoire, hors du dossier public."],
          quiz: quiz("php-securite-quiz", "Vérification — Sécurité", [
            qcm("Quelle fonction pour stocker un mot de passe ?", ["md5", "sha1", "password_hash", "base64_encode"], 2),
            qcm("Contre quelle attaque protège un jeton dans les formulaires ?", ["XSS", "CSRF", "Injection SQL", "Force brute"], 1),
            qcm("Quelle fonction pour générer un jeton de sécurité ?", ["rand()", "uniqid()", "random_bytes()", "time()"], 2),
            vraiFaux("On peut se fier au type MIME envoyé par le navigateur pour un fichier téléversé.", false),
          ]),
          exerciseSlugs: ["php-mot-de-passe-robuste"],
        }),
        lesson({
          slug: "php-architecture-tests",
          title: "Architecture MVC, middleware et tests automatisés",
          level: "avance",
          durationMinutes: 50,
          prerequisites: ["Sécurité d'une application PHP", "Héritage et interfaces"],
          objectives: ["Organiser une application en couches (MVC).", "Comprendre le rôle d'un routeur et des middlewares.", "Écrire des tests automatisés."],
          content: r`
            ## Pourquoi une architecture ?

            Un script de 2 000 lignes qui mélange SQL, HTML et règles métier devient impossible à maintenir. On sépare les **responsabilités** :

            - **Modèle** : les données et les règles métier (classes Etudiant, dépôts d'accès à la base) ;
            - **Vue** : l'affichage (gabarits HTML, sans requêtes SQL) ;
            - **Contrôleur** : reçoit la requête, appelle le modèle, choisit la vue.

            ## Arborescence type

            ~~~text
            public/index.php        ← point d'entrée unique (front controller)
            src/Controleurs/        ← EtudiantControleur.php
            src/Modeles/            ← Etudiant.php, EtudiantDepot.php
            src/Middlewares/        ← Authentification.php
            vues/                   ← etudiants/liste.php
            config/                 ← paramètres (sans secrets)
            tests/                  ← tests automatisés
            vendor/                 ← dépendances installées par Composer
            ~~~

            Seul le dossier **public/** est accessible depuis le web : le code et la configuration restent hors d'atteinte.

            ## Composer et l'autochargement

            **Composer** installe les bibliothèques (composer require) et génère un **autochargeur** : avec la norme **PSR-4**, la classe App\Modeles\Etudiant est cherchée dans src/Modeles/Etudiant.php ; un seul **require "vendor/autoload.php"** suffit.

            ## Routeur et middlewares

            Le **routeur** associe une adresse à une action de contrôleur. Un **middleware** est une couche traversée par chaque requête avant le contrôleur : vérifier la connexion, le rôle (étudiant, enseignant, administrateur), limiter le débit, journaliser. Chaque middleware peut laisser passer la requête ou répondre lui-même (403, redirection).

            ## Injection de dépendances

            Une classe **reçoit** ce dont elle a besoin (dans son constructeur) au lieu de le créer : un contrôleur reçoit un **EtudiantDepot** (interface). En test, on lui donne un dépôt en mémoire ; en production, un dépôt PDO.

            ## Tests automatisés

            Un **test unitaire** vérifie une petite unité (une fonction, une méthode) ; un **test d'intégration** vérifie plusieurs couches ensemble (contrôleur + base). En PHP, l'outil standard est **PHPUnit** (installé avec Composer) : **$this->assertSame(14.0, $e->moyenne());**. Les tests s'exécutent à chaque modification, souvent automatiquement (intégration continue).

            ## Vers Laravel

            **Laravel** fournit tout cela prêt à l'emploi : routeur, contrôleurs, modèles Eloquent, vues Blade, middlewares, migrations, validation, authentification et tests. Comprendre les briques ci-dessus permet de l'utiliser en sachant ce qui se passe.
          `,
          examples: [
            example(PHP, "Mini-framework : routeur, middleware, contrôleur et tests", r`
              <?php
              declare(strict_types=1);

              interface EtudiantDepot { public function tous(): array; }

              final class DepotMemoire implements EtudiantDepot
              {
                  public function __construct(private array $donnees) {}
                  public function tous(): array { return $this->donnees; }
              }

              final class EtudiantControleur
              {
                  public function __construct(private EtudiantDepot $depot) {}
                  public function liste(): string
                  {
                      return implode(", ", array_map(fn(array $e): string => $e["nom"], $this->depot->tous()));
                  }
              }

              /** Middleware : refuse la requête si l'utilisateur n'a pas le rôle demandé. */
              function exigerRole(string $role, callable $suivant): callable
              {
                  return fn(array $requete): string => ($requete["role"] ?? "") === $role ? $suivant($requete) : "403 Accès refusé";
              }

              $controleur = new EtudiantControleur(new DepotMemoire([["nom" => "Kito"], ["nom" => "Mbuyi"]]));
              $routes = ["GET /admin/etudiants" => exigerRole("administrateur", fn(array $r): string => "200 " . $controleur->liste())];

              function dispatcher(array $routes, array $requete): string
              {
                  return isset($routes[$requete["route"]]) ? $routes[$requete["route"]]($requete) : "404 Introuvable";
              }

              echo dispatcher($routes, ["route" => "GET /admin/etudiants", "role" => "administrateur"]), "\n";
              echo dispatcher($routes, ["route" => "GET /admin/etudiants", "role" => "etudiant"]), "\n";
              echo dispatcher($routes, ["route" => "GET /inconnu"]), "\n";

              // Tests unitaires minimalistes (PHPUnit fait la même chose, en plus complet)
              function verifier(string $nom, bool $condition): void { echo ($condition ? "✓ " : "✗ "), $nom, "\n"; }
              verifier("la liste contient Kito", str_contains($controleur->liste(), "Kito"));
              verifier("un étudiant est refusé", dispatcher($routes, ["route" => "GET /admin/etudiants", "role" => "etudiant"]) === "403 Accès refusé");
            `),
          ],
          summary: ["MVC : Modèle (données), Vue (affichage), Contrôleur (orchestration).", "public/ seul exposé ; Composer + PSR-4 chargent les classes.", "Routeur et middlewares filtrent les requêtes ; on injecte les dépendances.", "Tests unitaires et d'intégration (PHPUnit) à chaque modification."],
          quiz: quiz("php-architecture-quiz", "Vérification — Architecture", [
            qcm("Dans MVC, qui contient les requêtes SQL ?", ["La vue", "Le modèle (ou le dépôt)", "Le contrôleur uniquement", "Le fichier CSS"], 1),
            qcm("Quel est le rôle d'un middleware d'authentification ?", ["Afficher la page", "Filtrer les requêtes avant le contrôleur", "Créer les tables", "Compiler PHP"], 1),
            qcm("Quel outil installe les dépendances PHP ?", ["npm", "pip", "Composer", "Maven"], 2),
          ]),
          exerciseSlugs: ["php-panier-tests"],
        }),
      ],
    },
  ],
  finalQuiz: quiz("php-evaluation-finale", "Évaluation finale — PHP", [
    qcm("Où s'exécute le code PHP d'un site ?", ["Navigateur", "Serveur", "Base de données", "CSS"], 1),
    qcm("Quel opérateur concatène deux chaînes ?", ["+", ".", "&", "concat"], 1),
    qcm("Quelle boucle parcourt un tableau associatif avec ses clés ?", ["for", "while", "foreach ($t as $k => $v)", "do…while"], 2),
    qcm("Quelle fonction échappe le HTML à l'affichage ?", ["htmlspecialchars", "strip_tags", "trim", "addslashes"], 0),
    qcm("Quel mécanisme empêche l'injection SQL ?", ["Les requêtes préparées", "Les sessions", "Les cookies", "json_encode"], 0),
    qcm("Quelle fonction pour vérifier un mot de passe haché ?", ["password_verify", "md5", "hash_equals seul", "crypt"], 0),
    qcm("Quel mot-clé crée une classe fille ?", ["implements", "extends", "trait", "new"], 1),
    vraiFaux("Les données de $_SESSION sont stockées dans le navigateur.", false),
  ]),
};
