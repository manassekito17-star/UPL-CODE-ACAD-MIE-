import { example, lesson, qcm, quiz, vraiFaux } from "../helpers";
import type { Course } from "../types";

const P = "pseudocode" as const;

export const algorithmique: Course = {
  slug: "algorithmique",
  code: "Parcours A",
  language: "pseudocode",
  category: "fondamentaux",
  title: "Algorithmique et pseudocode",
  tagline: "Apprendre à raisonner avant de programmer.",
  description:
    "Le parcours obligatoire de base : de la notion d'algorithme jusqu'à la résolution de problèmes complexes, en passant par les structures de contrôle, les tableaux, les sous-programmes, la récursivité, le tri et la complexité. Chaque notion est illustrée par du pseudocode exécutable directement dans le navigateur.",
  level: "debutant",
  prerequisites: ["Aucun prérequis : ce parcours part de zéro."],
  objectives: [
    "Décomposer un problème en étapes précises et non ambiguës.",
    "Écrire des algorithmes corrects en pseudocode français.",
    "Maîtriser variables, conditions, boucles, tableaux et chaînes.",
    "Structurer un algorithme avec des fonctions et des procédures.",
    "Comprendre la récursivité, la recherche, le tri et la complexité.",
  ],
  durationHours: 30,
  status: "publie",
  modules: [
    {
      slug: "fondements",
      title: "Module 1 — Les fondements",
      description: "Ce qu'est un algorithme, comment on manipule des données et comment un programme communique avec l'utilisateur.",
      lessons: [
        lesson({
          slug: "introduction-algorithmique",
          title: "Introduction à l'algorithmique",
          durationMinutes: 20,
          objectives: [
            "Comprendre le rôle de l'algorithmique en informatique.",
            "Distinguer problème, algorithme et programme.",
            "Exécuter un premier algorithme dans l'éditeur.",
          ],
          content: `
            ## Pourquoi l'algorithmique ?

            Un ordinateur exécute des instructions **très simples**, très vite, sans jamais réfléchir. Pour lui faire résoudre un problème, il faut lui décrire **exactement** quoi faire, étape par étape. L'algorithmique est l'art de concevoir ces étapes.

            Avant d'écrire du Python, du C ou du Java, un informaticien réfléchit à la **méthode** : c'est l'algorithme. Le langage de programmation n'est ensuite qu'une traduction.

            ## Problème, algorithme, programme

            | Notion | Définition | Exemple |
            |---|---|---|
            | Problème | Ce que l'on veut obtenir | Calculer la moyenne de trois notes |
            | Algorithme | La méthode, indépendante du langage | Additionner les notes puis diviser par 3 |
            | Programme | L'algorithme traduit dans un langage | Le même calcul écrit en Python |

            ## Le pseudocode

            Le **pseudocode** est une façon d'écrire un algorithme en langage presque naturel, ici en français. Il est assez précis pour être exécuté, mais assez simple pour se concentrer sur la logique plutôt que sur la syntaxe.

            Sur UPL Code Academy, le pseudocode est **exécutable** : vous pouvez lancer chaque exemple avec le bouton **Exécuter**.

            ## Structure générale

            ~~~pseudocode
            ALGORITHME NomDeLAlgorithme
            VARIABLES
              // déclaration des variables
            DEBUT
              // instructions
            FIN
            ~~~

            Les mots-clés (ALGORITHME, DEBUT, ECRIRE…) peuvent être écrits en majuscules ou minuscules, avec ou sans accents.
          `,
          examples: [
            example(
              P,
              "Premier algorithme",
              `
              ALGORITHME Bonjour
              DEBUT
                ECRIRE("Bonjour et bienvenue à UPL Code Academy !")
                ECRIRE("Je suis votre premier algorithme.")
              FIN
              `,
              { explanation: "ECRIRE affiche un message à l'écran. Les instructions s'exécutent dans l'ordre, de haut en bas." },
            ),
          ],
          summary: [
            "Un algorithme est une méthode précise pour résoudre un problème.",
            "Le programme est la traduction de l'algorithme dans un langage.",
            "Le pseudocode permet de se concentrer sur la logique.",
          ],
          quiz: quiz("intro-algo-quiz", "Vérifier sa compréhension", [
            qcm("Qu'est-ce qu'un algorithme ?", [
              "Un langage de programmation",
              "Une suite finie d'instructions précises pour résoudre un problème",
              "Un composant de l'ordinateur",
              "Un logiciel de traitement de texte",
            ], 1, "Un algorithme est une méthode : une suite finie et non ambiguë d'étapes."),
            vraiFaux("Un même algorithme peut être traduit dans plusieurs langages de programmation.", true,
              "L'algorithme est indépendant du langage : on peut l'écrire en Python, en C, en Java…"),
          ]),
          exerciseSlugs: ["algo-bonjour"],
        }),
        lesson({
          slug: "notion-algorithme",
          title: "Notion d'algorithme",
          durationMinutes: 25,
          objectives: [
            "Connaître les propriétés d'un bon algorithme.",
            "Identifier les entrées, le traitement et les sorties.",
          ],
          content: `
            ## Définition

            Un **algorithme** est une suite **finie** d'instructions **non ambiguës** qui, à partir de données d'**entrée**, produit un **résultat** en un temps fini.

            ## Les propriétés d'un bon algorithme

            1. **Fini** : il se termine toujours.
            2. **Précis** : chaque étape a un seul sens possible.
            3. **Correct** : il donne le bon résultat pour toutes les entrées valides.
            4. **Efficace** : il n'utilise pas plus de temps ni de mémoire que nécessaire.

            ## Le schéma entrée → traitement → sortie

            Presque tout algorithme suit ce schéma :

            - **Entrées** : les données fournies (par exemple deux nombres).
            - **Traitement** : les calculs et décisions (les additionner).
            - **Sorties** : le résultat communiqué (afficher la somme).

            ## Exemple de la vie courante

            Préparer un thé : faire bouillir l'eau, mettre un sachet dans la tasse, verser l'eau, attendre trois minutes, retirer le sachet. L'ordre compte : verser l'eau **avant** de la faire bouillir ne donne pas le résultat attendu !

            ## Analyser avant d'écrire

            Avant d'écrire un algorithme, posez-vous trois questions :

            1. De quelles données ai-je besoin ?
            2. Quel résultat dois-je produire ?
            3. Quelles étapes transforment les données en résultat ?
          `,
          examples: [
            example(
              P,
              "Entrée, traitement, sortie",
              `
              ALGORITHME Double
              VARIABLES
                n, resultat : ENTIER
              DEBUT
                LIRE(n)                 // entrée
                resultat ← n * 2        // traitement
                ECRIRE("Le double de ", n, " est ", resultat)   // sortie
              FIN
              `,
              { stdin: "21", explanation: "La valeur 21 est lue depuis la zone « Entrée »." },
            ),
          ],
          summary: [
            "Un algorithme est fini, précis, correct et si possible efficace.",
            "Il transforme des entrées en sorties grâce à un traitement.",
            "L'ordre des instructions est essentiel.",
          ],
          quiz: quiz("notion-algo-quiz", "Propriétés d'un algorithme", [
            qcm("Laquelle de ces propriétés n'est PAS exigée d'un algorithme ?", [
              "Se terminer en un temps fini",
              "Être écrit en anglais",
              "Être non ambigu",
              "Produire un résultat correct",
            ], 1),
            vraiFaux("Un algorithme qui ne se termine jamais pour certaines entrées est correct.", false,
              "Un algorithme doit se terminer pour toutes les entrées valides."),
          ]),
        }),
        lesson({
          slug: "variables-constantes",
          title: "Variables et constantes",
          durationMinutes: 30,
          objectives: [
            "Déclarer des variables et des constantes.",
            "Utiliser l'affectation ←.",
            "Comprendre l'état de la mémoire pendant l'exécution.",
          ],
          content: `
            ## La variable : une boîte nommée

            Une **variable** est un emplacement de la mémoire qui porte un **nom** et contient une **valeur** qui peut changer pendant l'exécution. Elle a aussi un **type** (entier, réel, chaîne…).

            ## Déclaration

            Toute variable doit être déclarée dans la section VARIABLES :

            ~~~pseudocode
            VARIABLES
              age : ENTIER
              prix, total : REEL
              nom : CHAINE
            ~~~

            ## L'affectation

            L'affectation donne une valeur à une variable. Elle s'écrit avec la flèche **←** (on peut aussi taper **<-**) :

            ~~~pseudocode
            age ← 19
            total ← prix * 2
            ~~~

            On lit « age **reçoit** 19 ». La partie droite est calculée d'abord, puis le résultat est rangé dans la variable de gauche. L'ancienne valeur est **perdue**.

            > Attention : le signe **=** sert à **comparer**, pas à affecter.

            ## Les constantes

            Une **constante** a une valeur fixée une fois pour toutes :

            ~~~pseudocode
            CONSTANTES
              PI = 3.14159
              TAUX_TVA = 0.16
            ~~~

            Essayer de modifier une constante provoque une erreur. Les constantes rendent les algorithmes plus lisibles et plus faciles à modifier.

            ## Règles de nommage

            - Commencer par une lettre ; utiliser lettres, chiffres et « _ ».
            - Pas d'espace, pas de mot-clé (SI, POUR, FIN…).
            - Choisir des noms parlants : **moyenne** plutôt que **m**.

            ## Trace d'exécution

            Pour comprendre un algorithme, on suit l'évolution des variables ligne par ligne :

            | Instruction | a | b |
            |---|---|---|
            | a ← 5 | 5 | ? |
            | b ← a + 2 | 5 | 7 |
            | a ← b * 2 | 14 | 7 |
          `,
          examples: [
            example(
              P,
              "Échanger deux variables",
              `
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
              `,
              { explanation: "Sans la variable temp, la valeur de a serait écrasée et perdue." },
            ),
            example(
              P,
              "Utiliser une constante",
              `
              ALGORITHME Cercle
              CONSTANTES
                PI = 3.14159
              VARIABLES
                rayon, surface : REEL
              DEBUT
                rayon ← 2
                surface ← PI * rayon * rayon
                ECRIRE("Surface : ", surface)
              FIN
              `,
            ),
          ],
          summary: [
            "Une variable a un nom, un type et une valeur qui peut changer.",
            "L'affectation s'écrit ← ; le signe = sert à comparer.",
            "Une constante ne peut pas être modifiée.",
          ],
          quiz: quiz("variables-quiz", "Variables et affectation", [
            qcm("Après a ← 3 ; b ← a ; a ← 10, que vaut b ?", ["3", "10", "13", "La variable b n'a pas de valeur"], 0,
              "b a reçu une copie de la valeur de a (3) ; modifier a ensuite ne change pas b."),
            vraiFaux("On peut modifier la valeur d'une constante dans le programme principal.", false),
            qcm("Quel nom de variable est valide ?", ["2nombre", "note finale", "note_finale", "SI"], 2),
          ]),
          exerciseSlugs: ["algo-echange"],
        }),
        lesson({
          slug: "types-donnees",
          title: "Types de données",
          durationMinutes: 25,
          objectives: [
            "Connaître les types ENTIER, REEL, CHAINE, CARACTERE et BOOLEEN.",
            "Choisir le bon type pour chaque donnée.",
          ],
          content: `
            ## Pourquoi des types ?

            Le **type** d'une variable indique quelles valeurs elle peut contenir et quelles opérations sont possibles. On peut multiplier deux nombres, mais pas deux prénoms !

            ## Les types simples

            | Type | Valeurs | Exemples |
            |---|---|---|
            | ENTIER | nombres sans virgule | -3, 0, 42 |
            | REEL | nombres à virgule | 3.14, -0.5, 12.0 |
            | CHAINE | texte | "Kinshasa", "UPL" |
            | CARACTERE | un seul caractère | 'A', '7', '?' |
            | BOOLEEN | VRAI ou FAUX | VRAI |

            > En pseudocode, la virgule décimale s'écrit avec un **point** : 3.14.

            ## Vérification des types

            L'interpréteur de la plateforme vérifie les types : ranger 7 / 2 (qui vaut 3.5, un réel) dans une variable ENTIER provoque une erreur. C'est volontaire : cela vous aide à repérer les erreurs de raisonnement.

            ## Choisir le bon type

            - Un âge, un nombre d'étudiants : **ENTIER**.
            - Une moyenne, un prix : **REEL**.
            - Un nom, une adresse : **CHAINE**.
            - Une réponse oui/non, « est admis » : **BOOLEEN**.

            ## Conversions

            Les fonctions **ENTIER(x)**, **REEL(x)** et **CHAINE(x)** convertissent une valeur. **ARRONDI(x)** arrondit et **ENT(x)** donne la partie entière.
          `,
          examples: [
            example(
              P,
              "Les cinq types",
              `
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
              `,
              { explanation: "La comparaison moyenne >= 10 produit une valeur booléenne." },
            ),
          ],
          summary: [
            "Cinq types simples : ENTIER, REEL, CHAINE, CARACTERE, BOOLEEN.",
            "Le type détermine les valeurs et opérations autorisées.",
            "On convertit avec ENTIER(), REEL(), CHAINE().",
          ],
          quiz: quiz("types-quiz", "Types de données", [
            qcm("Quel type convient pour stocker le prix d'un livre (ex. 12.50) ?", ["ENTIER", "REEL", "BOOLEEN", "CARACTERE"], 1),
            qcm("Quelle est la valeur de 15 >= 10 ?", ["15", "10", "VRAI", "FAUX"], 2),
            vraiFaux("Une variable de type CARACTERE peut contenir le texte \"Bonjour\".", false,
              "Un CARACTERE contient exactement un caractère. Pour un texte, on utilise CHAINE."),
          ]),
        }),
        lesson({
          slug: "operateurs",
          title: "Opérateurs arithmétiques et logiques",
          durationMinutes: 30,
          objectives: [
            "Utiliser les opérateurs arithmétiques, DIV et MOD.",
            "Écrire des comparaisons et des expressions logiques avec ET, OU, NON.",
            "Connaître les priorités des opérateurs.",
          ],
          content: `
            ## Opérateurs arithmétiques

            | Opérateur | Rôle | Exemple | Résultat |
            |---|---|---|---|
            | + | addition | 7 + 2 | 9 |
            | - | soustraction | 7 - 2 | 5 |
            | * | multiplication | 7 * 2 | 14 |
            | / | division réelle | 7 / 2 | 3.5 |
            | DIV | quotient entier | 7 DIV 2 | 3 |
            | MOD | reste de la division | 7 MOD 2 | 1 |
            | ^ | puissance | 2 ^ 3 | 8 |

            **MOD** est très utile : un nombre n est **pair** si n MOD 2 = 0.

            ## Opérateurs de comparaison

            =, <> (différent), <, >, <= (inférieur ou égal), >= (supérieur ou égal). Le résultat est un **booléen**.

            ## Opérateurs logiques

            | A | B | A ET B | A OU B | NON A |
            |---|---|---|---|---|
            | VRAI | VRAI | VRAI | VRAI | FAUX |
            | VRAI | FAUX | FAUX | VRAI | FAUX |
            | FAUX | VRAI | FAUX | VRAI | VRAI |
            | FAUX | FAUX | FAUX | FAUX | VRAI |

            Pour tester qu'une note est comprise entre 0 et 20 : **(note >= 0) ET (note <= 20)**. On ne peut pas écrire 0 <= note <= 20.

            ## Priorités

            Du plus prioritaire au moins prioritaire :

            1. Parenthèses
            2. ^
            3. *, /, DIV, MOD
            4. +, -
            5. Comparaisons
            6. NON, puis ET, puis OU

            En cas de doute, **ajoutez des parenthèses** : 2 + 3 * 4 vaut 14, mais (2 + 3) * 4 vaut 20.
          `,
          examples: [
            example(
              P,
              "Quotient et reste",
              `
              ALGORITHME Conversion
              VARIABLES
                secondes, minutes, reste : ENTIER
              DEBUT
                secondes ← 200
                minutes ← secondes DIV 60
                reste ← secondes MOD 60
                ECRIRE(secondes, " s = ", minutes, " min ", reste, " s")
              FIN
              `,
            ),
            example(
              P,
              "Expressions logiques",
              `
              ALGORITHME Logique
              VARIABLES
                n : ENTIER
                pair, valide : BOOLEEN
              DEBUT
                n ← 14
                pair ← n MOD 2 = 0
                valide ← (n >= 0) ET (n <= 20)
                ECRIRE("Pair : ", pair, " ; note valide : ", valide, " ; impair : ", NON pair)
              FIN
              `,
            ),
          ],
          summary: [
            "DIV donne le quotient entier, MOD le reste.",
            "Les comparaisons produisent des booléens.",
            "ET, OU, NON combinent des conditions ; les parenthèses lèvent les ambiguïtés.",
          ],
          quiz: quiz("operateurs-quiz", "Opérateurs", [
            qcm("Que vaut 17 MOD 5 ?", ["3", "2", "3.4", "12"], 1),
            qcm("Que vaut 2 + 3 * 4 ?", ["20", "14", "24", "9"], 1),
            qcm("Quelle condition teste qu'un âge est compris entre 18 et 25 inclus ?", [
              "18 <= age <= 25",
              "(age >= 18) OU (age <= 25)",
              "(age >= 18) ET (age <= 25)",
              "age = 18 ET 25",
            ], 2),
          ]),
          exerciseSlugs: ["algo-conversion-temps"],
        }),
        lesson({
          slug: "entrees-sorties",
          title: "Entrées et sorties",
          durationMinutes: 20,
          objectives: [
            "Lire des données avec LIRE.",
            "Afficher des résultats clairs avec ECRIRE.",
          ],
          content: `
            ## Afficher : ECRIRE

            **ECRIRE** affiche des valeurs puis passe à la ligne. On peut afficher plusieurs éléments séparés par des virgules :

            ~~~pseudocode
            ECRIRE("La moyenne est ", moyenne, " sur 20")
            ~~~

            ## Lire : LIRE

            **LIRE(variable)** attend une donnée de l'utilisateur et la range dans la variable. Sur la plateforme, les données sont saisies à l'avance dans la zone **Entrée**, **une valeur par ligne**.

            ~~~pseudocode
            LIRE(nom)
            LIRE(age)
            ~~~

            La valeur lue est convertie dans le type de la variable : si la variable est un ENTIER et que l'on saisit « abc », une erreur est signalée.

            ## Bonnes pratiques

            - Afficher un message avant de lire, pour guider l'utilisateur.
            - Afficher des résultats explicites : « Moyenne : 12.5 » plutôt que « 12.5 ».
            - Pour les exercices corrigés automatiquement, respectez **exactement** le format de sortie demandé.
          `,
          examples: [
            example(
              P,
              "Saluer l'utilisateur",
              `
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
              `,
              { stdin: "Grâce\n2005" },
            ),
          ],
          summary: [
            "ECRIRE affiche ; LIRE range une donnée saisie dans une variable.",
            "Sur la plateforme, saisissez les entrées une par ligne.",
            "Respectez le format de sortie demandé par les exercices.",
          ],
          exerciseSlugs: ["algo-somme-deux-nombres", "algo-moyenne-trois-notes"],
        }),
      ],
    },
    {
      slug: "structures-controle",
      title: "Module 2 — Structures de contrôle",
      description: "Prendre des décisions et répéter des actions.",
      lessons: [
        lesson({
          slug: "structures-conditionnelles",
          title: "Structures conditionnelles",
          durationMinutes: 30,
          objectives: [
            "Écrire des tests avec SI … ALORS … SINON … FINSI.",
            "Utiliser SELON pour des choix multiples.",
          ],
          content: `
            ## SI … ALORS … FINSI

            Une condition permet d'exécuter des instructions **seulement si** une condition est vraie.

            ~~~pseudocode
            SI note >= 10 ALORS
              ECRIRE("Admis")
            FINSI
            ~~~

            ## SI … ALORS … SINON … FINSI

            ~~~pseudocode
            SI note >= 10 ALORS
              ECRIRE("Admis")
            SINON
              ECRIRE("Ajourné")
            FINSI
            ~~~

            ## Plusieurs cas : SINON SI

            ~~~pseudocode
            SI note >= 16 ALORS
              ECRIRE("Très bien")
            SINON SI note >= 14 ALORS
              ECRIRE("Bien")
            SINON SI note >= 10 ALORS
              ECRIRE("Passable")
            SINON
              ECRIRE("Insuffisant")
            FINSI
            ~~~

            Les conditions sont testées **dans l'ordre** : dès qu'une est vraie, les suivantes sont ignorées.

            ## SELON : choix selon une valeur

            ~~~pseudocode
            SELON jour
              CAS 1 : ECRIRE("Lundi")
              CAS 6, 7 : ECRIRE("Week-end")
              AUTRE : ECRIRE("Jour de semaine")
            FINSELON
            ~~~

            **SELON** compare une valeur à des constantes. Il rend le code plus lisible qu'une longue suite de SINON SI.

            ## Indentation

            Décalez les instructions à l'intérieur d'un bloc. L'interpréteur ne l'exige pas, mais vos lecteurs (et vos enseignants !) vous remercieront.
          `,
          examples: [
            example(
              P,
              "Mention d'un étudiant",
              `
              ALGORITHME Mention
              VARIABLES
                note : REEL
              DEBUT
                LIRE(note)
                SI note >= 16 ALORS
                  ECRIRE("Très bien")
                SINON SI note >= 14 ALORS
                  ECRIRE("Bien")
                SINON SI note >= 10 ALORS
                  ECRIRE("Passable")
                SINON
                  ECRIRE("Insuffisant")
                FINSI
              FIN
              `,
              { stdin: "14.5" },
            ),
            example(
              P,
              "SELON",
              `
              ALGORITHME Jour
              VARIABLES
                jour : ENTIER
              DEBUT
                LIRE(jour)
                SELON jour
                  CAS 1 : ECRIRE("Lundi")
                  CAS 2 : ECRIRE("Mardi")
                  CAS 3 : ECRIRE("Mercredi")
                  CAS 4 : ECRIRE("Jeudi")
                  CAS 5 : ECRIRE("Vendredi")
                  CAS 6, 7 : ECRIRE("Week-end")
                  AUTRE : ECRIRE("Numéro invalide")
                FINSELON
              FIN
              `,
              { stdin: "6" },
            ),
          ],
          summary: [
            "SI … ALORS … SINON … FINSI exécute un bloc selon une condition.",
            "SINON SI enchaîne plusieurs cas testés dans l'ordre.",
            "SELON compare une valeur à plusieurs constantes.",
          ],
          quiz: quiz("conditions-quiz", "Conditions", [
            qcm("Avec note = 15, que affiche l'algorithme « Mention » ?", ["Très bien", "Bien", "Passable", "Bien puis Passable"], 1,
              "15 >= 16 est faux, 15 >= 14 est vrai : « Bien » est affiché et les autres cas sont ignorés."),
            vraiFaux("Le bloc SINON est obligatoire dans un SI.", false),
          ]),
          exerciseSlugs: ["algo-pair-impair", "algo-mention"],
        }),
        lesson({
          slug: "conditions-imbriquees",
          title: "Conditions imbriquées",
          level: "debutant",
          durationMinutes: 25,
          objectives: [
            "Placer un SI à l'intérieur d'un autre SI.",
            "Simplifier des conditions avec ET / OU.",
          ],
          content: `
            ## Imbriquer des conditions

            Un bloc SI peut contenir un autre SI. Exemple : déterminer le signe d'un produit sans le calculer.

            ~~~pseudocode
            SI a = 0 OU b = 0 ALORS
              ECRIRE("nul")
            SINON
              SI (a > 0 ET b > 0) OU (a < 0 ET b < 0) ALORS
                ECRIRE("positif")
              SINON
                ECRIRE("négatif")
              FINSI
            FINSI
            ~~~

            Chaque **SI** doit être fermé par son **FINSI**. L'indentation permet de vérifier visuellement l'appariement.

            ## Imbriquer ou combiner ?

            Ces deux écritures sont équivalentes :

            ~~~pseudocode
            SI age >= 18 ALORS
              SI inscrit ALORS
                ECRIRE("Accès autorisé")
              FINSI
            FINSI
            ~~~

            ~~~pseudocode
            SI age >= 18 ET inscrit ALORS
              ECRIRE("Accès autorisé")
            FINSI
            ~~~

            La seconde est plus lisible. On imbrique quand chaque niveau a ses propres actions (par exemple un SINON différent).

            ## Erreurs fréquentes

            - Oublier un FINSI : l'interpréteur signale « FINSI attendu ».
            - Tester des cas qui se chevauchent dans le mauvais ordre.
            - Écrire 0 < x < 10 au lieu de (x > 0) ET (x < 10).
          `,
          examples: [
            example(
              P,
              "Le plus grand de trois nombres",
              `
              ALGORITHME Maximum3
              VARIABLES
                a, b, c, max : ENTIER
              DEBUT
                LIRE(a)
                LIRE(b)
                LIRE(c)
                SI a >= b ALORS
                  SI a >= c ALORS
                    max ← a
                  SINON
                    max ← c
                  FINSI
                SINON
                  SI b >= c ALORS
                    max ← b
                  SINON
                    max ← c
                  FINSI
                FINSI
                ECRIRE("Maximum : ", max)
              FIN
              `,
              { stdin: "12\n45\n7" },
            ),
          ],
          summary: [
            "Un SI peut contenir d'autres SI ; chacun a son FINSI.",
            "ET / OU permettent souvent d'éviter des imbrications.",
            "L'ordre des tests compte quand les cas se chevauchent.",
          ],
          exerciseSlugs: ["algo-annee-bissextile"],
        }),
        lesson({
          slug: "boucles",
          title: "Boucles POUR, TANT QUE et RÉPÉTER",
          durationMinutes: 40,
          objectives: [
            "Répéter des instructions avec POUR, TANT QUE et RÉPÉTER.",
            "Choisir la boucle adaptée à la situation.",
            "Éviter les boucles infinies.",
          ],
          content: `
            ## La boucle POUR

            Quand on connaît **à l'avance** le nombre de répétitions :

            ~~~pseudocode
            POUR i DE 1 A 5 FAIRE
              ECRIRE(i)
            FINPOUR
            ~~~

            Le compteur **i** prend successivement les valeurs 1, 2, 3, 4, 5. On peut préciser un pas : **POUR i DE 10 A 0 PAS -2 FAIRE**.

            ## La boucle TANT QUE

            Quand on répète **tant qu'une condition est vraie**, sans connaître le nombre de tours :

            ~~~pseudocode
            TANT QUE solde < objectif FAIRE
              solde ← solde * 1.05
              annees ← annees + 1
            FINTANTQUE
            ~~~

            La condition est testée **avant** chaque tour : si elle est fausse au départ, la boucle ne s'exécute jamais.

            ## La boucle RÉPÉTER … JUSQU'À

            La condition est testée **après** chaque tour : le corps s'exécute **au moins une fois**. Idéal pour contrôler une saisie :

            ~~~pseudocode
            REPETER
              LIRE(note)
            JUSQU'A (note >= 0) ET (note <= 20)
            ~~~

            Attention : RÉPÉTER s'arrête quand la condition devient **vraie**, TANT QUE s'arrête quand elle devient **fausse**.

            ## Quelle boucle choisir ?

            | Situation | Boucle |
            |---|---|
            | Nombre de tours connu | POUR |
            | Condition testée avant, 0 tour possible | TANT QUE |
            | Au moins un tour | RÉPÉTER |

            ## Boucles infinies

            Si la condition de sortie n'est jamais atteinte, la boucle ne s'arrête pas. La plateforme interrompt automatiquement le programme après un grand nombre d'instructions. Vérifiez toujours que **la condition finit par changer** dans le corps de la boucle.
          `,
          examples: [
            example(
              P,
              "Table de multiplication",
              `
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
              { stdin: "7" },
            ),
            example(
              P,
              "Épargne avec TANT QUE",
              `
              ALGORITHME Epargne
              VARIABLES
                solde : REEL
                annees : ENTIER
              DEBUT
                solde ← 1000
                annees ← 0
                TANT QUE solde < 2000 FAIRE
                  solde ← solde * 1.08
                  annees ← annees + 1
                FINTANTQUE
                ECRIRE("Capital doublé après ", annees, " ans")
              FIN
              `,
            ),
            example(
              P,
              "Saisie contrôlée avec RÉPÉTER",
              `
              ALGORITHME SaisieNote
              VARIABLES
                note : REEL
              DEBUT
                REPETER
                  ECRIRE("Entrez une note entre 0 et 20 :")
                  LIRE(note)
                JUSQU'A (note >= 0) ET (note <= 20)
                ECRIRE("Note acceptée : ", note)
              FIN
              `,
              { stdin: "25\n-3\n12" },
            ),
          ],
          summary: [
            "POUR : nombre de tours connu.",
            "TANT QUE : condition testée avant chaque tour.",
            "RÉPÉTER … JUSQU'À : au moins un tour, s'arrête quand la condition est vraie.",
          ],
          quiz: quiz("boucles-quiz", "Boucles", [
            qcm("Combien de fois s'exécute le corps de POUR i DE 3 A 7 FAIRE ?", ["4", "5", "7", "3"], 1),
            qcm("Quelle boucle s'exécute toujours au moins une fois ?", ["POUR", "TANT QUE", "RÉPÉTER … JUSQU'À", "Aucune"], 2),
            vraiFaux("Une boucle TANT QUE dont la condition est fausse au départ ne s'exécute pas.", true),
          ]),
          exerciseSlugs: ["algo-table-multiplication", "algo-somme-n-premiers"],
        }),
        lesson({
          slug: "compteurs-accumulateurs",
          title: "Compteurs et accumulateurs",
          durationMinutes: 30,
          objectives: [
            "Utiliser un compteur pour dénombrer.",
            "Utiliser un accumulateur pour calculer une somme ou un produit.",
            "Rechercher un minimum ou un maximum au fil d'une saisie.",
          ],
          content: `
            ## Le compteur

            Un **compteur** est une variable entière que l'on augmente de 1 à chaque fois qu'un événement se produit.

            ~~~pseudocode
            nbAdmis ← 0              // initialisation AVANT la boucle
            ...
            SI note >= 10 ALORS
              nbAdmis ← nbAdmis + 1  // incrémentation
            FINSI
            ~~~

            ## L'accumulateur

            Un **accumulateur** cumule des valeurs : somme (initialisée à 0) ou produit (initialisé à 1).

            ~~~pseudocode
            somme ← 0
            POUR i DE 1 A n FAIRE
              LIRE(x)
              somme ← somme + x
            FINPOUR
            ~~~

            ## Minimum et maximum

            On initialise le maximum avec la **première valeur** lue, puis on compare chaque nouvelle valeur.

            ## La règle d'or

            **Toujours initialiser** compteurs et accumulateurs avant la boucle. Une variable utilisée sans valeur provoque une erreur : « utilisée avant d'avoir reçu une valeur ».

            ## La valeur sentinelle

            Pour lire une série dont on ne connaît pas la longueur, on convient d'une valeur d'arrêt (par exemple -1) :

            ~~~pseudocode
            LIRE(x)
            TANT QUE x <> -1 FAIRE
              somme ← somme + x
              LIRE(x)
            FINTANTQUE
            ~~~
          `,
          examples: [
            example(
              P,
              "Statistiques d'une promotion",
              `
              ALGORITHME Statistiques
              VARIABLES
                n, i, nbAdmis : ENTIER
                note, somme, meilleure : REEL
              DEBUT
                LIRE(n)
                somme ← 0
                nbAdmis ← 0
                POUR i DE 1 A n FAIRE
                  LIRE(note)
                  somme ← somme + note
                  SI note >= 10 ALORS
                    nbAdmis ← nbAdmis + 1
                  FINSI
                  SI i = 1 OU note > meilleure ALORS
                    meilleure ← note
                  FINSI
                FINPOUR
                ECRIRE("Moyenne : ", somme / n)
                ECRIRE("Admis : ", nbAdmis, " sur ", n)
                ECRIRE("Meilleure note : ", meilleure)
              FIN
              `,
              {
                stdin: "5\n12\n8.5\n15\n9\n17",
                explanation: "Le OU est évalué de gauche à droite : au premier tour, i = 1 est vrai et meilleure n'est pas encore lue.",
              },
            ),
          ],
          summary: [
            "Compteur : +1 à chaque événement, initialisé à 0.",
            "Accumulateur : somme (0) ou produit (1).",
            "Toujours initialiser avant la boucle.",
          ],
          exerciseSlugs: ["algo-compter-positifs", "algo-factorielle"],
        }),
      ],
    },
    {
      slug: "donnees-structurees",
      title: "Module 3 — Tableaux et chaînes",
      description: "Manipuler des collections de valeurs et du texte.",
      lessons: [
        lesson({
          slug: "tableaux",
          title: "Tableaux",
          durationMinutes: 40,
          level: "intermediaire",
          objectives: [
            "Déclarer et parcourir un tableau.",
            "Accéder à une case par son indice.",
            "Utiliser des tableaux à deux dimensions.",
          ],
          content: `
            ## Pourquoi des tableaux ?

            Pour stocker les notes de 50 étudiants, déclarer 50 variables serait absurde. Un **tableau** regroupe plusieurs valeurs **du même type** sous un seul nom ; chaque case est repérée par un **indice**.

            ## Déclaration

            ~~~pseudocode
            VARIABLES
              notes : TABLEAU[1..50] DE REEL
            ~~~

            Les indices vont ici de 1 à 50. On accède à une case avec **notes[i]**.

            ## Parcourir un tableau

            La boucle POUR est l'outil naturel :

            ~~~pseudocode
            POUR i DE 1 A 50 FAIRE
              LIRE(notes[i])
            FINPOUR
            ~~~

            ## Débordement

            Accéder à **notes[51]** provoque l'erreur « indice hors limites ». C'est l'une des erreurs les plus fréquentes : vérifiez les bornes de vos boucles.

            ## Tableaux à deux dimensions

            Une matrice (tableau de lignes et de colonnes) se déclare ainsi :

            ~~~pseudocode
            M : TABLEAU[1..3, 1..4] DE ENTIER
            M[2, 3] ← 7
            ~~~

            On la parcourt avec deux boucles imbriquées : une pour les lignes, une pour les colonnes.

            ## Passage à un sous-programme

            Un tableau passé à une fonction l'est **par référence** : la fonction travaille directement sur le tableau d'origine.
          `,
          examples: [
            example(
              P,
              "Notes au-dessus de la moyenne",
              `
              ALGORITHME AuDessus
              CONSTANTES
                N = 5
              VARIABLES
                notes : TABLEAU[1..N] DE REEL
                i : ENTIER
                somme, moyenne : REEL
              DEBUT
                somme ← 0
                POUR i DE 1 A N FAIRE
                  LIRE(notes[i])
                  somme ← somme + notes[i]
                FINPOUR
                moyenne ← somme / N
                ECRIRE("Moyenne : ", moyenne)
                POUR i DE 1 A N FAIRE
                  SI notes[i] > moyenne ALORS
                    ECRIRE("Étudiant ", i, " : ", notes[i])
                  FINSI
                FINPOUR
              FIN
              `,
              { stdin: "12\n7\n15\n10\n16" },
            ),
            example(
              P,
              "Matrice et boucles imbriquées",
              `
              ALGORITHME Matrice
              VARIABLES
                M : TABLEAU[1..3, 1..3] DE ENTIER
                i, j : ENTIER
                ligne : CHAINE
              DEBUT
                POUR i DE 1 A 3 FAIRE
                  ligne ← ""
                  POUR j DE 1 A 3 FAIRE
                    M[i, j] ← i * j
                    ligne ← ligne + CHAINE(M[i, j]) + " "
                  FINPOUR
                  ECRIRE(ligne)
                FINPOUR
              FIN
              `,
            ),
          ],
          summary: [
            "Un tableau regroupe des valeurs de même type, repérées par un indice.",
            "On le parcourt avec une boucle POUR.",
            "Attention aux indices hors limites.",
          ],
          quiz: quiz("tableaux-quiz", "Tableaux", [
            qcm("T : TABLEAU[1..10] DE ENTIER. Combien de cases contient T ?", ["9", "10", "11", "1"], 1),
            vraiFaux("Un tableau peut contenir à la fois des entiers et des chaînes.", false),
          ]),
          exerciseSlugs: ["algo-inverser-tableau", "algo-maximum-tableau"],
        }),
        lesson({
          slug: "chaines-caracteres",
          title: "Chaînes de caractères",
          durationMinutes: 30,
          level: "intermediaire",
          objectives: [
            "Concaténer des chaînes.",
            "Accéder aux caractères d'une chaîne.",
            "Utiliser les fonctions prédéfinies sur les chaînes.",
          ],
          content: `
            ## Concaténation

            L'opérateur **+** colle deux chaînes : "Bon" + "jour" donne "Bonjour". Pour coller un nombre, convertissez-le : "Note : " + CHAINE(15).

            ## Accès aux caractères

            Une chaîne se comporte comme un tableau de caractères indicé **à partir de 1** : si s ← "UPL", alors s[1] vaut 'U' et s[3] vaut 'L'.

            ## Fonctions utiles

            | Fonction | Rôle | Exemple | Résultat |
            |---|---|---|---|
            | LONGUEUR(s) | nombre de caractères | LONGUEUR("code") | 4 |
            | MAJUSCULE(s) | en majuscules | MAJUSCULE("upl") | "UPL" |
            | MINUSCULE(s) | en minuscules | MINUSCULE("UPL") | "upl" |
            | SOUSCHAINE(s, d, n) | n caractères à partir de d | SOUSCHAINE("algorithme", 1, 4) | "algo" |
            | ORD(c) / CHR(n) | code d'un caractère et inverse | ORD("A") | 65 |

            ## Parcours d'une chaîne

            ~~~pseudocode
            POUR i DE 1 A LONGUEUR(s) FAIRE
              SI s[i] = "a" ALORS
                nb ← nb + 1
              FINSI
            FINPOUR
            ~~~

            ## Comparaison

            Les chaînes se comparent avec = et <>, et aussi avec < ou > (ordre alphabétique). La comparaison distingue majuscules et minuscules : utilisez MINUSCULE pour comparer sans en tenir compte.
          `,
          examples: [
            example(
              P,
              "Palindrome",
              `
              ALGORITHME Palindrome
              VARIABLES
                mot, envers : CHAINE
                i : ENTIER
              DEBUT
                LIRE(mot)
                mot ← MINUSCULE(mot)
                envers ← ""
                POUR i DE LONGUEUR(mot) A 1 PAS -1 FAIRE
                  envers ← envers + mot[i]
                FINPOUR
                SI mot = envers ALORS
                  ECRIRE(mot, " est un palindrome")
                SINON
                  ECRIRE(mot, " n'est pas un palindrome")
                FINSI
              FIN
              `,
              { stdin: "Radar" },
            ),
          ],
          summary: [
            "+ concatène ; CHAINE(x) convertit un nombre en texte.",
            "s[i] donne le i-ème caractère (à partir de 1).",
            "LONGUEUR, MAJUSCULE, MINUSCULE, SOUSCHAINE sont prédéfinies.",
          ],
          exerciseSlugs: ["algo-compter-voyelles"],
        }),
      ],
    },
    {
      slug: "modularite",
      title: "Module 4 — Sous-programmes",
      description: "Découper un algorithme en fonctions et procédures réutilisables.",
      lessons: [
        lesson({
          slug: "fonctions-procedures",
          title: "Fonctions et procédures",
          durationMinutes: 45,
          level: "intermediaire",
          objectives: [
            "Définir et appeler une fonction qui retourne une valeur.",
            "Définir et appeler une procédure.",
            "Distinguer passage par valeur et par référence.",
          ],
          content: `
            ## Pourquoi découper ?

            Un algorithme long devient vite illisible. Les **sous-programmes** permettent de :

            - donner un nom à une tâche précise ;
            - réutiliser le même code plusieurs fois ;
            - tester chaque partie séparément.

            ## La fonction

            Une **fonction** calcule et **retourne** une valeur :

            ~~~pseudocode
            FONCTION carre(x : REEL) : REEL
            DEBUT
              RETOURNER x * x
            FIN
            ~~~

            On l'utilise dans une expression : **y ← carre(3) + 1**.

            ## La procédure

            Une **procédure** effectue une action mais ne retourne pas de valeur :

            ~~~pseudocode
            PROCEDURE afficherLigne(n : ENTIER)
            VARIABLES
              i : ENTIER
              ligne : CHAINE
            DEBUT
              ligne ← ""
              POUR i DE 1 A n FAIRE
                ligne ← ligne + "-"
              FINPOUR
              ECRIRE(ligne)
            FIN
            ~~~

            On l'appelle comme une instruction : **afficherLigne(20)**.

            ## Paramètres et variables locales

            - Les **paramètres** reçoivent les valeurs transmises à l'appel.
            - Les **variables locales** (section VARIABLES du sous-programme) n'existent que pendant l'appel.

            ## Passage par valeur ou par référence

            Par défaut, un paramètre reçoit une **copie** : le modifier ne change pas la variable de l'appelant. Avec le mot-clé **VAR** (ou E/S), le paramètre est passé **par référence** : le sous-programme modifie directement la variable d'origine.

            ~~~pseudocode
            PROCEDURE echanger(VAR a : ENTIER, VAR b : ENTIER)
            ~~~

            ## Où placer les sous-programmes ?

            Avant ou après le bloc DEBUT … FIN principal. Une fonction peut se terminer par FIN ou FINFONCTION.
          `,
          examples: [
            example(
              P,
              "Fonction et procédure",
              `
              ALGORITHME Sousprogrammes

              FONCTION estPair(n : ENTIER) : BOOLEEN
              DEBUT
                RETOURNER n MOD 2 = 0
              FIN

              PROCEDURE echanger(VAR a : ENTIER, VAR b : ENTIER)
              VARIABLES
                t : ENTIER
              DEBUT
                t ← a
                a ← b
                b ← t
              FIN

              VARIABLES
                x, y : ENTIER
              DEBUT
                x ← 4
                y ← 9
                ECRIRE("4 est pair : ", estPair(x))
                echanger(x, y)
                ECRIRE("Après échange : x = ", x, ", y = ", y)
              FIN
              `,
            ),
          ],
          summary: [
            "Une fonction retourne une valeur avec RETOURNER ; une procédure non.",
            "Les variables locales n'existent que pendant l'appel.",
            "VAR passe un paramètre par référence.",
          ],
          quiz: quiz("fonctions-quiz", "Sous-programmes", [
            qcm("Quelle est la différence principale entre fonction et procédure ?", [
              "La fonction ne prend pas de paramètres",
              "La fonction retourne une valeur, la procédure non",
              "La procédure est plus rapide",
              "Il n'y a aucune différence",
            ], 1),
            vraiFaux("Sans VAR, modifier un paramètre dans une procédure modifie la variable de l'appelant.", false),
          ]),
          exerciseSlugs: ["algo-fonction-puissance"],
        }),
        lesson({
          slug: "recursivite",
          title: "Récursivité",
          durationMinutes: 40,
          level: "avance",
          objectives: [
            "Comprendre le principe d'une fonction récursive.",
            "Identifier le cas de base et le cas récursif.",
            "Suivre l'exécution d'appels récursifs.",
          ],
          content: `
            ## Définition

            Une fonction est **récursive** lorsqu'elle s'appelle elle-même. C'est une façon élégante de résoudre un problème en le ramenant à une **version plus petite** du même problème.

            ## Les deux ingrédients indispensables

            1. **Le cas de base** : une situation simple où l'on connaît la réponse directement.
            2. **Le cas récursif** : on résout le problème en appelant la fonction sur un problème plus petit, qui se rapproche du cas de base.

            ## Exemple : la factorielle

            n! = n × (n-1)! et 0! = 1.

            ~~~pseudocode
            FONCTION fact(n : ENTIER) : ENTIER
            DEBUT
              SI n = 0 ALORS
                RETOURNER 1               // cas de base
              FINSI
              RETOURNER n * fact(n - 1)   // cas récursif
            FIN
            ~~~

            ## Ce qui se passe en mémoire

            fact(3) appelle fact(2), qui appelle fact(1), qui appelle fact(0). fact(0) retourne 1, puis les résultats « remontent » : 1 × 1 = 1, 2 × 1 = 2, 3 × 2 = 6. Chaque appel en attente occupe de la mémoire dans la **pile d'appels**.

            ## Le danger : la récursivité infinie

            Sans cas de base, ou si le cas de base n'est jamais atteint, la fonction s'appelle indéfiniment. La plateforme l'arrête et affiche « Trop d'appels imbriqués ».

            ## Récursif ou itératif ?

            Tout algorithme récursif peut s'écrire avec des boucles. La récursivité est naturelle pour les problèmes qui se décomposent (tours de Hanoï, parcours d'arbres, tri fusion), mais elle peut être coûteuse : la version récursive naïve de Fibonacci recalcule de nombreuses fois les mêmes valeurs.
          `,
          examples: [
            example(
              P,
              "Factorielle et Fibonacci",
              `
              ALGORITHME Recursivite

              FONCTION fact(n : ENTIER) : ENTIER
              DEBUT
                SI n = 0 ALORS
                  RETOURNER 1
                FINSI
                RETOURNER n * fact(n - 1)
              FIN

              FONCTION fib(n : ENTIER) : ENTIER
              DEBUT
                SI n <= 1 ALORS
                  RETOURNER n
                FINSI
                RETOURNER fib(n - 1) + fib(n - 2)
              FIN

              VARIABLES
                i : ENTIER
              DEBUT
                ECRIRE("5! = ", fact(5))
                POUR i DE 0 A 10 FAIRE
                  ECRIRE("fib(", i, ") = ", fib(i))
                FINPOUR
              FIN
              `,
            ),
            example(
              P,
              "Tours de Hanoï",
              `
              ALGORITHME Hanoi

              PROCEDURE hanoi(n : ENTIER, depart : CHAINE, arrivee : CHAINE, inter : CHAINE)
              DEBUT
                SI n > 0 ALORS
                  hanoi(n - 1, depart, inter, arrivee)
                  ECRIRE("Déplacer le disque ", n, " de ", depart, " vers ", arrivee)
                  hanoi(n - 1, inter, arrivee, depart)
                FINSI
              FIN

              DEBUT
                hanoi(3, "A", "C", "B")
              FIN
              `,
            ),
          ],
          summary: [
            "Une fonction récursive s'appelle elle-même.",
            "Il faut un cas de base et un cas récursif qui s'en rapproche.",
            "Chaque appel en attente occupe la pile d'appels.",
          ],
          quiz: quiz("recursivite-quiz", "Récursivité", [
            qcm("Que se passe-t-il si une fonction récursive n'a pas de cas de base ?", [
              "Elle retourne 0",
              "Elle s'appelle indéfiniment jusqu'à saturer la mémoire",
              "Elle s'exécute une seule fois",
              "Le compilateur ajoute un cas de base automatiquement",
            ], 1),
          ]),
          exerciseSlugs: ["algo-somme-chiffres-recursive"],
        }),
      ],
    },
    {
      slug: "algorithmes-classiques",
      title: "Module 5 — Algorithmes classiques et méthodes",
      description: "Rechercher, trier, mesurer l'efficacité et résoudre des problèmes complets.",
      lessons: [
        lesson({
          slug: "recherche-tri",
          title: "Recherche et tri",
          durationMinutes: 50,
          level: "intermediaire",
          objectives: [
            "Programmer une recherche séquentielle et une recherche dichotomique.",
            "Programmer le tri par sélection et le tri à bulles.",
          ],
          content: `
            ## Recherche séquentielle

            On parcourt le tableau case par case jusqu'à trouver la valeur. Simple et valable pour tout tableau, mais il faut parfois parcourir **toutes** les cases.

            ## Recherche dichotomique

            Si le tableau est **trié**, on compare la valeur cherchée avec l'élément du **milieu** :

            - égale : trouvée ;
            - plus petite : on cherche dans la moitié gauche ;
            - plus grande : dans la moitié droite.

            À chaque étape, la zone de recherche est divisée par deux. Pour 1 000 000 d'éléments, une vingtaine de comparaisons suffisent !

            ## Tri par sélection

            Pour chaque position i, on cherche le plus petit élément entre i et la fin, puis on l'échange avec la case i.

            ## Tri à bulles

            On parcourt le tableau en échangeant les voisins mal ordonnés. Après chaque passage, le plus grand élément restant « remonte » à sa place définitive, comme une bulle.

            ## Comparaison

            | Algorithme | Condition | Coût (pire cas) |
            |---|---|---|
            | Recherche séquentielle | aucune | n comparaisons |
            | Recherche dichotomique | tableau trié | environ log2(n) |
            | Tri par sélection | aucune | environ n²/2 comparaisons |
            | Tri à bulles | aucune | environ n²/2 comparaisons |

            Des tris plus rapides existent (tri fusion, tri rapide) ; ils utilisent la récursivité.
          `,
          examples: [
            example(
              P,
              "Recherche dichotomique",
              `
              ALGORITHME Dichotomie
              VARIABLES
                T : TABLEAU[1..10] DE ENTIER
                i, x, gauche, droite, milieu : ENTIER
                trouve : BOOLEEN
              DEBUT
                POUR i DE 1 A 10 FAIRE
                  T[i] ← i * 3        // tableau trié : 3, 6, 9, …, 30
                FINPOUR
                LIRE(x)
                gauche ← 1
                droite ← 10
                trouve ← FAUX
                TANT QUE gauche <= droite ET NON trouve FAIRE
                  milieu ← (gauche + droite) DIV 2
                  SI T[milieu] = x ALORS
                    trouve ← VRAI
                  SINON SI x < T[milieu] ALORS
                    droite ← milieu - 1
                  SINON
                    gauche ← milieu + 1
                  FINSI
                FINTANTQUE
                SI trouve ALORS
                  ECRIRE(x, " trouvé à la position ", milieu)
                SINON
                  ECRIRE(x, " absent du tableau")
                FINSI
              FIN
              `,
              { stdin: "21" },
            ),
            example(
              P,
              "Tri par sélection",
              `
              ALGORITHME TriSelection
              CONSTANTES
                N = 6
              VARIABLES
                T : TABLEAU[1..N] DE ENTIER
                i, j, iMin, temp : ENTIER
                ligne : CHAINE
              DEBUT
                POUR i DE 1 A N FAIRE
                  LIRE(T[i])
                FINPOUR
                POUR i DE 1 A N - 1 FAIRE
                  iMin ← i
                  POUR j DE i + 1 A N FAIRE
                    SI T[j] < T[iMin] ALORS
                      iMin ← j
                    FINSI
                  FINPOUR
                  temp ← T[i]
                  T[i] ← T[iMin]
                  T[iMin] ← temp
                FINPOUR
                ligne ← ""
                POUR i DE 1 A N FAIRE
                  ligne ← ligne + CHAINE(T[i]) + " "
                FINPOUR
                ECRIRE("Tableau trié : ", ligne)
              FIN
              `,
              { stdin: "42\n7\n19\n3\n25\n11" },
            ),
          ],
          summary: [
            "Recherche séquentielle : tout tableau, jusqu'à n comparaisons.",
            "Recherche dichotomique : tableau trié, environ log2(n) comparaisons.",
            "Tri par sélection et tri à bulles : environ n² comparaisons.",
          ],
          quiz: quiz("tri-quiz", "Recherche et tri", [
            vraiFaux("La recherche dichotomique fonctionne sur un tableau non trié.", false),
            qcm("Combien de comparaisons au maximum pour une recherche dichotomique dans 1 024 éléments ?", ["environ 10", "environ 100", "512", "1 024"], 0,
              "1 024 = 2^10 : on divise 10 fois la zone par deux."),
          ]),
          exerciseSlugs: ["algo-recherche-sequentielle", "algo-tri-bulles"],
        }),
        lesson({
          slug: "complexite",
          title: "Complexité algorithmique",
          durationMinutes: 35,
          level: "avance",
          objectives: [
            "Estimer le nombre d'opérations d'un algorithme.",
            "Connaître les notations O(1), O(log n), O(n), O(n log n), O(n²).",
          ],
          content: `
            ## Pourquoi mesurer ?

            Deux algorithmes corrects peuvent avoir des performances très différentes. La **complexité** mesure comment le temps (ou la mémoire) évolue quand la taille des données **n** grandit.

            ## Compter les opérations

            On compte les opérations élémentaires (affectations, comparaisons) dans le **pire cas** :

            - une boucle de 1 à n contenant k opérations : environ k × n ;
            - deux boucles imbriquées de 1 à n : environ n × n = n².

            ## La notation O (grand O)

            On ne garde que le terme qui domine quand n devient grand, sans les constantes : 3n² + 5n + 2 s'écrit **O(n²)**.

            | Complexité | Nom | Exemple | n = 1 000 |
            |---|---|---|---|
            | O(1) | constante | accès à T[i] | 1 |
            | O(log n) | logarithmique | recherche dichotomique | ~10 |
            | O(n) | linéaire | recherche séquentielle | 1 000 |
            | O(n log n) | quasi linéaire | tri fusion | ~10 000 |
            | O(n²) | quadratique | tri par sélection | 1 000 000 |
            | O(2^n) | exponentielle | Fibonacci récursif naïf | astronomique |

            ## En pratique

            - Avant d'optimiser, assurez-vous que l'algorithme est **correct**.
            - Une boucle imbriquée sur les mêmes données est souvent le signe d'un O(n²).
            - Pour de grandes données, passer de O(n²) à O(n log n) change tout.
          `,
          examples: [
            example(
              P,
              "Compter les opérations",
              `
              ALGORITHME CompterOperations
              VARIABLES
                n, i, j, compteur : ENTIER
              DEBUT
                POUR n DE 10 A 40 PAS 10 FAIRE
                  compteur ← 0
                  POUR i DE 1 A n FAIRE
                    POUR j DE 1 A n FAIRE
                      compteur ← compteur + 1
                    FINPOUR
                  FINPOUR
                  ECRIRE("n = ", n, " -> ", compteur, " opérations")
                FINPOUR
              FIN
              `,
              { explanation: "Quand n double, le nombre d'opérations est multiplié par 4 : c'est la signature d'un O(n²)." },
            ),
          ],
          summary: [
            "La complexité décrit l'évolution du coût en fonction de n.",
            "On garde le terme dominant : 3n² + 5n devient O(n²).",
            "O(log n) < O(n) < O(n log n) < O(n²) < O(2^n).",
          ],
          quiz: quiz("complexite-quiz", "Complexité", [
            qcm("Quelle est la complexité de deux boucles POUR imbriquées de 1 à n ?", ["O(n)", "O(log n)", "O(n²)", "O(1)"], 2),
            qcm("Comment s'écrit 5n + 100 en notation O ?", ["O(5n)", "O(n)", "O(100)", "O(n + 100)"], 1),
          ]),
        }),
        lesson({
          slug: "organigrammes",
          title: "Organigrammes",
          durationMinutes: 25,
          objectives: [
            "Lire et dessiner un organigramme.",
            "Passer d'un organigramme au pseudocode et inversement.",
          ],
          content: `
            ## Qu'est-ce qu'un organigramme ?

            Un **organigramme** (ou logigramme) représente un algorithme sous forme de **schéma**. Il est utile pour visualiser le cheminement d'un algorithme, en particulier les conditions et les boucles.

            ## Les symboles normalisés

            | Symbole | Forme | Signification |
            |---|---|---|
            | Terminal | ovale | Début ou fin |
            | Traitement | rectangle | Calcul, affectation |
            | Entrée / sortie | parallélogramme | LIRE ou ECRIRE |
            | Décision | losange | Condition (deux sorties : oui / non) |
            | Flèche | ligne fléchée | Ordre d'exécution |

            ## Exemple : pair ou impair

            ~~~text
               ( DÉBUT )
                   |
              / LIRE n /
                   |
              < n MOD 2 = 0 ? >
               oui |      | non
            / ÉCRIRE    / ÉCRIRE
              "pair" /    "impair" /
                   |      |
                ( FIN ) <-
            ~~~

            ## Représenter une boucle

            Une boucle apparaît comme une **flèche qui remonte** vers un losange de décision. Une boucle TANT QUE teste la condition avant le traitement ; une boucle RÉPÉTER la teste après.

            ## Du schéma au pseudocode

            - Chaque losange devient un **SI** ou la condition d'une **boucle**.
            - Chaque rectangle devient une **affectation**.
            - Chaque parallélogramme devient **LIRE** ou **ECRIRE**.

            Pour les problèmes plus longs, le pseudocode est plus compact ; l'organigramme reste précieux pour expliquer la logique à l'oral ou en examen.
          `,
          examples: [
            example(
              P,
              "Traduction de l'organigramme « pair ou impair »",
              `
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
              { stdin: "7" },
            ),
          ],
          summary: [
            "Ovale : début/fin ; rectangle : traitement ; parallélogramme : entrée/sortie ; losange : décision.",
            "Une boucle est une flèche qui remonte vers une décision.",
            "Chaque symbole se traduit par une instruction de pseudocode.",
          ],
          quiz: quiz("organigramme-quiz", "Organigrammes", [
            qcm("Quel symbole représente une condition ?", ["Le rectangle", "L'ovale", "Le losange", "Le parallélogramme"], 2),
          ]),
        }),
        lesson({
          slug: "resolution-problemes",
          title: "Résolution de problèmes complexes",
          durationMinutes: 50,
          level: "avance",
          objectives: [
            "Appliquer une méthode de résolution en étapes.",
            "Décomposer un problème en sous-problèmes.",
            "Tester un algorithme avec des cas limites.",
          ],
          content: `
            ## Une méthode en cinq étapes

            1. **Comprendre** : reformuler l'énoncé, identifier entrées et sorties, traiter un exemple à la main.
            2. **Décomposer** : découper en sous-problèmes plus simples (chacun deviendra souvent une fonction).
            3. **Concevoir** : choisir les structures de données (variables, tableaux) et les algorithmes (recherche, tri…).
            4. **Écrire** : rédiger le pseudocode, sous-problème par sous-problème.
            5. **Tester** : vérifier avec des cas normaux et des **cas limites** (tableau vide, valeur négative, zéro, valeurs égales…).

            ## Exemple : gestion des résultats d'une promotion

            Énoncé : lire les notes de n étudiants, afficher la moyenne, le nombre d'admis, la meilleure note et les notes triées.

            Décomposition :

            - lire les notes → procédure **lireNotes** ;
            - calculer la moyenne → fonction **moyenne** ;
            - compter les admis → fonction **nbAdmis** ;
            - trier → procédure **trier** ;
            - afficher → programme principal.

            ## Tester avec des cas limites

            | Cas | Pourquoi |
            |---|---|
            | n = 1 | un seul élément |
            | toutes les notes égales | égalités dans les comparaisons |
            | notes 0 et 20 | bornes |

            ## Déboguer

            Quand le résultat est faux : ajoutez des ECRIRE pour suivre les variables, faites une trace à la main sur un petit exemple, ou demandez au **professeur IA** de vous aider à analyser l'erreur.
          `,
          examples: [
            example(
              P,
              "Programme complet décomposé",
              `
              ALGORITHME Promotion
              CONSTANTES
                MAX = 100
              VARIABLES
                notes : TABLEAU[1..MAX] DE REEL
                n, i : ENTIER
                ligne : CHAINE

              PROCEDURE lireNotes(T : TABLEAU DE REEL, n : ENTIER)
              VARIABLES
                i : ENTIER
              DEBUT
                POUR i DE 1 A n FAIRE
                  LIRE(T[i])
                FINPOUR
              FIN

              FONCTION moyenne(T : TABLEAU DE REEL, n : ENTIER) : REEL
              VARIABLES
                i : ENTIER
                s : REEL
              DEBUT
                s ← 0
                POUR i DE 1 A n FAIRE
                  s ← s + T[i]
                FINPOUR
                RETOURNER s / n
              FIN

              FONCTION nbAdmis(T : TABLEAU DE REEL, n : ENTIER) : ENTIER
              VARIABLES
                i, c : ENTIER
              DEBUT
                c ← 0
                POUR i DE 1 A n FAIRE
                  SI T[i] >= 10 ALORS
                    c ← c + 1
                  FINSI
                FINPOUR
                RETOURNER c
              FIN

              PROCEDURE trier(T : TABLEAU DE REEL, n : ENTIER)
              VARIABLES
                i, j : ENTIER
                tmp : REEL
              DEBUT
                POUR i DE 1 A n - 1 FAIRE
                  POUR j DE 1 A n - i FAIRE
                    SI T[j] > T[j + 1] ALORS
                      tmp ← T[j]
                      T[j] ← T[j + 1]
                      T[j + 1] ← tmp
                    FINSI
                  FINPOUR
                FINPOUR
              FIN

              DEBUT
                LIRE(n)
                lireNotes(notes, n)
                ECRIRE("Moyenne : ", moyenne(notes, n))
                ECRIRE("Admis : ", nbAdmis(notes, n), "/", n)
                trier(notes, n)
                ECRIRE("Meilleure note : ", notes[n])
                ligne ← ""
                POUR i DE 1 A n FAIRE
                  ligne ← ligne + CHAINE(notes[i]) + " "
                FINPOUR
                ECRIRE("Notes triées : ", ligne)
              FIN
              `,
              { stdin: "6\n12\n8\n15.5\n10\n6.5\n18" },
            ),
          ],
          summary: [
            "Comprendre, décomposer, concevoir, écrire, tester.",
            "Chaque sous-problème devient une fonction ou une procédure.",
            "Testez toujours les cas limites.",
          ],
          exerciseSlugs: ["algo-nombres-premiers", "algo-projet-caisse"],
        }),
      ],
    },
  ],
  finalQuiz: quiz("algorithmique-evaluation-finale", "Évaluation finale — Algorithmique", [
    qcm("Que vaut x après : x ← 5 ; x ← x * 2 + 1 ?", ["5", "10", "11", "12"], 2),
    qcm("Que vaut 23 DIV 4 ?", ["5", "5.75", "3", "6"], 0),
    qcm("Combien de fois s'affiche « * » ?", ["3", "4", "12", "7"], 2, undefined, `
      POUR i DE 1 A 3 FAIRE
        POUR j DE 1 A 4 FAIRE
          ECRIRE("*")
        FINPOUR
      FINPOUR
    `),
    vraiFaux("RÉPÉTER … JUSQU'À exécute toujours son corps au moins une fois.", true),
    qcm("Quel est l'indice de la dernière case de T : TABLEAU[1..20] DE ENTIER ?", ["19", "20", "21", "0"], 1),
    qcm("Quelle est la complexité de la recherche dichotomique ?", ["O(n)", "O(n²)", "O(log n)", "O(1)"], 2),
    vraiFaux("Une fonction récursive doit avoir un cas de base.", true),
    qcm("Quelle condition teste qu'un nombre n est pair ?", ["n DIV 2 = 0", "n MOD 2 = 0", "n / 2 = 0", "n MOD 2 = 1"], 1),
  ], 70),
};
