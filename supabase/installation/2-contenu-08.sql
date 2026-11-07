-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 8 sur 10.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
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
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-presentation'), 'Au moins deux paragraphes', '', '', true, 1, 3, '{"type":"element","selector":"p","min":2,"message":"Au moins deux paragraphes"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-projet-presentation'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <!-- Auteur : Amani -->
  <h1>Amani</h1>
  <p>Je suis étudiant en <strong>informatique</strong> à l''UPL.</p>
  <p>Ma référence : <a href="https://www.wikipedia.org">Wikipédia</a>.</p>
</body>
</html>', 'La page combine les éléments du chapitre : titre, paragraphes, mise en valeur, lien et commentaire.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-squelette', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-structure-document'), 'html', 'Squelette complet', 'Écrivez un document HTML complet : DOCTYPE, élément html avec **lang="fr"**, head contenant **meta charset utf-8** et un **title** « Accueil », body contenant un **h1** « Accueil ».', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Commencez par <!DOCTYPE html>.', 'L''attribut lang se place sur l''élément html.']::text[], 5, false, 'publie', 50, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-squelette');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-squelette'), 'html a l''attribut lang="fr"', '', '', false, 1, 0, '{"type":"attribute","selector":"html","name":"lang","equals":"fr","message":"html a l''attribut lang=\"fr\""}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-squelette'), 'meta charset="utf-8" dans head', '', '', false, 1, 1, '{"type":"attribute","selector":"head meta[charset]","name":"charset","equals":"utf-8","message":"meta charset=\"utf-8\" dans head"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-squelette'), 'Le titre de l''onglet est « Accueil »', '', '', false, 1, 2, '{"type":"text","selector":"head title","equals":"Accueil","message":"Le titre de l''onglet est « Accueil »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-squelette'), 'Un h1 « Accueil » dans body', '', '', false, 1, 3, '{"type":"text","selector":"body h1","equals":"Accueil","message":"Un h1 « Accueil » dans body"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-squelette'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Accueil</title>
</head>
<body>
  <h1>Accueil</h1>
</body>
</html>', 'Le squelette complet garantit le mode standard, la langue, l''encodage et un titre d''onglet.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-meta-viewport', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-structure-document'), 'html', 'Page adaptée au téléphone', 'Complétez l''en-tête avec la **meta viewport** (content="width=device-width, initial-scale=1") et donnez à la page le titre « Horaires — Bibliothèque ».', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['<meta name="viewport" content="width=device-width, initial-scale=1">']::text[], 5, false, 'publie', 51, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-meta-viewport');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-meta-viewport'), 'meta viewport avec width=device-width', '', '', false, 1, 0, '{"type":"attribute","selector":"head meta[name=''viewport'']","name":"content","contains":"width=device-width","message":"meta viewport avec width=device-width"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-meta-viewport'), 'Titre « Horaires — Bibliothèque »', '', '', false, 1, 1, '{"type":"text","selector":"title","equals":"Horaires — Bibliothèque","message":"Titre « Horaires — Bibliothèque »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-meta-viewport'), 'L''encodage utf-8 est conservé', '', '', true, 1, 2, '{"type":"attribute","selector":"meta[charset]","name":"charset","equals":"utf-8","message":"L''encodage utf-8 est conservé"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-meta-viewport'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Horaires — Bibliothèque</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>

</body>
</html>', 'La meta viewport est indispensable pour un affichage correct sur téléphone.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-commentaire-titre', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-structure-document'), 'html', 'Contenu au bon endroit', 'Le code de départ place le titre visible dans head. Corrigez-le : le **h1** « Club informatique » doit être dans **body**, et head ne doit contenir aucun h1.', 'debutant', 'corriger', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Club</title>
  <h1>Club informatique</h1>
</head>
<body>
  <p>Réunion le vendredi.</p>
