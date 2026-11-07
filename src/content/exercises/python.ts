import type { Exercise } from "../types";
import { makeExercise, type ExInput } from "../helpers";

const ex = (input: ExInput) => makeExercise({ language: "python", courseSlug: "python" }, input);

export const pythonExercises: Exercise[] = [
  ex({
    slug: "py-bonjour",
    lessonSlug: "syntaxe-fondamentale",
    title: "Bonjour en Python",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: `
      Lisez un prénom et affichez :

      ~~~text
      Bonjour <prénom>, bienvenue en Python !
      ~~~
    `,
    examples: [{ input: "Amani", output: "Bonjour Amani, bienvenue en Python !" }],
    starterCode: `
      prenom = input()
      # Affichez le message
    `,
    hints: ["Utilisez print avec une f-string.", "print(f\"Bonjour {prenom}, …\")"],
    tests: [
      { input: "Amani", expected: "Bonjour Amani, bienvenue en Python !" },
      { input: "Grâce", expected: "Bonjour Grâce, bienvenue en Python !", hidden: true },
    ],
    solution: `
      prenom = input()
      print(f"Bonjour {prenom}, bienvenue en Python !")
    `,
    correction: `
      Une f-string insère la valeur de la variable entre accolades. Attention à la virgule et à l'espace avant le point d'exclamation.
    `,
    points: 5,
  }),
  ex({
    slug: "py-somme",
    lessonSlug: "variables-types",
    title: "Somme et produit",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: `
      Lisez deux entiers (un par ligne) et affichez leur somme puis leur produit :

      ~~~text
      Somme : <a + b>
      Produit : <a * b>
      ~~~
    `,
    examples: [{ input: "4\n5", output: "Somme : 9\nProduit : 20" }],
    hints: ["input() renvoie une chaîne : convertissez avec int().", "Sans conversion, \"4\" + \"5\" donne \"45\" !"],
    tests: [
      { input: "4\n5", expected: "Somme : 9\nProduit : 20" },
      { input: "-3\n7", expected: "Somme : 4\nProduit : -21" },
      { input: "0\n123", expected: "Somme : 123\nProduit : 0", hidden: true },
    ],
    solution: `
      a = int(input())
      b = int(input())
      print("Somme :", a + b)
      print("Produit :", a * b)
    `,
    correction: `
      L'erreur classique est d'oublier **int()** : les chaînes seraient concaténées au lieu d'être additionnées. print sépare ses arguments par un espace.
    `,
    points: 5,
  }),
  ex({
    slug: "py-conversion-temps",
    lessonSlug: "operateurs",
    title: "Conversion de secondes",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: `
      Lisez un nombre de secondes et affichez-le au format **HH:MM:SS** (avec deux chiffres pour chaque partie).
    `,
    examples: [{ input: "3725", output: "01:02:05" }],
    hints: ["// donne le quotient, % le reste.", "f\"{h:02d}\" affiche un entier sur deux chiffres."],
    tests: [
      { input: "3725", expected: "01:02:05" },
      { input: "59", expected: "00:00:59" },
      { input: "86399", expected: "23:59:59", hidden: true },
    ],
    solution: `
      total = int(input())
      h = total // 3600
      m = total % 3600 // 60
      s = total % 60
      print(f"{h:02d}:{m:02d}:{s:02d}")
    `,
    correction: `
      Le format **:02d** complète avec un zéro à gauche pour obtenir deux chiffres.
    `,
  }),
  ex({
    slug: "py-pair-impair",
    lessonSlug: "conditions",
    title: "Pair ou impair",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Lisez un entier et affichez **pair** ou **impair**.",
    examples: [{ input: "10", output: "pair" }],
    hints: ["n % 2 vaut 0 pour un nombre pair."],
    tests: [
      { input: "10", expected: "pair" },
      { input: "7", expected: "impair" },
      { input: "-3", expected: "impair", hidden: true },
      { input: "0", expected: "pair", hidden: true },
    ],
    solution: `
      n = int(input())
      if n % 2 == 0:
          print("pair")
      else:
          print("impair")
    `,
    correction: "On teste le reste de la division par 2 avec l'opérateur **%** et la comparaison **==** (deux signes égal).",
    points: 5,
  }),
  ex({
    slug: "py-mention",
    lessonSlug: "conditions",
    title: "Mention",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: `
      Lisez une note (réel) et affichez **Note invalide** (hors de 0–20), **Très bien** (≥ 16), **Bien** (≥ 14), **Passable** (≥ 10) ou **Ajourné**.
    `,
    examples: [{ input: "14.5", output: "Bien" }],
    hints: ["Utilisez if / elif / else.", "Python permet d'écrire 0 <= note <= 20."],
    tests: [
      { input: "14.5", expected: "Bien" },
      { input: "20", expected: "Très bien" },
      { input: "9.99", expected: "Ajourné" },
      { input: "-1", expected: "Note invalide", hidden: true },
      { input: "10", expected: "Passable", hidden: true },
    ],
    solution: `
      note = float(input())
      if not 0 <= note <= 20:
          print("Note invalide")
      elif note >= 16:
          print("Très bien")
      elif note >= 14:
          print("Bien")
      elif note >= 10:
          print("Passable")
      else:
          print("Ajourné")
    `,
    correction: "On traite d'abord le cas invalide, puis les mentions de la plus haute à la plus basse.",
  }),
  ex({
    slug: "py-table",
    lessonSlug: "boucles",
    title: "Table de multiplication",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Lisez un entier n et affichez sa table de 1 à 10 au format **n x i = résultat**.",
    examples: [{ input: "3", output: "3 x 1 = 3\n…\n3 x 10 = 30" }],
    hints: ["range(1, 11) produit les nombres de 1 à 10."],
    tests: [
      { input: "3", expected: Array.from({ length: 10 }, (_, k) => `3 x ${k + 1} = ${3 * (k + 1)}`).join("\n") },
      { input: "9", expected: Array.from({ length: 10 }, (_, k) => `9 x ${k + 1} = ${9 * (k + 1)}`).join("\n"), hidden: true },
    ],
    solution: `
      n = int(input())
      for i in range(1, 11):
          print(f"{n} x {i} = {n * i}")
    `,
    correction: "range(1, 11) s'arrête **avant** 11 : la boucle s'exécute pour i = 1 à 10.",
  }),
  ex({
    slug: "py-factorielle",
    lessonSlug: "boucles",
    title: "Factorielle",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Lisez un entier n ≥ 0 et affichez n!. Python gère les grands entiers : testez avec n = 30 !",
    examples: [{ input: "5", output: "120" }],
    hints: ["Initialisez le produit à 1.", "for i in range(2, n + 1): …"],
    tests: [
      { input: "5", expected: "120" },
      { input: "0", expected: "1" },
      { input: "30", expected: "265252859812191058636308480000000", hidden: true },
    ],
    solution: `
      n = int(input())
      f = 1
      for i in range(2, n + 1):
          f *= i
      print(f)
    `,
    correction: "Les entiers Python ont une précision illimitée, contrairement au C ou au Java où l'on aurait un dépassement de capacité pour 30!.",
  }),
  ex({
    slug: "py-maximum-liste",
    lessonSlug: "listes-tuples",
    title: "Maximum sans max()",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: `
      Lisez une ligne d'entiers séparés par des espaces et affichez le plus grand **sans utiliser max()** ni **sorted()**.
    `,
    examples: [{ input: "4 9 -2 7", output: "9" }],
    constraints: ["Interdiction d'utiliser max(), sorted() ou sort()."],
    hints: ["valeurs = list(map(int, input().split()))", "Initialisez le maximum avec le premier élément, pas avec 0."],
    tests: [
      { input: "4 9 -2 7", expected: "9" },
      { input: "-5 -1 -8", expected: "-1" },
      { input: "42", expected: "42", hidden: true },
    ],
    solution: `
      valeurs = list(map(int, input().split()))
      plus_grand = valeurs[0]
      for v in valeurs[1:]:
          if v > plus_grand:
              plus_grand = v
      print(plus_grand)
    `,
    correction: "Initialiser à 0 serait faux pour une liste de nombres tous négatifs : on part du premier élément.",
  }),
  ex({
    slug: "py-inverser-liste",
    lessonSlug: "listes-tuples",
    title: "Inverser une liste",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Lisez une ligne de mots séparés par des espaces et affichez-les dans l'ordre inverse, séparés par un espace.",
    examples: [{ input: "le code est beau", output: "beau est code le" }],
    hints: ["input().split() découpe la ligne en liste.", "Une tranche avec un pas négatif [::-1] inverse une liste.", "\" \".join(liste) recolle les mots."],
    tests: [
      { input: "le code est beau", expected: "beau est code le" },
      { input: "UPL", expected: "UPL" },
      { input: "a b c d e", expected: "e d c b a", hidden: true },
    ],
    solution: `
      mots = input().split()
      print(" ".join(mots[::-1]))
    `,
    correction: "**[::-1]** parcourt la liste avec un pas de -1 ; **join** assemble les éléments avec le séparateur choisi.",
  }),
  ex({
    slug: "py-frequences",
    lessonSlug: "dictionnaires-ensembles",
    title: "Fréquence des lettres",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: `
      Lisez un mot (en minuscules) et affichez chaque lettre distincte avec son nombre d'occurrences, **dans l'ordre alphabétique**, au format **lettre:nombre**, une par ligne.
    `,
    examples: [{ input: "banane", output: "a:2\nb:1\ne:1\nn:2" }],
    hints: ["Un dictionnaire associe chaque lettre à un compteur.", "compte[c] = compte.get(c, 0) + 1", "sorted(compte) donne les clés triées."],
    tests: [
      { input: "banane", expected: "a:2\nb:1\ne:1\nn:2" },
      { input: "aaa", expected: "a:3" },
      { input: "programmation", expected: "a:2\ng:1\ni:1\nm:2\nn:1\no:2\np:1\nr:2\nt:1", hidden: true },
    ],
    solution: `
      mot = input().strip()
      compte = {}
      for c in mot:
          compte[c] = compte.get(c, 0) + 1
      for c in sorted(compte):
          print(f"{c}:{compte[c]}")
    `,
    correction: "Le dictionnaire évite d'écrire 26 compteurs. **get(c, 0)** renvoie 0 pour une lettre pas encore rencontrée.",
  }),
  ex({
    slug: "py-fonction-premier",
    lessonSlug: "fonctions",
    title: "Fonction est_premier",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: `
      Écrivez une fonction **est_premier(n)** qui retourne True si n est premier. Le programme lit un entier n et affiche le nombre de nombres premiers inférieurs ou égaux à n.
    `,
    examples: [{ input: "20", output: "8" }],
    starterCode: `
      def est_premier(n):
          # À compléter
          pass

      n = int(input())
      print(sum(1 for k in range(2, n + 1) if est_premier(k)))
    `,
    hints: ["0 et 1 ne sont pas premiers.", "Testez les diviseurs d tant que d * d <= n."],
    tests: [
      { input: "20", expected: "8" },
      { input: "1", expected: "0" },
      { input: "1000", expected: "168", hidden: true },
    ],
    solution: `
      def est_premier(n):
          if n < 2:
              return False
          d = 2
          while d * d <= n:
              if n % d == 0:
                  return False
              d += 1
          return True

      n = int(input())
      print(sum(1 for k in range(2, n + 1) if est_premier(k)))
    `,
    correction: "On s'arrête à la racine carrée de n : si n avait un diviseur plus grand, il en aurait forcément un plus petit.",
  }),
  ex({
    slug: "py-pgcd",
    lessonSlug: "fonctions",
    title: "PGCD d'Euclide (récursif)",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: `
      Écrivez une fonction **récursive pgcd(a, b)** utilisant l'algorithme d'Euclide : pgcd(a, 0) = a et pgcd(a, b) = pgcd(b, a % b). Lisez deux entiers positifs et affichez leur PGCD.
    `,
    examples: [{ input: "48\n18", output: "6" }],
    constraints: ["Ne pas utiliser math.gcd."],
    hints: ["Cas de base : b == 0.", "Cas récursif : return pgcd(b, a % b)."],
    tests: [
      { input: "48\n18", expected: "6" },
      { input: "17\n5", expected: "1" },
      { input: "1071\n462", expected: "21", hidden: true },
    ],
    solution: `
      def pgcd(a, b):
          if b == 0:
              return a
          return pgcd(b, a % b)

      a = int(input())
      b = int(input())
      print(pgcd(a, b))
    `,
    correction: "À chaque appel, le second argument diminue strictement (a % b < b) : on atteint forcément le cas de base b = 0.",
    isEvaluated: true,
  }),
  ex({
    slug: "py-division-securisee",
    lessonSlug: "exceptions",
    title: "Division sécurisée",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: `
      Lisez deux valeurs a et b (une par ligne) et affichez a / b arrondi à 2 décimales. Gérez les erreurs :

      - si une valeur n'est pas un nombre : **Erreur : valeur invalide**
      - si b vaut 0 : **Erreur : division par zéro**
    `,
    examples: [{ input: "7\n2", output: "3.5" }],
    hints: ["float() lève ValueError si la conversion échoue.", "Utilisez plusieurs blocs except.", "round(x, 2) arrondit."],
    tests: [
      { input: "7\n2", expected: "3.5" },
      { input: "1\n0", expected: "Erreur : division par zéro" },
      { input: "abc\n2", expected: "Erreur : valeur invalide" },
      { input: "10\n3", expected: "3.33", hidden: true },
    ],
    solution: `
      try:
          a = float(input())
          b = float(input())
          print(round(a / b, 2))
      except ValueError:
          print("Erreur : valeur invalide")
      except ZeroDivisionError:
          print("Erreur : division par zéro")
    `,
    correction: "Chaque type d'erreur a son propre **except**. On intercepte des exceptions précises plutôt qu'un except général.",
  }),
  ex({
    slug: "py-classe-rectangle",
    lessonSlug: "programmation-orientee-objet",
    title: "Classe Rectangle",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: `
      Écrivez une classe **Rectangle** avec un constructeur (largeur, hauteur) et les méthodes **aire()**, **perimetre()** et **est_carre()**. Le programme lit la largeur et la hauteur (entiers) et affiche :

      ~~~text
      Aire : …
      Périmètre : …
      Carré : True ou False
      ~~~
    `,
    examples: [{ input: "4\n5", output: "Aire : 20\nPérimètre : 18\nCarré : False" }],
    starterCode: `
      class Rectangle:
          def __init__(self, largeur, hauteur):
              pass

      r = Rectangle(int(input()), int(input()))
      print("Aire :", r.aire())
      print("Périmètre :", r.perimetre())
      print("Carré :", r.est_carre())
    `,
    hints: ["Stockez les dimensions dans self.largeur et self.hauteur.", "Chaque méthode reçoit self en premier paramètre."],
    tests: [
      { input: "4\n5", expected: "Aire : 20\nPérimètre : 18\nCarré : False" },
      { input: "3\n3", expected: "Aire : 9\nPérimètre : 12\nCarré : True", hidden: true },
    ],
    solution: `
      class Rectangle:
          def __init__(self, largeur, hauteur):
              self.largeur = largeur
              self.hauteur = hauteur

          def aire(self):
              return self.largeur * self.hauteur

          def perimetre(self):
              return 2 * (self.largeur + self.hauteur)

          def est_carre(self):
              return self.largeur == self.hauteur

      r = Rectangle(int(input()), int(input()))
      print("Aire :", r.aire())
      print("Périmètre :", r.perimetre())
      print("Carré :", r.est_carre())
    `,
    correction: "Les attributs sont enregistrés dans le constructeur, puis utilisés par les méthodes via **self**.",
  }),
  ex({
    slug: "py-parentheses",
    lessonSlug: "structures-de-donnees",
    title: "Parenthèses équilibrées",
    difficulty: "avance",
    type: "probleme",
    statement: `
      Lisez une expression et affichez **OK** si les parenthèses (), crochets [] et accolades {} sont correctement équilibrés et imbriqués, **ERREUR** sinon.
    `,
    examples: [
      { input: "{[(a+b)*c]}", output: "OK" },
      { input: "(a]", output: "ERREUR" },
    ],
    hints: ["Utilisez une pile : empilez chaque symbole ouvrant.", "À chaque fermant, le sommet de la pile doit être l'ouvrant correspondant.", "À la fin, la pile doit être vide."],
    tests: [
      { input: "{[(a+b)*c]}", expected: "OK" },
      { input: "(a]", expected: "ERREUR" },
      { input: "((x)", expected: "ERREUR" },
      { input: "x)(", expected: "ERREUR", hidden: true },
      { input: "sans symbole", expected: "OK", hidden: true },
    ],
    solution: `
      expr = input()
      paires = {")": "(", "]": "[", "}": "{"}
      pile = []
      ok = True
      for c in expr:
          if c in "([{":
              pile.append(c)
          elif c in paires:
              if not pile or pile.pop() != paires[c]:
                  ok = False
                  break
      print("OK" if ok and not pile else "ERREUR")
    `,
    correction: "La pile mémorise les ouvrants en attente. Trois cas d'erreur : un fermant sans ouvrant, un fermant qui ne correspond pas, des ouvrants restants à la fin.",
    isEvaluated: true,
  }),
  ex({
    slug: "py-tri-insertion",
    lessonSlug: "recherche-tri",
    title: "Tri par insertion",
    difficulty: "avance",
    type: "ecrire_programme",
    statement: "Lisez une ligne d'entiers et affichez-les triés par ordre croissant en programmant le **tri par insertion** (sans sorted() ni sort()).",
    examples: [{ input: "5 2 9 1 5 6", output: "1 2 5 5 6 9" }],
    constraints: ["Interdiction d'utiliser sorted() et sort()."],
    hints: [
      "Pour chaque indice i à partir de 1, mémorisez cle = L[i].",
      "Décalez vers la droite les éléments plus grands que cle situés avant i.",
      "Placez cle dans la case libérée.",
    ],
    tests: [
      { input: "5 2 9 1 5 6", expected: "1 2 5 5 6 9" },
      { input: "1", expected: "1" },
      { input: "3 -1 0 -7 8", expected: "-7 -1 0 3 8", hidden: true },
    ],
    solution: `
      L = list(map(int, input().split()))
      for i in range(1, len(L)):
          cle = L[i]
          j = i - 1
          while j >= 0 and L[j] > cle:
              L[j + 1] = L[j]
              j -= 1
          L[j + 1] = cle
      print(" ".join(map(str, L)))
    `,
    correction: "La partie gauche L[0..i-1] est toujours triée. On y insère L[i] en décalant les éléments plus grands. Complexité : O(n²) dans le pire cas, O(n) si la liste est déjà triée.",
    isEvaluated: true,
  }),
  ex({
    slug: "py-dichotomie",
    lessonSlug: "recherche-tri",
    title: "Recherche dichotomique",
    difficulty: "avance",
    type: "ecrire_programme",
    statement: `
      La première ligne contient des entiers **triés** ; la seconde une valeur x. Affichez l'indice (à partir de 0) de x dans la liste, ou **-1** s'il est absent. Utilisez une recherche **dichotomique**.
    `,
    examples: [{ input: "1 3 5 7 9 11\n7", output: "3" }],
    hints: ["Gardez deux bornes debut et fin.", "milieu = (debut + fin) // 2"],
    tests: [
      { input: "1 3 5 7 9 11\n7", expected: "3" },
      { input: "1 3 5 7 9 11\n4", expected: "-1" },
      { input: "2\n2", expected: "0", hidden: true },
      { input: "10 20 30 40 50 60 70 80\n80", expected: "7", hidden: true },
    ],
    solution: `
      L = list(map(int, input().split()))
      x = int(input())
      debut, fin = 0, len(L) - 1
      position = -1
      while debut <= fin:
          milieu = (debut + fin) // 2
          if L[milieu] == x:
              position = milieu
              break
          elif x < L[milieu]:
              fin = milieu - 1
          else:
              debut = milieu + 1
      print(position)
    `,
    correction: "À chaque tour, la zone de recherche est divisée par deux : complexité O(log n).",
  }),
  ex({
    slug: "py-statistiques",
    lessonSlug: "science-donnees-ia",
    title: "Statistiques descriptives",
    difficulty: "avance",
    type: "mini_projet",
    statement: `
      Lisez une ligne de notes (réels) et affichez, arrondis à 2 décimales :

      ~~~text
      Moyenne : …
      Médiane : …
      Écart type : …
      ~~~

      L'écart type est la racine de la moyenne des carrés des écarts à la moyenne (écart type de population). Programmez les calculs vous-même, sans le module statistics.
    `,
    examples: [{ input: "10 12 14 16", output: "Moyenne : 13.0\nMédiane : 13.0\nÉcart type : 2.24" }],
    hints: [
      "La médiane d'une liste triée de taille paire est la moyenne des deux valeurs centrales.",
      "variance = sum((x - moyenne) ** 2 for x in notes) / n",
      "round(valeur, 2)",
    ],
    tests: [
      { input: "10 12 14 16", expected: "Moyenne : 13.0\nMédiane : 13.0\nÉcart type : 2.24" },
      { input: "5 18 9", expected: "Moyenne : 10.67\nMédiane : 9.0\nÉcart type : 5.44" },
      { input: "12", expected: "Moyenne : 12.0\nMédiane : 12.0\nÉcart type : 0.0", hidden: true },
    ],
    solution: `
      notes = list(map(float, input().split()))
      n = len(notes)
      moyenne = sum(notes) / n
      triees = sorted(notes)
      if n % 2 == 1:
          mediane = triees[n // 2]
      else:
          mediane = (triees[n // 2 - 1] + triees[n // 2]) / 2
      ecart = (sum((x - moyenne) ** 2 for x in notes) / n) ** 0.5
      print("Moyenne :", round(moyenne, 2))
      print("Médiane :", round(mediane, 2))
      print("Écart type :", round(ecart, 2))
    `,
    correction: "On trie une copie pour la médiane, en distinguant taille paire et impaire. L'écart type mesure la dispersion des notes autour de la moyenne.",
    points: 25,
  }),
];
