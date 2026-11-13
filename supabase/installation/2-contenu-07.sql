-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 7 sur 14.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'kplus') and slug = 'sites-web'), (select id from public.courses where slug = 'kplus'), 'kplus-web-premiere-page', 'Ma première page web', 'debutant', 35, array['Activer la bibliothèque web avec utiliser web.', 'Construire une page : titres, paragraphes, listes, images, liens.', 'Publier un site.']::text[], '{}'::text[], '## utiliser web

Un programme qui commence par **utiliser web** construit une **page web**. Chaque élément créé s''ajoute à la fin de la page, dans l''ordre du programme :

~~~kplus
utiliser web

titre_page("Mon site")
titre("Bienvenue")
paragraphe("Ce site est écrit en K+.")
variable langages = liste()
ajouter_ligne(langages, "HTML")
ajouter_ligne(langages, "K+")
lien("Le langage K+", "https://manassekito17-star.github.io/K-/")
~~~

Sur la plateforme, le bouton **Exécuter** affiche la page sous le code.

## Les éléments

| Fonction | Crée |
|---|---|
| titre(t), sous_titre(t) | un grand titre, un titre de section |
| paragraphe(t) | un paragraphe |
| liste() puis ajouter_ligne(liste, t) | une liste à puces |
| image(adresse, description) | une image (la description est lue aux personnes aveugles) |
| lien(t, adresse) | un lien |
| titre_page(t) | le titre de l''onglet du navigateur |

Les textes sont toujours affichés **tels quels** : un texte qui contient du HTML ne peut pas abîmer la page (sécurité).

## Publier

Avec K+ Studio (https://manassekito17-star.github.io/K-/), l''onglet **Page** montre le site ; sur un ordinateur, `kplus --site mon_site.kplus` crée un dossier publiable chez un hébergeur gratuit (GitHub Pages, Netlify…).', array['utiliser web active les fonctions de page.', 'Les éléments s''ajoutent dans l''ordre du programme.', 'kplus --site crée un site publiable.']::text[], '[{"language":"kplus","title":"Une page de présentation","code":"utiliser web\n\ntitre_page(\"Mon site\")\ntitre(\"Bienvenue\")\nparagraphe(\"Ce site est écrit en K+.\")\nsous_titre(\"Ce que j''apprends\")\nvariable langages = liste()\najouter_ligne(langages, \"Algorithmique\")\najouter_ligne(langages, \"K+\")\nlien(\"Le langage K+\", \"https://manassekito17-star.github.io/K-/\")","explanation":"La page s''affiche sous le code ; titre_page change le titre de l''onglet."}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-web-premiere-page'), 'kplus-web-premiere-page-quiz', 'Ma première page', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'kplus-web-premiere-page-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-web-premiere-page-quiz'), 'qcm', 'Par quoi commence un programme qui construit une page ?', null, '["page web","utiliser web","importer web","html"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-web-premiere-page-quiz'), 'qcm', 'Comment ajoute-t-on une ligne à une liste de la page ?', null, '["ajouter(liste, t)","ajouter_ligne(liste, t)","ligne(t)","liste(t)"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-web-premiere-page-quiz'), 'vrai_faux', 'Un paragraphe contenant <b>gras</b> affiche du texte en gras.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Les textes sont affichés tels quels, pour la sécurité.' from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'kplus') and slug = 'sites-web'), (select id from public.courses where slug = 'kplus'), 'kplus-web-interactions', 'Boutons et champs de saisie', 'debutant', 40, array['Créer un bouton qui appelle une fonction.', 'Lire un champ de saisie.', 'Modifier la page en réponse au visiteur.']::text[], '{}'::text[], '## Un bouton appelle une fonction

`bouton("Calculer", calculer)` crée un bouton ; **à chaque clic**, la fonction **calculer** est appelée. On donne le nom de la fonction, **sans parenthèses**.

## Lire et modifier

| Fonction | Rôle |
|---|---|
| champ(étiquette) | une zone de saisie |
| valeur(champ) | le texte tapé (toujours un texte) |
| changer_texte(élément, t) | remplace le texte d''un paragraphe, d''un titre… |
| changer_valeur(champ, t) | remplace le texte d''un champ |
| quand_change(champ, f) | appelle f à chaque touche tapée |

## Le programme reste vivant

Le programme s''exécute une fois pour construire la page ; ensuite, ses variables **restent en mémoire** : chaque clic peut les lire et les modifier.', array['bouton(texte, fonction) : la fonction est appelée à chaque clic.', 'valeur(champ) lit la saisie ; changer_texte modifie la page.', 'Les variables du programme restent en mémoire entre deux clics.']::text[], '[{"language":"kplus","title":"Calculatrice du double","code":"utiliser web\n\ntitre(\"Calculatrice du double\")\nvariable saisie = champ(\"Votre nombre\")\nvariable resultat = paragraphe(\"\")\n\nfonction calculer()\n    essayer\n        variable n = decimal(valeur(saisie))\n        changer_texte(resultat, \"Le double est \" + texte(n * 2))\n    attraper\n        changer_texte(resultat, \"Écrivez un nombre, par exemple 3.5\")\n    fin\nfin\n\nbouton(\"Calculer\", calculer)","explanation":"Tapez un nombre dans la page, puis cliquez sur Calculer."}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'kplus') and slug = 'sites-web'), (select id from public.courses where slug = 'kplus'), 'kplus-web-listes', 'Listes dynamiques', 'debutant', 40, array['Ajouter et supprimer des éléments pendant la visite.', 'Réagir au clic sur n''importe quel élément.', 'Tenir un compteur à jour.']::text[], '{}'::text[], '## Ajouter pendant la visite

**ajouter_ligne(liste, t)** renvoie la ligne créée : on peut la garder dans une variable et lui associer une action avec **quand_clic(ligne, fonction)**.

Quand la fonction a **un paramètre**, elle reçoit l''élément cliqué :

~~~kplus
fonction terminer(ligne)
    supprimer(ligne)
fin
~~~

## Retirer

