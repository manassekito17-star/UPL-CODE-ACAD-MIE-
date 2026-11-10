-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 11 sur 11.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-mention'), null, '12', 'Assez bien', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-mention'), null, '10', 'Admis', true, 1, 4, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-mention'), null, '21', 'Note invalide', true, 1, 5, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-mention'), null, '-1', 'Note invalide', true, 1, 6, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-mention'), 'variable note = entier(demander())
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
fin', 'L''ordre compte : si l''on testait note >= 10 en premier, une note de 18 afficherait « Admis ». Les limites (16, 14, 12, 10) appartiennent à la mention supérieure : on utilise >=.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-table', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-boucles'), 'kplus', 'Table de multiplication', 'Lisez un entier n et affichez sa table de multiplication de 1 à 10, une ligne par opération :

~~~text
n x 1 = …
…
n x 10 = …
~~~', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"3","output":"3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30"}]'::jsonb, '{}'::text[], '', array['pour i de 1 à 10 faire … fin : les deux bornes sont incluses.', 'afficher(n, "x", i, "=", n * i) sépare les valeurs par des espaces.']::text[], 10, false, 'publie', 111, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-table');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-table'), null, '3', '3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
3 x 4 = 12
3 x 5 = 15
3 x 6 = 18
3 x 7 = 21
3 x 8 = 24
3 x 9 = 27
3 x 10 = 30', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-table'), null, '0', '0 x 1 = 0
0 x 2 = 0
0 x 3 = 0
0 x 4 = 0
0 x 5 = 0
0 x 6 = 0
0 x 7 = 0
0 x 8 = 0
0 x 9 = 0
0 x 10 = 0', true, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-table'), null, '-2', '-2 x 1 = -2
-2 x 2 = -4
-2 x 3 = -6
-2 x 4 = -8
-2 x 5 = -10
-2 x 6 = -12
-2 x 7 = -14
-2 x 8 = -16
-2 x 9 = -18
-2 x 10 = -20', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-table'), 'variable n = entier(demander())
pour i de 1 à 10 faire
    afficher(n, "x", i, "=", n * i)
fin', 'La boucle pour compte de 1 à 10 inclus. afficher sépare ses valeurs par une espace, ce qui donne exactement le format demandé.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-maximum', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-fonctions-listes'), 'kplus', 'Plus grande note', 'Lisez un entier n, puis n notes entières (une par ligne). Écrivez une **fonction** `maximum(liste)` qui renvoie la plus grande valeur d''une liste, puis affichez :

~~~text
Plus grande note : <maximum>
~~~

Si n vaut 0, affichez `Aucune note`.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"3\n12\n17\n9","output":"Plus grande note : 17"}]'::jsonb, '{}'::text[], 'fonction maximum(liste)
    # À compléter
fin

variable n = entier(demander())
variable notes = []', array['Remplissez la liste avec ajouter(notes, …) dans une boucle.', 'Partez du premier élément (liste[0]) et comparez-le aux suivants.']::text[], 15, false, 'publie', 112, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-maximum');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-maximum'), null, '3
12
17
9', 'Plus grande note : 17', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-maximum'), null, '0', 'Aucune note', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-maximum'), null, '4
-5
-2
-9
-3', 'Plus grande note : -2', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-maximum'), null, '1
14', 'Plus grande note : 14', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-maximum'), 'fonction maximum(liste)
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
fin', 'Partir de 0 au lieu de liste[0] donnerait un résultat faux pour des notes toutes négatives. Le cas n = 0 est traité à part : liste[0] provoquerait une erreur d''indice sur une liste vide.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-web-page', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-web-premiere-page'), 'kplus', 'Page de présentation', '    Créez une page web (`utiliser web`) qui contient, dans cet ordre :

    1. le titre **Mon école** ;
    2. le paragraphe **Bienvenue sur notre site.** ;
    3. le sous-titre **Nos matières** ;
    4. une liste avec les lignes **Mathématiques**, **Français** et **Informatique** ;
    5. un lien **Le langage K+** vers `https://manassekito17-star.github.io/K-/`.

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
    
### Comment votre site est corrigé

Un **visiteur simulé** utilise votre page : il tape dans les champs (`saisir "Étiquette" "texte"`), clique (`cliquer "Texte"`) ou laisse passer le temps (`minuterie 3`). Le correcteur compare ensuite la **description de la page** obtenue, un élément par ligne, au résultat attendu. Les lignes d''une liste sont décalées de deux espaces.

    Ici, le visiteur ne fait rien : seule la page de départ est vérifiée.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"","output":"titre: Mon école\nparagraphe: Bienvenue sur notre site.\nsous_titre: Nos matières\nliste:\n  ligne: Mathématiques\n  ligne: Français\n  ligne: Informatique\nlien: Le langage K+ -> https://manassekito17-star.github.io/K-/"}]'::jsonb, '{}'::text[], 'utiliser web