</body>
</html>', array['Déplacez la ligne du h1 juste après <body>.']::text[], 5, false, 'publie', 52, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-commentaire-titre');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-commentaire-titre'), 'Le h1 est dans body', '', '', false, 1, 0, '{"type":"text","selector":"body h1","equals":"Club informatique","message":"Le h1 est dans body"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-commentaire-titre'), 'head ne contient pas de h1', '', '', false, 1, 1, '{"type":"element","selector":"head h1","min":0,"max":0,"message":"head ne contient pas de h1"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-commentaire-titre'), 'Le paragraphe existant est conservé', '', '', true, 1, 2, '{"type":"text","selector":"body p","contains":"vendredi","message":"Le paragraphe existant est conservé"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-commentaire-titre'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Club</title>
</head>
<body>
  <h1>Club informatique</h1>
  <p>Réunion le vendredi.</p>
</body>
</html>', 'head ne contient que des métadonnées. Le navigateur déplace parfois le h1 de lui-même, mais le code doit être correct.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-projet-accueil', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-structure-document'), 'html', 'Projet : page d''accueil d''un département', 'Créez la page d''accueil du département d''informatique : document complet en français, encodage utf-8, meta viewport, titre « Département d''informatique — UPL », un h1 et deux paragraphes.', 'debutant', 'mini_projet', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Reprenez le squelette complet du cours.', 'Le titre de l''onglet et le h1 peuvent différer.']::text[], 15, false, 'publie', 53, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-projet-accueil');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Langue française', '', '', false, 1, 0, '{"type":"attribute","selector":"html","name":"lang","equals":"fr","message":"Langue française"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Encodage utf-8', '', '', false, 1, 1, '{"type":"attribute","selector":"meta[charset]","name":"charset","equals":"utf-8","message":"Encodage utf-8"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'meta viewport', '', '', false, 1, 2, '{"type":"attribute","selector":"meta[name=''viewport'']","name":"content","contains":"width=device-width","message":"meta viewport"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Titre de l''onglet exact', '', '', false, 1, 3, '{"type":"text","selector":"title","equals":"Département d''informatique — UPL","message":"Titre de l''onglet exact"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Deux paragraphes', '', '', true, 1, 4, '{"type":"element","selector":"body p","min":2,"message":"Deux paragraphes"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-accueil'), 'Un seul h1', '', '', true, 1, 5, '{"type":"element","selector":"h1","min":1,"max":1,"message":"Un seul h1"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-projet-accueil'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Département d''informatique — UPL</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h1>Département d''informatique</h1>
  <p>Formations en informatique et en intelligence artificielle.</p>
  <p>Secrétariat ouvert du lundi au vendredi.</p>
</body>
</html>', 'Toutes les métadonnées essentielles sont présentes : la page est prête à être publiée.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-liste-langages', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-textes-listes'), 'html', 'Liste de langages', 'Ajoutez un titre **h2** « Langages » suivi d''une **liste à puces** de trois éléments : Python, C et Java.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['ul pour une liste sans ordre, li pour chaque élément.']::text[], 5, false, 'publie', 54, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-liste-langages');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-langages'), 'Un h2 « Langages »', '', '', false, 1, 0, '{"type":"text","selector":"h2","equals":"Langages","message":"Un h2 « Langages »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-langages'), 'Une liste ul de trois éléments', '', '', false, 1, 1, '{"type":"element","selector":"ul > li","min":3,"max":3,"message":"Une liste ul de trois éléments"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-langages'), 'Java fait partie de la liste', '', '', true, 1, 2, '{"type":"text","selector":"ul > li","equals":"Java","message":"Java fait partie de la liste"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-liste-langages'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <h2>Langages</h2>
  <ul>
    <li>Python</li>
    <li>C</li>
    <li>Java</li>
  </ul>
</body>
</html>', 'L''ordre des langages n''a pas d''importance : on choisit ul.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-recette', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-textes-listes'), 'html', 'Une recette structurée', 'Créez une page avec un **h1** « Fufu », un **h2** « Ingrédients » suivi d''une liste **ul** d''au moins 2 ingrédients, puis un **h2** « Étapes » suivi d''une liste **ol** d''au moins 3 étapes.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Les ingrédients n''ont pas d''ordre ; les étapes, si.', 'Respectez la hiérarchie h1 puis h2.']::text[], 10, false, 'publie', 55, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-recette');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-recette'), 'Un h1 « Fufu »', '', '', false, 1, 0, '{"type":"text","selector":"h1","equals":"Fufu","message":"Un h1 « Fufu »"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-recette'), 'Deux sections h2', '', '', false, 1, 1, '{"type":"element","selector":"h2","min":2,"message":"Deux sections h2"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-recette'), 'Au moins deux ingrédients dans un ul', '', '', false, 1, 2, '{"type":"element","selector":"ul > li","min":2,"message":"Au moins deux ingrédients dans un ul"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-recette'), 'Au moins trois étapes dans un ol', '', '', false, 1, 3, '{"type":"element","selector":"ol > li","min":3,"message":"Au moins trois étapes dans un ol"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-recette'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <h1>Fufu</h1>
  <h2>Ingrédients</h2>
  <ul>
    <li>Farine de manioc</li>
    <li>Eau</li>
  </ul>
  <h2>Étapes</h2>
  <ol>
    <li>Faire bouillir l''eau.</li>
    <li>Verser la farine progressivement.</li>
    <li>Remuer jusqu''à obtenir une pâte ferme.</li>
  </ol>
