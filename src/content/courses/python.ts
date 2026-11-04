import { example, lesson, qcm, quiz, vraiFaux } from "../helpers";
import type { Course } from "../types";

const PY = "python" as const;

export const python: Course = {
  slug: "python",
  code: "Parcours B",
  language: "python",
  category: "programmation",
  title: "Python",
  tagline: "Le langage idéal pour passer de l'algorithme au programme.",
  description:
    "Un parcours complet pour apprendre Python : syntaxe, structures de contrôle, structures de données, fonctions, modules, exceptions, fichiers, programmation orientée objet, algorithmes classiques, jusqu'à une introduction à la science des données et à l'intelligence artificielle.",
  level: "debutant",
  prerequisites: ["Avoir suivi le module 1 et 2 du parcours Algorithmique (recommandé)."],
  objectives: [
    "Écrire des programmes Python lisibles et corrects.",
    "Utiliser listes, tuples, dictionnaires et ensembles.",
    "Structurer un programme avec des fonctions, des modules et des classes.",
    "Gérer les erreurs et manipuler des fichiers.",
    "Implémenter des algorithmes de recherche et de tri.",
  ],
  durationHours: 36,
  status: "publie",
  modules: [
    {
      slug: "bases",
      title: "Module 1 — Les bases du langage",
      lessons: [
        lesson({
          slug: "syntaxe-fondamentale",
          title: "Syntaxe fondamentale",
          durationMinutes: 25,
          objectives: ["Écrire et exécuter un premier programme Python.", "Comprendre l'indentation et les commentaires."],
          content: `
            ## Pourquoi Python ?

            Python est un langage **lisible**, **polyvalent** et très utilisé : développement web, automatisation, science des données, intelligence artificielle. Sa syntaxe proche du pseudocode en fait un excellent premier langage.

            ## Premier programme

            ~~~python
            print("Bonjour UPL !")
            ~~~

            **print** affiche une valeur puis passe à la ligne.

            ## Pas de DEBUT / FIN : l'indentation

            En Python, les blocs sont délimités par l'**indentation** (4 espaces par convention), après un deux-points :

            ~~~python
            if note >= 10:
                print("Admis")
            print("Fin")   # hors du bloc
            ~~~

            Une indentation incorrecte provoque une **IndentationError**.

            ## Commentaires

            Tout ce qui suit **#** est ignoré par Python. Commentez le **pourquoi**, pas l'évidence.

            ## Du pseudocode à Python

            | Pseudocode | Python |
            |---|---|
            | ECRIRE("x = ", x) | print("x =", x) |
            | x ← 5 | x = 5 |
            | SI … ALORS … FINSI | if …: (bloc indenté) |
            | ET, OU, NON | and, or, not |
          `,
          examples: [
            example(PY, "Premier programme", `
              # Mon premier programme Python
              print("Bonjour UPL !")
              print("2 + 3 =", 2 + 3)
            `),
          ],
          summary: ["print affiche des valeurs.", "Les blocs sont définis par l'indentation.", "# introduit un commentaire."],
          quiz: quiz("py-syntaxe-quiz", "Syntaxe", [
            qcm("Comment Python délimite-t-il les blocs ?", ["Avec DEBUT et FIN", "Avec des accolades", "Avec l'indentation", "Avec des points-virgules"], 2),
            vraiFaux("En Python, # commence un commentaire.", true),
          ]),
          exerciseSlugs: ["py-bonjour"],
        }),
        lesson({
          slug: "variables-types",
          title: "Variables et types",
          durationMinutes: 30,
          objectives: ["Créer des variables.", "Connaître int, float, str, bool.", "Convertir entre types."],
          content: `
            ## Variables

            En Python, une variable est créée lors de sa **première affectation**, avec le signe **=** :

            ~~~python
            age = 19
            moyenne = 13.5
            nom = "Amani"
            admis = True
            ~~~

            Pas besoin de déclarer le type : Python le déduit (**typage dynamique**).

            ## Les types de base

            | Type | Exemple | Pseudocode |
            |---|---|---|
            | int | 42 | ENTIER |
            | float | 3.14 | REEL |
            | str | "UPL" | CHAINE |
            | bool | True, False | BOOLEEN |

            La fonction **type(x)** donne le type d'une valeur.

            ## Conversions

            - **int("42")** → 42
            - **float("3.5")** → 3.5
            - **str(10)** → "10"

            ## Lire au clavier

            **input()** lit une ligne de texte. Le résultat est **toujours une chaîne** : il faut le convertir pour calculer.

            ~~~python
            age = int(input())
            ~~~

            ## Conventions de nommage

            Utilisez le style **snake_case** : note_finale, nombre_etudiants. Les constantes s'écrivent en majuscules : TAUX_TVA = 0.16.
          `,
          examples: [
            example(PY, "Types et conversions", `
              nom = input()
              annee = int(input())
              age = 2026 - annee
              print("Bonjour", nom)
              print("Âge :", age, type(age))
              print("Moyenne :", 27 / 2, type(27 / 2))
            `, { stdin: "Amani\n2006" }),
          ],
          summary: ["= crée ou modifie une variable.", "int, float, str, bool sont les types de base.", "input() renvoie toujours une chaîne."],
          quiz: quiz("py-variables-quiz", "Variables", [
            qcm("Que renvoie input() ?", ["Un int", "Une str", "Un float", "Cela dépend de ce qui est tapé"], 1),
            qcm("Que vaut int(\"7\") + 3 ?", ["\"73\"", "10", "Erreur", "\"10\""], 1),
          ]),
          exerciseSlugs: ["py-somme"],
        }),
        lesson({
          slug: "operateurs",
          title: "Opérateurs",
          durationMinutes: 25,
          objectives: ["Utiliser les opérateurs arithmétiques, de comparaison et logiques.", "Formater l'affichage avec les f-strings."],
          content: `
            ## Arithmétique

            | Opérateur | Rôle | Exemple | Résultat |
            |---|---|---|---|
            | + - * | classiques | 7 * 2 | 14 |
            | / | division réelle | 7 / 2 | 3.5 |
            | // | division entière (DIV) | 7 // 2 | 3 |
            | % | reste (MOD) | 7 % 2 | 1 |
            | ** | puissance | 2 ** 10 | 1024 |

            ## Comparaisons et logique

            ==, !=, <, >, <=, >= ; puis **and**, **or**, **not**. Python autorise les comparaisons enchaînées : **0 <= note <= 20**.

            ## Affectations composées

            x += 1 équivaut à x = x + 1 (de même -=, *=, //=…).

            ## Les f-strings

            Pour insérer des valeurs dans un texte :

            ~~~python
            moyenne = 13.456
            print(f"Moyenne : {moyenne:.2f}")   # Moyenne : 13.46
            ~~~

            Le **:.2f** affiche deux décimales.
          `,
          examples: [
            example(PY, "Opérateurs", `
              secondes = 3725
              h = secondes // 3600
              m = secondes % 3600 // 60
              s = secondes % 60
              print(f"{h} h {m} min {s} s")
              note = 14
              print("Valide :", 0 <= note <= 20, "| Pair :", note % 2 == 0)
            `),
          ],
          summary: ["// et % correspondent à DIV et MOD.", "** est la puissance.", "Les f-strings formatent l'affichage."],
          exerciseSlugs: ["py-conversion-temps"],
        }),
        lesson({
          slug: "conditions",
          title: "Conditions",
          durationMinutes: 25,
          objectives: ["Écrire des tests avec if, elif, else.", "Utiliser match pour des choix multiples."],
          content: `
            ## if / elif / else

            ~~~python
            if note >= 16:
                print("Très bien")
            elif note >= 14:
                print("Bien")
            elif note >= 10:
                print("Passable")
            else:
                print("Insuffisant")
            ~~~

            **elif** correspond à SINON SI. N'oubliez pas les **deux-points**.

            ## Valeurs « vraies » et « fausses »

            0, 0.0, "" (chaîne vide), [] (liste vide) et None sont considérés comme **faux** dans un if.

            ## L'expression conditionnelle

            ~~~python
            statut = "admis" if note >= 10 else "ajourné"
            ~~~

            ## match (Python 3.10+)

            Équivalent de SELON :

            ~~~python
            match jour:
                case 6 | 7:
                    print("Week-end")
                case _:
                    print("Semaine")
            ~~~
          `,
          examples: [
            example(PY, "Année bissextile", `
              annee = int(input())
              if (annee % 4 == 0 and annee % 100 != 0) or annee % 400 == 0:
                  print("bissextile")
              else:
                  print("non bissextile")
            `, { stdin: "2024" }),
          ],
          summary: ["if / elif / else avec deux-points et indentation.", "and, or, not combinent les conditions.", "match remplace SELON."],
          quiz: quiz("py-conditions-quiz", "Conditions", [
            qcm("Quel mot-clé correspond à SINON SI ?", ["else if", "elseif", "elif", "sinon_si"], 2),
            vraiFaux("Une liste vide est considérée comme fausse dans un if.", true),
          ]),
          exerciseSlugs: ["py-pair-impair", "py-mention"],
        }),
        lesson({
          slug: "boucles",
          title: "Boucles",
          durationMinutes: 35,
          objectives: ["Utiliser for avec range.", "Utiliser while.", "Contrôler une boucle avec break et continue."],
          content: `
            ## for et range

            ~~~python
            for i in range(1, 6):   # 1, 2, 3, 4, 5
                print(i)
            ~~~

            **range(début, fin, pas)** : la valeur de **fin est exclue**. range(5) donne 0, 1, 2, 3, 4.

            ## for sur une collection

            ~~~python
            for lettre in "UPL":
                print(lettre)
            ~~~

            ## while

            ~~~python
            solde = 1000
            annees = 0
            while solde < 2000:
                solde *= 1.08
                annees += 1
            ~~~

            Python n'a pas de RÉPÉTER … JUSQU'À : on utilise **while True** avec **break**.

            ## break et continue

            - **break** sort immédiatement de la boucle.
            - **continue** passe directement au tour suivant.

            ~~~python
            while True:
                note = float(input())
                if 0 <= note <= 20:
                    break
            ~~~
          `,
          examples: [
            example(PY, "Table et somme", `
              n = int(input())
              for i in range(1, 11):
                  print(f"{n} x {i} = {n * i}")
              total = 0
              for i in range(1, n + 1):
                  total += i
              print("Somme de 1 à", n, ":", total)
            `, { stdin: "7" }),
          ],
          summary: ["range(a, b) va de a à b-1.", "while répète tant que la condition est vraie.", "break sort, continue passe au tour suivant."],
          quiz: quiz("py-boucles-quiz", "Boucles", [
            qcm("Quelles valeurs produit range(2, 8, 2) ?", ["2, 4, 6, 8", "2, 4, 6", "2, 8", "0, 2, 4, 6"], 1),
            qcm("Que fait break ?", ["Passe au tour suivant", "Arrête le programme", "Sort de la boucle", "Recommence la boucle"], 2),
          ]),
          exerciseSlugs: ["py-table", "py-factorielle"],
        }),
      ],
    },
    {
      slug: "structures-donnees",
      title: "Module 2 — Collections",
      lessons: [
        lesson({
          slug: "listes-tuples",
          title: "Listes et tuples",
          durationMinutes: 40,
          objectives: ["Créer et modifier des listes.", "Parcourir une liste.", "Utiliser les tuples."],
          content: `
            ## Les listes

            Une **liste** est une collection ordonnée et **modifiable** :

            ~~~python
            notes = [12, 15.5, 9, 17]
            print(notes[0])      # 12 (les indices commencent à 0 !)
            print(notes[-1])     # 17 (dernier élément)
            notes.append(11)     # ajout à la fin
            notes[2] = 10        # modification
            print(len(notes))    # 5
            ~~~

            > Contrairement au pseudocode de la plateforme, les indices Python commencent à **0**.

            ## Opérations utiles

            | Opération | Rôle |
            |---|---|
            | len(L) | nombre d'éléments |
            | sum(L), min(L), max(L) | somme, minimum, maximum |
            | L.append(x) | ajouter à la fin |
            | L.insert(i, x) | insérer à la position i |
            | L.remove(x), L.pop() | supprimer |
            | x in L | test d'appartenance |
            | L.sort(), sorted(L) | trier |
            | L[a:b] | tranche (de a à b-1) |

            ## Parcours

            ~~~python
            for i, note in enumerate(notes):
                print(i, note)
            ~~~

            ## Listes en compréhension

            ~~~python
            carres = [x ** 2 for x in range(1, 6)]           # [1, 4, 9, 16, 25]
            admis = [n for n in notes if n >= 10]
            ~~~

            ## Les tuples

            Un **tuple** est comme une liste mais **non modifiable** : point = (3, 4). On l'utilise pour des données fixes, ou pour retourner plusieurs valeurs d'une fonction.

            ## Lire une liste au clavier

            ~~~python
            valeurs = list(map(int, input().split()))
            ~~~
          `,
          examples: [
            example(PY, "Manipuler une liste", `
              notes = list(map(float, input().split()))
              print("Notes :", notes)
              print("Moyenne :", round(sum(notes) / len(notes), 2))
              print("Admis :", [n for n in notes if n >= 10])
              print("Triées :", sorted(notes))
            `, { stdin: "12 8.5 15 9 17" }),
          ],
          summary: ["Les indices commencent à 0 ; -1 désigne le dernier.", "append, sort, len, sum, in sont essentiels.", "Un tuple ne peut pas être modifié."],
          quiz: quiz("py-listes-quiz", "Listes", [
            qcm("L = [4, 8, 15]. Que vaut L[1] ?", ["4", "8", "15", "Erreur"], 1),
            qcm("Que vaut [x * 2 for x in range(3)] ?", ["[2, 4, 6]", "[0, 2, 4]", "[0, 1, 2]", "[1, 2, 3]"], 1),
            vraiFaux("On peut modifier un élément d'un tuple.", false),
          ]),
          exerciseSlugs: ["py-maximum-liste", "py-inverser-liste"],
        }),
        lesson({
          slug: "dictionnaires-ensembles",
          title: "Dictionnaires et ensembles",
          durationMinutes: 35,
          objectives: ["Associer des clés à des valeurs avec un dictionnaire.", "Éliminer les doublons avec un ensemble."],
          content: `
            ## Les dictionnaires

            Un **dictionnaire** associe des **clés** à des **valeurs** :

            ~~~python
            etudiant = {"nom": "Amani", "age": 20, "faculte": "Informatique"}
            print(etudiant["nom"])
            etudiant["age"] = 21          # modification
            etudiant["moyenne"] = 14.2    # ajout
            ~~~

            - **d.get(cle, defaut)** évite une erreur si la clé n'existe pas.
            - **cle in d** teste la présence d'une clé.

            ## Parcourir un dictionnaire

            ~~~python
            for cle, valeur in etudiant.items():
                print(cle, ":", valeur)
            ~~~

            ## Compter des occurrences

            ~~~python
            compte = {}
            for mot in texte.split():
                compte[mot] = compte.get(mot, 0) + 1
            ~~~

            ## Les ensembles

            Un **ensemble** (set) contient des éléments **uniques**, sans ordre :

            ~~~python
            vus = {1, 2, 3}
            vus.add(2)            # ignoré : déjà présent
            print(len(set([1, 1, 2, 3, 3])))   # 3
            ~~~

            Opérations : union (|), intersection (&), différence (-). Le test **x in ensemble** est très rapide.
          `,
          examples: [
            example(PY, "Fréquence des mots", `
              texte = input().lower()
              compte = {}
              for mot in texte.split():
                  compte[mot] = compte.get(mot, 0) + 1
              for mot in sorted(compte):
                  print(mot, compte[mot])
              print("Mots distincts :", len(set(texte.split())))
            `, { stdin: "le code le plus simple est le meilleur code" }),
          ],
          summary: ["Un dictionnaire associe clé → valeur.", "get() fournit une valeur par défaut.", "Un set élimine les doublons."],
          exerciseSlugs: ["py-frequences"],
        }),
      ],
    },
    {
      slug: "structuration",
      title: "Module 3 — Structurer ses programmes",
      lessons: [
        lesson({
          slug: "fonctions",
          title: "Fonctions",
          durationMinutes: 40,
          objectives: ["Définir des fonctions avec def.", "Utiliser paramètres par défaut et valeurs de retour multiples.", "Comprendre la portée des variables."],
          content: `
            ## Définir une fonction

            ~~~python
            def carre(x):
                return x * x

            print(carre(5))   # 25
            ~~~

            Une fonction sans **return** renvoie **None** : c'est l'équivalent d'une procédure.

            ## Paramètres par défaut et nommés

            ~~~python
            def saluer(nom, message="Bonjour"):
                print(f"{message}, {nom} !")

            saluer("Amani")
            saluer("Grâce", message="Bonsoir")
            ~~~

            ## Retourner plusieurs valeurs

            ~~~python
            def min_max(liste):
                return min(liste), max(liste)

            petit, grand = min_max([4, 9, 1])
            ~~~

            ## Portée des variables

            Les variables créées dans une fonction sont **locales**. Une fonction peut lire une variable globale, mais pour la modifier il faudrait **global** — à éviter : préférez passer des paramètres et retourner des résultats.

            ## Objets modifiables

            Une liste passée à une fonction peut être modifiée par celle-ci (comme un passage par référence). Les nombres et chaînes, eux, ne sont jamais modifiés.

            ## Documenter

            ~~~python
            def moyenne(notes):
                """Retourne la moyenne d'une liste non vide de notes."""
                return sum(notes) / len(notes)
            ~~~

            ## Récursivité

            ~~~python
            def fact(n):
                return 1 if n == 0 else n * fact(n - 1)
            ~~~
          `,
          examples: [
            example(PY, "Fonctions", `
              def est_premier(n):
                  """Retourne True si n est un nombre premier."""
                  if n < 2:
                      return False
                  d = 2
                  while d * d <= n:
                      if n % d == 0:
                          return False
                      d += 1
                  return True

              premiers = [k for k in range(2, 50) if est_premier(k)]
              print(premiers)
            `),
          ],
          summary: ["def définit une fonction, return renvoie le résultat.", "Les paramètres peuvent avoir des valeurs par défaut.", "Les variables d'une fonction sont locales."],
          quiz: quiz("py-fonctions-quiz", "Fonctions", [
            qcm("Que renvoie une fonction sans instruction return ?", ["0", "None", "False", "Une erreur"], 1),
            qcm("def f(a, b=2): return a * b. Que vaut f(5) ?", ["5", "7", "10", "Erreur"], 2),
          ]),
          exerciseSlugs: ["py-fonction-premier", "py-pgcd"],
        }),
        lesson({
          slug: "modules",
          title: "Modules",
          durationMinutes: 25,
          objectives: ["Importer des modules de la bibliothèque standard.", "Créer son propre module."],
          content: `
            ## Importer un module

            Un **module** est un fichier Python réutilisable. La bibliothèque standard en contient des centaines :

            ~~~python
            import math
            print(math.sqrt(16), math.pi)

            from random import randint
            print(randint(1, 6))
            ~~~

            ## Modules utiles

            | Module | Usage |
            |---|---|
            | math | fonctions mathématiques |
            | random | nombres aléatoires |
            | datetime | dates et heures |
            | statistics | moyenne, médiane, écart type |
            | collections | Counter, deque… |

            ## Créer son module

            Placez des fonctions dans un fichier **outils.py** puis, dans **main.py** : **import outils**. Dans l'éditeur de la plateforme, ajoutez un fichier avec le bouton **+** pour essayer.

            ## Le bloc principal

            ~~~python
            if __name__ == "__main__":
                main()
            ~~~

            Ce code ne s'exécute que si le fichier est lancé directement, pas lorsqu'il est importé.

            ## Paquets externes

            Avec **pip**, on installe des bibliothèques comme numpy ou pandas (voir le dernier module).
          `,
          examples: [
            example(PY, "Bibliothèque standard", `
              import math
              import statistics
              from collections import Counter

              notes = [12, 15, 9, 15, 17, 12, 15]
              print("Racine de 2 :", round(math.sqrt(2), 4))
              print("Moyenne :", round(statistics.mean(notes), 2))
              print("Médiane :", statistics.median(notes))
              print("Note la plus fréquente :", Counter(notes).most_common(1))
            `),
          ],
          summary: ["import charge un module.", "La bibliothèque standard est très riche.", "if __name__ == \"__main__\" protège le code principal."],
        }),
        lesson({
          slug: "exceptions",
          title: "Gestion des exceptions",
          durationMinutes: 30,
          level: "intermediaire",
          objectives: ["Lire un message d'erreur Python.", "Intercepter des erreurs avec try / except.", "Lever ses propres exceptions."],
          content: `
            ## Lire une erreur

            Quand une erreur survient, Python affiche un **traceback** : la dernière ligne indique le **type** d'erreur et le message, les lignes précédentes indiquent **où** elle s'est produite.

            | Exception | Cause fréquente |
            |---|---|
            | SyntaxError | faute de syntaxe (deux-points oubliés…) |
            | NameError | variable non définie |
            | TypeError | opération entre types incompatibles ("2" + 3) |
            | ValueError | conversion impossible (int("abc")) |
            | IndexError | indice hors de la liste |
            | KeyError | clé absente d'un dictionnaire |
            | ZeroDivisionError | division par zéro |

            ## try / except

            ~~~python
            try:
                age = int(input())
            except ValueError:
                print("Veuillez saisir un nombre entier.")
            ~~~

            On peut ajouter **else** (exécuté si aucune erreur) et **finally** (exécuté dans tous les cas).

            ## Lever une exception

            ~~~python
            def racine(x):
                if x < 0:
                    raise ValueError("x doit être positif")
                return x ** 0.5
            ~~~

            ## Bonne pratique

            Interceptez des exceptions **précises**. Un **except:** sans type masque les vraies erreurs et rend le débogage difficile.
          `,
          examples: [
            example(PY, "Saisie robuste", `
              valeurs = ["12", "abc", "0", "4"]
              for v in valeurs:
                  try:
                      n = int(v)
                      print(f"100 / {n} = {100 / n}")
                  except ValueError:
                      print(f"'{v}' n'est pas un entier")
                  except ZeroDivisionError:
                      print("Division par zéro impossible")
            `),
          ],
          summary: ["Le traceback indique le type et la ligne de l'erreur.", "try / except intercepte une erreur précise.", "raise lève une exception."],
          quiz: quiz("py-exceptions-quiz", "Exceptions", [
            qcm("Quelle exception provoque int(\"douze\") ?", ["TypeError", "ValueError", "NameError", "SyntaxError"], 1),
          ]),
          exerciseSlugs: ["py-division-securisee"],
        }),
        lesson({
          slug: "fichiers",
          title: "Fichiers",
          durationMinutes: 25,
          level: "intermediaire",
          objectives: ["Lire et écrire des fichiers texte.", "Utiliser with pour fermer automatiquement un fichier.", "Manipuler un fichier CSV."],
          content: `
            ## Écrire dans un fichier

            ~~~python
            with open("notes.txt", "w", encoding="utf-8") as f:
                f.write("Amani;15\\n")
                f.write("Grâce;17\\n")
            ~~~

            Le mode **"w"** crée (ou écrase) le fichier, **"a"** ajoute à la fin, **"r"** lit (par défaut).

            ## Lire un fichier

            ~~~python
            with open("notes.txt", encoding="utf-8") as f:
                for ligne in f:
                    nom, note = ligne.strip().split(";")
                    print(nom, float(note))
            ~~~

            Le bloc **with** ferme automatiquement le fichier, même en cas d'erreur.

            ## Le module csv

            ~~~python
            import csv
            with open("notes.csv", newline="", encoding="utf-8") as f:
                for ligne in csv.reader(f):
                    print(ligne)
            ~~~

            ## Erreurs fréquentes

            - **FileNotFoundError** : le fichier n'existe pas (vérifiez le chemin).
            - Oublier **strip()** laisse le caractère de fin de ligne.
            - Oublier **encoding="utf-8"** peut corrompre les accents.
          `,
          examples: [
            example(PY, "Écrire puis relire", `
              etudiants = [("Amani", 15), ("Grâce", 17), ("Josué", 9)]
              with open("notes.txt", "w", encoding="utf-8") as f:
                  for nom, note in etudiants:
                      f.write(f"{nom};{note}\\n")

              with open("notes.txt", encoding="utf-8") as f:
                  for ligne in f:
                      nom, note = ligne.strip().split(";")
                      statut = "admis" if int(note) >= 10 else "ajourné"
                      print(f"{nom} : {note} ({statut})")
            `),
          ],
          summary: ["open() ouvre un fichier ; with le ferme automatiquement.", "Modes : r (lire), w (écrire), a (ajouter).", "strip() et split() découpent les lignes."],
        }),
      ],
    },
    {
      slug: "poo-algorithmes",
      title: "Module 4 — Objets et algorithmes",
      lessons: [
        lesson({
          slug: "programmation-orientee-objet",
          title: "Programmation orientée objet",
          durationMinutes: 45,
          level: "intermediaire",
          objectives: ["Définir une classe avec attributs et méthodes.", "Créer des objets.", "Utiliser l'héritage."],
          content: `
            ## Classes et objets

            Une **classe** est un modèle ; un **objet** est un exemplaire construit à partir de ce modèle.

            ~~~python
            class Etudiant:
                def __init__(self, nom, notes=None):
                    self.nom = nom                  # attribut
                    self.notes = notes or []

                def ajouter_note(self, note):       # méthode
                    self.notes.append(note)

                def moyenne(self):
                    return sum(self.notes) / len(self.notes) if self.notes else 0

            e = Etudiant("Amani")
            e.ajouter_note(15)
            print(e.moyenne())
            ~~~

            - **__init__** est le constructeur, appelé à la création de l'objet.
            - **self** désigne l'objet lui-même.

            ## Représentation textuelle

            La méthode **__str__** définit ce qu'affiche print(objet).

            ## Héritage

            Une classe peut **hériter** d'une autre et redéfinir certaines méthodes :

            ~~~python
            class Boursier(Etudiant):
                def __init__(self, nom, montant):
                    super().__init__(nom)
                    self.montant = montant
            ~~~

            ## Encapsulation

            Par convention, un attribut préfixé par **_** est « privé » : il ne doit pas être utilisé hors de la classe.
          `,
          examples: [
            example(PY, "Compte bancaire", `
              class Compte:
                  def __init__(self, titulaire, solde=0):
                      self.titulaire = titulaire
                      self._solde = solde

                  def deposer(self, montant):
                      if montant <= 0:
                          raise ValueError("Le montant doit être positif")
                      self._solde += montant

                  def retirer(self, montant):
                      if montant > self._solde:
                          raise ValueError("Solde insuffisant")
                      self._solde -= montant

                  def __str__(self):
                      return f"Compte de {self.titulaire} : {self._solde} FC"

              c = Compte("Amani", 5000)
              c.deposer(2500)
              c.retirer(1000)
              print(c)
              try:
                  c.retirer(100000)
              except ValueError as e:
                  print("Erreur :", e)
            `),
          ],
          summary: ["Une classe définit attributs et méthodes.", "__init__ initialise l'objet ; self le désigne.", "L'héritage réutilise une classe existante."],
          quiz: quiz("py-poo-quiz", "Objets", [
            qcm("Quel est le rôle de __init__ ?", ["Détruire l'objet", "Initialiser l'objet à sa création", "Afficher l'objet", "Importer la classe"], 1),
          ]),
          exerciseSlugs: ["py-classe-rectangle"],
        }),
        lesson({
          slug: "structures-de-donnees",
          title: "Structures de données",
          durationMinutes: 35,
          level: "intermediaire",
          objectives: ["Implémenter une pile et une file.", "Choisir la structure adaptée à un problème."],
          content: `
            ## La pile (LIFO)

            Dernier entré, premier sorti, comme une pile d'assiettes. En Python, une liste suffit : **append** pour empiler, **pop** pour dépiler.

            Usages : annuler une action, vérifier des parenthèses, appels de fonctions.

            ## La file (FIFO)

            Premier entré, premier sorti, comme une file d'attente. On utilise **collections.deque** : **append** pour enfiler, **popleft** pour défiler (rapide, contrairement à list.pop(0)).

            ## Quelle structure choisir ?

            | Besoin | Structure | Coût d'accès |
            |---|---|---|
            | Accès par position | list | O(1) |
            | Recherche par clé | dict | O(1) en moyenne |
            | Test d'appartenance, unicité | set | O(1) en moyenne |
            | Ajout/retrait aux deux bouts | deque | O(1) |
            | Données fixes | tuple | O(1) |

            Tester **x in liste** coûte O(n), alors que **x in ensemble** coûte O(1) en moyenne : pour de grandes données, la différence est énorme.
          `,
          examples: [
            example(PY, "Parenthèses équilibrées avec une pile", `
              def equilibre(expr):
                  paires = {")": "(", "]": "[", "}": "{"}
                  pile = []
                  for c in expr:
                      if c in "([{":
                          pile.append(c)
                      elif c in paires:
                          if not pile or pile.pop() != paires[c]:
                              return False
                  return not pile

              for e in ["(a + b) * [c]", "((a)", "{[()]}", "(]"]:
                  print(e, "->", equilibre(e))
            `),
          ],
          summary: ["Pile : append / pop (LIFO).", "File : deque.append / popleft (FIFO).", "dict et set offrent des recherches rapides."],
          exerciseSlugs: ["py-parentheses"],
        }),
        lesson({
          slug: "recherche-tri",
          title: "Algorithmes de recherche et de tri",
          durationMinutes: 45,
          level: "avance",
          objectives: ["Implémenter la recherche dichotomique.", "Implémenter le tri par insertion et le tri fusion.", "Comparer avec sorted()."],
          content: `
            ## Recherche dichotomique

            ~~~python
            def dichotomie(liste, x):
                debut, fin = 0, len(liste) - 1
                while debut <= fin:
                    milieu = (debut + fin) // 2
                    if liste[milieu] == x:
                        return milieu
                    if x < liste[milieu]:
                        fin = milieu - 1
                    else:
                        debut = milieu + 1
                return -1
            ~~~

            ## Tri par insertion — O(n²)

            On insère chaque élément à sa place dans la partie déjà triée, comme on range des cartes dans sa main.

            ## Tri fusion — O(n log n)

            On coupe la liste en deux, on trie récursivement chaque moitié, puis on **fusionne** les deux moitiés triées.

            ## En pratique

            Python fournit **sorted()** et **list.sort()** (algorithme Timsort, O(n log n)). Avec **key**, on trie selon un critère :

            ~~~python
            etudiants.sort(key=lambda e: e[1], reverse=True)
            ~~~

            Programmer soi-même les tris reste indispensable pour **comprendre** et pour les examens.
          `,
          examples: [
            example(PY, "Tri fusion", `
              def fusion(a, b):
                  resultat, i, j = [], 0, 0
                  while i < len(a) and j < len(b):
                      if a[i] <= b[j]:
                          resultat.append(a[i]); i += 1
                      else:
                          resultat.append(b[j]); j += 1
                  return resultat + a[i:] + b[j:]

              def tri_fusion(liste):
                  if len(liste) <= 1:
                      return liste
                  m = len(liste) // 2
                  return fusion(tri_fusion(liste[:m]), tri_fusion(liste[m:]))

              print(tri_fusion([38, 27, 43, 3, 9, 82, 10]))
            `),
          ],
          summary: ["La dichotomie exige une liste triée.", "Insertion : O(n²) ; fusion : O(n log n).", "sorted() accepte key et reverse."],
          exerciseSlugs: ["py-tri-insertion", "py-dichotomie"],
        }),
        lesson({
          slug: "science-donnees-ia",
          title: "Introduction à la science des données et à l'IA",
          durationMinutes: 40,
          level: "avance",
          objectives: ["Découvrir l'écosystème Python pour les données.", "Calculer des statistiques descriptives.", "Comprendre le principe de l'apprentissage automatique."],
          content: `
            ## L'écosystème

            | Bibliothèque | Rôle |
            |---|---|
            | NumPy | calcul sur des tableaux de nombres |
            | pandas | tableaux de données (lignes et colonnes) |
            | Matplotlib | graphiques |
            | scikit-learn | apprentissage automatique |

            Ces bibliothèques s'installent avec pip. Les exemples ci-dessous utilisent uniquement la bibliothèque standard pour fonctionner partout.

            ## Statistiques descriptives

            Moyenne, médiane, écart type, minimum, maximum : ces mesures résument un jeu de données.

            ## Qu'est-ce que l'apprentissage automatique ?

            Au lieu d'écrire les règles à la main, on fournit des **exemples** et l'algorithme **apprend** une règle. Exemple : prédire la note d'examen à partir des heures de révision.

            La **régression linéaire** cherche la droite y = a·x + b la plus proche des points. Les formules des moindres carrés donnent :

            - a = covariance(x, y) / variance(x)
            - b = moyenne(y) − a × moyenne(x)

            ## Une IA responsable

            Un modèle n'est jamais meilleur que ses données : des données biaisées produisent des décisions biaisées. Vérifiez toujours les résultats et respectez la vie privée des personnes concernées.
          `,
          examples: [
            example(PY, "Régression linéaire à la main", `
              heures = [1, 2, 3, 4, 5, 6]
              notes = [6, 8, 11, 12, 15, 17]

              n = len(heures)
              mx = sum(heures) / n
              my = sum(notes) / n
              cov = sum((x - mx) * (y - my) for x, y in zip(heures, notes)) / n
              var = sum((x - mx) ** 2 for x in heures) / n
              a = cov / var
              b = my - a * mx

              print(f"Modèle : note = {a:.2f} x heures + {b:.2f}")
              for h in [3.5, 8]:
                  print(f"{h} h de révision -> note prédite {a * h + b:.1f}")
            `),
          ],
          summary: ["NumPy, pandas, Matplotlib et scikit-learn forment l'écosystème données.", "L'apprentissage automatique apprend une règle à partir d'exemples.", "La qualité des données conditionne celle du modèle."],
          exerciseSlugs: ["py-statistiques"],
        }),
      ],
    },
  ],
  finalQuiz: quiz("python-evaluation-finale", "Évaluation finale — Python", [
    qcm("Que vaut 17 // 5 ?", ["3.4", "3", "2", "4"], 1),
    qcm("Que vaut len([1, [2, 3], 4]) ?", ["4", "3", "2", "Erreur"], 1),
    qcm("Quel type est renvoyé par input() ?", ["int", "str", "float", "bool"], 1),
    vraiFaux("Les indices d'une liste Python commencent à 1.", false),
    qcm("Quelle structure garantit l'unicité de ses éléments ?", ["list", "tuple", "set", "str"], 2),
    qcm("Quelle exception lève {\"a\": 1}[\"b\"] ?", ["IndexError", "KeyError", "ValueError", "NameError"], 1),
    vraiFaux("Une méthode d'instance reçoit l'objet en premier paramètre, nommé self par convention.", true),
    qcm("Quelle est la complexité de sorted() ?", ["O(n)", "O(n log n)", "O(n²)", "O(1)"], 1),
  ], 70),
};