**supprimer(élément)** retire un élément ; **vider(liste)** retire toutes ses lignes.', array['ajouter_ligne renvoie la ligne créée.', 'quand_clic(élément, f) : f peut recevoir l''élément cliqué.', 'supprimer et vider retirent des éléments.']::text[], '[{"language":"kplus","title":"Liste de tâches","code":"utiliser web\n\ntitre(\"Mes tâches\")\nvariable nouvelle = champ(\"Nouvelle tâche\")\nvariable taches = liste()\nvariable compteur = paragraphe(\"0 tâche\")\nvariable nombre = 0\n\nfonction terminer(ligne)\n    supprimer(ligne)\n    nombre = nombre - 1\n    changer_texte(compteur, texte(nombre) + \" tâche(s)\")\nfin\n\nfonction ajouter_tache()\n    si valeur(nouvelle) == \"\" alors\n        retourner\n    fin\n    variable ligne = ajouter_ligne(taches, valeur(nouvelle))\n    quand_clic(ligne, terminer)\n    changer_valeur(nouvelle, \"\")\n    nombre = nombre + 1\n    changer_texte(compteur, texte(nombre) + \" tâche(s)\")\nfin\n\nbouton(\"Ajouter\", ajouter_tache)","explanation":"Ajoutez des tâches, puis cliquez sur une tâche pour la supprimer."}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'kplus') and slug = 'sites-web'), (select id from public.courses where slug = 'kplus'), 'kplus-web-minuteries', 'Mise en forme et minuteries', 'debutant', 40, array['Colorer, regrouper, cacher des éléments.', 'Faire évoluer une page dans le temps avec toutes_les.', 'Arrêter une minuterie.']::text[], '{}'::text[], '## Mettre en forme

- **couleur(élément, c)** et **couleur_fond(élément, c)** : rouge, vert, bleu, jaune, orange, violet, rose, noir, blanc, gris, ou un code #rrggbb ;
- **zone()** crée un cadre et **placer(élément, zone)** y range un élément ;
- **cacher(élément)** et **montrer(élément)**.

## Minuteries

