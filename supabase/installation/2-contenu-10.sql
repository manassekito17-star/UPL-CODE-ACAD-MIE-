-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 10 sur 13.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-caisse', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'resolution-problemes'), 'pseudocode', 'Mini-projet : caisse de la cafétéria', 'La cafétéria de l''université veut un programme de caisse.

**Entrées** : une suite de lignes, chacune contenant un prix unitaire (réel) puis, sur la ligne suivante, une quantité (entier). La saisie se termine par un prix égal à **0**.

**Sorties** :

~~~text
Articles : <quantité totale>
Total : <montant total>
Remise : <montant de la remise>
A payer : <montant final>
~~~

Une remise de **10 %** est accordée si le total dépasse **strictement 50**.', 'avance', 'mini_projet', '{}'::text[], '[{"input":"2.5\n4\n30\n1\n0","output":"Articles : 5\nTotal : 40\nRemise : 0\nA payer : 40"}]'::jsonb, '{}'::text[], '', array['Utilisez une valeur sentinelle (prix = 0) avec TANT QUE.', 'Deux accumulateurs : la quantité totale et le montant total.', 'Calculez la remise après la boucle, avec un SI.']::text[], 30, true, 'publie', 21, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-caisse');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-caisse'), null, '2.5
4
30
1
0', 'Articles : 5
Total : 40
Remise : 0
A payer : 40', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-caisse'), null, '20
3
0', 'Articles : 3
Total : 60
Remise : 6
A payer : 54', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-caisse'), null, '0', 'Articles : 0
Total : 0
Remise : 0
A payer : 0', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-caisse'), null, '50
1
0', 'Articles : 1
Total : 50
Remise : 0
A payer : 50', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-caisse'), 'ALGORITHME Caisse
VARIABLES
  prix, total, remise : REEL
  qte, articles : ENTIER
DEBUT
  total ← 0
  articles ← 0
  LIRE(prix)
  TANT QUE prix <> 0 FAIRE
    LIRE(qte)
    total ← total + prix * qte
    articles ← articles + qte
    LIRE(prix)
  FINTANTQUE
  SI total > 50 ALORS
    remise ← total * 0.1
  SINON
    remise ← 0
  FINSI
  ECRIRE("Articles : ", articles)
  ECRIRE("Total : ", total)
  ECRIRE("Remise : ", remise)
  ECRIRE("A payer : ", total - remise)
FIN', 'Le programme combine une **boucle à sentinelle**, deux **accumulateurs** et une **condition** finale. Le cas limite « total = 50 » ne donne pas de remise car la condition est « strictement supérieur ».')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-trois-lignes', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'introduction-algorithmique'), 'pseudocode', 'Présentation en trois lignes', 'Lisez un prénom puis une filière et affichez exactement ces trois lignes :

~~~text
Bienvenue <prénom> !
Filière : <filière>
Bon courage pour cette année.
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"Amani\nInformatique","output":"Bienvenue Amani !\nFilière : Informatique\nBon courage pour cette année."}]'::jsonb, '{}'::text[], '', array['Deux LIRE, puis trois ECRIRE, dans cet ordre.', 'Attention à l''espace avant le point d''exclamation : ECRIRE("Bienvenue ", prenom, " !").']::text[], 5, false, 'publie', 22, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-trois-lignes');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-trois-lignes'), null, 'Amani
Informatique', 'Bienvenue Amani !
Filière : Informatique
Bon courage pour cette année.', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-trois-lignes'), null, 'Grâce
Intelligence Artificielle', 'Bienvenue Grâce !
Filière : Intelligence Artificielle
Bon courage pour cette année.', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-trois-lignes'), 'ALGORITHME Presentation
VARIABLES
  prenom, filiere : CHAINE
DEBUT
  LIRE(prenom)
  LIRE(filiere)
  ECRIRE("Bienvenue ", prenom, " !")
  ECRIRE("Filière : ", filiere)
  ECRIRE("Bon courage pour cette année.")
FIN', 'Exécution séquentielle : les deux lectures d''abord, puis les trois affichages dans l''ordre demandé. Une filière peut contenir des espaces : une variable CHAINE reçoit toute la ligne.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-carre-perimetre', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'introduction-algorithmique'), 'pseudocode', 'Périmètre et aire d''un carré', 'Lisez la longueur du côté d''un carré (un réel) et affichez :

~~~text
Périmètre : <4 × côté>
Aire : <côté × côté>
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"3","output":"Périmètre : 12\nAire : 9"}]'::jsonb, '{}'::text[], '', array['Entrée : le côté. Sorties : le périmètre et l''aire.', 'Le côté peut être décimal : choisissez le type REEL.']::text[], 5, false, 'publie', 23, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-carre-perimetre');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-carre-perimetre'), null, '3', 'Périmètre : 12
Aire : 9', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-carre-perimetre'), null, '2.5', 'Périmètre : 10
Aire : 6.25', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-carre-perimetre'), null, '0', 'Périmètre : 0
Aire : 0', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-carre-perimetre'), 'ALGORITHME Carre
VARIABLES
  cote : REEL
DEBUT
  LIRE(cote)
  ECRIRE("Périmètre : ", 4 * cote)
  ECRIRE("Aire : ", cote * cote)