titre("Mon école")', array['variable matieres = liste() crée la liste ; ajouter_ligne(matieres, …) ajoute une ligne.', 'lien(texte, adresse).']::text[], 10, false, 'publie', 113, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-web-page');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-page'), null, '', 'titre: Mon école
paragraphe: Bienvenue sur notre site.
sous_titre: Nos matières
liste:
  ligne: Mathématiques
  ligne: Français
  ligne: Informatique
lien: Le langage K+ -> https://manassekito17-star.github.io/K-/', false, 1, 0, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-web-page'), 'utiliser web

titre("Mon école")
paragraphe("Bienvenue sur notre site.")
sous_titre("Nos matières")
variable matieres = liste()
ajouter_ligne(matieres, "Mathématiques")
ajouter_ligne(matieres, "Français")
ajouter_ligne(matieres, "Informatique")
lien("Le langage K+", "https://manassekito17-star.github.io/K-/")', 'Les éléments apparaissent dans l''ordre où le programme les crée. Les lignes sont rangées dans la liste qu''on donne à ajouter_ligne.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-web-salutation', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-web-interactions'), 'kplus', 'Formulaire de salutation', '    Créez une page avec :

    - le titre **Salutation** ;
    - un champ d''étiquette **Votre nom** ;
    - un paragraphe vide (`paragraphe("")`) qui affichera la réponse ;
    - un bouton **Saluer**.

    Quand on clique sur **Saluer** :

    - si le champ est vide, le paragraphe affiche `Écrivez votre nom.` ;
    - sinon, il affiche `Bonjour <nom> !`.

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
    
### Comment votre site est corrigé

Un **visiteur simulé** utilise votre page : il tape dans les champs (`saisir "Étiquette" "texte"`), clique (`cliquer "Texte"`) ou laisse passer le temps (`minuterie 3`). Le correcteur compare ensuite la **description de la page** obtenue, un élément par ligne, au résultat attendu. Les lignes d''une liste sont décalées de deux espaces.', 'debutant', 'ecrire_programme', '{}'::text[], '[{"input":"saisir \"Votre nom\" \"Awa\"\ncliquer \"Saluer\"","output":"titre: Salutation\nchamp: Votre nom = \"Awa\"\nparagraphe: Bonjour Awa !\nbouton: Saluer"}]'::jsonb, '{}'::text[], 'utiliser web

titre("Salutation")
variable nom = champ("Votre nom")
variable reponse = paragraphe("")

fonction saluer()
    # À compléter
fin

bouton("Saluer", saluer)', array['valeur(nom) donne le texte tapé.', 'changer_texte(reponse, …) modifie le paragraphe.']::text[], 10, false, 'publie', 114, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-web-salutation');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-salutation'), null, 'saisir "Votre nom" "Awa"
cliquer "Saluer"', 'titre: Salutation
champ: Votre nom = "Awa"
paragraphe: Bonjour Awa !
bouton: Saluer', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-salutation'), null, 'cliquer "Saluer"', 'titre: Salutation
champ: Votre nom = ""
paragraphe: Écrivez votre nom.
bouton: Saluer', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-salutation'), null, 'saisir "Votre nom" "Awa"
cliquer "Saluer"
saisir "Votre nom" "Koffi"
cliquer "Saluer"', 'titre: Salutation
champ: Votre nom = "Koffi"
paragraphe: Bonjour Koffi !
bouton: Saluer', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-salutation'), null, '', 'titre: Salutation
champ: Votre nom = ""
paragraphe: 
bouton: Saluer', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-web-salutation'), 'utiliser web

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

bouton("Saluer", saluer)', 'On lit le champ **au moment du clic**, dans la fonction : lu au début du programme, il serait toujours vide. Le bouton reçoit le nom de la fonction, sans parenthèses.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-web-compteur', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-web-listes'), 'kplus', 'Liste de courses', '    Créez une page de liste de courses avec, dans cet ordre :

    - le titre **Courses** ;
    - un champ **Article** ;
    - un bouton **Ajouter** ;
    - un paragraphe compteur qui affiche `0 article(s)` au départ ;
    - une liste (vide au départ).

    Un clic sur **Ajouter** ajoute le texte du champ comme nouvelle ligne de la liste (sauf s''il est vide), vide le champ et met à jour le compteur. Un clic sur une **ligne** la supprime et met à jour le compteur.

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
    
### Comment votre site est corrigé