**toutes_les(millisecondes, fonction)** appelle la fonction régulièrement (au moins toutes les 100 ms) et renvoie la minuterie ; **arreter_minuterie(m)** l''arrête. C''est ainsi qu''on fait une horloge, un compte à rebours ou une animation simple.', array['couleur, couleur_fond, zone, placer, cacher, montrer.', 'toutes_les(ms, f) répète f ; arreter_minuterie l''arrête.']::text[], '[{"language":"kplus","title":"Compte à rebours","code":"utiliser web\n\ntitre(\"Compte à rebours\")\nvariable affichage = paragraphe(\"5\")\nvariable reste = 5\nvariable minuterie = nul\n\nfonction tic()\n    reste = reste - 1\n    changer_texte(affichage, texte(reste))\n    si reste == 0 alors\n        arreter_minuterie(minuterie)\n        changer_texte(affichage, \"Décollage !\")\n        couleur(affichage, \"rouge\")\n    fin\nfin\n\nfonction lancer()\n    si minuterie == nul alors\n        minuterie = toutes_les(1000, tic)\n    fin\nfin\n\nbouton(\"Lancer\", lancer)","explanation":"Cliquez sur Lancer : le nombre diminue chaque seconde."}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-web-minuteries'), 'kplus-web-minuteries-quiz', 'Minuteries', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'kplus-web-minuteries-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-web-minuteries-quiz'), 'qcm', 'Quel est l''intervalle minimal de toutes_les ?', null, '["1 ms","10 ms","100 ms","1000 ms"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-web-minuteries-quiz'), 'qcm', 'Que renvoie toutes_les(1000, tic) ?', null, '["rien","la minuterie, pour pouvoir l''arrêter","le nombre de tours","un texte"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'kplus') and m.slug not in ('bases', 'sites-web') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'kplus'), 1, 'Niveau 1 — Très débutant : programmer en français', 'Écrire ses premiers programmes K+ : afficher, variables, calculs, conditions, boucles, fonctions et listes.', array['Écrire et exécuter un programme K+.', 'Utiliser variables, calculs, conditions et boucles.', 'Écrire des fonctions et gérer les erreurs.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'kplus'), null, 'kplus-examen-niveau-1', 'Examen du niveau 1 — Bases de K+', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'kplus-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-examen-niveau-1'), 'qcm', 'Que renvoie demander(…) ?', null, '["un entier","un texte","un décimal","nul"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-examen-niveau-1'), 'qcm', 'Que vaut 7 / 2 en K+ ?', null, '["3","3.5","4","erreur"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-examen-niveau-1'), 'qcm', 'Que vaut 17 % 5 ?', null, '["3","2","3.4","5"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-examen-niveau-1'), 'qcm', 'Quel mot termine un bloc si … alors ?', null, '["finsi","fin","}","end"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-examen-niveau-1'), 'qcm', 'Quelles valeurs prend i dans « pour i de 1 à 4 faire » ?', null, '["1, 2, 3","1, 2, 3, 4","0, 1, 2, 3","1 et 4"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-examen-niveau-1'), 'vrai_faux', 'En K+, "Âge : " + 20 est accepté sans conversion.', null, '["Vrai","Faux"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Il faut écrire texte(20).' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-examen-niveau-1'), 'qcm', 'Quel est l''indice du premier élément d''une liste ?', null, '["0","1","-1","ça dépend"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-examen-niveau-1'), 'qcm', 'Quel bloc attrape une erreur ?', null, '["si … sinon","essayer … attraper","tant que","lever"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'kplus'), 2, 'Niveau 2 — Débutant : sites web dynamiques avec K+', 'Construire des pages web qui réagissent au visiteur : boutons, champs, listes dynamiques, mise en forme et minuteries.', array['Construire une page avec utiliser web.', 'Réagir aux clics et aux saisies du visiteur.', 'Faire évoluer une page dans le temps et la publier.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'kplus'), null, 'kplus-examen-niveau-2', 'Examen du niveau 2 — Sites web dynamiques', false, 70, 'publie', 'examen_niveau', null, 2)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'kplus-examen-niveau-2');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-examen-niveau-2'), 'qcm', 'Quelle ligne active les fonctions de page ?', null, '["importer page","utiliser web","web()","page web"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-examen-niveau-2'), 'qcm', 'Comment associe-t-on la fonction envoyer à un bouton ?', null, '["bouton(\"Envoyer\", envoyer)","bouton(\"Envoyer\", envoyer())","bouton(envoyer)","clic(envoyer)"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-examen-niveau-2'), 'qcm', 'Que renvoie valeur(champ) ?', null, '["un nombre","le texte tapé","l''étiquette","vrai si rempli"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-examen-niveau-2'), 'qcm', 'Quelle fonction remplace le texte d''un paragraphe ?', null, '["changer_valeur","changer_texte","paragraphe","afficher"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-examen-niveau-2'), 'vrai_faux', 'Les variables du programme restent en mémoire entre deux clics.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-examen-niveau-2'), 'qcm', 'Comment arrête-t-on une minuterie m ?', null, '["supprimer(m)","arreter_minuterie(m)","arreter","cacher(m)"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'kplus'), 3, 'Niveau 3 — Intermédiaire : sites côté serveur', 'Sites avec plusieurs pages, formulaires, données enregistrées et comptes utilisateurs, à la manière de PHP (K+ 0.3, en préparation).', array['Créer un site à plusieurs pages.', 'Traiter des formulaires.', 'Enregistrer des données de façon sûre.']::text[], array['Plusieurs pages et adresses (utiliser serveur)', 'Formulaires et paramètres', 'Enregistrer des données dans des tables', 'Comptes, sessions et mots de passe', 'Dictionnaires et modules (K+ 0.4)']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'kplus'), 4, 'Niveau 4 — Professionnel : projets K+', 'Objets, types vérifiés et projet de site complet publié en ligne.', array['Organiser un grand programme K+.', 'Sécuriser un site.', 'Mener un projet de bout en bout.']::text[], array['Objets et classes (K+ 0.5)', 'Types vérifiés (K+ 0.6)', 'Sécurité d''un site web', 'Projet professionnel : site complet publié']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'kplus'), null, 'kplus-positionnement', 'Test de positionnement — K+', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'kplus-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-positionnement'), 'qcm', 'Comment affiche-t-on du texte en K+ ?', null, '["print()","afficher()","echo","ecrire()"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-positionnement'), 'qcm', 'Comment déclare-t-on une variable ?', null, '["var x = 1","variable x = 1","x := 1","let x = 1"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-positionnement'), 'qcm', 'Que fait ajouter_ligne(liste, "Riz") ?', null, '["ajoute Riz à une liste de la page","affiche Riz","crée une variable","rien"]'::jsonb, 2, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-positionnement'), 'qcm', 'Que fait toutes_les(1000, tic) ?', null, '["appelle tic une fois","appelle tic chaque seconde","attend 1000 secondes","arrête tic"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-positionnement'), 'qcm', 'Côté serveur, où doit-on vérifier les données d''un formulaire ?', null, '["seulement dans le navigateur","sur le serveur","nulle part","dans le titre"]'::jsonb, 4, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-positionnement'), 'qcm', 'Comment doit-on enregistrer un mot de passe ?', null, '["en clair","chiffré par une fonction de hachage lente","dans un cookie","dans l''adresse"]'::jsonb, 5, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-positionnement'), 'qcm', 'Pourquoi écrire des tests automatisés ?', null, '["pour vérifier le programme à chaque modification","pour ralentir le site","c''est inutile","pour cacher le code"]'::jsonb, 6, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-positionnement'), 'qcm', 'Qu''est-ce qu''une injection ?', null, '["une donnée du visiteur exécutée comme du code","une fonction rapide","un type de boucle","une image"]'::jsonb, 7, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;

-- ===== Formation complète PHP — du débutant au professionnel =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('php', 'php', (select id from public.course_categories where slug = 'web'), 'Parcours H', 'Formation complète PHP — du débutant au professionnel', 'Le langage serveur qui fait tourner une grande partie du web.', 'PHP génère des pages web dynamiques, traite les formulaires, gère les sessions et dialogue avec les bases de données. Cette formation va des premières lignes (echo, variables, conditions) jusqu''à la programmation orientée objet, PDO, les API JSON, la sécurité et l''architecture professionnelle. Chaque exemple est exécuté par le vrai PHP 8.3 dans votre navigateur.', 'debutant', array['Bases de HTML (parcours HTML, niveau 1).', 'Notions d''algorithmique : variables, conditions, boucles (parcours Algorithmique, niveau 2).']::text[], array['Écrire des pages PHP dynamiques et traiter des formulaires en toute sécurité.', 'Structurer un programme avec des fonctions, des tableaux et des classes.', 'Accéder à une base de données avec PDO et des requêtes préparées.', 'Appliquer les règles de sécurité professionnelles (XSS, injection SQL, mots de passe, sessions).']::text[], 60, 'publie', 9, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'php'), 'php-premiers-pas', 'Premiers pas en PHP', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-premiers-pas'), (select id from public.courses where slug = 'php'), 'php-introduction', 'Qu''est-ce que PHP ? Le fonctionnement côté serveur', 'debutant', 30, array['Expliquer le rôle d''un langage côté serveur.', 'Écrire un premier script avec echo et print.', 'Mélanger HTML et PHP dans une page.']::text[], '{}'::text[], '## PHP, un langage côté serveur

**PHP** (PHP: Hypertext Preprocessor) est un langage de programmation créé en 1994 pour fabriquer des **pages web dynamiques**. Il fait fonctionner WordPress, de nombreux sites d''universités, de boutiques et d''administrations.

Contrairement à JavaScript dans le navigateur, le code PHP s''exécute **sur le serveur** :

1. le navigateur demande une page, par exemple **index.php** ;
2. le serveur web (Apache, Nginx…) confie le fichier à l''**interpréteur PHP** ;
3. PHP exécute le code et **produit du HTML** ;
4. le serveur renvoie ce HTML au navigateur, qui l''affiche.

Le visiteur ne voit **jamais** le code PHP : seulement le résultat. C''est ce qui permet de cacher les mots de passe de la base de données ou les règles de calcul.

## Les balises PHP

Le code PHP se place entre **<?php** et **?>**. Tout ce qui est en dehors est envoyé tel quel au navigateur.

~~~php
<?php
echo "Bonjour UPL !";
~~~

Dans un fichier qui ne contient que du PHP, on **omet** la balise fermante ?> : cela évite d''envoyer par erreur des espaces ou des lignes vides.

## Afficher avec echo et print

- **echo** affiche une ou plusieurs valeurs, séparées par des virgules ;
- **print** affiche une seule valeur (et renvoie 1) ;
- le caractère **\n** passe à la ligne dans la console ; dans une page HTML, on utilise la balise **<br>** ou des paragraphes.

Chaque instruction se termine par un **point-virgule**. L''oublier est l''erreur la plus fréquente : PHP signale alors une **Parse error** avec le numéro de ligne.

## Les commentaires

~~~php
<?php
// commentaire sur une ligne
# autre commentaire sur une ligne
/* commentaire
   sur plusieurs lignes */
~~~

## Mélanger HTML et PHP

On peut ouvrir et fermer PHP au milieu d''une page. La forme courte **<?= expression ?>** affiche directement une valeur :

~~~php
<h1>Bienvenue</h1>
<p>Nous sommes le <?= date("d/m/Y") ?>.</p>
~~~

## Exécuter PHP sur UPL CODE ACADEMY MK

Sur la plateforme, votre code est exécuté par le **vrai PHP 8.3**, compilé en WebAssembly, **dans votre navigateur** : rien n''est envoyé au serveur. Si le programme produit du HTML, l''éditeur affiche aussi l''**aperçu de la page**. En entreprise, on installe PHP sur un serveur (ou localement avec XAMPP, WAMP, Laragon ou la commande **php -S localhost:8000**).', array['PHP s''exécute sur le serveur et renvoie du HTML au navigateur.', 'Le code se place entre <?php et ?> ; chaque instruction finit par un point-virgule.', 'echo et print affichent ; <?= ?> affiche une valeur au milieu du HTML.']::text[], '[{"language":"php","title":"Premier programme","code":"<?php\necho \"Bonjour UPL !\\n\";\necho \"PHP version \", PHP_VERSION, \"\\n\";\nprint \"Bienvenue à l''université\\n\";"},{"language":"php","title":"Une page HTML générée par PHP","code":"<?php $universite = \"UPL\"; ?>\n<!DOCTYPE html>\n<html lang=\"fr\">\n<body>\n  <h1>Bienvenue à l''<?= $universite ?></h1>\n  <p>Page générée le <?= date(\"d/m/Y\") ?> à <?= date(\"H:i\") ?>.</p>\n</body>\n</html>"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-introduction'), 'php-introduction-quiz', 'Vérification — Introduction à PHP', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-introduction-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-introduction-quiz'), 'qcm', 'Où le code PHP est-il exécuté sur un site classique ?', null, '["Dans le navigateur du visiteur","Sur le serveur web","Dans la base de données","Dans le fichier CSS"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-introduction-quiz'), 'vrai_faux', 'Le visiteur d''un site peut lire le code PHP avec « Afficher la source ».', null, '["Vrai","Faux"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Il ne reçoit que le HTML produit par PHP.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-introduction-quiz'), 'qcm', 'Quelle balise ouvre un bloc PHP ?', null, '["<php>","<?php","<script php>","{php}"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-introduction-quiz'), 'qcm', 'Que produit l''oubli d''un point-virgule ?', null, '["Un avertissement ignoré","Une Parse error avec le numéro de ligne","Rien","Une page blanche sans message"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-premiers-pas'), (select id from public.courses where slug = 'php'), 'php-variables-types', 'Variables, types et constantes', 'debutant', 35, array['Déclarer et utiliser des variables.', 'Reconnaître les types de PHP.', 'Définir des constantes.', 'Concaténer et insérer des variables dans une chaîne.']::text[], array['Qu''est-ce que PHP ?']::text[], '## Les variables