FIN', 'Les expressions sont calculées directement dans ECRIRE. Le cas limite côté = 0 est valide et donne 0 pour les deux résultats.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-intervalle', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'logique-raisonnement'), 'pseudocode', 'Appartenance à un intervalle', 'Lisez un nombre x (réel). Affichez **VRAI** si x appartient à l''intervalle [10 ; 20] (bornes incluses), **FAUX** sinon. N''utilisez pas de structure SI : affichez directement la valeur d''une condition.', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"15","output":"VRAI"}]'::jsonb, array['Ne pas utiliser SI.']::text[], '', array['Une condition a une valeur VRAI ou FAUX : on peut l''afficher avec ECRIRE.', 'Deux comparaisons reliées par ET : (x >= 10) ET (x <= 20).']::text[], 10, false, 'publie', 24, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-intervalle');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-intervalle'), null, '15', 'VRAI', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-intervalle'), null, '25', 'FAUX', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-intervalle'), null, '10', 'VRAI', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-intervalle'), null, '20', 'VRAI', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-intervalle'), null, '9.99', 'FAUX', true, 1, 4, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-intervalle'), 'ALGORITHME Intervalle
VARIABLES
  x : REEL
DEBUT
  LIRE(x)
  ECRIRE((x >= 10) ET (x <= 20))
FIN', 'Les bornes sont incluses : on utilise >= et <=. Les tests cachés vérifient précisément les cas limites 10 et 20.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-table-verite', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'logique-raisonnement'), 'pseudocode', 'Calculateur de connecteurs logiques', 'Lisez deux booléens a et b (saisis VRAI ou FAUX) et affichez :

~~~text
a ET b : <valeur>
a OU b : <valeur>
NON a : <valeur>
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"VRAI\nFAUX","output":"a ET b : FAUX\na OU b : VRAI\nNON a : FAUX"}]'::jsonb, '{}'::text[], '', array['Déclarez a et b de type BOOLEEN : LIRE convertit VRAI/FAUX.', 'ECRIRE("a ET b : ", a ET b)']::text[], 10, false, 'publie', 25, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-table-verite');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-table-verite'), null, 'VRAI
FAUX', 'a ET b : FAUX
a OU b : VRAI
NON a : FAUX', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-table-verite'), null, 'VRAI
VRAI', 'a ET b : VRAI
a OU b : VRAI
NON a : FAUX', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-table-verite'), null, 'FAUX
FAUX', 'a ET b : FAUX
a OU b : FAUX
NON a : VRAI', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-table-verite'), null, 'FAUX
VRAI', 'a ET b : FAUX
a OU b : VRAI
NON a : VRAI', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-table-verite'), 'ALGORITHME Connecteurs
VARIABLES
  a, b : BOOLEEN
DEBUT
  LIRE(a)
  LIRE(b)
  ECRIRE("a ET b : ", a ET b)
  ECRIRE("a OU b : ", a OU b)
  ECRIRE("NON a : ", NON a)
FIN', 'Les quatre tests correspondent aux quatre lignes de la table de vérité : c''est un jeu d''essai **exhaustif**.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-de-morgan', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'logique-raisonnement'), 'pseudocode', 'Vérifier une loi de De Morgan', 'Lisez deux booléens a et b. Affichez la valeur de NON (a ET b), puis celle de (NON a) OU (NON b), puis si les deux sont égales :

~~~text
NON (a ET b) : <valeur>
NON a OU NON b : <valeur>
Égales : <valeur>
~~~', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"VRAI\nFAUX","output":"NON (a ET b) : VRAI\nNON a OU NON b : VRAI\nÉgales : VRAI"}]'::jsonb, '{}'::text[], '', array['Deux booléens se comparent avec =.', 'Mettez des parenthèses : (NON (a ET b)) = ((NON a) OU (NON b)).']::text[], 10, false, 'publie', 26, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-de-morgan');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-de-morgan'), null, 'VRAI
FAUX', 'NON (a ET b) : VRAI
NON a OU NON b : VRAI
Égales : VRAI', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-de-morgan'), null, 'VRAI
VRAI', 'NON (a ET b) : FAUX
NON a OU NON b : FAUX
Égales : VRAI', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-de-morgan'), null, 'FAUX
FAUX', 'NON (a ET b) : VRAI
NON a OU NON b : VRAI
Égales : VRAI', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-de-morgan'), 'ALGORITHME VerifDeMorgan
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
FIN', 'Pour toutes les entrées, les deux expressions sont égales : c''est exactement ce qu''affirme la loi de De Morgan. Ranger chaque expression dans une variable rend l''algorithme plus lisible.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-prix-ttc', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'analyse-problemes'), 'pseudocode', 'Prix toutes taxes comprises', 'Un magasin applique une TVA de **16 %**. Lisez le prix unitaire hors taxes (réel) puis la quantité (entier) et affichez :

~~~text
Total HT : <prix × quantité>
TVA : <16 % du total HT>
Total TTC : <total HT + TVA>
~~~', 'debutant', 'probleme', '{}'::text[], '[{"input":"1000\n3","output":"Total HT : 3000\nTVA : 480\nTotal TTC : 3480"}]'::jsonb, '{}'::text[], '', array['Commencez par écrire les données, les résultats et un jeu d''essai.', 'Déclarez TAUX_TVA = 0.16 dans la section CONSTANTES.', 'Calculez d''abord le total HT, puis la TVA à partir de ce total.']::text[], 10, false, 'publie', 27, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-prix-ttc');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-prix-ttc'), null, '1000
3', 'Total HT : 3000
TVA : 480
Total TTC : 3480', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-prix-ttc'), null, '2500
0', 'Total HT : 0
TVA : 0
Total TTC : 0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-prix-ttc'), null, '125
4', 'Total HT : 500
TVA : 80
Total TTC : 580', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-prix-ttc'), 'ALGORITHME PrixTTC
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
FIN', 'Décomposition : total HT, puis TVA, puis total TTC. La constante TAUX_TVA permet de changer le taux en une seule ligne. Le cas quantité = 0 est un cas limite valide.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-rendu-monnaie', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'analyse-problemes'), 'pseudocode', 'Rendu de monnaie', 'Lisez un montant m en francs congolais (entier, multiple de 100). Décomposez-le avec le moins de coupures possible en billets de 5 000, 1 000 et 500 FC et en pièces de 100 FC. Affichez :

