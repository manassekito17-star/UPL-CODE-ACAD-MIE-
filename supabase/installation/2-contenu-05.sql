-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 5 sur 10.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'fonctions-modules'), (select id from public.courses where slug = 'python'), 'modules', 'Modules', 'debutant', 25, array['Importer des modules de la bibliothèque standard.', 'Créer son propre module.']::text[], '{}'::text[], '## Importer un module

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

Placez des fonctions dans un fichier **outils.py** puis, dans **main.py** : **import outils**. Dans l''éditeur de la plateforme, ajoutez un fichier avec le bouton **+** pour essayer.

## Le bloc principal

~~~python
if __name__ == "__main__":
    main()
~~~

Ce code ne s''exécute que si le fichier est lancé directement, pas lorsqu''il est importé.

## Paquets externes

Avec **pip**, on installe des bibliothèques comme numpy ou pandas (voir le dernier module).', array['import charge un module.', 'La bibliothèque standard est très riche.', 'if __name__ == "__main__" protège le code principal.']::text[], '[{"language":"python","title":"Bibliothèque standard","code":"import math\nimport statistics\nfrom collections import Counter\n\nnotes = [12, 15, 9, 15, 17, 12, 15]\nprint(\"Racine de 2 :\", round(math.sqrt(2), 4))\nprint(\"Moyenne :\", round(statistics.mean(notes), 2))\nprint(\"Médiane :\", statistics.median(notes))\nprint(\"Note la plus fréquente :\", Counter(notes).most_common(1))"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'python'), 'structuration', 'Programmes robustes', null, 4, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'structuration'), (select id from public.courses where slug = 'python'), 'exceptions', 'Gestion des exceptions', 'intermediaire', 30, array['Lire un message d''erreur Python.', 'Intercepter des erreurs avec try / except.', 'Lever ses propres exceptions.']::text[], '{}'::text[], '## Lire une erreur

Quand une erreur survient, Python affiche un **traceback** : la dernière ligne indique le **type** d''erreur et le message, les lignes précédentes indiquent **où** elle s''est produite.

| Exception | Cause fréquente |
|---|---|
| SyntaxError | faute de syntaxe (deux-points oubliés…) |
| NameError | variable non définie |
| TypeError | opération entre types incompatibles ("2" + 3) |
| ValueError | conversion impossible (int("abc")) |
| IndexError | indice hors de la liste |
| KeyError | clé absente d''un dictionnaire |
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