Une variable est un **nom associé à une valeur**. En PHP, son nom commence toujours par **$** :

~~~php
<?php
$nom = "Kito";
$age = 21;
~~~

Règles : le nom commence par une lettre ou _, puis lettres, chiffres ou _ ; il est **sensible à la casse** ($age et $Age sont deux variables). Il n''y a pas de déclaration de type : la variable prend le type de la valeur qu''on lui donne (typage **dynamique**).

## Les types

| Type | Exemple | Rôle |
|---|---|---|
| int | 42, -7 | nombres entiers |
| float | 3.14, 12.5 | nombres à virgule |
| string | "UPL", ''Kinshasa'' | texte |
| bool | true, false | vrai ou faux |
| null | null | absence de valeur |
| array | [1, 2, 3] | liste ou tableau associatif |

**var_dump()** affiche le type et la valeur : c''est l''outil de débogage le plus utile. **gettype()** renvoie le nom du type.

## Chaînes : guillemets doubles ou simples

- entre **guillemets doubles**, les variables sont remplacées par leur valeur et **\n** est un retour à la ligne : "Bonjour $nom\n" ;
- entre **apostrophes**, le texte est pris tel quel : ''Bonjour $nom'' affiche littéralement $nom.

Pour coller une variable à du texte, on l''entoure d''accolades : "{$nom}s".

## La concaténation

L''opérateur **.** (point) colle deux chaînes ; **.=** ajoute à la fin d''une variable :

~~~php
<?php
$message = "Bonjour " . $nom;
$message .= " !";
~~~

Attention : en PHP, **+** additionne des nombres, il ne concatène pas.

## Les constantes

Une constante ne change jamais. Son nom s''écrit sans $, en majuscules par convention :

~~~php
<?php
const TAUX_TVA = 0.16;
define("UNIVERSITE", "UPL");
~~~

PHP fournit aussi des constantes prédéfinies : **PHP_VERSION**, **PHP_EOL** (fin de ligne), **PHP_INT_MAX**.

## Conversions

On convertit avec **(int)**, **(float)**, **(string)**, **(bool)** : (int) "25 ans" vaut 25. Les données lues au clavier ou dans un formulaire sont **toujours des chaînes** : il faut les convertir avant de calculer.', array['Une variable commence par $ et prend le type de sa valeur.', 'Guillemets doubles : variables remplacées ; apostrophes : texte brut.', 'Le point concatène ; const et define créent des constantes.', 'Les entrées utilisateur sont des chaînes : on les convertit avant de calculer.']::text[], '[{"language":"php","title":"Types et var_dump","code":"<?php\n$nom = \"Kito\";\n$age = 21;\n$moyenne = 14.5;\n$inscrit = true;\nvar_dump($nom, $age, $moyenne, $inscrit);\necho gettype($moyenne), \"\\n\";"},{"language":"php","title":"Concaténation, interpolation et constantes","code":"<?php\nconst UNIVERSITE = \"UPL\";\n$prenom = \"Grace\";\n$annee = 2;\necho \"Étudiante : \" . $prenom . \"\\n\";\necho \"$prenom est en {$annee}e année à \" . UNIVERSITE . \"\\n\";\necho ''Entre apostrophes : $prenom'', \"\\n\";\n$age = (int) \"19 ans\";\necho \"Dans un an : \", $age + 1, \" ans\\n\";"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-variables-types'), 'php-variables-quiz', 'Vérification — Variables et types', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-variables-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-variables-quiz'), 'qcm', 'Quel nom de variable est valide ?', null, '["$2nom","$nom_etudiant","nom","$nom-etudiant"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-variables-quiz'), 'qcm', 'Qu''affiche echo ''Total : $x''; ?', null, '["Total : suivi de la valeur de $x","Total : $x","Une erreur","Rien"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-variables-quiz'), 'qcm', 'Quel opérateur concatène deux chaînes ?', null, '["+",".","&",","]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-variables-quiz'), 'qcm', 'Que vaut (int) "12abc" ?', null, '["0","12","une erreur","12abc"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-premiers-pas'), (select id from public.courses where slug = 'php'), 'php-operateurs', 'Opérateurs et expressions', 'debutant', 30, array['Calculer avec les opérateurs arithmétiques.', 'Comparer avec == et ===.', 'Combiner des conditions avec les opérateurs logiques.']::text[], array['Variables et types']::text[], '## Opérateurs arithmétiques

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