~~~text
5000 FC : <nombre>
1000 FC : <nombre>
500 FC : <nombre>
100 FC : <nombre>
~~~', 'intermediaire', 'probleme', '{}'::text[], '[{"input":"7600","output":"5000 FC : 1\n1000 FC : 2\n500 FC : 1\n100 FC : 1"}]'::jsonb, '{}'::text[], '', array['Le nombre de billets de 5 000 est le quotient m DIV 5000.', 'Il reste alors m MOD 5000 à rendre : recommencez avec 1 000.', 'Utilisez une variable reste mise à jour après chaque coupure.']::text[], 10, true, 'publie', 28, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-rendu-monnaie');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-rendu-monnaie'), null, '7600', '5000 FC : 1
1000 FC : 2
500 FC : 1
100 FC : 1', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-rendu-monnaie'), null, '0', '5000 FC : 0
1000 FC : 0
500 FC : 0
100 FC : 0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-rendu-monnaie'), null, '5000', '5000 FC : 1
1000 FC : 0
500 FC : 0
100 FC : 0', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-rendu-monnaie'), null, '400', '5000 FC : 0
1000 FC : 0
500 FC : 0
100 FC : 4', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-rendu-monnaie'), null, '23900', '5000 FC : 4
1000 FC : 3
500 FC : 1
100 FC : 4', true, 1, 4, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-rendu-monnaie'), 'ALGORITHME Monnaie
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
FIN', 'À chaque étape, le quotient donne le nombre de coupures et le reste ce qu''il reste à rendre. Le jeu d''essai du cours (0, 5 000, 400) couvre les cas limites.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-semaines-jours', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'analyse-problemes'), 'pseudocode', 'Semaines, jours et heures', 'Lisez une durée en heures (entier ≥ 0) et affichez-la en semaines, jours et heures :

~~~text
<s> semaine(s) <j> jour(s) <h> heure(s)
~~~', 'intermediaire', 'probleme', '{}'::text[], '[{"input":"200","output":"1 semaine(s) 1 jour(s) 8 heure(s)"}]'::jsonb, '{}'::text[], '', array['Une semaine = 168 heures, un jour = 24 heures.', 'Semaines : total DIV 168 ; il reste total MOD 168 heures.']::text[], 10, false, 'publie', 29, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-semaines-jours');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-semaines-jours'), null, '200', '1 semaine(s) 1 jour(s) 8 heure(s)', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-semaines-jours'), null, '23', '0 semaine(s) 0 jour(s) 23 heure(s)', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-semaines-jours'), null, '168', '1 semaine(s) 0 jour(s) 0 heure(s)', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-semaines-jours'), null, '0', '0 semaine(s) 0 jour(s) 0 heure(s)', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-semaines-jours'), 'ALGORITHME DureeHeures
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
FIN', 'Les heures restantes se calculent directement par total MOD 24, car 168 est un multiple de 24.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-permutation-circulaire', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'variables-constantes'), 'pseudocode', 'Permutation circulaire', 'Lisez trois entiers a, b et c. Faites tourner leurs valeurs : a reçoit l''ancienne valeur de b, b celle de c, c celle de a. Affichez ensuite a, b et c séparés par un espace.', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"1\n2\n3","output":"2 3 1"}]'::jsonb, array['Utilisez exactement une variable auxiliaire.', 'Les valeurs doivent réellement être échangées dans les variables (pas seulement affichées dans un autre ordre).']::text[], '', array['Sauvegardez d''abord la valeur qui va être écrasée en premier.', 'temp ← a, puis a ← b, b ← c, c ← temp.']::text[], 10, false, 'publie', 30, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-permutation-circulaire');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-permutation-circulaire'), null, '1
2
3', '2 3 1', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-permutation-circulaire'), null, '7
7
0', '7 0 7', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-permutation-circulaire'), null, '-5
10
20', '10 20 -5', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-permutation-circulaire'), 'ALGORITHME Rotation
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
FIN', 'Chaque affectation écrase une valeur : on sauvegarde **a** avant tout. Faites la trace : avec 1, 2, 3, temp = 1, puis a = 2, b = 3, c = 1.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-solde-compte', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'variables-constantes'), 'pseudocode', 'Suivi d''un compte', 'Lisez le solde initial d''un compte, puis le montant d''un dépôt, puis le montant d''un retrait (des réels). Mettez à jour **une seule variable solde** après chaque opération et affichez :

~~~text
Après dépôt : <solde>
Après retrait : <solde>
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"10000\n2500\n4000","output":"Après dépôt : 12500\nAprès retrait : 8500"}]'::jsonb, '{}'::text[], '', array['solde ← solde + depot', 'Affichez le solde juste après chaque mise à jour.']::text[], 10, false, 'publie', 31, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-solde-compte');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-solde-compte'), null, '10000
2500
4000', 'Après dépôt : 12500
Après retrait : 8500', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-solde-compte'), null, '0
0
0', 'Après dépôt : 0
Après retrait : 0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-solde-compte'), null, '150.5
49.5
200', 'Après dépôt : 200
Après retrait : 0', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-solde-compte'), 'ALGORITHME Compte
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
FIN', 'La même variable évolue : sa valeur dépend du moment où on l''affiche. C''est ce que montre un tableau de suivi.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-celsius-fahrenheit', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'types-donnees'), 'pseudocode', 'Conversion Celsius → Fahrenheit', 'Lisez une température en degrés Celsius (réel) et affichez-la en degrés Fahrenheit, sachant que F = C × 9 / 5 + 32 :

