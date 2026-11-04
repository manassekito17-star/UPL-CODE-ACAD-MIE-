import { example, lesson, qcm, quiz, vraiFaux } from "../helpers";
import type { Course } from "../types";

const C = "c" as const;

export const langageC: Course = {
  slug: "langage-c",
  code: "Parcours C",
  language: "c",
  category: "programmation",
  title: "Langage C",
  tagline: "Comprendre ce qui se passe au plus près de la machine.",
  description:
    "Le langage C est la base de nombreux systèmes (Linux, microcontrôleurs, bases de données). Ce parcours couvre la structure d'un programme, les types, les entrées-sorties, les structures de contrôle, les fonctions, les tableaux, les chaînes, les pointeurs, l'allocation dynamique, les structures, les fichiers et les structures de données.",
  level: "intermediaire",
  prerequisites: ["Parcours Algorithmique, modules 1 à 4."],
  objectives: [
    "Écrire, compiler et exécuter des programmes C.",
    "Comprendre la mémoire : adresses, pointeurs, allocation dynamique.",
    "Manipuler tableaux, chaînes, structures et fichiers.",
    "Implémenter des structures de données classiques.",
  ],
  durationHours: 32,
  status: "publie",
  modules: [
    {
      slug: "bases",
      title: "Module 1 — Les bases",
      lessons: [
        lesson({
          slug: "structure-programme",
          title: "Structure d'un programme C",
          durationMinutes: 25,
          objectives: ["Connaître la structure minimale d'un programme C.", "Comprendre la compilation."],
          content: `
            ## Un premier programme

            ~~~c
            #include <stdio.h>

            int main(void) {
                printf("Bonjour UPL !\\n");
                return 0;
            }
            ~~~

            - **#include <stdio.h>** importe la bibliothèque d'entrées-sorties.
            - **main** est la fonction principale : l'exécution commence ici.
            - Chaque instruction se termine par un **point-virgule**.
            - Les blocs sont délimités par des **accolades**.
            - **return 0** indique que le programme s'est bien terminé.

            ## La compilation

            Le C est un langage **compilé** : le compilateur (gcc) traduit le code source en programme exécutable. Les erreurs de compilation doivent être corrigées avant toute exécution. Sur la plateforme, le bouton **Exécuter** compile puis lance le programme dans un environnement isolé.

            ## Commentaires

            // sur une ligne, ou /* sur plusieurs lignes */.
          `,
          examples: [
            example(C, "Bonjour", `
              #include <stdio.h>

              int main(void) {
                  printf("Bonjour UPL !\\n");
                  printf("Le C a été créé en %d.\\n", 1972);
                  return 0;
              }
            `),
          ],
          summary: ["Un programme C commence par main.", "Instructions terminées par ; et blocs entre accolades.", "Le code est compilé avant d'être exécuté."],
          quiz: quiz("c-structure-quiz", "Structure", [
            qcm("Par quelle fonction commence l'exécution d'un programme C ?", ["start", "main", "printf", "include"], 1),
            vraiFaux("Le C est un langage interprété ligne par ligne.", false),
          ]),
          exerciseSlugs: ["c-bonjour"],
        }),
        lesson({
          slug: "variables-types",
          title: "Variables et types",
          durationMinutes: 30,
          objectives: ["Déclarer des variables typées.", "Connaître int, double, char et leurs tailles."],
          content: `
            ## Déclarer avant d'utiliser

            En C, chaque variable doit être **déclarée avec son type** :

            ~~~c
            int age = 20;
            double moyenne = 13.5;
            char initiale = 'U';
            const double PI = 3.14159;
            ~~~

            ## Les types principaux

            | Type | Contenu | Taille courante |
            |---|---|---|
            | char | un caractère | 1 octet |
            | int | entier | 4 octets |
            | long long | grand entier | 8 octets |
            | float | réel simple précision | 4 octets |
            | double | réel double précision | 8 octets |

            **sizeof(type)** donne la taille en octets.

            ## Attention

            - Une variable non initialisée contient une valeur **indéterminée**.
            - Un int a une capacité limitée (environ ±2 milliards) : au-delà, il y a **dépassement**.
            - La division de deux int est **entière** : 7 / 2 vaut 3. Écrivez 7.0 / 2 pour obtenir 3.5.
            - Il n'y a pas de type booléen natif en C89 : 0 signifie faux, toute autre valeur vrai (ou bool avec stdbool.h).
          `,
          examples: [
            example(C, "Types et tailles", `
              #include <stdio.h>

              int main(void) {
                  int a = 7, b = 2;
                  printf("7 / 2 = %d\\n", a / b);
                  printf("7.0 / 2 = %.1f\\n", (double)a / b);
                  printf("sizeof(int) = %zu, sizeof(double) = %zu\\n", sizeof(int), sizeof(double));
                  return 0;
              }
            `),
          ],
          summary: ["Toute variable est déclarée avec son type.", "La division entre entiers est entière.", "sizeof donne la taille d'un type."],
        }),
        lesson({
          slug: "entrees-sorties",
          title: "Entrées et sorties",
          durationMinutes: 25,
          objectives: ["Afficher avec printf.", "Lire avec scanf."],
          content: `
            ## printf et les formats

            | Format | Type |
            |---|---|
            | %d | int |
            | %lld | long long |
            | %f, %.2f | double (2 décimales) |
            | %c | char |
            | %s | chaîne |

            ~~~c
            printf("Moyenne : %.2f\\n", moyenne);
            ~~~

            **\\n** passe à la ligne.

            ## scanf

            ~~~c
            int n;
            scanf("%d", &n);
            ~~~

            Le **&** donne l'**adresse** de la variable : scanf a besoin de savoir où ranger la valeur. Pour un double, utilisez **%lf** dans scanf.

            ## Vérifier la lecture

            scanf renvoie le nombre de valeurs lues : **if (scanf("%d", &n) != 1)** détecte une saisie invalide.
          `,
          examples: [
            example(C, "Lire et afficher", `
              #include <stdio.h>

              int main(void) {
                  int a, b;
                  scanf("%d %d", &a, &b);
                  printf("Somme : %d\\n", a + b);
                  printf("Moyenne : %.2f\\n", (a + b) / 2.0);
                  return 0;
              }
            `, { stdin: "12 17" }),
          ],
          summary: ["printf utilise des formats (%d, %f, %s…).", "scanf a besoin de l'adresse : &variable.", "%lf pour lire un double."],
          exerciseSlugs: ["c-somme"],
        }),
        lesson({
          slug: "conditions",
          title: "Conditions",
          durationMinutes: 20,
          objectives: ["Utiliser if, else et switch."],
          content: `
            ## if / else

            ~~~c
            if (note >= 10) {
                printf("Admis\\n");
            } else if (note >= 8) {
                printf("Rattrapage\\n");
            } else {
                printf("Ajourné\\n");
            }
            ~~~

            La condition est **entre parenthèses**. Opérateurs : ==, !=, <, >, <=, >=, && (ET), || (OU), ! (NON).

            > Piège : **if (x = 5)** affecte 5 à x (toujours vrai) au lieu de comparer. Écrivez **==**.

            ## switch

            ~~~c
            switch (jour) {
                case 6:
                case 7:
                    printf("Week-end\\n");
                    break;
                default:
                    printf("Semaine\\n");
            }
            ~~~

            Sans **break**, l'exécution continue dans le cas suivant.
          `,
          examples: [
            example(C, "Pair ou impair", `
              #include <stdio.h>

              int main(void) {
                  int n;
                  scanf("%d", &n);
                  if (n % 2 == 0) {
                      printf("pair\\n");
                  } else {
                      printf("impair\\n");
                  }
                  return 0;
              }
            `, { stdin: "7" }),
          ],
          summary: ["if (condition) { … } else { … }.", "== compare, = affecte.", "switch nécessite break."],
          exerciseSlugs: ["c-pair-impair"],
        }),
        lesson({
          slug: "boucles",
          title: "Boucles",
          durationMinutes: 25,
          objectives: ["Utiliser for, while et do … while."],
          content: `
            ## for

            ~~~c
            for (int i = 1; i <= 10; i++) {
                printf("%d\\n", i);
            }
            ~~~

            Trois parties : initialisation ; condition ; incrémentation.

            ## while et do … while

            ~~~c
            while (solde < 2000) { solde *= 1.08; annees++; }

            do {
                scanf("%d", &note);
            } while (note < 0 || note > 20);
            ~~~

            **do … while** exécute le corps au moins une fois, comme RÉPÉTER (mais la condition est celle de **continuation**).

            ## break et continue

            Comme en Python : **break** sort de la boucle, **continue** passe au tour suivant.
          `,
          examples: [
            example(C, "Factorielle", `
              #include <stdio.h>

              int main(void) {
                  int n;
                  long long f = 1;
                  scanf("%d", &n);
                  for (int i = 2; i <= n; i++) {
                      f *= i;
                  }
                  printf("%d! = %lld\\n", n, f);
                  return 0;
              }
            `, { stdin: "15" }),
          ],
          summary: ["for (init; condition; pas).", "do … while s'exécute au moins une fois.", "long long évite le dépassement pour les grands produits."],
          exerciseSlugs: ["c-table"],
        }),
      ],
    },
    {
      slug: "modularite-memoire",
      title: "Module 2 — Fonctions, tableaux et mémoire",
      lessons: [
        lesson({
          slug: "fonctions",
          title: "Fonctions",
          durationMinutes: 30,
          objectives: ["Déclarer et définir des fonctions.", "Comprendre le passage par valeur."],
          content: `
            ## Définition

            ~~~c
            int carre(int x) {
                return x * x;
            }
            ~~~

            Le type de retour précède le nom ; **void** indique l'absence de retour (procédure).

            ## Prototype

            Une fonction doit être connue avant son appel. Si elle est définie après main, on écrit son **prototype** au début : **int carre(int x);**

            ## Passage par valeur

            En C, les arguments sont **toujours copiés**. Pour qu'une fonction modifie une variable de l'appelant, on lui passe son **adresse** (voir les pointeurs).
          `,
          examples: [
            example(C, "PGCD", `
              #include <stdio.h>

              int pgcd(int a, int b);

              int main(void) {
                  printf("pgcd(48, 18) = %d\\n", pgcd(48, 18));
                  return 0;
              }

              int pgcd(int a, int b) {
                  while (b != 0) {
                      int r = a % b;
                      a = b;
                      b = r;
                  }
                  return a;
              }
            `),
          ],
          summary: ["type nom(paramètres) { … }.", "void : pas de valeur de retour.", "Les arguments sont copiés."],
          exerciseSlugs: ["c-puissance"],
        }),
        lesson({
          slug: "tableaux",
          title: "Tableaux",
          durationMinutes: 30,
          objectives: ["Déclarer et parcourir un tableau.", "Passer un tableau à une fonction."],
          content: `
            ## Déclaration

            ~~~c
            int notes[5] = {12, 15, 9, 17, 11};
            ~~~

            Les indices vont de **0 à taille - 1**. Le C ne vérifie **pas** les débordements : écrire notes[5] corrompt la mémoire sans message d'erreur clair. Soyez rigoureux !

            ## Parcours

            ~~~c
            for (int i = 0; i < 5; i++) somme += notes[i];
            ~~~

            ## Tableaux et fonctions

            Un tableau passé à une fonction n'est pas copié : la fonction reçoit l'adresse du premier élément. Il faut transmettre la **taille** séparément.

            ~~~c
            double moyenne(int t[], int n);
            ~~~

            ## Tableaux à deux dimensions

            **int m[3][4];** et accès **m[i][j]**.
          `,
          examples: [
            example(C, "Maximum d'un tableau", `
              #include <stdio.h>

              int maximum(int t[], int n) {
                  int m = t[0];
                  for (int i = 1; i < n; i++) {
                      if (t[i] > m) m = t[i];
                  }
                  return m;
              }

              int main(void) {
                  int n, t[100];
                  scanf("%d", &n);
                  for (int i = 0; i < n; i++) scanf("%d", &t[i]);
                  printf("Maximum : %d\\n", maximum(t, n));
                  return 0;
              }
            `, { stdin: "5\n4 9 2 9 1" }),
          ],
          summary: ["Indices de 0 à n-1.", "Aucune vérification des bornes en C.", "On passe la taille avec le tableau."],
          exerciseSlugs: ["c-inverser-tableau"],
        }),
        lesson({
          slug: "chaines",
          title: "Chaînes de caractères",
          durationMinutes: 30,
          objectives: ["Comprendre les chaînes terminées par '\\0'.", "Utiliser string.h."],
          content: `
            ## Une chaîne est un tableau de char

            ~~~c
            char ville[20] = "Lubumbashi";
            ~~~

            Une chaîne se termine par le caractère nul **'\\0'**. Le tableau doit donc avoir une case de plus que le nombre de lettres.

            ## Fonctions de string.h

            | Fonction | Rôle |
            |---|---|
            | strlen(s) | longueur |
            | strcpy(d, s) | copie |
            | strcat(d, s) | concaténation |
            | strcmp(a, b) | comparaison (0 si égales) |

            On ne compare **jamais** deux chaînes avec == : on compare leurs adresses !

            ## Lire une chaîne

            **scanf("%19s", ville)** lit un mot (sans &, le nom du tableau est déjà une adresse). Pour une ligne entière : **fgets(ligne, sizeof ligne, stdin)**.
          `,
          examples: [
            example(C, "Compter les voyelles", `
              #include <stdio.h>
              #include <string.h>
              #include <ctype.h>

              int main(void) {
                  char mot[100];
                  int nb = 0;
                  scanf("%99s", mot);
                  for (size_t i = 0; i < strlen(mot); i++) {
                      char c = tolower(mot[i]);
                      if (strchr("aeiouy", c)) nb++;
                  }
                  printf("%s contient %d voyelle(s)\\n", mot, nb);
                  return 0;
              }
            `, { stdin: "Programmation" }),
          ],
          summary: ["Une chaîne finit par '\\0'.", "strlen, strcpy, strcmp sont dans string.h.", "Ne jamais comparer des chaînes avec ==."],
        }),
        lesson({
          slug: "pointeurs",
          title: "Pointeurs",
          durationMinutes: 40,
          level: "avance",
          objectives: ["Comprendre adresses et pointeurs.", "Modifier une variable via son adresse."],
          content: `
            ## Adresse et pointeur

            Chaque variable occupe une place en mémoire, repérée par une **adresse**. Un **pointeur** est une variable qui contient une adresse.

            ~~~c
            int x = 10;
            int *p = &x;   // p contient l'adresse de x
            *p = 20;       // modifie x via le pointeur
            ~~~

            - **&x** : adresse de x.
            - **\\*p** : valeur située à l'adresse contenue dans p (déréférencement).

            ## Simuler le passage par référence

            ~~~c
            void echanger(int *a, int *b) {
                int t = *a;
                *a = *b;
                *b = t;
            }
            echanger(&x, &y);
            ~~~

            ## Pointeurs et tableaux

            Le nom d'un tableau est l'adresse de son premier élément : **t[i]** équivaut à **\\*(t + i)**.

            ## Le pointeur NULL

            **NULL** indique qu'un pointeur ne désigne rien. Déréférencer NULL ou un pointeur non initialisé provoque une **erreur de segmentation**.
          `,
          examples: [
            example(C, "Échange par pointeurs", `
              #include <stdio.h>

              void echanger(int *a, int *b) {
                  int t = *a;
                  *a = *b;
                  *b = t;
              }

              int main(void) {
                  int x = 3, y = 8;
                  int *p = &x;
                  printf("x = %d, *p = %d\\n", x, *p);
                  echanger(&x, &y);
                  printf("Après échange : x = %d, y = %d\\n", x, y);
                  return 0;
              }
            `),
          ],
          summary: ["Un pointeur contient une adresse.", "& donne l'adresse, * accède à la valeur pointée.", "Passer une adresse permet de modifier la variable d'origine."],
          quiz: quiz("c-pointeurs-quiz", "Pointeurs", [
            qcm("int x = 5; int *p = &x; *p = 9; Que vaut x ?", ["5", "9", "L'adresse de x", "Erreur"], 1),
          ]),
          exerciseSlugs: ["c-echange-pointeurs"],
        }),
        lesson({
          slug: "allocation-dynamique",
          title: "Allocation dynamique",
          durationMinutes: 35,
          level: "avance",
          objectives: ["Réserver de la mémoire avec malloc.", "Libérer la mémoire avec free."],
          content: `
            ## Pourquoi ?

            La taille d'un tableau classique est fixée à la compilation. Avec l'allocation dynamique, on réserve la mémoire **pendant l'exécution**, selon les besoins.

            ~~~c
            #include <stdlib.h>
            int *t = malloc(n * sizeof(int));
            if (t == NULL) { /* plus de mémoire */ }
            ...
            free(t);
            ~~~

            ## Les règles

            1. Toujours vérifier que malloc n'a pas renvoyé NULL.
            2. Toujours libérer avec **free** ce qui a été alloué (sinon : **fuite mémoire**).
            3. Ne jamais utiliser un pointeur après free.

            **calloc** alloue et initialise à zéro ; **realloc** change la taille d'un bloc.
          `,
          examples: [
            example(C, "Tableau de taille choisie", `
              #include <stdio.h>
              #include <stdlib.h>

              int main(void) {
                  int n;
                  scanf("%d", &n);
                  int *t = malloc(n * sizeof(int));
                  if (t == NULL) return 1;
                  for (int i = 0; i < n; i++) t[i] = i * i;
                  for (int i = 0; i < n; i++) printf("%d ", t[i]);
                  printf("\\n");
                  free(t);
                  return 0;
              }
            `, { stdin: "8" }),
          ],
          summary: ["malloc réserve, free libère.", "Vérifier NULL après malloc.", "Une mémoire non libérée est une fuite."],
        }),
      ],
    },
    {
      slug: "donnees-avancees",
      title: "Module 3 — Structures, fichiers et structures de données",
      lessons: [
        lesson({
          slug: "structures",
          title: "Structures",
          durationMinutes: 30,
          level: "intermediaire",
          objectives: ["Définir un type structuré avec struct.", "Manipuler un tableau de structures."],
          content: `
            ## Regrouper des données

            ~~~c
            typedef struct {
                char nom[50];
                int age;
                double moyenne;
            } Etudiant;

            Etudiant e = {"Amani", 20, 14.5};
            printf("%s : %.1f\\n", e.nom, e.moyenne);
            ~~~

            On accède aux champs avec le **point**. Avec un pointeur vers une structure, on utilise la **flèche** : **p->age** (équivalent à (\\*p).age).

            ## Tableaux de structures

            **Etudiant promo[100];** permet de gérer toute une promotion.
          `,
          examples: [
            example(C, "Meilleur étudiant", `
              #include <stdio.h>

              typedef struct {
                  char nom[30];
                  double moyenne;
              } Etudiant;

              int main(void) {
                  Etudiant promo[3] = {{"Amani", 14.5}, {"Grace", 17.0}, {"Josue", 11.25}};
                  int meilleur = 0;
                  for (int i = 1; i < 3; i++) {
                      if (promo[i].moyenne > promo[meilleur].moyenne) meilleur = i;
                  }
                  printf("Major : %s (%.2f)\\n", promo[meilleur].nom, promo[meilleur].moyenne);
                  return 0;
              }
            `),
          ],
          summary: ["struct regroupe des champs de types différents.", "typedef donne un nom au type.", ". pour une variable, -> pour un pointeur."],
        }),
        lesson({
          slug: "fichiers",
          title: "Fichiers",
          durationMinutes: 25,
          level: "intermediaire",
          objectives: ["Ouvrir, lire, écrire et fermer un fichier."],
          content: `
            ## fopen et fclose

            ~~~c
            FILE *f = fopen("notes.txt", "w");
            if (f == NULL) { perror("fopen"); return 1; }
            fprintf(f, "%s %d\\n", "Amani", 15);
            fclose(f);
            ~~~

            Modes : "r" (lecture), "w" (écriture), "a" (ajout).

            ## Lire

            **fscanf(f, "%s %d", nom, &note)** renvoie le nombre de valeurs lues, ou EOF à la fin du fichier. **fgets** lit une ligne entière.

            Toujours vérifier que **fopen** n'a pas renvoyé NULL et toujours fermer le fichier.
          `,
          examples: [
            example(C, "Écrire puis relire", `
              #include <stdio.h>

              int main(void) {
                  FILE *f = fopen("notes.txt", "w");
                  if (f == NULL) return 1;
                  fprintf(f, "Amani 15\\nGrace 17\\nJosue 9\\n");
                  fclose(f);

                  f = fopen("notes.txt", "r");
                  if (f == NULL) return 1;
                  char nom[30];
                  int note;
                  while (fscanf(f, "%29s %d", nom, &note) == 2) {
                      printf("%-6s %2d %s\\n", nom, note, note >= 10 ? "admis" : "ajourné");
                  }
                  fclose(f);
                  return 0;
              }
            `),
          ],
          summary: ["fopen / fclose.", "fprintf et fscanf fonctionnent comme printf et scanf.", "Vérifier NULL après fopen."],
        }),
        lesson({
          slug: "structures-donnees",
          title: "Algorithmes et structures de données",
          durationMinutes: 45,
          level: "avance",
          objectives: ["Implémenter une liste chaînée.", "Implémenter une pile."],
          content: `
            ## La liste chaînée

            Chaque **nœud** contient une valeur et un pointeur vers le nœud suivant :

            ~~~c
            typedef struct Noeud {
                int valeur;
                struct Noeud *suivant;
            } Noeud;
            ~~~

            Avantages : insertion en tête en O(1), taille variable. Inconvénient : accès au i-ème élément en O(n).

            ## La pile

            Une pile peut être réalisée avec une liste chaînée : empiler = insérer en tête, dépiler = retirer la tête.

            ## Libérer la mémoire

            Chaque nœud alloué avec malloc doit être libéré avec free, en parcourant la liste.
          `,
          examples: [
            example(C, "Liste chaînée", `
              #include <stdio.h>
              #include <stdlib.h>

              typedef struct Noeud {
                  int valeur;
                  struct Noeud *suivant;
              } Noeud;

              Noeud *empiler(Noeud *tete, int v) {
                  Noeud *n = malloc(sizeof(Noeud));
                  if (n == NULL) exit(1);
                  n->valeur = v;
                  n->suivant = tete;
                  return n;
              }

              int main(void) {
                  Noeud *pile = NULL;
                  for (int i = 1; i <= 5; i++) pile = empiler(pile, i * 10);
                  for (Noeud *p = pile; p != NULL; p = p->suivant) printf("%d ", p->valeur);
                  printf("\\n");
                  while (pile != NULL) {
                      Noeud *s = pile->suivant;
                      free(pile);
                      pile = s;
                  }
                  return 0;
              }
            `),
          ],
          summary: ["Une liste chaînée relie des nœuds par des pointeurs.", "Une pile se réalise par insertion/retrait en tête.", "Libérer chaque nœud."],
        }),
      ],
    },
  ],
  finalQuiz: quiz("c-evaluation-finale", "Évaluation finale — Langage C", [
    qcm("Que vaut 9 / 2 en C si les deux opérandes sont des int ?", ["4.5", "4", "5", "Erreur"], 1),
    qcm("Quel format affiche un double avec deux décimales ?", ["%d", "%.2f", "%2d", "%s"], 1),
    vraiFaux("Le C vérifie automatiquement les indices des tableaux.", false),
    qcm("Que faut-il appeler après malloc lorsque la mémoire n'est plus utile ?", ["delete", "free", "fclose", "Rien"], 1),
  ], 70),
};