## L''opérateur ?? (fusion null)

**$a ?? $b** vaut $a s''il existe et n''est pas null, sinon $b. Il est très utilisé avec les formulaires : **$_GET["page"] ?? "accueil"**.

## Arrondir et formater

**round($x, 2)** arrondit à 2 décimales ; **number_format($x, 2, ",", " ")** affiche 1 234,50 ; **sprintf("%.1f", $x)** formate avec une décimale.', array['/ donne un résultat exact ; % le reste ; intdiv le quotient entier.', '=== compare valeur et type : à préférer à ==.', '&&, || et ! combinent des conditions ; ?? donne une valeur par défaut.']::text[], '[{"language":"php","title":"Calculs et comparaisons","code":"<?php\n$a = 17;\n$b = 5;\necho \"Somme : \", $a + $b, \"\\n\";\necho \"Division : \", $a / $b, \"\\n\";\necho \"Quotient entier : \", intdiv($a, $b), \"\\n\";\necho \"Reste : \", $a % $b, \"\\n\";\necho \"Puissance : \", 2 ** 8, \"\\n\";\nvar_dump(\"5\" == 5, \"5\" === 5);\necho \"Moyenne : \", number_format(13.456, 2, \",\", \" \"), \"\\n\";"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-operateurs'), 'php-operateurs-quiz', 'Vérification — Opérateurs', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-operateurs-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-operateurs-quiz'), 'qcm', 'Que vaut 17 % 5 ?', null, '["3","2","3.4","12"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-operateurs-quiz'), 'qcm', 'Que vaut 7 / 2 en PHP ?', null, '["3","3.5","4","une erreur"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-operateurs-quiz'), 'qcm', '"10" === 10 vaut…', null, '["true","false"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-operateurs-quiz'), 'qcm', 'Que vaut $x ?? "défaut" si $x n''existe pas ?', null, '["null","une erreur","\"défaut\"","false"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-premiers-pas'), (select id from public.courses where slug = 'php'), 'php-conditions-simples', 'Premières conditions et page dynamique', 'debutant', 35, array['Écrire if / else.', 'Utiliser l''opérateur ternaire.', 'Construire une page personnalisée selon des données.']::text[], array['Opérateurs et expressions']::text[], '## if et else

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

## L''opérateur ternaire

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

On combine variables, conditions et HTML : la page salue l''étudiant selon l''heure, affiche sa filière et un message adapté à sa moyenne. C''est le principe de toute page dynamique : **les mêmes fichiers produisent un affichage différent selon les données**.', array['if / else choisit entre deux blocs ; les accolades sont recommandées.', 'Le ternaire choisit une valeur en une ligne.', 'La syntaxe if: … endif; rend les pages HTML lisibles.']::text[], '[{"language":"php","title":"Page personnalisée","code":"<?php\n$prenom = \"Grace\";\n$filiere = \"Informatique\";\n$moyenne = 15.5;\n$heure = 9;\n$salutation = $heure < 12 ? \"Bonjour\" : \"Bonsoir\";\n?>\n<h1><?= $salutation ?>, <?= htmlspecialchars($prenom) ?> !</h1>\n<p>Filière : <?= htmlspecialchars($filiere) ?></p>\n<?php if ($moyenne >= 14): ?>\n  <p>Excellent travail : mention Bien.</p>\n<?php elseif ($moyenne >= 10): ?>\n  <p>Vous êtes admise.</p>\n<?php else: ?>\n  <p>Courage pour la session de rattrapage.</p>\n<?php endif; ?>"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-conditions-simples'), 'php-conditions-simples-quiz', 'Vérification — Conditions', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-conditions-simples-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-conditions-simples-quiz'), 'qcm', 'Que vaut $x = 8 >= 10 ? "A" : "B"; ?', null, '["A","B","true","false"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-conditions-simples-quiz'), 'qcm', 'Laquelle de ces valeurs est considérée comme vraie ?', null, '["0","\"\"","\"0\"","\"non\""]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[3]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-conditions-simples-quiz'), 'vrai_faux', 'La condition d''un if s''écrit entre parenthèses.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'php'), 'php-controle-donnees', 'Structures de contrôle, tableaux et fonctions', null, 2, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-controle-donnees'), (select id from public.courses where slug = 'php'), 'php-conditions-switch-match', 'if / elseif, switch et match', 'debutant', 30, array['Enchaîner plusieurs cas avec elseif.', 'Utiliser switch.', 'Utiliser l''expression match de PHP 8.']::text[], array['Premières conditions']::text[], '## elseif

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

Les conditions sont testées **dans l''ordre** : la première vraie l''emporte. Placez donc les cas les plus restrictifs en premier.

## switch

**switch** compare une valeur à une liste de cas. N''oubliez pas **break**, sinon l''exécution continue dans le cas suivant :

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

**match** est une expression : elle **renvoie** une valeur, compare avec **===**, n''a pas besoin de break et lève une erreur si aucun cas ne correspond (sauf default).

~~~php
<?php
$libelle = match ($code) {
    "INF" => "Informatique",
    "DRT" => "Droit",
    "ECO", "GES" => "Économie et gestion",
    default => "Filière inconnue",
};
~~~