Interceptez des exceptions **précises**. Un **except:** sans type masque les vraies erreurs et rend le débogage difficile.', array['Le traceback indique le type et la ligne de l''erreur.', 'try / except intercepte une erreur précise.', 'raise lève une exception.']::text[], '[{"language":"python","title":"Saisie robuste","code":"valeurs = [\"12\", \"abc\", \"0\", \"4\"]\nfor v in valeurs:\n    try:\n        n = int(v)\n        print(f\"100 / {n} = {100 / n}\")\n    except ValueError:\n        print(f\"''{v}'' n''est pas un entier\")\n    except ZeroDivisionError:\n        print(\"Division par zéro impossible\")"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'exceptions'), 'py-exceptions-quiz', 'Exceptions', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-exceptions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-exceptions-quiz'), 'qcm', 'Quelle exception provoque int("douze") ?', null, '["TypeError","ValueError","NameError","SyntaxError"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'structuration'), (select id from public.courses where slug = 'python'), 'fichiers', 'Fichiers', 'intermediaire', 25, array['Lire et écrire des fichiers texte.', 'Utiliser with pour fermer automatiquement un fichier.', 'Manipuler un fichier CSV.']::text[], '{}'::text[], '## Écrire dans un fichier

~~~python
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("Amani;15\n")
    f.write("Grâce;17\n")
~~~

Le mode **"w"** crée (ou écrase) le fichier, **"a"** ajoute à la fin, **"r"** lit (par défaut).

## Lire un fichier

~~~python
with open("notes.txt", encoding="utf-8") as f:
    for ligne in f:
        nom, note = ligne.strip().split(";")
        print(nom, float(note))
~~~

Le bloc **with** ferme automatiquement le fichier, même en cas d''erreur.

## Le module csv

~~~python
import csv
with open("notes.csv", newline="", encoding="utf-8") as f:
    for ligne in csv.reader(f):
        print(ligne)
~~~

## Erreurs fréquentes

- **FileNotFoundError** : le fichier n''existe pas (vérifiez le chemin).
- Oublier **strip()** laisse le caractère de fin de ligne.
- Oublier **encoding="utf-8"** peut corrompre les accents.', array['open() ouvre un fichier ; with le ferme automatiquement.', 'Modes : r (lire), w (écrire), a (ajouter).', 'strip() et split() découpent les lignes.']::text[], '[{"language":"python","title":"Écrire puis relire","code":"etudiants = [(\"Amani\", 15), (\"Grâce\", 17), (\"Josué\", 9)]\nwith open(\"notes.txt\", \"w\", encoding=\"utf-8\") as f:\n    for nom, note in etudiants:\n        f.write(f\"{nom};{note}\\n\")\n\nwith open(\"notes.txt\", encoding=\"utf-8\") as f:\n    for ligne in f:\n        nom, note = ligne.strip().split(\";\")\n        statut = \"admis\" if int(note) >= 10 else \"ajourné\"\n        print(f\"{nom} : {note} ({statut})\")"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'python'), 'poo-algorithmes', 'Objets et algorithmes', null, 5, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'poo-algorithmes'), (select id from public.courses where slug = 'python'), 'programmation-orientee-objet', 'Programmation orientée objet', 'intermediaire', 45, array['Définir une classe avec attributs et méthodes.', 'Créer des objets.', 'Utiliser l''héritage.']::text[], '{}'::text[], '## Classes et objets

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

- **__init__** est le constructeur, appelé à la création de l''objet.
- **self** désigne l''objet lui-même.

## Représentation textuelle

La méthode **__str__** définit ce qu''affiche print(objet).

## Héritage

Une classe peut **hériter** d''une autre et redéfinir certaines méthodes :

~~~python
class Boursier(Etudiant):
    def __init__(self, nom, montant):
        super().__init__(nom)
        self.montant = montant
~~~

## Encapsulation

Par convention, un attribut préfixé par **_** est « privé » : il ne doit pas être utilisé hors de la classe.', array['Une classe définit attributs et méthodes.', '__init__ initialise l''objet ; self le désigne.', 'L''héritage réutilise une classe existante.']::text[], '[{"language":"python","title":"Compte bancaire","code":"class Compte:\n    def __init__(self, titulaire, solde=0):\n        self.titulaire = titulaire\n        self._solde = solde\n\n    def deposer(self, montant):\n        if montant <= 0:\n            raise ValueError(\"Le montant doit être positif\")\n        self._solde += montant\n\n    def retirer(self, montant):\n        if montant > self._solde:\n            raise ValueError(\"Solde insuffisant\")\n        self._solde -= montant\n\n    def __str__(self):\n        return f\"Compte de {self.titulaire} : {self._solde} FC\"\n\nc = Compte(\"Amani\", 5000)\nc.deposer(2500)\nc.retirer(1000)\nprint(c)\ntry:\n    c.retirer(100000)\nexcept ValueError as e:\n    print(\"Erreur :\", e)"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'programmation-orientee-objet'), 'py-poo-quiz', 'Objets', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-poo-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-poo-quiz'), 'qcm', 'Quel est le rôle de __init__ ?', null, '["Détruire l''objet","Initialiser l''objet à sa création","Afficher l''objet","Importer la classe"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'poo-algorithmes'), (select id from public.courses where slug = 'python'), 'structures-de-donnees', 'Structures de données', 'intermediaire', 35, array['Implémenter une pile et une file.', 'Choisir la structure adaptée à un problème.']::text[], '{}'::text[], '## La pile (LIFO)

Dernier entré, premier sorti, comme une pile d''assiettes. En Python, une liste suffit : **append** pour empiler, **pop** pour dépiler.

Usages : annuler une action, vérifier des parenthèses, appels de fonctions.

## La file (FIFO)

Premier entré, premier sorti, comme une file d''attente. On utilise **collections.deque** : **append** pour enfiler, **popleft** pour défiler (rapide, contrairement à list.pop(0)).

## Quelle structure choisir ?

| Besoin | Structure | Coût d''accès |
|---|---|---|
| Accès par position | list | O(1) |
| Recherche par clé | dict | O(1) en moyenne |
| Test d''appartenance, unicité | set | O(1) en moyenne |
| Ajout/retrait aux deux bouts | deque | O(1) |
| Données fixes | tuple | O(1) |

Tester **x in liste** coûte O(n), alors que **x in ensemble** coûte O(1) en moyenne : pour de grandes données, la différence est énorme.', array['Pile : append / pop (LIFO).', 'File : deque.append / popleft (FIFO).', 'dict et set offrent des recherches rapides.']::text[], '[{"language":"python","title":"Parenthèses équilibrées avec une pile","code":"def equilibre(expr):\n    paires = {\")\": \"(\", \"]\": \"[\", \"}\": \"{\"}\n    pile = []\n    for c in expr:\n        if c in \"([{\":\n            pile.append(c)\n        elif c in paires:\n            if not pile or pile.pop() != paires[c]:\n                return False\n    return not pile\n\nfor e in [\"(a + b) * [c]\", \"((a)\", \"{[()]}\", \"(]\"]:\n    print(e, \"->\", equilibre(e))"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'poo-algorithmes'), (select id from public.courses where slug = 'python'), 'recherche-tri', 'Algorithmes de recherche et de tri', 'avance', 45, array['Implémenter la recherche dichotomique.', 'Implémenter le tri par insertion et le tri fusion.', 'Comparer avec sorted().']::text[], '{}'::text[], '## Recherche dichotomique

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

Programmer soi-même les tris reste indispensable pour **comprendre** et pour les examens.', array['La dichotomie exige une liste triée.', 'Insertion : O(n²) ; fusion : O(n log n).', 'sorted() accepte key et reverse.']::text[], '[{"language":"python","title":"Tri fusion","code":"def fusion(a, b):\n    resultat, i, j = [], 0, 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            resultat.append(a[i]); i += 1\n        else:\n            resultat.append(b[j]); j += 1\n    return resultat + a[i:] + b[j:]\n\ndef tri_fusion(liste):\n    if len(liste) <= 1:\n        return liste\n    m = len(liste) // 2\n    return fusion(tri_fusion(liste[:m]), tri_fusion(liste[m:]))\n\nprint(tri_fusion([38, 27, 43, 3, 9, 82, 10]))"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'python'), 'professionnel', 'Python professionnel', null, 6, 4)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'professionnel'), (select id from public.courses where slug = 'python'), 'science-donnees-ia', 'Introduction à la science des données et à l''IA', 'avance', 40, array['Découvrir l''écosystème Python pour les données.', 'Calculer des statistiques descriptives.', 'Comprendre le principe de l''apprentissage automatique.']::text[], '{}'::text[], '## L''écosystème

| Bibliothèque | Rôle |
|---|---|
| NumPy | calcul sur des tableaux de nombres |
| pandas | tableaux de données (lignes et colonnes) |
| Matplotlib | graphiques |
| scikit-learn | apprentissage automatique |

Ces bibliothèques s''installent avec pip. Les exemples ci-dessous utilisent uniquement la bibliothèque standard pour fonctionner partout.

## Statistiques descriptives

Moyenne, médiane, écart type, minimum, maximum : ces mesures résument un jeu de données.

## Qu''est-ce que l''apprentissage automatique ?

Au lieu d''écrire les règles à la main, on fournit des **exemples** et l''algorithme **apprend** une règle. Exemple : prédire la note d''examen à partir des heures de révision.

La **régression linéaire** cherche la droite y = a·x + b la plus proche des points. Les formules des moindres carrés donnent :

- a = covariance(x, y) / variance(x)
- b = moyenne(y) − a × moyenne(x)

## Une IA responsable

Un modèle n''est jamais meilleur que ses données : des données biaisées produisent des décisions biaisées. Vérifiez toujours les résultats et respectez la vie privée des personnes concernées.', array['NumPy, pandas, Matplotlib et scikit-learn forment l''écosystème données.', 'L''apprentissage automatique apprend une règle à partir d''exemples.', 'La qualité des données conditionne celle du modèle.']::text[], '[{"language":"python","title":"Régression linéaire à la main","code":"heures = [1, 2, 3, 4, 5, 6]\nnotes = [6, 8, 11, 12, 15, 17]\n\nn = len(heures)\nmx = sum(heures) / n\nmy = sum(notes) / n\ncov = sum((x - mx) * (y - my) for x, y in zip(heures, notes)) / n\nvar = sum((x - mx) ** 2 for x in heures) / n\na = cov / var\nb = my - a * mx\n\nprint(f\"Modèle : note = {a:.2f} x heures + {b:.2f}\")\nfor h in [3.5, 8]:\n    print(f\"{h} h de révision -> note prédite {a * h + b:.1f}\")"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'python') and m.slug not in ('bases', 'structures-donnees', 'fonctions-modules', 'structuration', 'poo-algorithmes', 'professionnel') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'python'), 1, 'Niveau 1 — Très débutant : premiers pas en Python', 'Écrire et exécuter ses premiers programmes : syntaxe, variables, opérateurs, conditions et boucles.', array['Écrire et exécuter un programme Python.', 'Utiliser variables, types et opérateurs.', 'Écrire des conditions et des boucles.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), null, 'python-examen-niveau-1', 'Examen du niveau 1 — Bases de Python', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'python-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'qcm', 'Que renvoie input() ?', null, '["un int","une str","un float","cela dépend"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'qcm', 'Que vaut 17 // 5 ?', null, '["3.4","3","2","4"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'qcm', 'Que vaut 2 ** 3 ?', null, '["6","8","9","5"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'qcm', 'Quel mot-clé correspond à SINON SI ?', null, '["else if","elif","elseif","sinon"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'qcm', 'Quelles valeurs produit range(1, 5) ?', null, '["1, 2, 3, 4, 5","1, 2, 3, 4","0, 1, 2, 3, 4","1, 5"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'vrai_faux', 'Python délimite les blocs par l''indentation.', null, '["Vrai","Faux"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'qcm', 'Que vaut int("4") + 1 ?', null, '["\"41\"","5","erreur","\"5\""]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-1'), 'qcm', 'Que fait break dans une boucle ?', null, '["passe au tour suivant","sort de la boucle","arrête le programme","recommence"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'python'), 2, 'Niveau 2 — Débutant : collections et fonctions', 'Listes, tuples, dictionnaires, ensembles, fonctions et modules : écrire de petits programmes structurés.', array['Manipuler les collections Python.', 'Écrire des fonctions réutilisables.', 'Utiliser la bibliothèque standard.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), null, 'python-examen-niveau-2', 'Examen du niveau 2 — Collections et fonctions', false, 70, 'publie', 'examen_niveau', null, 2)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'python-examen-niveau-2');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-2'), 'qcm', 'L = [3, 6, 9]. Que vaut L[-1] ?', null, '["3","9","6","erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-2'), 'qcm', 'Que vaut len({1, 1, 2, 3}) ?', null, '["4","3","2","1"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-2'), 'qcm', 'Comment obtenir une valeur par défaut si la clé k est absente de d ?', null, '["d[k]","d.get(k, defaut)","d.find(k)","d.value(k)"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-2'), 'qcm', 'Que renvoie une fonction sans return ?', null, '["0","None","False","une erreur"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-2'), 'vrai_faux', 'Un tuple est modifiable.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-examen-niveau-2'), 'qcm', 'Que vaut [x * x for x in range(3)] ?', null, '["[1, 4, 9]","[0, 1, 4]","[0, 2, 4]","[0, 1, 2]"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'python'), 3, 'Niveau 3 — Intermédiaire : programmes robustes et objets', 'Exceptions, fichiers, programmation orientée objet, structures de données et algorithmes : des programmes complets et fiables.', array['Gérer les erreurs et les fichiers.', 'Concevoir des classes.', 'Implémenter des structures et des algorithmes classiques.']::text[], array['Débogage avec pdb et journalisation']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'python'), 4, 'Niveau 4 — Professionnel : Python en production', 'Science des données, architecture, tests, performances et sécurité : réaliser des projets Python professionnels.', array['Concevoir l''architecture d''un programme Python de taille réelle.', 'Mesurer et améliorer les performances.', 'Écrire du code sûr et le tester automatiquement.', 'Mener un projet professionnel de bout en bout.']::text[], array['Architecture d''une application Python', 'Tests automatisés avec pytest', 'Performance et profilage', 'Sécurité des programmes Python', 'Projet professionnel']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), null, 'python-positionnement', 'Test de positionnement — Python', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'python-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Comment affiche-t-on du texte en Python ?', null, '["echo","print()","ECRIRE","console.log()"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Que vaut 7 % 3 ?', null, '["2","1","2.33","0"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Comment ajoute-t-on 5 à la fin de la liste L ?', null, '["L.add(5)","L.append(5)","L.push(5)","L + 5"]'::jsonb, 2, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Quel mot-clé définit une fonction ?', null, '["function","def","fun","lambda seulement"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Quelle exception provoque int("abc") ?', null, '["TypeError","ValueError","KeyError","NameError"]'::jsonb, 4, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Que désigne self dans une méthode ?', null, '["la classe","l''objet courant","le module","le parent"]'::jsonb, 5, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Quel outil sert à écrire des tests automatisés en Python ?', null, '["pip","pytest","venv","pdb"]'::jsonb, 6, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-positionnement'), 'qcm', 'Quelle structure offre un test d''appartenance en O(1) en moyenne ?', null, '["list","tuple","set","str"]'::jsonb, 7, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), null, 'python-evaluation-finale', 'Évaluation finale — Python', true, 70, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'python-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Que vaut 17 // 5 ?', null, '["3.4","3","2","4"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Que vaut len([1, [2, 3], 4]) ?', null, '["4","3","2","Erreur"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Quel type est renvoyé par input() ?', null, '["int","str","float","bool"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'vrai_faux', 'Les indices d''une liste Python commencent à 1.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Quelle structure garantit l''unicité de ses éléments ?', null, '["list","tuple","set","str"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Quelle exception lève {"a": 1}["b"] ?', null, '["IndexError","KeyError","ValueError","NameError"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'vrai_faux', 'Une méthode d''instance reçoit l''objet en premier paramètre, nommé self par convention.', null, '["Vrai","Faux"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'python-evaluation-finale'), 'qcm', 'Quelle est la complexité de sorted() ?', null, '["O(n)","O(n log n)","O(n²)","O(1)"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== Langage C =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('langage-c', 'c', (select id from public.course_categories where slug = 'programmation'), 'Parcours C', 'Langage C', 'Comprendre ce qui se passe au plus près de la machine.', 'Le langage C est la base de nombreux systèmes (Linux, microcontrôleurs, bases de données). Ce parcours couvre la structure d''un programme, les types, les entrées-sorties, les structures de contrôle, les fonctions, les tableaux, les chaînes, les pointeurs, l''allocation dynamique, les structures, les fichiers et les structures de données.', 'intermediaire', array['Parcours Algorithmique, modules 1 à 4.']::text[], array['Écrire, compiler et exécuter des programmes C.', 'Comprendre la mémoire : adresses, pointeurs, allocation dynamique.', 'Manipuler tableaux, chaînes, structures et fichiers.', 'Implémenter des structures de données classiques.']::text[], 32, 'publie', 5, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'langage-c'), 'bases', 'Les bases', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'bases'), (select id from public.courses where slug = 'langage-c'), 'structure-programme', 'Structure d''un programme C', 'debutant', 25, array['Connaître la structure minimale d''un programme C.', 'Comprendre la compilation.']::text[], '{}'::text[], '## Un premier programme

~~~c
#include <stdio.h>

int main(void) {
    printf("Bonjour UPL !\n");
    return 0;
}
~~~

- **#include <stdio.h>** importe la bibliothèque d''entrées-sorties.
- **main** est la fonction principale : l''exécution commence ici.
- Chaque instruction se termine par un **point-virgule**.
- Les blocs sont délimités par des **accolades**.
- **return 0** indique que le programme s''est bien terminé.

## La compilation

Le C est un langage **compilé** : le compilateur (gcc) traduit le code source en programme exécutable. Les erreurs de compilation doivent être corrigées avant toute exécution. Sur la plateforme, le bouton **Exécuter** compile puis lance le programme dans un environnement isolé.

## Commentaires

// sur une ligne, ou /* sur plusieurs lignes */.', array['Un programme C commence par main.', 'Instructions terminées par ; et blocs entre accolades.', 'Le code est compilé avant d''être exécuté.']::text[], '[{"language":"c","title":"Bonjour","code":"#include <stdio.h>\n\nint main(void) {\n    printf(\"Bonjour UPL !\\n\");\n    printf(\"Le C a été créé en %d.\\n\", 1972);\n    return 0;\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'structure-programme'), 'c-structure-quiz', 'Structure', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'c-structure-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-structure-quiz'), 'qcm', 'Par quelle fonction commence l''exécution d''un programme C ?', null, '["start","main","printf","include"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-structure-quiz'), 'vrai_faux', 'Le C est un langage interprété ligne par ligne.', null, '["Vrai","Faux"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'bases'), (select id from public.courses where slug = 'langage-c'), 'variables-types', 'Variables et types', 'debutant', 30, array['Déclarer des variables typées.', 'Connaître int, double, char et leurs tailles.']::text[], '{}'::text[], '## Déclarer avant d''utiliser

En C, chaque variable doit être **déclarée avec son type** :

~~~c
int age = 20;
double moyenne = 13.5;
char initiale = ''U'';
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
- Il n''y a pas de type booléen natif en C89 : 0 signifie faux, toute autre valeur vrai (ou bool avec stdbool.h).', array['Toute variable est déclarée avec son type.', 'La division entre entiers est entière.', 'sizeof donne la taille d''un type.']::text[], '[{"language":"c","title":"Types et tailles","code":"#include <stdio.h>\n\nint main(void) {\n    int a = 7, b = 2;\n    printf(\"7 / 2 = %d\\n\", a / b);\n    printf(\"7.0 / 2 = %.1f\\n\", (double)a / b);\n    printf(\"sizeof(int) = %zu, sizeof(double) = %zu\\n\", sizeof(int), sizeof(double));\n    return 0;\n}"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'bases'), (select id from public.courses where slug = 'langage-c'), 'entrees-sorties', 'Entrées et sorties', 'debutant', 25, array['Afficher avec printf.', 'Lire avec scanf.']::text[], '{}'::text[], '## printf et les formats

| Format | Type |
|---|---|
| %d | int |
| %lld | long long |
| %f, %.2f | double (2 décimales) |
| %c | char |
| %s | chaîne |

~~~c
printf("Moyenne : %.2f\n", moyenne);
~~~

**\n** passe à la ligne.

## scanf

~~~c
int n;
scanf("%d", &n);
~~~

Le **&** donne l''**adresse** de la variable : scanf a besoin de savoir où ranger la valeur. Pour un double, utilisez **%lf** dans scanf.

## Vérifier la lecture

scanf renvoie le nombre de valeurs lues : **if (scanf("%d", &n) != 1)** détecte une saisie invalide.', array['printf utilise des formats (%d, %f, %s…).', 'scanf a besoin de l''adresse : &variable.', '%lf pour lire un double.']::text[], '[{"language":"c","title":"Lire et afficher","code":"#include <stdio.h>\n\nint main(void) {\n    int a, b;\n    scanf(\"%d %d\", &a, &b);\n    printf(\"Somme : %d\\n\", a + b);\n    printf(\"Moyenne : %.2f\\n\", (a + b) / 2.0);\n    return 0;\n}","stdin":"12 17"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'bases'), (select id from public.courses where slug = 'langage-c'), 'conditions', 'Conditions', 'debutant', 20, array['Utiliser if, else et switch.']::text[], '{}'::text[], '## if / else

~~~c
if (note >= 10) {
    printf("Admis\n");
} else if (note >= 8) {
    printf("Rattrapage\n");
} else {
    printf("Ajourné\n");
}
~~~

La condition est **entre parenthèses**. Opérateurs : ==, !=, <, >, <=, >=, && (ET), || (OU), ! (NON).

> Piège : **if (x = 5)** affecte 5 à x (toujours vrai) au lieu de comparer. Écrivez **==**.

## switch

~~~c
switch (jour) {
    case 6:
    case 7:
        printf("Week-end\n");
        break;
    default:
        printf("Semaine\n");
}
~~~

Sans **break**, l''exécution continue dans le cas suivant.', array['if (condition) { … } else { … }.', '== compare, = affecte.', 'switch nécessite break.']::text[], '[{"language":"c","title":"Pair ou impair","code":"#include <stdio.h>\n\nint main(void) {\n    int n;\n    scanf(\"%d\", &n);\n    if (n % 2 == 0) {\n        printf(\"pair\\n\");\n    } else {\n        printf(\"impair\\n\");\n    }\n    return 0;\n}","stdin":"7"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'bases'), (select id from public.courses where slug = 'langage-c'), 'boucles', 'Boucles', 'debutant', 25, array['Utiliser for, while et do … while.']::text[], '{}'::text[], '## for

~~~c
for (int i = 1; i <= 10; i++) {
    printf("%d\n", i);
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

Comme en Python : **break** sort de la boucle, **continue** passe au tour suivant.', array['for (init; condition; pas).', 'do … while s''exécute au moins une fois.', 'long long évite le dépassement pour les grands produits.']::text[], '[{"language":"c","title":"Factorielle","code":"#include <stdio.h>\n\nint main(void) {\n    int n;\n    long long f = 1;\n    scanf(\"%d\", &n);\n    for (int i = 2; i <= n; i++) {\n        f *= i;\n    }\n    printf(\"%d! = %lld\\n\", n, f);\n    return 0;\n}","stdin":"15"}]'::jsonb, null, 'publie', 5, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'langage-c'), 'modularite', 'Fonctions et tableaux', null, 2, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'modularite'), (select id from public.courses where slug = 'langage-c'), 'fonctions', 'Fonctions', 'debutant', 30, array['Déclarer et définir des fonctions.', 'Comprendre le passage par valeur.']::text[], '{}'::text[], '## Définition

~~~c
int carre(int x) {
    return x * x;
}
~~~

Le type de retour précède le nom ; **void** indique l''absence de retour (procédure).

## Prototype

Une fonction doit être connue avant son appel. Si elle est définie après main, on écrit son **prototype** au début : **int carre(int x);**

## Passage par valeur

En C, les arguments sont **toujours copiés**. Pour qu''une fonction modifie une variable de l''appelant, on lui passe son **adresse** (voir les pointeurs).', array['type nom(paramètres) { … }.', 'void : pas de valeur de retour.', 'Les arguments sont copiés.']::text[], '[{"language":"c","title":"PGCD","code":"#include <stdio.h>\n\nint pgcd(int a, int b);\n\nint main(void) {\n    printf(\"pgcd(48, 18) = %d\\n\", pgcd(48, 18));\n    return 0;\n}\n\nint pgcd(int a, int b) {\n    while (b != 0) {\n        int r = a % b;\n        a = b;\n        b = r;\n    }\n    return a;\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'modularite'), (select id from public.courses where slug = 'langage-c'), 'tableaux', 'Tableaux', 'debutant', 30, array['Déclarer et parcourir un tableau.', 'Passer un tableau à une fonction.']::text[], '{}'::text[], '## Déclaration

~~~c
int notes[5] = {12, 15, 9, 17, 11};
~~~

Les indices vont de **0 à taille - 1**. Le C ne vérifie **pas** les débordements : écrire notes[5] corrompt la mémoire sans message d''erreur clair. Soyez rigoureux !

## Parcours

~~~c
for (int i = 0; i < 5; i++) somme += notes[i];
~~~

## Tableaux et fonctions

Un tableau passé à une fonction n''est pas copié : la fonction reçoit l''adresse du premier élément. Il faut transmettre la **taille** séparément.

~~~c
double moyenne(int t[], int n);
~~~

## Tableaux à deux dimensions

**int m[3][4];** et accès **m[i][j]**.', array['Indices de 0 à n-1.', 'Aucune vérification des bornes en C.', 'On passe la taille avec le tableau.']::text[], '[{"language":"c","title":"Maximum d''un tableau","code":"#include <stdio.h>\n\nint maximum(int t[], int n) {\n    int m = t[0];\n    for (int i = 1; i < n; i++) {\n        if (t[i] > m) m = t[i];\n    }\n    return m;\n}\n\nint main(void) {\n    int n, t[100];\n    scanf(\"%d\", &n);\n    for (int i = 0; i < n; i++) scanf(\"%d\", &t[i]);\n    printf(\"Maximum : %d\\n\", maximum(t, n));\n    return 0;\n}","stdin":"5\n4 9 2 9 1"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'modularite'), (select id from public.courses where slug = 'langage-c'), 'chaines', 'Chaînes de caractères', 'debutant', 30, array['Comprendre les chaînes terminées par ''\0''.', 'Utiliser string.h.']::text[], '{}'::text[], '## Une chaîne est un tableau de char

~~~c
char ville[20] = "Lubumbashi";
~~~

Une chaîne se termine par le caractère nul **''\0''**. Le tableau doit donc avoir une case de plus que le nombre de lettres.

## Fonctions de string.h

| Fonction | Rôle |
|---|---|
| strlen(s) | longueur |
| strcpy(d, s) | copie |
| strcat(d, s) | concaténation |
| strcmp(a, b) | comparaison (0 si égales) |

On ne compare **jamais** deux chaînes avec == : on compare leurs adresses !

## Lire une chaîne

**scanf("%19s", ville)** lit un mot (sans &, le nom du tableau est déjà une adresse). Pour une ligne entière : **fgets(ligne, sizeof ligne, stdin)**.', array['Une chaîne finit par ''\0''.', 'strlen, strcpy, strcmp sont dans string.h.', 'Ne jamais comparer des chaînes avec ==.']::text[], '[{"language":"c","title":"Compter les voyelles","code":"#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n\nint main(void) {\n    char mot[100];\n    int nb = 0;\n    scanf(\"%99s\", mot);\n    for (size_t i = 0; i < strlen(mot); i++) {\n        char c = tolower(mot[i]);\n        if (strchr(\"aeiouy\", c)) nb++;\n    }\n    printf(\"%s contient %d voyelle(s)\\n\", mot, nb);\n    return 0;\n}","stdin":"Programmation"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'langage-c'), 'memoire', 'Mémoire et données', null, 3, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'memoire'), (select id from public.courses where slug = 'langage-c'), 'pointeurs', 'Pointeurs', 'avance', 40, array['Comprendre adresses et pointeurs.', 'Modifier une variable via son adresse.']::text[], '{}'::text[], '## Adresse et pointeur

Chaque variable occupe une place en mémoire, repérée par une **adresse**. Un **pointeur** est une variable qui contient une adresse.

~~~c
int x = 10;
int *p = &x;   // p contient l''adresse de x
*p = 20;       // modifie x via le pointeur
~~~

- **&x** : adresse de x.
- **\*p** : valeur située à l''adresse contenue dans p (déréférencement).

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

Le nom d''un tableau est l''adresse de son premier élément : **t[i]** équivaut à **\*(t + i)**.

## Le pointeur NULL

**NULL** indique qu''un pointeur ne désigne rien. Déréférencer NULL ou un pointeur non initialisé provoque une **erreur de segmentation**.', array['Un pointeur contient une adresse.', '& donne l''adresse, * accède à la valeur pointée.', 'Passer une adresse permet de modifier la variable d''origine.']::text[], '[{"language":"c","title":"Échange par pointeurs","code":"#include <stdio.h>\n\nvoid echanger(int *a, int *b) {\n    int t = *a;\n    *a = *b;\n    *b = t;\n}\n\nint main(void) {\n    int x = 3, y = 8;\n    int *p = &x;\n    printf(\"x = %d, *p = %d\\n\", x, *p);\n    echanger(&x, &y);\n    printf(\"Après échange : x = %d, y = %d\\n\", x, y);\n    return 0;\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'langage-c'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'pointeurs'), 'c-pointeurs-quiz', 'Pointeurs', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'c-pointeurs-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-pointeurs-quiz'), 'qcm', 'int x = 5; int *p = &x; *p = 9; Que vaut x ?', null, '["5","9","L''adresse de x","Erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'memoire'), (select id from public.courses where slug = 'langage-c'), 'allocation-dynamique', 'Allocation dynamique', 'avance', 35, array['Réserver de la mémoire avec malloc.', 'Libérer la mémoire avec free.']::text[], '{}'::text[], '## Pourquoi ?

La taille d''un tableau classique est fixée à la compilation. Avec l''allocation dynamique, on réserve la mémoire **pendant l''exécution**, selon les besoins.

~~~c
#include <stdlib.h>
int *t = malloc(n * sizeof(int));
if (t == NULL) { /* plus de mémoire */ }
...
free(t);
~~~

## Les règles

1. Toujours vérifier que malloc n''a pas renvoyé NULL.
2. Toujours libérer avec **free** ce qui a été alloué (sinon : **fuite mémoire**).
3. Ne jamais utiliser un pointeur après free.

**calloc** alloue et initialise à zéro ; **realloc** change la taille d''un bloc.', array['malloc réserve, free libère.', 'Vérifier NULL après malloc.', 'Une mémoire non libérée est une fuite.']::text[], '[{"language":"c","title":"Tableau de taille choisie","code":"#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n;\n    scanf(\"%d\", &n);\n    int *t = malloc(n * sizeof(int));\n    if (t == NULL) return 1;\n    for (int i = 0; i < n; i++) t[i] = i * i;\n    for (int i = 0; i < n; i++) printf(\"%d \", t[i]);\n    printf(\"\\n\");\n    free(t);\n    return 0;\n}","stdin":"8"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'memoire'), (select id from public.courses where slug = 'langage-c'), 'structures', 'Structures', 'intermediaire', 30, array['Définir un type structuré avec struct.', 'Manipuler un tableau de structures.']::text[], '{}'::text[], '## Regrouper des données

~~~c
typedef struct {
    char nom[50];
    int age;
    double moyenne;
} Etudiant;

Etudiant e = {"Amani", 20, 14.5};
printf("%s : %.1f\n", e.nom, e.moyenne);
~~~

On accède aux champs avec le **point**. Avec un pointeur vers une structure, on utilise la **flèche** : **p->age** (équivalent à (\*p).age).

## Tableaux de structures

**Etudiant promo[100];** permet de gérer toute une promotion.', array['struct regroupe des champs de types différents.', 'typedef donne un nom au type.', '. pour une variable, -> pour un pointeur.']::text[], '[{"language":"c","title":"Meilleur étudiant","code":"#include <stdio.h>\n\ntypedef struct {\n    char nom[30];\n    double moyenne;\n} Etudiant;\n\nint main(void) {\n    Etudiant promo[3] = {{\"Amani\", 14.5}, {\"Grace\", 17.0}, {\"Josue\", 11.25}};\n    int meilleur = 0;\n    for (int i = 1; i < 3; i++) {\n        if (promo[i].moyenne > promo[meilleur].moyenne) meilleur = i;\n    }\n    printf(\"Major : %s (%.2f)\\n\", promo[meilleur].nom, promo[meilleur].moyenne);\n    return 0;\n}"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'memoire'), (select id from public.courses where slug = 'langage-c'), 'fichiers', 'Fichiers', 'intermediaire', 25, array['Ouvrir, lire, écrire et fermer un fichier.']::text[], '{}'::text[], '## fopen et fclose

~~~c
FILE *f = fopen("notes.txt", "w");
if (f == NULL) { perror("fopen"); return 1; }
fprintf(f, "%s %d\n", "Amani", 15);
fclose(f);
~~~

Modes : "r" (lecture), "w" (écriture), "a" (ajout).

## Lire

**fscanf(f, "%s %d", nom, &note)** renvoie le nombre de valeurs lues, ou EOF à la fin du fichier. **fgets** lit une ligne entière.

Toujours vérifier que **fopen** n''a pas renvoyé NULL et toujours fermer le fichier.', array['fopen / fclose.', 'fprintf et fscanf fonctionnent comme printf et scanf.', 'Vérifier NULL après fopen.']::text[], '[{"language":"c","title":"Écrire puis relire","code":"#include <stdio.h>\n\nint main(void) {\n    FILE *f = fopen(\"notes.txt\", \"w\");\n    if (f == NULL) return 1;\n    fprintf(f, \"Amani 15\\nGrace 17\\nJosue 9\\n\");\n    fclose(f);\n\n    f = fopen(\"notes.txt\", \"r\");\n    if (f == NULL) return 1;\n    char nom[30];\n    int note;\n    while (fscanf(f, \"%29s %d\", nom, &note) == 2) {\n        printf(\"%-6s %2d %s\\n\", nom, note, note >= 10 ? \"admis\" : \"ajourné\");\n    }\n    fclose(f);\n    return 0;\n}"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'langage-c'), 'professionnel', 'C professionnel', null, 4, 4)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'langage-c') and slug = 'professionnel'), (select id from public.courses where slug = 'langage-c'), 'structures-donnees', 'Algorithmes et structures de données', 'avance', 45, array['Implémenter une liste chaînée.', 'Implémenter une pile.']::text[], '{}'::text[], '## La liste chaînée

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

Chaque nœud alloué avec malloc doit être libéré avec free, en parcourant la liste.', array['Une liste chaînée relie des nœuds par des pointeurs.', 'Une pile se réalise par insertion/retrait en tête.', 'Libérer chaque nœud.']::text[], '[{"language":"c","title":"Liste chaînée","code":"#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Noeud {\n    int valeur;\n    struct Noeud *suivant;\n} Noeud;\n\nNoeud *empiler(Noeud *tete, int v) {\n    Noeud *n = malloc(sizeof(Noeud));\n    if (n == NULL) exit(1);\n    n->valeur = v;\n    n->suivant = tete;\n    return n;\n}\n\nint main(void) {\n    Noeud *pile = NULL;\n    for (int i = 1; i <= 5; i++) pile = empiler(pile, i * 10);\n    for (Noeud *p = pile; p != NULL; p = p->suivant) printf(\"%d \", p->valeur);\n    printf(\"\\n\");\n    while (pile != NULL) {\n        Noeud *s = pile->suivant;\n        free(pile);\n        pile = s;\n    }\n    return 0;\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'langage-c') and m.slug not in ('bases', 'modularite', 'memoire', 'professionnel') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'langage-c'), 1, 'Niveau 1 — Très débutant : écrire et compiler', 'Structure d''un programme, variables, entrées-sorties, conditions et boucles.', array['Écrire, compiler et exécuter un programme C.', 'Utiliser printf et scanf.', 'Écrire des conditions et des boucles.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'langage-c'), null, 'c-examen-niveau-1', 'Examen du niveau 1 — Bases du C', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'c-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-examen-niveau-1'), 'qcm', 'Par quelle fonction commence l''exécution ?', null, '["start","main","init","printf"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-examen-niveau-1'), 'qcm', 'Que vaut 7 / 2 entre deux int ?', null, '["3.5","3","4","erreur"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-examen-niveau-1'), 'qcm', 'Quel format lit un double avec scanf ?', null, '["%d","%f","%lf","%s"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-examen-niveau-1'), 'qcm', 'Pourquoi écrit-on &n dans scanf("%d", &n) ?', null, '["pour multiplier","pour donner l''adresse de n","par convention","pour convertir"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-examen-niveau-1'), 'vrai_faux', 'if (x = 5) compare x à 5.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-examen-niveau-1'), 'qcm', 'Que se passe-t-il sans break dans un case de switch ?', null, '["erreur","l''exécution continue dans le case suivant","le switch s''arrête","rien"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'langage-c'), 2, 'Niveau 2 — Débutant : fonctions, tableaux et chaînes', 'Découper son programme, manipuler des tableaux et des chaînes.', array['Écrire des fonctions.', 'Parcourir des tableaux.', 'Manipuler des chaînes avec string.h.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'langage-c'), 3, 'Niveau 3 — Intermédiaire : la mémoire', 'Pointeurs, allocation dynamique, structures et fichiers.', array['Maîtriser les pointeurs.', 'Allouer et libérer la mémoire.', 'Organiser des données avec struct et des fichiers.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'langage-c'), 4, 'Niveau 4 — Professionnel : C robuste', 'Structures de données, modularité en plusieurs fichiers, sécurité mémoire, tests et performance.', array['Concevoir l''architecture d''un programme C de taille réelle.', 'Mesurer et améliorer les performances.', 'Écrire du code sûr et le tester automatiquement.', 'Mener un projet professionnel de bout en bout.']::text[], array['Compilation séparée et Makefile', 'Sécurité mémoire (débordements, Valgrind)', 'Tests unitaires en C', 'Projet professionnel']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'langage-c'), null, 'c-positionnement', 'Test de positionnement — Langage C', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'c-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Quelle fonction affiche du texte formaté en C ?', null, '["print","printf","echo","cout"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Que vaut 7 / 2 entre deux int ?', null, '["3.5","3","4","erreur"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Quel caractère termine une chaîne en C ?', null, '["''\\n''","''\\0''","'' ''","EOF"]'::jsonb, 2, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Quel est l''indice du dernier élément de int t[10] ?', null, '["10","9","11","1"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Que contient un pointeur ?', null, '["une valeur entière quelconque","une adresse mémoire","un tableau","une fonction"]'::jsonb, 4, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Quelle fonction libère une zone allouée par malloc ?', null, '["delete","free","release","dispose"]'::jsonb, 5, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Quel outil détecte les fuites mémoire d''un programme C ?', null, '["Valgrind","gzip","grep","make"]'::jsonb, 6, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-positionnement'), 'qcm', 'Quel fichier décrit la compilation d''un projet avec make ?', null, '["Makefile","package.json","build.txt","main.h"]'::jsonb, 7, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'langage-c'), null, 'c-evaluation-finale', 'Évaluation finale — Langage C', true, 70, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'c-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-evaluation-finale'), 'qcm', 'Que vaut 9 / 2 en C si les deux opérandes sont des int ?', null, '["4.5","4","5","Erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-evaluation-finale'), 'qcm', 'Quel format affiche un double avec deux décimales ?', null, '["%d","%.2f","%2d","%s"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-evaluation-finale'), 'vrai_faux', 'Le C vérifie automatiquement les indices des tableaux.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'c-evaluation-finale'), 'qcm', 'Que faut-il appeler après malloc lorsque la mémoire n''est plus utile ?', null, '["delete","free","fclose","Rien"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== JavaScript =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('javascript', 'javascript', (select id from public.course_categories where slug = 'web'), 'Parcours D', 'JavaScript', 'Le langage qui fait vivre le web.', 'JavaScript anime les pages web et fait aussi tourner des serveurs. Ce parcours va des variables et fonctions jusqu''au DOM, aux événements, à l''asynchronisme, aux promesses et aux API, avec des projets web pratiques.', 'debutant', array['Parcours Algorithmique, modules 1 et 2.']::text[], array['Maîtriser la syntaxe moderne de JavaScript.', 'Manipuler tableaux et objets.', 'Interagir avec une page web via le DOM et les événements.', 'Comprendre l''asynchronisme, les promesses et les API.']::text[], 28, 'publie', 6, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'javascript'), 'langage', 'Le langage', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'langage'), (select id from public.courses where slug = 'javascript'), 'introduction', 'Introduction à JavaScript', 'debutant', 20, array['Situer JavaScript dans l''écosystème web.', 'Afficher avec console.log.']::text[], '{}'::text[], '## Le langage du web

Une page web repose sur trois technologies : **HTML** (structure), **CSS** (apparence) et **JavaScript** (comportement). JavaScript s''exécute dans tous les navigateurs, et aussi sur les serveurs grâce à **Node.js**.

## Afficher une valeur

~~~javascript
console.log("Bonjour UPL !");
console.log("2 + 3 =", 2 + 3);
~~~

Sur la plateforme, console.log écrit dans la console de sortie de l''éditeur.

## Lire une entrée

Dans les exercices, les données d''entrée sont accessibles ligne par ligne grâce à la fonction **lireLigne()** fournie par la plateforme (ou en lisant l''entrée standard avec Node.js).

## Syntaxe

Les instructions se terminent par un point-virgule (recommandé) et les blocs sont délimités par des accolades.', array['HTML structure, CSS décore, JavaScript anime.', 'console.log affiche dans la console.', 'JavaScript fonctionne aussi côté serveur avec Node.js.']::text[], '[{"language":"javascript","title":"Premier programme","code":"console.log(\"Bonjour UPL !\");\nconst annee = new Date().getFullYear();\nconsole.log(\"Nous sommes en\", annee);"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'langage'), (select id from public.courses where slug = 'javascript'), 'variables-constantes', 'Variables, constantes et types', 'debutant', 25, array['Utiliser let et const.', 'Connaître les types primitifs.']::text[], '{}'::text[], '## let et const

~~~javascript
let age = 20;          // peut changer
const PI = 3.14159;    // ne peut pas être réaffectée
~~~

Utilisez **const** par défaut, **let** si la valeur doit changer. Évitez l''ancien **var**.

## Types primitifs

| Type | Exemple |
|---|---|
| number | 42, 3.14 (un seul type pour entiers et réels) |
| string | "UPL", ''UPL'' |
| boolean | true, false |
| undefined | variable sans valeur |
| null | absence volontaire de valeur |

**typeof x** donne le type.

## Conversions

Number("42") → 42, String(10) → "10", parseInt("12px") → 12. Attention : "5" + 3 donne "53" (concaténation), alors que "5" * 3 donne 15.', array['const par défaut, let si nécessaire.', 'number regroupe entiers et réels.', 'Attention aux conversions implicites avec +.']::text[], '[{"language":"javascript","title":"Types","code":"const nom = \"Amani\";\nlet note = 14.5;\nconsole.log(typeof nom, typeof note, typeof true);\nconsole.log(\"5\" + 3, \"5\" * 3, Number(\"5\") + 3);"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'langage'), (select id from public.courses where slug = 'javascript'), 'operateurs-conditions', 'Opérateurs et conditions', 'debutant', 25, array['Utiliser === et !==.', 'Écrire if / else et switch.']::text[], '{}'::text[], '## Comparer avec ===

**===** compare valeur **et** type ; **==** convertit avant de comparer ("5" == 5 est vrai !). Utilisez toujours **===** et **!==**.

## Opérateurs

Arithmétiques : + - * / % ** ; logiques : && (ET), || (OU), ! (NON). Division entière : **Math.floor(a / b)** ou **Math.trunc(a / b)**.

## Conditions

~~~javascript
if (note >= 16) {
  console.log("Très bien");
} else if (note >= 10) {
  console.log("Passable");
} else {
  console.log("Ajourné");
}
const statut = note >= 10 ? "admis" : "ajourné";
~~~

**switch** fonctionne comme en C (avec break).', array['Toujours === et !==.', 'Math.floor pour la division entière.', 'L''opérateur ternaire condition ? a : b.']::text[], '[{"language":"javascript","title":"Comparaisons","code":"console.log(\"5\" == 5, \"5\" === 5);\nconst note = 13;\nconsole.log(note >= 10 ? \"admis\" : \"ajourné\");\nconsole.log(17 % 5, 2 ** 10, Math.floor(17 / 5));"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'langage'), (select id from public.courses where slug = 'javascript'), 'boucles', 'Boucles', 'debutant', 20, array['Utiliser for, while, for…of.']::text[], '{}'::text[], '## for, while, do … while

~~~javascript
for (let i = 1; i <= 5; i++) console.log(i);
let n = 0;
while (n < 3) n++;
~~~

## for … of

Parcourt les **valeurs** d''un tableau ou d''une chaîne :

~~~javascript
for (const lettre of "UPL") console.log(lettre);
~~~

## for … in

Parcourt les **clés** d''un objet (à éviter sur les tableaux).', array['for classique pour un compteur.', 'for…of pour les valeurs.', 'for…in pour les clés d''un objet.']::text[], '[{"language":"javascript","title":"Table de multiplication","code":"const n = 7;\nfor (let i = 1; i <= 10; i++) {\n  console.log(n + \" x \" + i + \" = \" + n * i);\n}"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'javascript'), 'fonctions-donnees', 'Fonctions et données', null, 2, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'fonctions-donnees'), (select id from public.courses where slug = 'javascript'), 'fonctions', 'Fonctions', 'debutant', 30, array['Déclarer des fonctions classiques et fléchées.', 'Utiliser des fonctions comme valeurs.']::text[], '{}'::text[], '## Déclarations

~~~javascript
function carre(x) {
  return x * x;
}
const cube = (x) => x * x * x;   // fonction fléchée
~~~

## Paramètres par défaut

~~~javascript
function saluer(nom, message = "Bonjour") {
  return message + ", " + nom;
}
~~~

## Fonctions d''ordre supérieur

En JavaScript, une fonction est une **valeur** : on peut la passer en argument. C''est la base de map, filter et des gestionnaires d''événements.', array['function ou fonction fléchée =>.', 'Les fonctions sont des valeurs.', 'Paramètres par défaut possibles.']::text[], '[{"language":"javascript","title":"Fonctions","code":"function estPremier(n) {\n  if (n < 2) return false;\n  for (let d = 2; d * d <= n; d++) {\n    if (n % d === 0) return false;\n  }\n  return true;\n}\nconst premiers = [];\nfor (let k = 2; k < 40; k++) if (estPremier(k)) premiers.push(k);\nconsole.log(premiers.join(\", \"));"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
commit;