Un **visiteur simulé** utilise votre page : il tape dans les champs (`saisir "Étiquette" "texte"`), clique (`cliquer "Texte"`) ou laisse passer le temps (`minuterie 3`). Le correcteur compare ensuite la **description de la page** obtenue, un élément par ligne, au résultat attendu. Les lignes d''une liste sont décalées de deux espaces.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"saisir \"Article\" \"Riz\"\ncliquer \"Ajouter\"\nsaisir \"Article\" \"Huile\"\ncliquer \"Ajouter\"\ncliquer \"Riz\"","output":"titre: Courses\nchamp: Article = \"\"\nbouton: Ajouter\nparagraphe: 1 article(s)\nliste:\n  ligne: Huile"}]'::jsonb, '{}'::text[], '', array['Gardez le nombre d''articles dans une variable du programme : elle reste en mémoire entre deux clics.', 'ajouter_ligne renvoie la ligne : quand_clic(ligne, retirer) ; la fonction retirer(ligne) reçoit la ligne cliquée.']::text[], 15, false, 'publie', 115, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-web-compteur');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-compteur'), null, 'saisir "Article" "Riz"
cliquer "Ajouter"
saisir "Article" "Huile"
cliquer "Ajouter"
cliquer "Riz"', 'titre: Courses
champ: Article = ""
bouton: Ajouter
paragraphe: 1 article(s)
liste:
  ligne: Huile', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-compteur'), null, 'cliquer "Ajouter"', 'titre: Courses
champ: Article = ""
bouton: Ajouter
paragraphe: 0 article(s)
liste:', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-compteur'), null, 'saisir "Article" "Sel"
cliquer "Ajouter"
saisir "Article" "Sucre"
cliquer "Ajouter"
saisir "Article" "Pain"
cliquer "Ajouter"', 'titre: Courses
champ: Article = ""
bouton: Ajouter
paragraphe: 3 article(s)
liste:
  ligne: Sel
  ligne: Sucre
  ligne: Pain', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-compteur'), null, 'saisir "Article" "Sel"
cliquer "Ajouter"
cliquer "Sel"', 'titre: Courses
champ: Article = ""
bouton: Ajouter
paragraphe: 0 article(s)
liste:', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-web-compteur'), 'utiliser web

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
variable courses = liste()', 'Le compteur est une variable du programme, modifiée à chaque ajout et à chaque suppression. Les fonctions peuvent utiliser compteur et courses, créés plus bas : elles ne sont appelées qu''au moment des clics, quand la page est déjà construite.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('kplus-web-minuteur', (select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-web-minuteries'), 'kplus', 'Minuteur', '    Créez un minuteur de 3 secondes :

    - le titre **Minuteur** ;
    - un paragraphe qui affiche `3` au départ ;
    - un bouton **Démarrer**.

    Un clic sur **Démarrer** lance une minuterie d''une seconde (`toutes_les(1000, …)`) qui diminue le nombre de 1 à chaque tour. Quand il atteint 0, la minuterie s''arrête et le paragraphe affiche `Terminé !`. Cliquer plusieurs fois sur Démarrer ne doit pas lancer plusieurs minuteries.

    Exemple de visite (`minuterie 2` = deux tours de minuterie) :

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
    
### Comment votre site est corrigé

Un **visiteur simulé** utilise votre page : il tape dans les champs (`saisir "Étiquette" "texte"`), clique (`cliquer "Texte"`) ou laisse passer le temps (`minuterie 3`). Le correcteur compare ensuite la **description de la page** obtenue, un élément par ligne, au résultat attendu. Les lignes d''une liste sont décalées de deux espaces.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[{"input":"cliquer \"Démarrer\"\nminuterie 2","output":"titre: Minuteur\nparagraphe: 1\nbouton: Démarrer"}]'::jsonb, '{}'::text[], '', array['Gardez la minuterie dans une variable initialisée à nul, et ne la lancez que si elle vaut nul.', 'arreter_minuterie(m) arrête la minuterie.']::text[], 15, false, 'publie', 116, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'kplus-web-minuteur');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-minuteur'), null, 'cliquer "Démarrer"
minuterie 2', 'titre: Minuteur
paragraphe: 1
bouton: Démarrer', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-minuteur'), null, 'cliquer "Démarrer"
minuterie 3', 'titre: Minuteur
paragraphe: Terminé !
bouton: Démarrer', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-minuteur'), null, 'minuterie 2', 'titre: Minuteur
paragraphe: 3
bouton: Démarrer', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-minuteur'), null, 'cliquer "Démarrer"
cliquer "Démarrer"
minuterie 1', 'titre: Minuteur
paragraphe: 2
bouton: Démarrer', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'kplus-web-minuteur'), null, 'cliquer "Démarrer"
minuterie 10', 'titre: Minuteur
paragraphe: Terminé !
bouton: Démarrer', true, 1, 4, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'kplus-web-minuteur'), 'utiliser web

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

bouton("Démarrer", demarrer)', 'La variable minuterie vaut nul tant que rien n''est lancé : le test si minuterie == nul empêche un second clic de lancer une deuxième minuterie, qui ferait descendre le nombre deux fois plus vite. arreter_minuterie évite de passer sous zéro.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
commit;