Avec **match (true)**, chaque branche peut être une condition : c''est une autre façon d''écrire le calcul d''une mention.', array['elseif enchaîne les cas, testés dans l''ordre.', 'switch exige break à la fin de chaque cas.', 'match renvoie une valeur, compare avec === et n''a pas besoin de break.']::text[], '[{"language":"php","title":"Mention avec match (true)","code":"<?php\nforeach ([17, 13, 9] as $note) {\n    $mention = match (true) {\n        $note >= 16 => \"Très bien\",\n        $note >= 14 => \"Bien\",\n        $note >= 12 => \"Assez bien\",\n        $note >= 10 => \"Passable\",\n        default => \"Ajourné\",\n    };\n    echo \"$note/20 : $mention\\n\";\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-conditions-switch-match'), 'php-switch-match-quiz', 'Vérification — elseif, switch et match', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-switch-match-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-switch-match-quiz'), 'qcm', 'Que se passe-t-il si on oublie break dans un switch ?', null, '["Erreur de syntaxe","L''exécution continue dans le cas suivant","Rien","Le switch recommence"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-switch-match-quiz'), 'qcm', 'Quelle comparaison utilise match ?', null, '["==","===","<=>","aucune"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-switch-match-quiz'), 'vrai_faux', 'match peut renvoyer une valeur directement dans une variable.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-controle-donnees'), (select id from public.courses where slug = 'php'), 'php-boucles', 'Les boucles : while, for et foreach', 'debutant', 35, array['Répéter des instructions avec while, do…while et for.', 'Parcourir un tableau avec foreach.', 'Contrôler une boucle avec break et continue.']::text[], array['if / elseif, switch et match']::text[], '## while

Répète tant que la condition est vraie. La condition est testée **avant** chaque tour :

~~~php
<?php
$i = 1;
while ($i <= 5) {
    echo $i, " ";
    $i++;
}
~~~

Oublier **$i++** crée une **boucle infinie** : sur la plateforme, l''exécution est arrêtée au bout de 10 secondes.

## do … while

Le corps s''exécute **au moins une fois**, la condition est testée après.

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

Une boucle permet de produire une liste ou un tableau HTML à partir de données : c''est ainsi qu''un site affiche la liste des étudiants, des produits ou des articles.', array['while teste avant, do…while après (au moins un tour).', 'for convient quand le nombre de tours est connu.', 'foreach parcourt un tableau, avec ou sans les clés.']::text[], '[{"language":"php","title":"Table de multiplication et liste HTML","code":"<?php\nfor ($i = 1; $i <= 5; $i++) {\n    echo \"3 x $i = \", 3 * $i, \"\\n\";\n}\n$filieres = [\"Informatique\", \"Droit\", \"Médecine\"];\necho \"<ul>\\n\";\nforeach ($filieres as $f) {\n    echo \"  <li>\", htmlspecialchars($f), \"</li>\\n\";\n}\necho \"</ul>\\n\";"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-boucles'), 'php-boucles-quiz', 'Vérification — Boucles', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-boucles-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-boucles-quiz'), 'qcm', 'Combien de tours fait for ($i = 0; $i < 5; $i++) ?', null, '["4","5","6","infini"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-boucles-quiz'), 'qcm', 'Quelle boucle s''exécute au moins une fois ?', null, '["while","for","do … while","foreach"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-boucles-quiz'), 'qcm', 'Que fait continue ?', null, '["Sort de la boucle","Passe au tour suivant","Recommence au premier tour","Arrête le script"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-controle-donnees'), (select id from public.courses where slug = 'php'), 'php-tableaux', 'Tableaux simples et associatifs', 'debutant', 40, array['Créer et modifier un tableau indexé.', 'Utiliser un tableau associatif clé ⇒ valeur.', 'Employer les fonctions de tableaux courantes.']::text[], array['Les boucles']::text[], '## Tableaux indexés

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

Une liste d''étudiants est un tableau de tableaux associatifs — exactement ce que renvoie une base de données :

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
| count($t) | nombre d''éléments |
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

**print_r($t)** affiche la structure lisiblement ; **var_dump($t)** donne en plus les types.', array['Les indices commencent à 0 ; $t[] = … ajoute à la fin.', 'Un tableau associatif range les valeurs sous des clés.', 'count, in_array, sort, implode et explode sont à connaître.']::text[], '[{"language":"php","title":"Notes d''un étudiant","code":"<?php\n$notes = [\"Algorithmique\" => 15, \"Mathématiques\" => 11, \"Anglais\" => 13];\nforeach ($notes as $matiere => $note) {\n    echo str_pad($matiere, 15), \" : $note\\n\";\n}\n$moyenne = array_sum($notes) / count($notes);\necho \"Moyenne : \", round($moyenne, 2), \"\\n\";\narsort($notes);\necho \"Meilleure matière : \", array_key_first($notes), \"\\n\";\necho \"Liste : \", implode(\", \", array_keys($notes)), \"\\n\";"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-tableaux'), 'php-tableaux-quiz', 'Vérification — Tableaux', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-tableaux-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-tableaux-quiz'), 'qcm', 'Avec $t = [4, 8, 15], que vaut $t[1] ?', null, '["4","8","15","erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-tableaux-quiz'), 'qcm', 'Quelle fonction donne le nombre d''éléments ?', null, '["length()","size()","count()","len()"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-tableaux-quiz'), 'qcm', 'Que renvoie explode(",", "a,b,c") ?', null, '["\"abc\"","[\"a\", \"b\", \"c\"]","3","\"a b c\""]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-controle-donnees'), (select id from public.courses where slug = 'php'), 'php-fonctions-chaines-dates', 'Fonctions, chaînes de caractères et dates', 'debutant', 45, array['Écrire des fonctions typées avec paramètres et valeur de retour.', 'Manipuler les chaînes avec les fonctions natives.', 'Afficher et calculer des dates.']::text[], array['Tableaux simples et associatifs']::text[], '## Déclarer une fonction

~~~php
<?php
function moyenne(array $notes): float
{
    return array_sum($notes) / count($notes);
}
echo moyenne([12, 14, 16]); // 14
~~~

- les **paramètres** reçoivent les valeurs passées à l''appel ;
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