</body>
</html>', 'ul pour les ingrédients, ol pour les étapes : le choix exprime le sens du contenu.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-liste-imbriquee', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-textes-listes'), 'html', 'Liste imbriquée', 'Créez une liste **ul** de deux éléments, « Web » et « Programmation ». L''élément « Web » contient une **sous-liste ul** avec « HTML » et « CSS ».', 'intermediaire', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['La sous-liste se place à l''intérieur du li « Web », avant sa balise fermante.']::text[], 10, false, 'publie', 56, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-liste-imbriquee');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-imbriquee'), 'La liste principale a deux éléments', '', '', false, 1, 0, '{"type":"element","selector":"body > ul > li","min":2,"max":2,"message":"La liste principale a deux éléments"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-imbriquee'), 'Une sous-liste de deux éléments dans un li', '', '', false, 1, 1, '{"type":"element","selector":"ul > li > ul > li","min":2,"message":"Une sous-liste de deux éléments dans un li"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-liste-imbriquee'), 'Aucune liste directement dans un ul', '', '', true, 1, 2, '{"type":"element","selector":"ul > ul","min":0,"max":0,"message":"Aucune liste directement dans un ul"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-liste-imbriquee'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <ul>
    <li>Web
      <ul>
        <li>HTML</li>
        <li>CSS</li>
      </ul>
    </li>
    <li>Programmation</li>
  </ul>