~~~text
<F> °F
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"100","output":"212 °F"}]'::jsonb, '{}'::text[], '', array['La division produit un réel : déclarez des variables REEL.', 'ECRIRE(f, " °F")']::text[], 10, false, 'publie', 32, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-celsius-fahrenheit');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-celsius-fahrenheit'), null, '100', '212 °F', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-celsius-fahrenheit'), null, '0', '32 °F', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-celsius-fahrenheit'), null, '-40', '-40 °F', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-celsius-fahrenheit'), null, '36.6', '97.88 °F', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-celsius-fahrenheit'), 'ALGORITHME Fahrenheit
VARIABLES
  c, f : REEL
DEBUT
  LIRE(c)
  f ← c * 9 / 5 + 32
  ECRIRE(f, " °F")
FIN', 'Avec des variables ENTIER, 36.6 ne pourrait pas être lu et c × 9 / 5 ne pourrait pas être rangé : le type REEL s''impose. −40 est la température où les deux échelles coïncident.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-initiales', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'types-donnees'), 'pseudocode', 'Initiales', 'Lisez un prénom puis un nom et affichez les initiales en majuscules, chacune suivie d''un point (exemple : « Grâce » et « mutombo » → **G.M.**).', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"Grâce\nmutombo","output":"G.M."}]'::jsonb, '{}'::text[], '', array['Le premier caractère d''une chaîne s s''obtient par s[1].', 'MAJUSCULE transforme un texte en majuscules ; + concatène des chaînes.']::text[], 10, false, 'publie', 33, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-initiales');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-initiales'), null, 'Grâce
mutombo', 'G.M.', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-initiales'), null, 'jean
Kabila', 'J.K.', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-initiales'), null, 'élise
ngoy', 'É.N.', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-initiales'), 'ALGORITHME Initiales
VARIABLES
  prenom, nom : CHAINE
DEBUT
  LIRE(prenom)
  LIRE(nom)
  ECRIRE(MAJUSCULE(prenom[1] + "." + nom[1] + "."))
FIN', 'prenom[1] est un caractère, que l''on concatène avec "." pour former une chaîne, puis MAJUSCULE s''applique à l''ensemble.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-majeur', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'types-donnees'), 'pseudocode', 'Majeur ou mineur ?', 'Lisez l''année de naissance d''une personne. Calculez son âge en 2026 et rangez dans une variable **BOOLEEN** le fait qu''elle soit majeure (18 ans ou plus). Affichez :

~~~text
Âge : <âge>
Majeur : <VRAI ou FAUX>
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"2005","output":"Âge : 21\nMajeur : VRAI"}]'::jsonb, '{}'::text[], '', array['majeur ← age >= 18', 'Pas besoin de SI : une comparaison produit déjà un booléen.']::text[], 10, false, 'publie', 34, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-majeur');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-majeur'), null, '2005', 'Âge : 21
Majeur : VRAI', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-majeur'), null, '2010', 'Âge : 16
Majeur : FAUX', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-majeur'), null, '2008', 'Âge : 18
Majeur : VRAI', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-majeur'), 'ALGORITHME Majorite
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
FIN', 'Le cas limite 18 ans doit donner VRAI : la comparaison est **>=**.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-chiffres', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'operateurs'), 'pseudocode', 'Somme et inversion des chiffres', 'Lisez un entier n compris entre 100 et 999. Affichez la somme de ses chiffres, puis le nombre obtenu en inversant ses chiffres :

~~~text
Somme : <somme>
Inversé : <nombre inversé>
~~~', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"375","output":"Somme : 15\nInversé : 573"}]'::jsonb, '{}'::text[], '', array['Unités : n MOD 10 ; dizaines : (n DIV 10) MOD 10 ; centaines : n DIV 100.', 'Nombre inversé : u × 100 + d × 10 + c.']::text[], 10, true, 'publie', 35, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-chiffres');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-chiffres'), null, '375', 'Somme : 15
Inversé : 573', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-chiffres'), null, '100', 'Somme : 1
Inversé : 1', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-chiffres'), null, '999', 'Somme : 27
Inversé : 999', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-chiffres'), null, '120', 'Somme : 3
Inversé : 21', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-chiffres'), 'ALGORITHME Chiffres
VARIABLES
  n, c, d, u : ENTIER
DEBUT
  LIRE(n)
  u ← n MOD 10
  d ← (n DIV 10) MOD 10
  c ← n DIV 100
  ECRIRE("Somme : ", c + d + u)
  ECRIRE("Inversé : ", u * 100 + d * 10 + c)
FIN', 'DIV et MOD par 10 isolent les chiffres. Pour 100, l''inversé est 001, c''est-à-dire le nombre 1 : un entier n''a pas de zéros en tête.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-divisibilite', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'operateurs'), 'pseudocode', 'Tests de divisibilité', 'Lisez un entier n et affichez, sans structure SI :

~~~text
Pair : <VRAI/FAUX>
Multiple de 3 : <VRAI/FAUX>
Multiple de 6 : <VRAI/FAUX>
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"12","output":"Pair : VRAI\nMultiple de 3 : VRAI\nMultiple de 6 : VRAI"}]'::jsonb, array['Ne pas utiliser SI.']::text[], '', array['n est un multiple de k si n MOD k = 0.', 'Un multiple de 6 est un nombre pair ET multiple de 3 (ou simplement n MOD 6 = 0).']::text[], 10, false, 'publie', 36, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-divisibilite');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-divisibilite'), null, '12', 'Pair : VRAI
Multiple de 3 : VRAI
Multiple de 6 : VRAI', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-divisibilite'), null, '9', 'Pair : FAUX
Multiple de 3 : VRAI
Multiple de 6 : FAUX', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-divisibilite'), null, '0', 'Pair : VRAI
Multiple de 3 : VRAI
Multiple de 6 : VRAI', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-divisibilite'), null, '-4', 'Pair : VRAI
Multiple de 3 : FAUX
Multiple de 6 : FAUX', true, 1, 3, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-divisibilite'), 'ALGORITHME Divisibilite
VARIABLES
  n : ENTIER