Une variable créée dans une fonction est **locale** : elle n''existe pas à l''extérieur, et la fonction ne voit pas les variables extérieures. On transmet les données par **paramètres**, pas par variables globales.

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
~~~', array['function nom(type $param): typeRetour { … return … }', 'Les variables d''une fonction sont locales ; on passe les données en paramètres.', 'strlen, strtoupper, str_replace, substr, trim, sprintf manipulent les chaînes.', 'date() formate ; DateTime calcule des écarts et des décalages.']::text[], '[{"language":"php","title":"Fonctions et chaînes","code":"<?php\ndeclare(strict_types=1);\n\nfunction initiales(string $nomComplet): string\n{\n    $mots = explode(\" \", trim($nomComplet));\n    $lettres = array_map(fn(string $m): string => strtoupper(substr($m, 0, 1)), $mots);\n    return implode(\".\", $lettres) . \".\";\n}\n\nfunction mention(float $moyenne): string\n{\n    return match (true) {\n        $moyenne >= 14 => \"Bien\",\n        $moyenne >= 10 => \"Passable\",\n        default => \"Ajourné\",\n    };\n}\n\necho initiales(\"jean paul kabila\"), \"\\n\";\necho mention(15.2), \"\\n\";\necho sprintf(\"Moyenne : %.2f/20\", 13.456), \"\\n\";"},{"language":"php","title":"Calculer avec des dates","code":"<?php\n$rentree = new DateTime(\"2026-10-05\");\n$examens = new DateTime(\"2027-01-18\");\n$jours = $rentree->diff($examens)->days;\necho \"Rentrée : \", $rentree->format(\"d/m/Y\"), \"\\n\";\necho \"Il reste $jours jours avant les examens.\\n\";\n$rentree->modify(\"+7 days\");\necho \"Une semaine après la rentrée : \", $rentree->format(\"l d/m/Y\"), \"\\n\";"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-fonctions-chaines-dates'), 'php-fonctions-quiz', 'Vérification — Fonctions', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-fonctions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-fonctions-quiz'), 'qcm', 'Que renvoie une fonction sans return ?', null, '["0","false","null","une erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-fonctions-quiz'), 'qcm', 'Une variable créée dans une fonction est…', null, '["globale","locale à la fonction","constante","partagée"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-fonctions-quiz'), 'qcm', 'Que vaut substr("Kinshasa", 0, 3) ?', null, '["Kin","Kins","asa","Kinshasa"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-fonctions-quiz'), 'qcm', 'Que vaut ucfirst("upl") ?', null, '["UPL","Upl","upL","upl"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'php'), 'php-web', 'PHP et le web : formulaires et sessions', null, 3, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-web'), (select id from public.courses where slug = 'php'), 'php-formulaires', 'Formulaires GET et POST, validation et sécurité', 'debutant', 45, array['Recevoir des données avec $_GET et $_POST.', 'Valider et nettoyer les entrées.', 'Protéger l''affichage contre le XSS avec htmlspecialchars.']::text[], array['Fonctions, chaînes et dates', 'Formulaires HTML (parcours HTML)']::text[], '## Le cycle d''un formulaire

~~~html
<form method="post" action="inscription.php">
  <input name="nom">
  <input name="age" type="number">
  <button>Envoyer</button>
</form>
~~~

À l''envoi, le navigateur transmet les champs au fichier **action**. PHP les range dans des **tableaux superglobaux** :

- **$_GET** : données dans l''adresse (inscription.php?nom=Kito) — pour rechercher, filtrer, paginer ;
- **$_POST** : données dans le corps de la requête — pour créer, modifier, se connecter ;
- **$_SERVER["REQUEST_METHOD"]** indique la méthode utilisée.

## Ne jamais faire confiance aux données reçues

Un utilisateur peut envoyer **n''importe quoi** : champ vide, texte au lieu d''un nombre, code HTML ou JavaScript. Trois règles :

1. **vérifier la présence** : $_POST["nom"] ?? "" ;
2. **valider** : longueur, format, plage de valeurs ; **filter_var($email, FILTER_VALIDATE_EMAIL)**, **filter_var($age, FILTER_VALIDATE_INT, ["options" => ["min_range" => 15]])** ;
3. **échapper à l''affichage** : **htmlspecialchars($texte)** transforme < > " '' & en entités HTML. Sans cela, un visiteur peut injecter un script dans votre page : c''est la faille **XSS**.

## Collecter les erreurs

On accumule les messages d''erreur dans un tableau ; si le tableau est vide, le formulaire est valide :

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

Dans l''éditeur, il n''y a pas de vrai navigateur qui envoie le formulaire : les exemples **simulent** les données reçues en remplissant $_POST au début du script. Sur un vrai serveur, PHP remplit ces tableaux tout seul. Dans UPL IDE, les paramètres d''adresse peuvent aussi être fournis à $_GET.', array['$_GET lit l''adresse, $_POST le corps de la requête.', 'Toujours vérifier, valider (filter_var) puis échapper (htmlspecialchars).', 'Après un POST réussi : redirection avec header("Location: …").']::text[], '[{"language":"php","title":"Validation d''un formulaire d''inscription","code":"<?php\n// Simulation des données envoyées par le formulaire (sur un vrai serveur, PHP les remplit).\n$_POST = [\"nom\" => \"  Kito  \", \"email\" => \"kito@exemple\", \"age\" => \"17\", \"commentaire\" => \"<script>alert(1)</script>\"];\n\n$nom = trim($_POST[\"nom\"] ?? \"\");\n$email = trim($_POST[\"email\"] ?? \"\");\n$age = filter_var($_POST[\"age\"] ?? \"\", FILTER_VALIDATE_INT, [\"options\" => [\"min_range\" => 18, \"max_range\" => 99]]);\n$erreurs = [];\nif ($nom === \"\") {\n    $erreurs[] = \"Le nom est obligatoire.\";\n}\nif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {\n    $erreurs[] = \"Adresse e-mail invalide.\";\n}\nif ($age === false) {\n    $erreurs[] = \"L''âge doit être un entier entre 18 et 99.\";\n}\nforeach ($erreurs as $e) {\n    echo \"Erreur : $e\\n\";\n}\necho \"Commentaire affiché sans danger : \", htmlspecialchars($_POST[\"commentaire\"]), \"\\n\";"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-formulaires'), 'php-formulaires-quiz', 'Vérification — Formulaires', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-formulaires-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-formulaires-quiz'), 'qcm', 'Quelle méthode utiliser pour envoyer un mot de passe ?', null, '["GET","POST"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-formulaires-quiz'), 'qcm', 'Quelle fonction protège l''affichage contre le XSS ?', null, '["trim","htmlspecialchars","strip","addslashes"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-formulaires-quiz'), 'vrai_faux', 'Un champ number du navigateur garantit que $_POST contient un nombre.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Les données peuvent être modifiées avant l''envoi : on valide toujours côté serveur.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-formulaires-quiz'), 'qcm', 'Que renvoie filter_var("abc", FILTER_VALIDATE_INT) ?', null, '["0","false","null","\"abc\""]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-web'), (select id from public.courses where slug = 'php'), 'php-sessions-cookies-include', 'Sessions, cookies, include et gestion des erreurs', 'debutant', 40, array['Conserver des informations entre les pages avec les sessions.', 'Utiliser les cookies à bon escient.', 'Découper un site en fichiers avec include et require.', 'Lire et corriger les messages d''erreur de PHP.']::text[], array['Formulaires GET et POST']::text[], '## Pourquoi les sessions ?

HTTP « oublie » tout entre deux pages. Pour qu''un étudiant reste connecté, PHP crée une **session** : un identifiant aléatoire est stocké dans un cookie du navigateur, et les données restent **sur le serveur**.