</body>
</html>', 'La sous-liste détaille l''élément « Web » : elle est donc à l''intérieur de son li.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-projet-fiche-revision', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-textes-listes'), 'html', 'Projet : fiche de révision', 'Créez une fiche de révision sur un sujet de votre choix : un **h1**, au moins **deux h2**, au moins un **h3**, un paragraphe avec un mot en **strong**, une liste **ul** et une liste **ol**.', 'intermediaire', 'mini_projet', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Construisez d''abord le plan avec les titres.', 'Pas de saut de niveau : un h3 se place sous un h2.']::text[], 15, false, 'publie', 57, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-projet-fiche-revision');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Un seul h1', '', '', false, 1, 0, '{"type":"element","selector":"h1","min":1,"max":1,"message":"Un seul h1"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Au moins deux h2', '', '', false, 1, 1, '{"type":"element","selector":"h2","min":2,"message":"Au moins deux h2"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Au moins un h3', '', '', false, 1, 2, '{"type":"element","selector":"h3","min":1,"message":"Au moins un h3"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Un mot important dans un paragraphe', '', '', false, 1, 3, '{"type":"element","selector":"p strong","message":"Un mot important dans un paragraphe"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Une liste à puces', '', '', true, 1, 4, '{"type":"element","selector":"ul > li","min":1,"message":"Une liste à puces"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), 'Une liste numérotée', '', '', true, 1, 5, '{"type":"element","selector":"ol > li","min":1,"message":"Une liste numérotée"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-projet-fiche-revision'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <h1>Révision : les boucles</h1>
  <h2>Définition</h2>
  <p>Une boucle répète des instructions ; elle doit <strong>toujours</strong> se terminer.</p>
  <h2>Les types de boucles</h2>
  <h3>Boucles conditionnelles</h3>
  <ul>
    <li>TANT QUE</li>
    <li>RÉPÉTER</li>
  </ul>
  <h3>Méthode</h3>
  <ol>
    <li>Initialiser</li>
    <li>Tester</li>
    <li>Mettre à jour</li>
  </ol>
</body>
</html>', 'Le plan (h1, h2, h3) structure la fiche ; les listes choisies selon que l''ordre compte ou non.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-image-alt', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-liens-images'), 'html', 'Image accessible', 'Insérez l''image **https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg** avec un texte alternatif contenant « HTML5 », une largeur de **120** et une hauteur de **120**.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['<img src="…" alt="…" width="120" height="120">', 'img n''a pas de balise fermante.']::text[], 5, false, 'publie', 58, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-image-alt');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-image-alt'), 'L''image a la bonne source', '', '', false, 1, 0, '{"type":"attribute","selector":"img","name":"src","contains":"HTML5_logo","message":"L''image a la bonne source"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-image-alt'), 'Le texte alternatif mentionne HTML5', '', '', false, 1, 1, '{"type":"attribute","selector":"img","name":"alt","contains":"HTML5","message":"Le texte alternatif mentionne HTML5"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-image-alt'), 'Largeur 120', '', '', false, 1, 2, '{"type":"attribute","selector":"img","name":"width","equals":"120","message":"Largeur 120"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-image-alt'), 'Hauteur 120', '', '', true, 1, 3, '{"type":"attribute","selector":"img","name":"height","equals":"120","message":"Hauteur 120"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-image-alt'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg" alt="Logo HTML5" width="120" height="120">
</body>
</html>', 'alt décrit l''image pour les lecteurs d''écran ; width et height réservent sa place.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-menu-navigation', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-liens-images'), 'html', 'Menu de navigation', 'Créez un élément **nav** contenant trois liens : « Accueil » vers **index.html**, « Cours » vers **cours/index.html** et « MDN » vers **https://developer.mozilla.org/fr/**, ce dernier ouvert dans un nouvel onglet avec **rel="noopener"**.', 'intermediaire', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['Trois éléments a dans nav.', 'target="_blank" rel="noopener" sur le lien externe.']::text[], 10, false, 'publie', 59, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-menu-navigation');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-menu-navigation'), 'Trois liens dans nav', '', '', false, 1, 0, '{"type":"element","selector":"nav a","min":3,"message":"Trois liens dans nav"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-menu-navigation'), 'Un lien relatif vers index.html', '', '', false, 1, 1, '{"type":"attribute","selector":"nav a[href=''index.html'']","name":"href","equals":"index.html","message":"Un lien relatif vers index.html"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-menu-navigation'), 'Un lien vers cours/index.html', '', '', false, 1, 2, '{"type":"attribute","selector":"nav a[href=''cours/index.html'']","name":"href","equals":"cours/index.html","message":"Un lien vers cours/index.html"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-menu-navigation'), 'Le lien en nouvel onglet a rel="noopener"', '', '', false, 1, 3, '{"type":"attribute","selector":"nav a[target=''_blank'']","name":"rel","contains":"noopener","message":"Le lien en nouvel onglet a rel=\"noopener\""}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-menu-navigation'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <nav>
    <a href="index.html">Accueil</a>
    <a href="cours/index.html">Cours</a>
    <a href="https://developer.mozilla.org/fr/" target="_blank" rel="noopener">MDN</a>
  </nav>
</body>
</html>', 'Liens relatifs à l''intérieur du site, URL absolue pour le site externe, protégée par rel="noopener".')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-ancre-section', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-liens-images'), 'html', 'Lien vers une section', 'Créez un lien « Voir les horaires » qui mène à un titre **h2** « Horaires » de la même page, identifié par **id="horaires"**.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>


</body>
</html>', array['href="#horaires" sur le lien, id="horaires" sur le h2.']::text[], 5, false, 'publie', 60, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-ancre-section');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-ancre-section'), 'Le lien pointe vers #horaires', '', '', false, 1, 0, '{"type":"attribute","selector":"a","name":"href","equals":"#horaires","message":"Le lien pointe vers #horaires"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-ancre-section'), 'Un h2 « Horaires » avec id="horaires"', '', '', false, 1, 1, '{"type":"text","selector":"h2#horaires","equals":"Horaires","message":"Un h2 « Horaires » avec id=\"horaires\""}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-ancre-section'), 'Texte du lien exact', '', '', true, 1, 2, '{"type":"text","selector":"a[href=''#horaires'']","equals":"Voir les horaires","message":"Texte du lien exact"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-ancre-section'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Exercice</title>
</head>
<body>
  <p><a href="#horaires">Voir les horaires</a></p>
  <h2 id="horaires">Horaires</h2>
  <p>De 8 h à 16 h.</p>