DEBUT
  LIRE(n)
  ECRIRE("Pair : ", n MOD 2 = 0)
  ECRIRE("Multiple de 3 : ", n MOD 3 = 0)
  ECRIRE("Multiple de 6 : ", (n MOD 2 = 0) ET (n MOD 3 = 0))
FIN', '0 est un multiple de tous les entiers (0 MOD k = 0). Pour −4, le reste de la division par 2 est 0 : on teste « = 0 », ce qui fonctionne quel que soit le signe.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-facture', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'entrees-sorties'), 'pseudocode', 'Facture formatée', 'Lisez le nom d''un article, son prix unitaire (réel) et la quantité (entier). Affichez exactement :

~~~text
===== FACTURE =====
Article : <nom>
Quantité : <quantité> x <prix> FC
Total : <total> FC
===================
~~~', 'debutant', 'ecrire_algorithme', '{}'::text[], '[{"input":"Cahier\n1500\n4","output":"===== FACTURE =====\nArticle : Cahier\nQuantité : 4 x 1500 FC\nTotal : 6000 FC\n==================="}]'::jsonb, '{}'::text[], '', array['Cinq ECRIRE ; respectez les espaces autour de « : » et de « x ».', 'Le total est prix × quantité.']::text[], 10, false, 'publie', 37, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-facture');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-facture'), null, 'Cahier
1500
4', '===== FACTURE =====
Article : Cahier
Quantité : 4 x 1500 FC
Total : 6000 FC
===================', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-facture'), null, 'Stylo bleu
250.5
2', '===== FACTURE =====
Article : Stylo bleu
Quantité : 2 x 250.5 FC
Total : 501 FC
===================', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-facture'), 'ALGORITHME Facture
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
FIN', 'L''essentiel est le **format** : la sortie est comparée ligne par ligne. Le nom de l''article peut contenir des espaces.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-fiche-etudiant', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'entrees-sorties'), 'pseudocode', 'Fiche étudiant', 'Lisez un nom, un prénom, une année de naissance et une moyenne (réel). Affichez :

~~~text
NOM : <nom en majuscules>
Prénom : <prénom>
Âge en 2026 : <âge>
Moyenne : <moyenne>/20
Admis : <VRAI si moyenne >= 10, sinon FAUX>
~~~', 'intermediaire', 'ecrire_algorithme', '{}'::text[], '[{"input":"Kalenga\nRuth\n2006\n13.5","output":"NOM : KALENGA\nPrénom : Ruth\nÂge en 2026 : 20\nMoyenne : 13.5/20\nAdmis : VRAI"}]'::jsonb, '{}'::text[], '', array['MAJUSCULE(nom) met le nom en majuscules.', '« /20 » est un texte collé juste après la moyenne.']::text[], 10, false, 'publie', 38, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-fiche-etudiant');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-fiche-etudiant'), null, 'Kalenga
Ruth
2006
13.5', 'NOM : KALENGA
Prénom : Ruth
Âge en 2026 : 20
Moyenne : 13.5/20
Admis : VRAI', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-fiche-etudiant'), null, 'ilunga
Josué
2007
9.99', 'NOM : ILUNGA
Prénom : Josué
Âge en 2026 : 19
Moyenne : 9.99/20
Admis : FAUX', true, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-fiche-etudiant'), null, 'Banza
Marie
2004
10', 'NOM : BANZA
Prénom : Marie
Âge en 2026 : 22
Moyenne : 10/20
Admis : VRAI', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-fiche-etudiant'), 'ALGORITHME Fiche
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
FIN', 'Quatre lectures typées, cinq affichages. Le test caché avec la moyenne 10 vérifie la borne : 10 est admis.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-carte', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'introduction-algorithmique'), 'pseudocode', 'Projet : carte de visite numérique', 'Lisez un prénom, une filière puis une année d''études (texte, par exemple « Bac 1 ») et affichez exactement :

~~~text
+----------------------+
Nom : <prénom>
Filière : <filière>
Année : <année>
+----------------------+
~~~', 'debutant', 'mini_projet', '{}'::text[], '[{"input":"Amani\nInformatique\nBac 1","output":"+----------------------+\nNom : Amani\nFilière : Informatique\nAnnée : Bac 1\n+----------------------+"}]'::jsonb, '{}'::text[], '', array['Trois LIRE puis cinq ECRIRE.', 'Les deux bordures sont identiques : copiez-les exactement.']::text[], 15, false, 'publie', 39, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-carte');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-carte'), null, 'Amani
Informatique
Bac 1', '+----------------------+
Nom : Amani
Filière : Informatique
Année : Bac 1
+----------------------+', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-carte'), null, 'Ruth
Intelligence Artificielle
Bac 2', '+----------------------+
Nom : Ruth
Filière : Intelligence Artificielle
Année : Bac 2
+----------------------+', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-carte'), 'ALGORITHME Carte
VARIABLES
  prenom, filiere, annee : CHAINE
DEBUT
  LIRE(prenom)
  LIRE(filiere)
  LIRE(annee)
  ECRIRE("+----------------------+")
  ECRIRE("Nom : ", prenom)
  ECRIRE("Filière : ", filiere)
  ECRIRE("Année : ", annee)
  ECRIRE("+----------------------+")
FIN', 'L''année est lue comme un texte car elle contient « Bac ». L''algorithme est purement séquentiel.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-bibliotheque', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'logique-raisonnement'), 'pseudocode', 'Projet : contrôle d''accès à la bibliothèque', 'Lisez l''âge (entier), puis si la carte est valide (booléen), puis si la cotisation est payée (booléen). L''accès est autorisé si **la carte est valide ET (la cotisation est payée OU l''âge est inférieur à 18)**. L''accès est gratuit si l''âge est inférieur à 18. Affichez, sans utiliser SI :