~~~php
<?php
session_start();                 // au tout début, avant tout affichage
$_SESSION["utilisateur"] = "Kito";
echo $_SESSION["utilisateur"] ?? "invité";
~~~

Pour se déconnecter : **session_destroy()** (et vider $_SESSION). Après une connexion réussie, appelez **session_regenerate_id(true)** pour changer l''identifiant (protection contre la fixation de session).

## Les cookies

Un cookie est un petit texte stocké **dans le navigateur** : **setcookie("theme", "sombre", ["expires" => time() + 86400, "httponly" => true, "samesite" => "Lax"])**. On le relit avec **$_COOKIE["theme"]**. Ne stockez jamais d''information sensible dans un cookie : l''utilisateur peut le lire et le modifier.

## Découper avec include et require

Un site réel répète l''en-tête, le menu et le pied de page sur chaque page. On les place dans des fichiers séparés :

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
| Fatal error | erreur grave pendant l''exécution (fonction inconnue, division par zéro) — le script s''arrête |
| Warning | problème non bloquant (fichier introuvable avec include) |
| Notice / Deprecated | variable inconnue, fonction dépréciée |

Le message donne toujours le **fichier** et la **ligne** : commencez par lire la ligne indiquée et celle d''avant. En production, on n''affiche pas les erreurs aux visiteurs (**display_errors = Off**) : on les écrit dans un journal.

## Sur la plateforme

Chaque exécution est une **nouvelle requête** : les sessions et cookies ne sont donc pas conservés d''une exécution à l''autre dans l''éditeur. Les exemples montrent le fonctionnement à l''intérieur d''une seule exécution.', array['session_start() puis $_SESSION conserve des données côté serveur.', 'Les cookies sont stockés dans le navigateur : jamais de données sensibles.', 'require (indispensable), include (facultatif), *_once (une seule fois).', 'Parse error = syntaxe ; Fatal error = exécution ; lire la ligne indiquée.']::text[], '[{"language":"php","title":"Panier en session (une requête)","code":"<?php\nsession_start();\n$_SESSION[\"panier\"] ??= [];\n$_SESSION[\"panier\"][] = [\"article\" => \"Cahier\", \"prix\" => 1500];\n$_SESSION[\"panier\"][] = [\"article\" => \"Stylo\", \"prix\" => 500];\n$total = array_sum(array_column($_SESSION[\"panier\"], \"prix\"));\necho count($_SESSION[\"panier\"]), \" articles, total : $total FC\\n\";"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-sessions-cookies-include'), 'php-sessions-quiz', 'Vérification — Sessions et include', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-sessions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-sessions-quiz'), 'qcm', 'Où sont stockées les données de $_SESSION ?', null, '["Dans le navigateur","Sur le serveur","Dans l''adresse","Dans le HTML"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-sessions-quiz'), 'qcm', 'Quelle instruction arrête le script si le fichier est absent ?', null, '["include","require","import","use"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-sessions-quiz'), 'qcm', 'Quand appeler session_start() ?', null, '["À la fin du script","Avant tout affichage","Seulement à la déconnexion","Jamais"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'php'), 'php-objet', 'Programmation orientée objet', null, 4, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-objet'), (select id from public.courses where slug = 'php'), 'php-classes-objets', 'Classes, objets, constructeurs et encapsulation', 'intermediaire', 45, array['Définir une classe avec propriétés et méthodes.', 'Créer des objets avec un constructeur.', 'Protéger les données avec private et des méthodes d''accès.']::text[], array['Fonctions (niveau 2)']::text[], '## Classe et objet

Une **classe** est un modèle (le plan d''une maison) ; un **objet** est un exemplaire construit à partir de ce modèle. La classe regroupe des **propriétés** (données) et des **méthodes** (fonctions qui agissent sur ces données).

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

**$this** désigne l''objet courant ; **->** accède à une propriété ou appelle une méthode.

## Le constructeur

**__construct** s''exécute à la création de l''objet. Depuis PHP 8, la **promotion des propriétés** déclare et remplit les propriétés directement dans les paramètres :

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

On rend les propriétés **private** et on expose des **méthodes** qui contrôlent les modifications : une note doit rester entre 0 et 20, un solde ne peut pas devenir négatif. L''objet garantit ainsi sa propre cohérence.

## Membres statiques et constantes de classe

Une propriété **static** appartient à la classe (compteur d''objets créés) ; on y accède avec **self::$compteur** ou **NomClasse::$compteur**. Les constantes de classe s''écrivent **const NOTE_MAX = 20;**.

## Propriétés en lecture seule

**readonly** (PHP 8.1) interdit de modifier une propriété après la construction : idéal pour un matricule.', array['Une classe décrit, un objet existe (new).', 'Le constructeur initialise l''objet ; la promotion évite la répétition.', 'private + méthodes de contrôle = encapsulation.']::text[], '[{"language":"php","title":"Classe Etudiant encapsulée","code":"<?php\ndeclare(strict_types=1);\n\nclass Etudiant\n{\n    public const NOTE_MAX = 20;\n    private array $notes = [];\n\n    public function __construct(public readonly string $matricule, private string $nom) {}\n\n    public function ajouterNote(float $note): void\n    {\n        if ($note < 0 || $note > self::NOTE_MAX) {\n            throw new InvalidArgumentException(\"Note invalide : $note\");\n        }\n        $this->notes[] = $note;\n    }\n\n    public function moyenne(): float\n    {\n        return $this->notes ? array_sum($this->notes) / count($this->notes) : 0.0;\n    }\n\n    public function getNom(): string\n    {\n        return $this->nom;\n    }\n}\n\n$e = new Etudiant(\"UPL-2026-001\", \"Kito\");\n$e->ajouterNote(14);\n$e->ajouterNote(17);\necho $e->getNom(), \" (\", $e->matricule, \") : \", $e->moyenne(), \"/20\\n\";\ntry {\n    $e->ajouterNote(25);\n} catch (InvalidArgumentException $ex) {\n    echo \"Refusé : \", $ex->getMessage(), \"\\n\";\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-classes-objets'), 'php-classes-quiz', 'Vérification — Classes et objets', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-classes-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-classes-quiz'), 'qcm', 'Que désigne $this dans une méthode ?', null, '["La classe","L''objet courant","La classe mère","Le fichier"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-classes-quiz'), 'qcm', 'Quelle visibilité limite l''accès à la classe elle-même ?', null, '["public","protected","private","static"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-classes-quiz'), 'qcm', 'Quand s''exécute __construct ?', null, '["À la destruction","À la création avec new","À chaque appel de méthode","Jamais automatiquement"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
commit;