</body>
</html>', 'Le dièse dans href désigne l''identifiant d''un élément de la page.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('html-projet-club', (select id from public.courses where slug = 'html'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'html') and slug = 'html-liens-images'), 'html', 'Projet : page du club informatique', 'Créez la page de présentation du club informatique : document complet en français avec titre d''onglet, un **nav** d''au moins deux liens, un **h1**, un paragraphe de présentation, une liste **ul** d''activités (au moins 3), une **image avec alt non vide**, et un lien **mailto:** pour écrire au club.', 'intermediaire', 'mini_projet', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Commencez par le squelette, puis ajoutez les éléments un à un en surveillant l''aperçu.', 'Le lien de contact commence par mailto:.']::text[], 25, true, 'publie', 61, null, null)
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'html-projet-club');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-club'), 'Document en français', '', '', false, 1, 0, '{"type":"attribute","selector":"html","name":"lang","equals":"fr","message":"Document en français"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-club'), 'Un titre d''onglet', '', '', false, 1, 1, '{"type":"element","selector":"head title","message":"Un titre d''onglet"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-club'), 'Un menu d''au moins deux liens', '', '', false, 1, 2, '{"type":"element","selector":"nav a","min":2,"message":"Un menu d''au moins deux liens"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-club'), 'Un seul h1', '', '', false, 1, 3, '{"type":"element","selector":"h1","min":1,"max":1,"message":"Un seul h1"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-club'), 'Au moins trois activités', '', '', false, 1, 4, '{"type":"element","selector":"ul > li","min":3,"message":"Au moins trois activités"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-club'), 'Une image avec un texte alternatif non vide', '', '', true, 1, 5, '{"type":"attribute","selector":"img[alt]:not([alt=''''])","name":"alt","message":"Une image avec un texte alternatif non vide"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'html-projet-club'), 'Un lien mailto: de contact', '', '', true, 1, 6, '{"type":"attribute","selector":"a[href^=''mailto:'']","name":"href","contains":"@","message":"Un lien mailto: de contact"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'html-projet-club'), '<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Club informatique — UPL</title>
</head>
<body>
  <nav>
    <a href="index.html">Accueil</a>
    <a href="#activites">Activités</a>
  </nav>
  <h1>Club informatique de l''UPL</h1>
  <p>Le club réunit les étudiants passionnés de programmation.</p>
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg" alt="Logo HTML5, langage étudié au club" width="100" height="100">
  <h2 id="activites">Activités</h2>
  <ul>
    <li>Ateliers de code</li>
    <li>Concours d''algorithmique</li>
    <li>Conférences</li>
  </ul>
  <p><a href="mailto:club@exemple.cd">Écrire au club</a></p>
</body>
</html>', 'La page réunit toutes les notions du niveau : structure, titres, listes, liens et images accessibles.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-titre-couleur', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-introduction-selecteurs'), 'css', 'Colorer le titre', 'Dans **style.css**, donnez au **h1** la couleur **navy** et centrez-le (**text-align: center**).', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Sélecteur de type : h1 { … }', 'Deux déclarations, chacune terminée par un point-virgule.']::text[], 5, false, 'publie', 62, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <h1>Annonces</h1>\n  <nav>\n    <a href=\"#\">Accueil</a>\n    <a href=\"#\">Cours</a>\n  </nav>\n  <p>Réunion vendredi.</p>\n  <p class=\"alerte\">Inscription obligatoire.</p>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-titre-couleur');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-titre-couleur'), 'h1 { color: navy }', '', '', false, 1, 0, '{"type":"css","selector":"h1","property":"color","equals":"navy","message":"h1 { color: navy }"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-titre-couleur'), 'h1 { text-align: center }', '', '', false, 1, 1, '{"type":"css","selector":"h1","property":"text-align","equals":"center","message":"h1 { text-align: center }"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'css-titre-couleur'), 'h1 {
  color: navy;
  text-align: center;
}', 'Une règle, un sélecteur de type, deux déclarations.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-classe-alerte', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-introduction-selecteurs'), 'css', 'Une classe d''alerte', 'Les éléments de classe **alerte** doivent être rouges (**color: red**) et en gras (**font-weight: bold**).', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['Le sélecteur de classe commence par un point : .alerte']::text[], 5, false, 'publie', 63, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <h1>Annonces</h1>\n  <nav>\n    <a href=\"#\">Accueil</a>\n    <a href=\"#\">Cours</a>\n  </nav>\n  <p>Réunion vendredi.</p>\n  <p class=\"alerte\">Inscription obligatoire.</p>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-classe-alerte');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-classe-alerte'), '.alerte { color: red }', '', '', false, 1, 0, '{"type":"css","selector":".alerte","property":"color","oneOf":["red","#ff0000","#f00"],"message":".alerte { color: red }"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-classe-alerte'), '.alerte { font-weight: bold }', '', '', false, 1, 1, '{"type":"css","selector":".alerte","property":"font-weight","oneOf":["bold","700"],"message":".alerte { font-weight: bold }"}'::jsonb);
insert into public.exercise_solutions (exercise_id, solution_code, correction) values ((select id from public.exercises where slug = 'css-classe-alerte'), '.alerte {
  color: red;
  font-weight: bold;
}', 'Sans le point, « alerte » chercherait un élément HTML nommé alerte.')
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();
insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values ('css-menu-liens', (select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-introduction-selecteurs'), 'css', 'Les liens du menu', 'Seuls les liens **situés dans nav** doivent être verts (**color: green**). Utilisez un sélecteur **descendant**. Donnez aussi à tout le **body** la police **Arial, sans-serif**.', 'debutant', 'ecrire_programme', '{}'::text[], '[]'::jsonb, '{}'::text[], '', array['nav a { … }', 'body { font-family: Arial, sans-serif; }']::text[], 10, false, 'publie', 64, '[{"name":"index.html","content":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Exercice CSS</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <h1>Annonces</h1>\n  <nav>\n    <a href=\"#\">Accueil</a>\n    <a href=\"#\">Cours</a>\n  </nav>\n  <p>Réunion vendredi.</p>\n  <p class=\"alerte\">Inscription obligatoire.</p>\n</body>\n</html>"},{"name":"style.css","content":"/* Écrivez vos règles ici */\n"}]'::jsonb, 'style.css')
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;
delete from public.exercise_test_cases where exercise_id = (select id from public.exercises where slug = 'css-menu-liens');
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-menu-liens'), 'nav a { color: green }', '', '', false, 1, 0, '{"type":"css","selector":"nav a","property":"color","oneOf":["green","#008000"],"message":"nav a { color: green }"}'::jsonb);
insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values ((select id from public.exercises where slug = 'css-menu-liens'), 'body { font-family: Arial, sans-serif }', '', '', false, 1, 1, '{"type":"css","selector":"body","property":"font-family","equals":"arial,sans-serif","message":"body { font-family: Arial, sans-serif }"}'::jsonb);
commit;