~~~text
Accès : <VRAI/FAUX>
Gratuit : <VRAI/FAUX>
~~~', 'intermediaire', 'mini_projet', '{}'::text[], '[{"input":"20\nVRAI\nFAUX","output":"Accès : FAUX\nGratuit : FAUX"}]'::jsonb, array['Ne pas utiliser SI.']::text[], '', array['Traduisez mot à mot : carte ET (cotisation OU age < 18).', 'Les parenthèses sont indispensables : ET est prioritaire sur OU.']::text[], 20, true, 'publie', 40, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-bibliotheque');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-bibliotheque'), null, '20
VRAI
FAUX', 'Accès : FAUX
Gratuit : FAUX', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-bibliotheque'), null, '16
VRAI
FAUX', 'Accès : VRAI
Gratuit : VRAI', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-bibliotheque'), null, '25
VRAI
VRAI', 'Accès : VRAI
Gratuit : FAUX', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-bibliotheque'), null, '15
FAUX
VRAI', 'Accès : FAUX
Gratuit : VRAI', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-bibliotheque'), null, '18
VRAI
FAUX', 'Accès : FAUX
Gratuit : FAUX', true, 1, 4, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-bibliotheque'), 'ALGORITHME Bibliotheque
VARIABLES
  age : ENTIER
  carte, cotisation : BOOLEEN
DEBUT
  LIRE(age)
  LIRE(carte)
  LIRE(cotisation)
  ECRIRE("Accès : ", carte ET (cotisation OU age < 18))
  ECRIRE("Gratuit : ", age < 18)
FIN', 'Sans parenthèses, « carte ET cotisation OU age < 18 » autoriserait un mineur sans carte valide (cas 15, FAUX, VRAI). Le cas 18 ans vérifie la borne stricte < 18.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-budget', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'analyse-problemes'), 'pseudocode', 'Projet : budget mensuel', 'Lisez (entiers, en FC) : le revenu mensuel, le loyer, le coût du transport **par jour de cours** et le coût d''un repas. Un mois compte **22 jours de cours** avec **un repas par jour**. Affichez :

~~~text
Transport : <total transport>
Repas : <total repas>
Dépenses : <loyer + transport + repas>
Reste : <revenu - dépenses>
~~~', 'intermediaire', 'mini_projet', '{}'::text[], '[{"input":"200000\n60000\n2000\n3000","output":"Transport : 44000\nRepas : 66000\nDépenses : 170000\nReste : 30000"}]'::jsonb, '{}'::text[], '', array['Déclarez JOURS = 22 en constante.', 'Calculez chaque total dans sa propre variable avant de les additionner.']::text[], 20, false, 'publie', 41, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-budget');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-budget'), null, '200000
60000
2000
3000', 'Transport : 44000
Repas : 66000
Dépenses : 170000
Reste : 30000', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-budget'), null, '110000
0
2500
2500', 'Transport : 55000
Repas : 55000
Dépenses : 110000
Reste : 0', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-budget'), null, '150000
80000
1500
2000', 'Transport : 33000
Repas : 44000
Dépenses : 157000
Reste : -7000', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-budget'), 'ALGORITHME Budget
CONSTANTES
  JOURS = 22
VARIABLES
  revenu, loyer, transportJour, repas, transport, totalRepas, depenses : ENTIER
DEBUT
  LIRE(revenu)
  LIRE(loyer)
  LIRE(transportJour)
  LIRE(repas)
  transport ← transportJour * JOURS
  totalRepas ← repas * JOURS
  depenses ← loyer + transport + totalRepas
  ECRIRE("Transport : ", transport)
  ECRIRE("Repas : ", totalRepas)
  ECRIRE("Dépenses : ", depenses)
  ECRIRE("Reste : ", revenu - depenses)
FIN', 'La décomposition suit l''analyse : un total par poste, puis la somme, puis le reste. Le test caché montre qu''un reste négatif est possible : un futur chapitre permettra d''afficher un avertissement avec une condition.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-caisse-simple', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'variables-constantes'), 'pseudocode', 'Projet : caisse enregistreuse', 'Lisez les prix de trois articles (réels). Après chaque lecture, ajoutez le prix à une variable **total** et affichez le sous-total :

~~~text
Sous-total : <après article 1>
Sous-total : <après article 2>
Total : <après article 3>
~~~', 'debutant', 'mini_projet', '{}'::text[], '[{"input":"1500\n250.5\n3000","output":"Sous-total : 1500\nSous-total : 1750.5\nTotal : 4750.5"}]'::jsonb, array['Une seule variable pour le cumul.']::text[], '', array['Initialisez total à 0 avant la première lecture.', 'Lisez le prix dans une variable prix, puis total ← total + prix.']::text[], 15, false, 'publie', 42, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-caisse-simple');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-caisse-simple'), null, '1500
250.5
3000', 'Sous-total : 1500
Sous-total : 1750.5
Total : 4750.5', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-caisse-simple'), null, '0
0
0', 'Sous-total : 0
Sous-total : 0
Total : 0', true, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-caisse-simple'), null, '100
200
300', 'Sous-total : 100
Sous-total : 300
Total : 600', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-caisse-simple'), 'ALGORITHME Caisse
VARIABLES
  prix, total : REEL
DEBUT
  total ← 0
  LIRE(prix)
  total ← total + prix
  ECRIRE("Sous-total : ", total)
  LIRE(prix)
  total ← total + prix
  ECRIRE("Sous-total : ", total)
  LIRE(prix)
  total ← total + prix
  ECRIRE("Total : ", total)
FIN', 'La même variable prix est réutilisée pour chaque lecture ; total accumule. Ce motif répété sera écrit avec une boucle au niveau 2.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-fiche', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'types-donnees'), 'pseudocode', 'Projet : fiche de résultats', 'Lisez un nom, un prénom, puis deux notes (réels). Affichez :

~~~text
Étudiant : <NOM EN MAJUSCULES> <initiale du prénom en majuscule>.
Moyenne : <moyenne des deux notes>
Admis : <VRAI si moyenne >= 10>
~~~', 'intermediaire', 'mini_projet', '{}'::text[], '[{"input":"mbuyi\njoël\n12\n9","output":"Étudiant : MBUYI J.\nMoyenne : 10.5\nAdmis : VRAI"}]'::jsonb, '{}'::text[], '', array['MAJUSCULE(nom) et MAJUSCULE(prenom[1]).', 'La moyenne est un REEL.']::text[], 20, false, 'publie', 43, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-fiche');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-fiche'), null, 'mbuyi
joël
12
9', 'Étudiant : MBUYI J.
Moyenne : 10.5
Admis : VRAI', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-fiche'), null, 'Kabeya
esther
8
11.5', 'Étudiant : KABEYA E.
Moyenne : 9.75
Admis : FAUX', true, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-fiche'), null, 'ilunga
Anne
10
10', 'Étudiant : ILUNGA A.
Moyenne : 10
Admis : VRAI', true, 1, 2, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-fiche'), 'ALGORITHME FicheResultats
VARIABLES
  nom, prenom : CHAINE
  n1, n2, moyenne : REEL
DEBUT
  LIRE(nom)
  LIRE(prenom)
  LIRE(n1)
  LIRE(n2)
  moyenne ← (n1 + n2) / 2
  ECRIRE("Étudiant : ", MAJUSCULE(nom), " ", MAJUSCULE(prenom[1]), ".")
  ECRIRE("Moyenne : ", moyenne)
  ECRIRE("Admis : ", moyenne >= 10)
FIN', 'Chaque donnée a son type : CHAINE pour l''identité, REEL pour les notes, et la décision est un BOOLEEN obtenu par comparaison.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-horloge', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'operateurs'), 'pseudocode', 'Projet : horloge de la semaine', 'Lisez un nombre de minutes écoulées depuis lundi 00 h 00 (entier entre 0 et 10 079). Les jours sont numérotés de 1 (lundi) à 7 (dimanche). Affichez :

~~~text
Jour <n>, <h> h <m> min
~~~', 'intermediaire', 'mini_projet', '{}'::text[], '[{"input":"1530","output":"Jour 2, 1 h 30 min"}]'::jsonb, '{}'::text[], '', array['Un jour compte 1 440 minutes.', 'Jour : minutes DIV 1440 + 1 ; heures : (minutes MOD 1440) DIV 60 ; minutes : minutes MOD 60.']::text[], 20, true, 'publie', 44, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-horloge');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-horloge'), null, '1530', 'Jour 2, 1 h 30 min', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-horloge'), null, '0', 'Jour 1, 0 h 0 min', false, 1, 1, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-horloge'), null, '1439', 'Jour 1, 23 h 59 min', true, 1, 2, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-horloge'), null, '1440', 'Jour 2, 0 h 0 min', true, 1, 3, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-horloge'), null, '10079', 'Jour 7, 23 h 59 min', true, 1, 4, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-horloge'), 'ALGORITHME Horloge
CONSTANTES
  MIN_JOUR = 1440
VARIABLES
  minutes, jour, h, m : ENTIER
DEBUT
  LIRE(minutes)
  jour ← minutes DIV MIN_JOUR + 1
  h ← (minutes MOD MIN_JOUR) DIV 60
  m ← minutes MOD 60
  ECRIRE("Jour ", jour, ", ", h, " h ", m, " min")
FIN', 'DIV donne le nombre de jours complets écoulés (on ajoute 1 car lundi est le jour 1) ; MOD 1440 donne les minutes du jour courant. Les cas 1 439 et 1 440 vérifient le passage de minuit.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('algo-projet-recu', (select id from public.courses where slug = 'algorithmique'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'algorithmique') and slug = 'entrees-sorties'), 'pseudocode', 'Projet : reçu de paiement', 'Lisez le nom de l''étudiant, son matricule (texte), le montant total des frais et le montant payé (entiers, en dollars). Affichez exactement :

~~~text
===== REÇU =====
Étudiant : <nom>
Matricule : <matricule>
Payé : <payé> $ / <total> $
Reste à payer : <total - payé> $
================
~~~', 'intermediaire', 'mini_projet', '{}'::text[], '[{"input":"Kasongo Amani\nUPL-2026-0042\n600\n450","output":"===== REÇU =====\nÉtudiant : Kasongo Amani\nMatricule : UPL-2026-0042\nPayé : 450 $ / 600 $\nReste à payer : 150 $\n================"}]'::jsonb, '{}'::text[], '', array['Le matricule contient des lettres et des tirets : type CHAINE.', 'Respectez les espaces autour de « / » et avant « $ ».']::text[], 20, false, 'publie', 45, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'algo-projet-recu');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-recu'), null, 'Kasongo Amani
UPL-2026-0042
600
450', '===== REÇU =====
Étudiant : Kasongo Amani
Matricule : UPL-2026-0042
Payé : 450 $ / 600 $
Reste à payer : 150 $
================', false, 1, 0, null);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'algo-projet-recu'), null, 'Ruth Kalenga
UPL-2025-0007
800
800', '===== REÇU =====
Étudiant : Ruth Kalenga
Matricule : UPL-2025-0007
Payé : 800 $ / 800 $
Reste à payer : 0 $
================', true, 1, 1, null);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'algo-projet-recu'), 'ALGORITHME Recu
VARIABLES
  nom, matricule : CHAINE
  total, paye : ENTIER
DEBUT
  LIRE(nom)
  LIRE(matricule)
  LIRE(total)
  LIRE(paye)
  ECRIRE("===== REÇU =====")
  ECRIRE("Étudiant : ", nom)
  ECRIRE("Matricule : ", matricule)
  ECRIRE("Payé : ", paye, " $ / ", total, " $")
  ECRIRE("Reste à payer : ", total - paye, " $")
  ECRIRE("================")
FIN', 'L''ordre des LIRE suit l''ordre des données ; l''affichage reprend exactement le modèle, espaces compris.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-premier-paragraphe', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-introduction-web'), 'html', 'Un titre et un paragraphe', 'Dans le corps de la page, ajoutez un titre principal **h1** contenant « Bienvenue » et un paragraphe contenant le mot **important** mis en valeur avec **strong**.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Le contenu visible se place entre <body> et </body>.', '<p>Texte <strong>important</strong></p>']::text[], 5, false, 'publie', 46, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-premier-paragraphe');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-premier-paragraphe'), 'Un h1 contient « Bienvenue »', '', '', false, 1, 0, '{"type":"text","selector":"h1","contains":"Bienvenue","message":"Un h1 contient « Bienvenue »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-premier-paragraphe'), 'La page contient un paragraphe', '', '', false, 1, 1, '{"type":"element","selector":"p","message":"La page contient un paragraphe"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-premier-paragraphe'), 'Le mot « important » est dans un strong à l''intérieur d''un paragraphe', '', '', false, 1, 2, '{"type":"text","selector":"p strong","contains":"important","message":"Le mot « important » est dans un strong à l''intérieur d''un paragraphe"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-premier-paragraphe'), 'Un seul h1', '', '', true, 1, 3, '{"type":"element","selector":"h1","max":1,"message":"Un seul h1"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-premier-paragraphe'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <h1>Bienvenue</h1>
  <p>Ce message est <strong>important</strong>.</p>
</body>
</html>', 'Le h1 donne le titre principal ; strong est imbriqué dans p et fermé avant lui.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-titre-et-texte', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-introduction-web'), 'html', 'Présentation personnelle', 'Écrivez une page avec un **h1** « Qui suis-je ? » et **deux paragraphes** : le premier contient votre prénom, le second votre filière, mise en valeur avec **em**.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Deux éléments p successifs.', '<p>Filière : <em>Informatique</em></p>']::text[], 5, false, 'publie', 47, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-titre-et-texte');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-titre-et-texte'), 'Le h1 vaut exactement « Qui suis-je ? »', '', '', false, 1, 0, '{"type":"text","selector":"h1","equals":"Qui suis-je ?","message":"Le h1 vaut exactement « Qui suis-je ? »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-titre-et-texte'), 'Au moins deux paragraphes', '', '', false, 1, 1, '{"type":"element","selector":"p","min":2,"message":"Au moins deux paragraphes"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-titre-et-texte'), 'Un em dans un paragraphe', '', '', false, 1, 2, '{"type":"element","selector":"p em","message":"Un em dans un paragraphe"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-titre-et-texte'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <h1>Qui suis-je ?</h1>
  <p>Je m''appelle Amani.</p>
  <p>Filière : <em>Informatique</em></p>
</body>
</html>', 'Chaque bloc de texte est un p ; em exprime l''insistance.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-lien-mdn', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-introduction-web'), 'html', 'Un lien vers la documentation', 'Ajoutez un paragraphe contenant un lien vers **https://developer.mozilla.org/fr/** dont le texte est « Documentation MDN ».', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['L''élément a et son attribut href.', '<a href="https://developer.mozilla.org/fr/">Documentation MDN</a>']::text[], 5, false, 'publie', 48, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-lien-mdn');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-lien-mdn'), 'Le lien pointe vers https://developer.mozilla.org/fr/', '', '', false, 1, 0, '{"type":"attribute","selector":"a","name":"href","equals":"https://developer.mozilla.org/fr/","message":"Le lien pointe vers https://developer.mozilla.org/fr/"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-lien-mdn'), 'Le texte du lien est « Documentation MDN »', '', '', false, 1, 1, '{"type":"text","selector":"a","equals":"Documentation MDN","message":"Le texte du lien est « Documentation MDN »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-lien-mdn'), 'Le lien est dans un paragraphe', '', '', true, 1, 2, '{"type":"element","selector":"p a","message":"Le lien est dans un paragraphe"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-lien-mdn'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <p><a href="https://developer.mozilla.org/fr/">Documentation MDN</a></p>
</body>
</html>', 'href porte l''adresse complète (URL absolue) ; le texte du lien décrit la destination.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-projet-presentation', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-introduction-web'), 'html', 'Projet : ma page de présentation', 'Créez une page avec : un **h1** contenant votre prénom, un paragraphe de présentation avec au moins un mot en **strong**, un paragraphe avec un lien vers **https://www.wikipedia.org**, et un commentaire HTML indiquant l''auteur.', 'debutant', 'mini_projet', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Un commentaire s''écrit <!-- … -->.', 'Vérifiez l''imbrication : le dernier ouvert est le premier fermé.']::text[], 15, false, 'publie', 49, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-projet-presentation');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-presentation'), 'Un seul h1', '', '', false, 1, 0, '{"type":"element","selector":"h1","min":1,"max":1,"message":"Un seul h1"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-presentation'), 'Un mot important dans un paragraphe', '', '', false, 1, 1, '{"type":"element","selector":"p strong","message":"Un mot important dans un paragraphe"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-presentation'), 'Un lien vers wikipedia.org dans un paragraphe', '', '', false, 1, 2, '{"type":"attribute","selector":"p a","name":"href","contains":"wikipedia.org","message":"Un lien vers wikipedia.org dans un paragraphe"}'::jsonb);
commit;
