-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 4 sur 10.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'À quoi sert l''attribut aria-label ?', null, '["à styliser","à donner un nom accessible","à valider un champ","à créer un lien"]'::jsonb, 6, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'Quel élément propose plusieurs sources d''image selon l''écran ?', null, '["<figure>","<picture>","<canvas>","<source> seul"]'::jsonb, 7, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'vrai_faux', 'Un bouton créé avec <div onclick> est aussi accessible au clavier qu''un <button>.', null, '["Vrai","Faux"]'::jsonb, 8, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'Quel outil audite performances et accessibilité d''une page ?', null, '["Lighthouse","Git","npm","Babel"]'::jsonb, 9, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'Quel attribut retarde le chargement d''une image hors écran ?', null, '["defer","loading=\"lazy\"","async","preload"]'::jsonb, 10, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'html-positionnement'), 'qcm', 'Quelle balise déclare l''URL canonique d''une page ?', null, '["<meta name=\"canonical\">","<link rel=\"canonical\">","<base>","<a rel=\"canonical\">"]'::jsonb, 11, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== CSS =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('css', 'css', (select id from public.course_categories where slug = 'web'), 'Parcours CSS', 'CSS', 'Mettre en forme et mettre en page le web.', 'CSS (Cascading Style Sheets) décrit l''apparence des pages HTML : couleurs, typographie, espacements, mise en page, adaptation aux téléphones, animations. Ce parcours part des règles de base et mène jusqu''aux mises en page professionnelles et à l''architecture des feuilles de style.', 'debutant', array['Parcours HTML, niveau 1.']::text[], array['Écrire des règles CSS et cibler précisément les éléments.', 'Maîtriser couleurs, typographie et modèle de boîte.', 'Construire des mises en page adaptées à tous les écrans.', 'Organiser des feuilles de style maintenables.']::text[], 30, 'publie', 3, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'css'), 'fondamentaux-css', 'Fondamentaux du CSS', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'css') and slug = 'fondamentaux-css'), (select id from public.courses where slug = 'css'), 'css-introduction-selecteurs', 'Introduction au CSS et sélecteurs', 'debutant', 90, array['Expliquer le rôle du CSS et la séparation contenu / présentation.', 'Écrire une règle CSS : sélecteur, propriété, valeur.', 'Relier une feuille de style à une page.', 'Cibler des éléments par type, par classe et par identifiant.']::text[], array['Parcours HTML — chapitres 1 à 3.']::text[], '## 1. Séparer le contenu et la présentation

HTML dit **ce qu''est** le contenu (un titre, une liste) ; CSS dit **à quoi il ressemble** (bleu, centré, en gros caractères). Cette séparation a trois avantages :

- une seule feuille de style peut habiller **tout un site** : changer une couleur se fait en une ligne ;
- le HTML reste lisible et sémantique ;
- on peut proposer plusieurs présentations du même contenu (écran, téléphone, impression).

## 2. Anatomie d''une règle

~~~css
h1 {
  color: navy;
  text-align: center;
}
~~~

- **h1** est le **sélecteur** : il désigne les éléments concernés.
- Entre accolades se trouvent les **déclarations**, chacune sous la forme **propriété: valeur;**.
- **color** est une **propriété**, **navy** sa **valeur**. Chaque déclaration se termine par un **point-virgule**.

Les commentaires CSS s''écrivent **/* ainsi */**.

## 3. Relier le CSS au HTML

La méthode recommandée est une **feuille de style externe**, fichier **style.css**, reliée dans **head** :

~~~html
<link rel="stylesheet" href="style.css">
~~~

Deux autres possibilités existent : un élément **style** dans head (pratique pour un essai), et l''attribut **style** sur un élément (à éviter : il mélange contenu et présentation). Dans UPL IDE, les projets web contiennent déjà **index.html** et **style.css** reliés.

## 4. Les sélecteurs de base

| Sélecteur | Exemple | Cible |
|---|---|---|
| type | p | tous les paragraphes |
| classe | .important | tous les éléments ayant class="important" |
| identifiant | #menu | l''unique élément ayant id="menu" |
| descendant | nav a | les liens situés dans un nav |
| groupe | h1, h2 | les h1 et les h2 |
| universel | * | tous les éléments |

Une **classe** peut être utilisée sur plusieurs éléments, et un élément peut avoir plusieurs classes : **class="carte vedette"**. Un **identifiant** est unique dans la page. En pratique, on stylise surtout avec des **classes**, réutilisables.

## 5. La cascade et la spécificité

Quand plusieurs règles s''appliquent à un même élément et se contredisent, le navigateur choisit :

1. la règle la plus **spécifique** : un identifiant l''emporte sur une classe, qui l''emporte sur un type ;
2. à spécificité égale, la règle écrite **en dernier**.

~~~css
p { color: black; }
.alerte { color: red; }   /* un <p class="alerte"> sera rouge */
~~~

## 6. L''héritage

Certaines propriétés, comme **color** et **font-family**, sont **héritées** : définies sur body, elles s''appliquent à tous les éléments qu''il contient, sauf s''ils en redéfinissent une autre valeur. D''autres, comme **border** ou **margin**, ne le sont pas.

## 7. Les outils de développement

Ouvrez les outils du navigateur (**F12**), puis sélectionnez un élément dans l''onglet **Éléments**. Le panneau **Styles** affiche :
- toutes les règles qui s''appliquent à cet élément, de la plus spécifique à la moins spécifique ;
- les déclarations **barrées**, qui ont perdu la cascade ;
- le fichier et la ligne d''où vient chaque règle.

C''est l''outil indispensable pour comprendre pourquoi une règle « ne marche pas ». Dans la grande majorité des cas, c''est l''une de ces trois raisons :
- le sélecteur ne cible pas l''élément voulu ;
- une règle plus spécifique l''emporte ;
- la propriété est mal orthographiée et donc ignorée.', array['HTML structure le contenu, CSS le présente.', 'Une règle = sélecteur { propriété: valeur; }.', 'On relie une feuille externe avec <link rel="stylesheet" href="style.css">.', 'Sélecteurs : type (p), classe (.nom), identifiant (#nom), descendant (nav a), groupe (h1, h2).', 'En cas de conflit : la règle la plus spécifique, puis la dernière écrite.']::text[], '[{"language":"css","title":"Sélecteurs de type, de classe et d''identifiant","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Sélecteurs</title>\n  <style>\n    body { font-family: Arial, sans-serif; }\n    h1 { color: navy; }\n    .important { color: red; font-weight: bold; }\n    #pied { color: gray; }\n  </style>\n</head>\n<body>\n  <h1>Annonces du club</h1>\n  <p>Réunion vendredi à 14 h.</p>\n  <p class=\"important\">Inscription obligatoire avant jeudi.</p>\n  <p id=\"pied\">Club informatique de l''UPL</p>\n</body>\n</html>","explanation":"Dans un vrai projet, les règles seraient dans style.css."}]'::jsonb, '{"competences":["Écrire des règles CSS","Relier une feuille de style","Choisir le bon sélecteur","Prévoir le résultat de la cascade"],"definitions":[{"term":"Règle CSS","definition":"Association d''un sélecteur et d''un bloc de déclarations."},{"term":"Sélecteur","definition":"Motif qui désigne les éléments auxquels s''appliquent les déclarations."},{"term":"Déclaration","definition":"Couple **propriété: valeur;** qui fixe une caractéristique d''affichage."},{"term":"Classe","definition":"Attribut class réutilisable sur plusieurs éléments, ciblé en CSS par **.nom**."},{"term":"Spécificité","definition":"Poids d''un sélecteur qui départage les règles en conflit (identifiant > classe > type)."}],"commentedAlgorithms":[{"title":"Une feuille de style commentée","code":"<style>\n  body {\n    font-family: Georgia, serif;\n  }\n  .carte {\n    border: 2px solid #1d5fe0;\n    padding: 12px;\n  }\n  #titre {\n    color: #0a1a3a;\n  }\n</style>\n<h1 id=\"titre\">Nos formations</h1>\n<p class=\"carte\">Algorithmique</p>\n<p class=\"carte\">Python</p>","comments":{"1":"Dans un projet réel, ce contenu irait dans style.css.","2":"Sélecteur de type : l''élément body.","3":"Police héritée par tous les éléments de la page.","5":"Sélecteur de classe : tous les éléments class=\"carte\".","6":"Bordure de 2 pixels, pleine, bleue.","7":"Espace intérieur entre la bordure et le texte.","9":"Sélecteur d''identifiant : l''élément unique id=\"titre\".","10":"Couleur du texte, en hexadécimal.","14":"Même classe sur deux éléments : même style."},"language":"css","showPreview":true}],"commonErrors":[{"title":"Oublier le point d''une classe","wrong":"important { color: red; }","right":".important { color: red; }","explanation":"Sans le point, le sélecteur cherche un élément nommé « important », qui n''existe pas en HTML.","run":false},{"title":"Oublier un point-virgule","wrong":"h1 {\n  color: navy\n  font-size: 32px;\n}","right":"h1 {\n  color: navy;\n  font-size: 32px;\n}","explanation":"Sans point-virgule, « navy font-size: 32px » est lu comme une seule valeur invalide : les deux déclarations sont ignorées.","run":false}],"solvedExercises":[{"title":"Prévoir la couleur","statement":"Avec p { color: black; } puis .note { color: green; } puis #n1 { color: blue; }, de quelle couleur est `<p class=\"note\" id=\"n1\">` ?","solution":"Bleu.","explanation":"L''identifiant est plus spécifique que la classe, elle-même plus spécifique que le type."},{"title":"Écrire des sélecteurs","statement":"Écrivez le sélecteur qui cible : (a) tous les liens du menu nav, (b) les h2 et h3, (c) les éléments de classe prix.","solution":"(a) nav a\n(b) h2, h3\n(c) .prix","explanation":"Espace = descendant ; virgule = groupe ; point = classe."}],"td":{"title":"TD 1 — Sélecteurs et règles","instructions":"Écrivez vos règles dans style.css ; la page index.html est déjà reliée. La correction lit vos règles CSS.","exerciseSlugs":["css-classe-alerte","css-menu-liens"]},"project":{"title":"Habiller la page d''annonces","context":"Donner une identité visuelle cohérente à la page d''annonces du club.","steps":["Choisir une police pour toute la page.","Colorer le titre principal.","Retirer le soulignement des liens du menu.","Mettre en évidence les alertes, puis soumettre."],"deliverables":["Une feuille style.css validée par les tests."],"exerciseSlug":"css-projet-annonce"}}'::jsonb, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-introduction-selecteurs'), 'css-introduction-interrogation', 'Interrogation — Sélecteurs', false, 60, 'publie', 'interrogation', 8, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-introduction-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-interrogation'), 'qcm', 'Quel sélecteur cible class="prix" ?', null, '["prix","#prix",".prix","*prix"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-interrogation'), 'qcm', 'Quel sélecteur cible id="menu" ?', null, '[".menu","#menu","menu","@menu"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-interrogation'), 'qcm', 'Quelle règle l''emporte à spécificité égale ?', null, '["la première écrite","la dernière écrite","la plus courte","aucune"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-interrogation'), 'vrai_faux', 'La propriété color est héritée par les éléments enfants.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-introduction-selecteurs'), 'css-introduction-evaluation', 'Évaluation — Introduction au CSS', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-introduction-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-evaluation'), 'qcm', 'Dans h1 { color: navy; }, quelle est la propriété ?', null, '["h1","color","navy","{ }"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-evaluation'), 'qcm', 'Comment relier style.css à une page ?', null, '["<style src=\"style.css\">","<link rel=\"stylesheet\" href=\"style.css\">","<css>style.css</css>","<script src=\"style.css\">"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-evaluation'), 'qcm', 'Que cible nav a ?', null, '["les nav et les a","les liens situés dans un nav","le premier lien","les nav dans un lien"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-evaluation'), 'qcm', 'Quel sélecteur est le plus spécifique ?', null, '["p",".texte","#intro","*"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-evaluation'), 'vrai_faux', 'Un même identifiant peut être utilisé sur plusieurs éléments d''une page.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-evaluation'), 'qcm', 'Pourquoi éviter l''attribut style dans le HTML ?', null, '["Il est interdit","Il mélange contenu et présentation","Il est plus lent","Il ne fonctionne pas"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-introduction-evaluation'), 'qcm', 'Comment écrit-on un commentaire CSS ?', null, '["<!-- -->","// ","/* */","#"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'css') and slug = 'fondamentaux-css'), (select id from public.courses where slug = 'css'), 'css-couleurs-textes', 'Couleurs, textes et polices', 'debutant', 90, array['Exprimer des couleurs (noms, hexadécimal, rgb) et garantir un bon contraste.', 'Régler la police, la taille, la graisse et l''alignement du texte.', 'Choisir l''unité adaptée : px, em, rem, %.']::text[], array['Chapitre 1 — Introduction au CSS et sélecteurs.']::text[], '## 1. Les couleurs

Deux propriétés principales : **color** (couleur du texte) et **background-color** (couleur du fond). Une couleur peut s''écrire :

| Notation | Exemple | Remarque |
|---|---|---|
| nom | navy, white, tomato | 140 noms prédéfinis |
| hexadécimal | #1d5fe0 | rouge, vert, bleu de 00 à ff |
| hexadécimal court | #fff | équivaut à #ffffff |
| rgb | rgb(29, 95, 224) | valeurs de 0 à 255 |
| rgb avec transparence | rgb(29 95 224 / 50%) | opacité de 50 % |

## 2. Le contraste, une question d''accessibilité

Un texte gris clair sur fond blanc est difficile à lire, surtout en plein soleil sur un téléphone ou pour une personne malvoyante. Les recommandations d''accessibilité (WCAG) demandent un **rapport de contraste d''au moins 4,5 : 1** pour le texte courant. Des outils comme le vérificateur de contraste des outils de développement du navigateur permettent de le mesurer.

## 3. Les polices

~~~css
body {
  font-family: "Segoe UI", Arial, sans-serif;
}
~~~

**font-family** reçoit une **liste** de polices : le navigateur utilise la première disponible. On termine toujours par une **famille générique** (**sans-serif**, **serif**, **monospace**). Les noms contenant des espaces s''écrivent entre guillemets.

Autres propriétés : **font-size** (taille), **font-weight** (graisse : **normal**, **bold** ou un nombre de 100 à 900), **font-style** (**italic**), **line-height** (hauteur de ligne ; 1.5 améliore la lisibilité).

## 4. Les unités

| Unité | Signification | Usage |
|---|---|---|
| px | pixel | bordures, petits détails |
| rem | relatif à la taille de police de la racine (16 px par défaut) | tailles de texte et espacements |
| em | relatif à la taille de police de l''élément | espacements proportionnels au texte |
| % | pourcentage de l''élément parent | largeurs |

Avec **rem**, si l''utilisateur agrandit la police de son navigateur, toute la page suit : c''est plus accessible que des tailles fixes en px.

## 5. L''alignement et la décoration du texte

- **text-align** : **left**, **center**, **right**, **justify** ;
- **text-decoration** : **none** (retirer le soulignement d''un lien), **underline** ;
- **text-transform** : **uppercase** (majuscules), **capitalize** ;
- **letter-spacing** : espacement entre les lettres.

## 6. Styler les liens

Les liens ont plusieurs **états**, ciblés par des **pseudo-classes** :

~~~css
a { color: #1d5fe0; }
a:hover { text-decoration: underline; }   /* survol de la souris */
a:focus { outline: 2px solid orange; }    /* navigation au clavier */
~~~

Ne supprimez jamais l''indicateur de focus sans le remplacer : il permet aux personnes qui naviguent au clavier de savoir où elles se trouvent.

## 7. Organiser ses couleurs et ses textes

Sur un vrai site, on limite volontairement le nombre de couleurs :
- une couleur **principale** (boutons, liens) ;
- une couleur **d''accent** ;
- des **gris** pour le texte et les fonds.

On fixe la police et la couleur du texte une seule fois sur **body** : grâce à l''héritage, tous les éléments en profitent. On ne redéfinit ensuite que les exceptions (titres, liens).

Cette discipline rend la feuille de style courte, cohérente et facile à modifier : changer la couleur principale ne demande alors qu''une modification. Au niveau 3, les **variables CSS** permettront de nommer ces couleurs.', array['color pour le texte, background-color pour le fond ; noms, hexadécimal ou rgb.', 'Un contraste suffisant (4,5 : 1) est une exigence d''accessibilité.', 'font-family se termine par une famille générique ; line-height de 1,5 améliore la lecture.', 'rem pour les tailles de texte : la page suit le réglage de l''utilisateur.', 'Les pseudo-classes :hover et :focus stylisent les états des liens.']::text[], '[{"language":"css","title":"Typographie lisible","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Typographie</title>\n  <style>\n    body { font-family: Georgia, serif; font-size: 1.125rem; line-height: 1.6; color: #222222; background-color: #fafafa; }\n    h1 { font-family: Arial, sans-serif; color: #1d5fe0; text-align: center; text-transform: uppercase; letter-spacing: 2px; }\n    a { color: #0a1a3a; }\n    a:hover { color: #1d5fe0; }\n  </style>\n</head>\n<body>\n  <h1>Le CSS</h1>\n  <p>Un texte bien contrasté, avec une hauteur de ligne de 1,6, se lit beaucoup plus facilement, en particulier sur téléphone.</p>\n  <p><a href=\"#\">Un lien qui change de couleur au survol</a></p>\n</body>\n</html>"}]'::jsonb, '{"competences":["Exprimer une couleur et vérifier un contraste","Configurer la typographie","Choisir une unité adaptée"],"definitions":[{"term":"Hexadécimal","definition":"Notation #rrggbb où chaque paire (00 à ff) donne la quantité de rouge, de vert et de bleu."},{"term":"Famille générique","definition":"Catégorie de police (serif, sans-serif, monospace) utilisée si aucune police listée n''est disponible."},{"term":"rem","definition":"Unité relative à la taille de police de l''élément racine (16 px par défaut)."},{"term":"Pseudo-classe","definition":"Mot-clé ajouté au sélecteur (**:hover**, **:focus**) qui cible un état particulier d''un élément."},{"term":"Contraste","definition":"Rapport de luminosité entre le texte et son fond ; au moins 4,5 : 1 pour un texte courant."}],"commentedAlgorithms":[{"title":"Mise en forme d''un article","code":"<style>\n  body {\n    font-family: \"Segoe UI\", Arial, sans-serif;\n    font-size: 1rem;\n    line-height: 1.5;\n    color: #1f2937;\n  }\n  h1 {\n    font-size: 2rem;\n    color: #1d5fe0;\n  }\n  .chapeau {\n    font-style: italic;\n    font-weight: 600;\n  }\n</style>\n<h1>Rentrée académique</h1>\n<p class=\"chapeau\">Les cours reprennent le lundi 6 octobre.</p>\n<p>Les étudiants sont invités à consulter leur emploi du temps.</p>","comments":{"2":"Réglages de base hérités par tout le document.","3":"Liste de polices terminée par une famille générique.","4":"16 px par défaut, ajustable par l''utilisateur.","5":"Hauteur de ligne : 1,5 fois la taille du texte.","6":"Gris très foncé : bon contraste sur fond blanc.","9":"Deux fois la taille de base.","10":"Le bleu principal du site, réservé aux titres.","12":"Classe pour le résumé de l''article.","13":"Italique : distingue le résumé du texte courant.","14":"Graisse intermédiaire (semi-gras)."},"language":"css","showPreview":true}],"commonErrors":[{"title":"Une police sans famille générique","wrong":"body { font-family: Calibri; }","right":"body { font-family: Calibri, Arial, sans-serif; }","explanation":"Si Calibri n''est pas installée (téléphones Android, Linux), le navigateur choisit une police par défaut imprévisible.","run":false},{"title":"Un contraste insuffisant","wrong":"p { color: #cccccc; background-color: #ffffff; }","right":"p { color: #374151; background-color: #ffffff; }","explanation":"Le gris clair sur blanc a un contraste d''environ 1,6 : 1, illisible pour beaucoup d''utilisateurs.","run":false}],"solvedExercises":[{"title":"Convertir des couleurs","statement":"Écrivez en hexadécimal : (a) blanc, (b) noir, (c) rouge pur, (d) rgb(29, 95, 224).","solution":"(a) #ffffff\n(b) #000000\n(c) #ff0000\n(d) #1d5fe0","explanation":"29 = 1d, 95 = 5f, 224 = e0 en base 16."},{"title":"Calculer des tailles","statement":"La racine a une taille de 16 px. Que valent 1.5rem et 0.75rem en pixels ?","solution":"1.5rem = 24 px ; 0.75rem = 12 px","explanation":"Il suffit de multiplier par 16."}],"td":{"title":"TD 2 — Couleurs et typographie","instructions":"Écrivez exactement les valeurs demandées : la correction compare les valeurs de vos déclarations.","exerciseSlugs":["css-bandeau-couleurs","css-liens-etats"]},"project":{"title":"Mise en forme d''un article","context":"Rendre un article d''actualité agréable à lire sur ordinateur et sur téléphone.","steps":["Définir la typographie de base sur body.","Régler la taille et la couleur du titre.","Mettre le chapeau en italique.","Gérer l''état de survol des liens, puis soumettre."],"deliverables":["Une feuille style.css lisible et accessible."],"exerciseSlug":"css-projet-article"}}'::jsonb, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-couleurs-textes'), 'css-couleurs-interrogation', 'Interrogation — Couleurs et textes', false, 60, 'publie', 'interrogation', 8, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-couleurs-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-interrogation'), 'qcm', 'Quelle propriété change la couleur du fond ?', null, '["color","background-color","font-color","bg"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-interrogation'), 'qcm', 'Que vaut #fff ?', null, '["noir","blanc","rouge","gris"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-interrogation'), 'qcm', 'Par quoi doit se terminer font-family ?', null, '["une police installée","une famille générique","un point","une taille"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-interrogation'), 'qcm', 'Combien vaut 2rem si la racine fait 16 px ?', null, '["16 px","18 px","32 px","2 px"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-couleurs-textes'), 'css-couleurs-evaluation', 'Évaluation — Couleurs, textes et polices', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-couleurs-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-evaluation'), 'qcm', 'Quelle pseudo-classe cible le survol de la souris ?', null, '[":focus",":hover",":active",":visited"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-evaluation'), 'qcm', 'Quelle propriété retire le soulignement d''un lien ?', null, '["text-style: none","text-decoration: none","underline: none","font-decoration: none"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-evaluation'), 'qcm', 'Quelle valeur de line-height améliore la lecture d''un paragraphe ?', null, '["0.5","1.5","5","0"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-evaluation'), 'qcm', 'Quel rapport de contraste minimal pour un texte courant ?', null, '["1 : 1","2 : 1","4,5 : 1","10 : 1"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-evaluation'), 'vrai_faux', 'Supprimer l''indicateur de focus sans le remplacer gêne la navigation au clavier.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-evaluation'), 'qcm', 'Pourquoi préférer rem à px pour le texte ?', null, '["rem est plus rapide","La page suit le réglage de taille de l''utilisateur","px n''existe plus","rem change la police"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-couleurs-evaluation'), 'qcm', 'Que fait text-transform: uppercase ?', null, '["Met en gras","Affiche en majuscules","Souligne","Agrandit"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'css') and slug = 'fondamentaux-css'), (select id from public.courses where slug = 'css'), 'css-modele-boite', 'Le modèle de boîte', 'debutant', 100, array['Décrire les quatre zones d''une boîte : contenu, padding, bordure, marge.', 'Régler largeur, hauteur et box-sizing.', 'Centrer un bloc horizontalement et espacer les éléments.']::text[], array['Chapitre 2 — Couleurs, textes et polices.']::text[], '## 1. Tout élément est une boîte

Le navigateur dessine chaque élément comme un **rectangle** composé de quatre zones, de l''intérieur vers l''extérieur :

1. le **contenu** (texte, image) ;
2. le **padding** (marge intérieure) : espace entre le contenu et la bordure, qui prend la couleur de fond ;
3. la **bordure** (**border**) ;
4. la **marge** (**margin**, marge extérieure) : espace transparent qui sépare la boîte de ses voisines.

~~~text
┌──────────── margin ────────────┐
│ ┌────────── border ──────────┐ │
│ │ ┌──────── padding ───────┐ │ │
│ │ │        contenu         │ │ │
│ │ └────────────────────────┘ │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
~~~

Les outils de développement du navigateur (clic droit → Inspecter) affichent ce schéma pour l''élément sélectionné.

## 2. Padding, border et margin

~~~css
.carte {
  padding: 16px;                 /* les 4 côtés */
  border: 1px solid #dfe5ee;     /* épaisseur, style, couleur */
  margin: 0 0 24px 0;            /* haut, droite, bas, gauche */
}
~~~

Les raccourcis s''écrivent dans le sens des aiguilles d''une montre : **haut droite bas gauche**. Avec deux valeurs, la première vaut pour haut et bas, la seconde pour droite et gauche. On peut aussi régler un seul côté : **padding-top**, **margin-left**…

**border-radius** arrondit les coins : **border-radius: 8px**.

## 3. Largeur, hauteur et box-sizing

Par défaut (**box-sizing: content-box**), **width** ne concerne que le contenu : une boîte de width 300px avec 20px de padding et 1px de bordure occupe en réalité 342 px. C''est source d''erreurs. La plupart des projets commencent donc par :

~~~css
* { box-sizing: border-box; }
~~~

Avec **border-box**, width inclut padding et bordure : la boîte occupe exactement 300 px.

Préférez **max-width** à width pour les blocs de texte : la boîte se réduit sur les petits écrans au lieu de déborder.

## 4. Éléments de bloc et éléments en ligne

- Les éléments **de bloc** (p, h1, div, ul, section) occupent toute la largeur disponible et commencent sur une nouvelle ligne ; width, height et les marges verticales s''y appliquent.
- Les éléments **en ligne** (a, strong, em, span) s''insèrent dans le texte ; leur largeur et leurs marges verticales sont ignorées.

La propriété **display** change ce comportement : **display: block**, **display: inline-block** (en ligne mais dimensionnable).

## 5. Centrer un bloc

Pour centrer horizontalement un bloc de largeur fixée, on lui donne des marges latérales automatiques :

~~~css
.conteneur {
  max-width: 720px;
  margin: 0 auto;
}
~~~

Pour centrer du **texte** à l''intérieur d''un bloc, on utilise **text-align: center** : ce n''est pas la même chose.

## 6. La fusion des marges

Les marges verticales de deux blocs voisins ne s''additionnent pas : elles **fusionnent**, et la plus grande l''emporte. Un paragraphe avec margin-bottom 24px suivi d''un autre avec margin-top 16px sont séparés de 24 px, pas de 40 px.

## 7. Déboguer une mise en page

Quand une boîte n''a pas la taille ou la place attendue, ajoutez temporairement **outline: 1px solid red;** à l''élément concerné. Contrairement à **border**, **outline** ne prend pas de place et ne modifie donc pas les dimensions de la boîte.

Les outils de développement affichent aussi un schéma du modèle de boîte de l''élément sélectionné, avec les valeurs calculées du contenu, du padding, de la bordure et de la marge.

Dernier réflexe : vérifiez si **box-sizing: border-box** est appliqué. C''est la cause la plus fréquente d''un écart de quelques pixels entre la largeur demandée et la largeur obtenue.', array['Une boîte = contenu + padding + bordure + marge.', 'Raccourcis dans l''ordre haut, droite, bas, gauche.', 'box-sizing: border-box fait inclure padding et bordure dans width.', 'Les blocs prennent toute la largeur ; les éléments en ligne s''insèrent dans le texte.', 'margin: 0 auto centre un bloc de largeur limitée ; text-align centre le texte.']::text[], '[{"language":"css","title":"Une carte centrée","code":"<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Modèle de boîte</title>\n  <style>\n    * { box-sizing: border-box; }\n    body { font-family: Arial, sans-serif; background-color: #eef2f7; }\n    .carte { max-width: 360px; margin: 40px auto; padding: 20px; background-color: white; border: 1px solid #dfe5ee; border-radius: 12px; }\n    .carte h2 { margin: 0 0 8px 0; color: #1d5fe0; }\n  </style>\n</head>\n<body>\n  <div class=\"carte\">\n    <h2>Parcours HTML</h2>\n    <p>Structurer le contenu des pages web.</p>\n  </div>\n</body>\n</html>"}]'::jsonb, '{"competences":["Décrire le modèle de boîte","Régler les espacements","Centrer un bloc","Utiliser box-sizing"],"definitions":[{"term":"Padding","definition":"Marge intérieure, entre le contenu et la bordure ; elle prend la couleur de fond de l''élément."},{"term":"Margin","definition":"Marge extérieure, transparente, qui sépare la boîte des éléments voisins."},{"term":"box-sizing","definition":"Propriété qui indique si width inclut (border-box) ou non (content-box) le padding et la bordure."},{"term":"Élément de bloc","definition":"Élément qui occupe toute la largeur disponible et commence sur une nouvelle ligne."},{"term":"Fusion des marges","definition":"Les marges verticales adjacentes de deux blocs se confondent : seule la plus grande est appliquée."}],"commentedAlgorithms":[{"title":"Mise en page d''une fiche centrée","code":"<style>\n  * {\n    box-sizing: border-box;\n  }\n  .fiche {\n    max-width: 400px;\n    margin: 24px auto;\n    padding: 16px 24px;\n    border: 2px solid #1d5fe0;\n    border-radius: 8px;\n  }\n  .fiche p {\n    margin: 0 0 12px 0;\n  }\n</style>\n<div class=\"fiche\">\n  <p><strong>Nom :</strong> Amani</p>\n  <p><strong>Filière :</strong> Informatique</p>\n</div>","comments":{"2":"Sélecteur universel : tous les éléments.","3":"width inclut padding et bordure.","6":"Jamais plus de 400 px, moins sur petit écran.","7":"24 px en haut et en bas, centrée horizontalement.","8":"16 px en haut et en bas, 24 px à gauche et à droite.","9":"Bordure bleue de 2 px.","10":"Coins arrondis.","12":"Paragraphes situés dans une fiche.","13":"Seulement une marge basse de 12 px.","16":"div : bloc générique, sans signification particulière."},"language":"css","showPreview":true}],"commonErrors":[{"title":"Centrer un bloc avec text-align","wrong":".conteneur { width: 600px; text-align: center; }","right":".conteneur { max-width: 600px; margin: 0 auto; }","explanation":"text-align centre le **contenu en ligne** (le texte) à l''intérieur du bloc, pas le bloc lui-même.","run":false},{"title":"Oublier box-sizing et déborder","wrong":".colonne { width: 100%; padding: 20px; }","right":"* { box-sizing: border-box; }\n.colonne { width: 100%; padding: 20px; }","explanation":"En content-box, 100 % + 40 px de padding dépasse la largeur du parent et provoque un défilement horizontal, en particulier sur téléphone.","run":false}],"solvedExercises":[{"title":"Calculer une largeur","statement":"Une boîte a width: 300px, padding: 10px, border: 2px solid. Quelle largeur occupe-t-elle en content-box ? en border-box ?","solution":"content-box : 300 + 2 × 10 + 2 × 2 = 324 px\nborder-box : 300 px","explanation":"En border-box, le contenu se réduit à 300 − 24 = 276 px pour que le total reste 300 px."},{"title":"Lire un raccourci","statement":"Que signifie margin: 10px 20px 30px ?","solution":"haut 10px, droite et gauche 20px, bas 30px","explanation":"Avec trois valeurs : haut, puis droite et gauche, puis bas."}],"td":{"title":"TD 3 — Boîtes et espacements","instructions":"Utilisez exactement les sélecteurs et les valeurs demandés.","exerciseSlugs":["css-conteneur-centre","css-espacements-liste"]},"project":{"title":"Carte de profil étudiant","context":"Mettre en forme la carte de profil d''un étudiant : centrée, aérée, lisible et adaptée au téléphone.","steps":["Ajouter box-sizing: border-box à tous les éléments.","Centrer la carte avec une largeur maximale et des marges automatiques.","Régler padding, bordure arrondie et couleur de fond.","Mettre en forme le titre et le texte, puis vérifier l''aperçu et soumettre."],"deliverables":["Une feuille style.css qui satisfait toutes les vérifications."],"exerciseSlug":"css-projet-profil"}}'::jsonb, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-modele-boite'), 'css-boite-interrogation', 'Interrogation — Modèle de boîte', false, 60, 'publie', 'interrogation', 8, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-boite-interrogation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-interrogation'), 'qcm', 'Quelle zone est entre le contenu et la bordure ?', null, '["margin","padding","outline","width"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-interrogation'), 'qcm', 'Que signifie padding: 10px 20px ?', null, '["haut/bas 10, gauche/droite 20","haut 10, bas 20","gauche 10, droite 20","tous les côtés 30"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-interrogation'), 'qcm', 'Comment centrer un bloc de largeur limitée ?', null, '["text-align: center","margin: 0 auto","padding: auto","align: center"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-interrogation'), 'vrai_faux', 'En border-box, width inclut padding et bordure.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'css') and slug = 'css-modele-boite'), 'css-boite-evaluation', 'Évaluation — Le modèle de boîte', false, 70, 'publie', 'evaluation', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-boite-evaluation');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-evaluation'), 'qcm', 'Quelle est la zone la plus extérieure d''une boîte ?', null, '["padding","border","margin","contenu"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-evaluation'), 'qcm', 'Quelle largeur occupe width: 200px; padding: 10px; border: 1px solid en content-box ?', null, '["200 px","211 px","222 px","220 px"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-evaluation'), 'qcm', 'Quel élément est en ligne par défaut ?', null, '["p","div","span","h2"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-evaluation'), 'qcm', 'Deux paragraphes : margin-bottom 30px puis margin-top 20px. Quel espace les sépare ?', null, '["50 px","30 px","20 px","10 px"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-evaluation'), 'qcm', 'Pourquoi préférer max-width à width pour un bloc de texte ?', null, '["max-width est plus rapide","Le bloc se réduit sur les petits écrans","width n''existe pas","Pour la couleur"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-evaluation'), 'vrai_faux', 'Le padding prend la couleur de fond de l''élément.', null, '["Vrai","Faux"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-boite-evaluation'), 'qcm', 'Quelle propriété arrondit les coins ?', null, '["corner","border-radius","round","radius"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'css') and m.slug not in ('fondamentaux-css') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'css'), 1, 'Niveau 1 — Très débutant : mettre en forme', 'Relier une feuille de style, cibler les éléments avec des sélecteurs, gérer couleurs et textes, comprendre le modèle de boîte.', array['Relier une feuille CSS et écrire des règles.', 'Choisir le bon sélecteur (élément, classe, id, descendant).', 'Mettre en forme couleurs, polices et textes.', 'Dimensionner et espacer des boîtes (margin, border, padding).']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), null, 'css-examen-niveau-1', 'Examen du niveau 1 — Fondamentaux du CSS', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Comment relie-t-on une feuille style.css à une page ?', null, '["<style src=\"style.css\">","<link rel=\"stylesheet\" href=\"style.css\">","<css href=\"style.css\">","<script src=\"style.css\">"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Quel sélecteur cible les éléments de classe « carte » ?', null, '["#carte",".carte","carte","*carte"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Quel sélecteur est le plus spécifique ?', null, '["p",".texte","#intro","*"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Que cible « nav a » ?', null, '["les nav qui sont dans un a","les a situés dans un nav","les nav et les a","le premier a"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Quelle propriété change la couleur du texte ?', null, '["background-color","color","font-color","text-color"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Quelle propriété met le texte en gras ?', null, '["font-style: bold","font-weight: bold","text-weight: bold","bold: true"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Dans le modèle de boîte, quel espace est à l''intérieur de la bordure ?', null, '["margin","padding","outline","gap"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Avec box-sizing: border-box, width inclut…', null, '["seulement le contenu","contenu, padding et bordure","aussi la marge","rien"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'vrai_faux', 'margin: 0 auto centre horizontalement un bloc qui a une largeur définie.', null, '["Vrai","Faux"]'::jsonb, 8, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-examen-niveau-1'), 'qcm', 'Si deux règles de même spécificité se contredisent, laquelle s''applique ?', null, '["la première écrite","la dernière écrite","aucune","celle avec le plus de propriétés"]'::jsonb, 9, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'css'), 2, 'Niveau 2 — Débutant : mise en page', 'Positionnement, Flexbox, Grid et pages adaptées aux mobiles.', array['Disposer des éléments avec Flexbox et Grid.', 'Adapter une page aux écrans avec les media queries.']::text[], array['Affichage et positionnement', 'Flexbox', 'CSS Grid', 'Responsive design et media queries', 'Unités relatives (rem, %, vw)']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'css'), 3, 'Niveau 3 — Intermédiaire : interfaces soignées', 'Variables CSS, transitions et animations, pseudo-éléments, thèmes clair et sombre.', array['Construire un thème avec des variables CSS.', 'Animer une interface sans nuire à l''accessibilité.']::text[], array['Variables CSS (custom properties)', 'Transitions et animations', 'Pseudo-classes et pseudo-éléments avancés', 'Thèmes clair et sombre']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'css'), 4, 'Niveau 4 — Professionnel : architecture CSS', 'Organisation des feuilles de style, méthodologies, préprocesseurs et frameworks, performances.', array['Organiser le CSS d''un projet réel (BEM, composants).', 'Évaluer l''usage d''un framework CSS.', 'Optimiser le rendu.']::text[], array['Méthodologie BEM et composants', 'Préprocesseurs (Sass)', 'Frameworks utilitaires', 'Performances du rendu', 'Projet professionnel']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'css'), null, 'css-positionnement', 'Test de positionnement — CSS', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'css-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quel sélecteur cible l''élément d''id « menu » ?', null, '[".menu","#menu","menu","@menu"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quelle propriété change la couleur de fond ?', null, '["color","background-color","fill","bgcolor"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quelle propriété ajoute de l''espace à l''intérieur de la bordure ?', null, '["margin","padding","spacing","gap"]'::jsonb, 2, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quelle déclaration active Flexbox sur un conteneur ?', null, '["display: flex","flex: on","position: flex","float: flex"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quelle règle applique des styles seulement sous 600 px de large ?', null, '["@media (max-width: 600px)","@screen 600","@if width < 600","@media (min-width: 600px)"]'::jsonb, 4, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quelle propriété définit les colonnes d''une grille ?', null, '["grid-columns","grid-template-columns","columns-grid","grid-cols"]'::jsonb, 5, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Comment utilise-t-on la variable --principale ?', null, '["$principale","var(--principale)","@principale","--principale()"]'::jsonb, 6, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quel pseudo-élément insère du contenu avant un élément ?', null, '[":before-content","::before",":first","::start"]'::jsonb, 7, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quelle propriété anime en douceur un changement de couleur au survol ?', null, '["animation-color","transition","transform","keyframes"]'::jsonb, 8, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Dans la méthode BEM, que désigne « carte__titre » ?', null, '["un modificateur","un élément du bloc carte","un bloc","un id"]'::jsonb, 9, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'qcm', 'Quelle propriété est la moins coûteuse à animer ?', null, '["width","top","transform","margin"]'::jsonb, 10, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'css-positionnement'), 'vrai_faux', 'Sass est un préprocesseur compilé en CSS avant d''être envoyé au navigateur.', null, '["Vrai","Faux"]'::jsonb, 11, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;

-- ===== Python =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('python', 'python', (select id from public.course_categories where slug = 'programmation'), 'Parcours B', 'Python', 'Le langage idéal pour passer de l''algorithme au programme.', 'Un parcours complet pour apprendre Python : syntaxe, structures de contrôle, structures de données, fonctions, modules, exceptions, fichiers, programmation orientée objet, algorithmes classiques, jusqu''à une introduction à la science des données et à l''intelligence artificielle.', 'debutant', array['Avoir suivi le module 1 et 2 du parcours Algorithmique (recommandé).']::text[], array['Écrire des programmes Python lisibles et corrects.', 'Utiliser listes, tuples, dictionnaires et ensembles.', 'Structurer un programme avec des fonctions, des modules et des classes.', 'Gérer les erreurs et manipuler des fichiers.', 'Implémenter des algorithmes de recherche et de tri.']::text[], 36, 'publie', 4, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'python'), 'bases', 'Les bases du langage', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'bases'), (select id from public.courses where slug = 'python'), 'syntaxe-fondamentale', 'Syntaxe fondamentale', 'debutant', 25, array['Écrire et exécuter un premier programme Python.', 'Comprendre l''indentation et les commentaires.']::text[], '{}'::text[], '## Pourquoi Python ?

Python est un langage **lisible**, **polyvalent** et très utilisé : développement web, automatisation, science des données, intelligence artificielle. Sa syntaxe proche du pseudocode en fait un excellent premier langage.

## Premier programme

~~~python
print("Bonjour UPL !")
~~~

**print** affiche une valeur puis passe à la ligne.

## Pas de DEBUT / FIN : l''indentation

En Python, les blocs sont délimités par l''**indentation** (4 espaces par convention), après un deux-points :

~~~python
if note >= 10:
    print("Admis")
print("Fin")   # hors du bloc
~~~

Une indentation incorrecte provoque une **IndentationError**.

## Commentaires

Tout ce qui suit **#** est ignoré par Python. Commentez le **pourquoi**, pas l''évidence.

## Du pseudocode à Python

| Pseudocode | Python |
|---|---|
| ECRIRE("x = ", x) | print("x =", x) |
| x ← 5 | x = 5 |
| SI … ALORS … FINSI | if …: (bloc indenté) |
| ET, OU, NON | and, or, not |', array['print affiche des valeurs.', 'Les blocs sont définis par l''indentation.', '# introduit un commentaire.']::text[], '[{"language":"python","title":"Premier programme","code":"# Mon premier programme Python\nprint(\"Bonjour UPL !\")\nprint(\"2 + 3 =\", 2 + 3)"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'syntaxe-fondamentale'), 'py-syntaxe-quiz', 'Syntaxe', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-syntaxe-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-syntaxe-quiz'), 'qcm', 'Comment Python délimite-t-il les blocs ?', null, '["Avec DEBUT et FIN","Avec des accolades","Avec l''indentation","Avec des points-virgules"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-syntaxe-quiz'), 'vrai_faux', 'En Python, # commence un commentaire.', null, '["Vrai","Faux"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'bases'), (select id from public.courses where slug = 'python'), 'variables-types', 'Variables et types', 'debutant', 30, array['Créer des variables.', 'Connaître int, float, str, bool.', 'Convertir entre types.']::text[], '{}'::text[], '## Variables

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

La fonction **type(x)** donne le type d''une valeur.

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

Utilisez le style **snake_case** : note_finale, nombre_etudiants. Les constantes s''écrivent en majuscules : TAUX_TVA = 0.16.', array['= crée ou modifie une variable.', 'int, float, str, bool sont les types de base.', 'input() renvoie toujours une chaîne.']::text[], '[{"language":"python","title":"Types et conversions","code":"nom = input()\nannee = int(input())\nage = 2026 - annee\nprint(\"Bonjour\", nom)\nprint(\"Âge :\", age, type(age))\nprint(\"Moyenne :\", 27 / 2, type(27 / 2))","stdin":"Amani\n2006"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'variables-types'), 'py-variables-quiz', 'Variables', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-variables-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-variables-quiz'), 'qcm', 'Que renvoie input() ?', null, '["Un int","Une str","Un float","Cela dépend de ce qui est tapé"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-variables-quiz'), 'qcm', 'Que vaut int("7") + 3 ?', null, '["\"73\"","10","Erreur","\"10\""]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'bases'), (select id from public.courses where slug = 'python'), 'operateurs', 'Opérateurs', 'debutant', 25, array['Utiliser les opérateurs arithmétiques, de comparaison et logiques.', 'Formater l''affichage avec les f-strings.']::text[], '{}'::text[], '## Arithmétique

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

Le **:.2f** affiche deux décimales.', array['// et % correspondent à DIV et MOD.', '** est la puissance.', 'Les f-strings formatent l''affichage.']::text[], '[{"language":"python","title":"Opérateurs","code":"secondes = 3725\nh = secondes // 3600\nm = secondes % 3600 // 60\ns = secondes % 60\nprint(f\"{h} h {m} min {s} s\")\nnote = 14\nprint(\"Valide :\", 0 <= note <= 20, \"| Pair :\", note % 2 == 0)"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'bases'), (select id from public.courses where slug = 'python'), 'conditions', 'Conditions', 'debutant', 25, array['Écrire des tests avec if, elif, else.', 'Utiliser match pour des choix multiples.']::text[], '{}'::text[], '## if / elif / else

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

**elif** correspond à SINON SI. N''oubliez pas les **deux-points**.

## Valeurs « vraies » et « fausses »

0, 0.0, "" (chaîne vide), [] (liste vide) et None sont considérés comme **faux** dans un if.

## L''expression conditionnelle

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
~~~', array['if / elif / else avec deux-points et indentation.', 'and, or, not combinent les conditions.', 'match remplace SELON.']::text[], '[{"language":"python","title":"Année bissextile","code":"annee = int(input())\nif (annee % 4 == 0 and annee % 100 != 0) or annee % 400 == 0:\n    print(\"bissextile\")\nelse:\n    print(\"non bissextile\")","stdin":"2024"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'conditions'), 'py-conditions-quiz', 'Conditions', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-conditions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-conditions-quiz'), 'qcm', 'Quel mot-clé correspond à SINON SI ?', null, '["else if","elseif","elif","sinon_si"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-conditions-quiz'), 'vrai_faux', 'Une liste vide est considérée comme fausse dans un if.', null, '["Vrai","Faux"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'bases'), (select id from public.courses where slug = 'python'), 'boucles', 'Boucles', 'debutant', 35, array['Utiliser for avec range.', 'Utiliser while.', 'Contrôler une boucle avec break et continue.']::text[], '{}'::text[], '## for et range

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

Python n''a pas de RÉPÉTER … JUSQU''À : on utilise **while True** avec **break**.

## break et continue

- **break** sort immédiatement de la boucle.
- **continue** passe directement au tour suivant.

~~~python
while True:
    note = float(input())
    if 0 <= note <= 20:
        break
~~~', array['range(a, b) va de a à b-1.', 'while répète tant que la condition est vraie.', 'break sort, continue passe au tour suivant.']::text[], '[{"language":"python","title":"Table et somme","code":"n = int(input())\nfor i in range(1, 11):\n    print(f\"{n} x {i} = {n * i}\")\ntotal = 0\nfor i in range(1, n + 1):\n    total += i\nprint(\"Somme de 1 à\", n, \":\", total)","stdin":"7"}]'::jsonb, null, 'publie', 5, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'boucles'), 'py-boucles-quiz', 'Boucles', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-boucles-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-boucles-quiz'), 'qcm', 'Quelles valeurs produit range(2, 8, 2) ?', null, '["2, 4, 6, 8","2, 4, 6","2, 8","0, 2, 4, 6"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-boucles-quiz'), 'qcm', 'Que fait break ?', null, '["Passe au tour suivant","Arrête le programme","Sort de la boucle","Recommence la boucle"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'python'), 'structures-donnees', 'Collections', null, 2, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'structures-donnees'), (select id from public.courses where slug = 'python'), 'listes-tuples', 'Listes et tuples', 'debutant', 40, array['Créer et modifier des listes.', 'Parcourir une liste.', 'Utiliser les tuples.']::text[], '{}'::text[], '## Les listes

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
| len(L) | nombre d''éléments |
| sum(L), min(L), max(L) | somme, minimum, maximum |
| L.append(x) | ajouter à la fin |
| L.insert(i, x) | insérer à la position i |
| L.remove(x), L.pop() | supprimer |
| x in L | test d''appartenance |
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

Un **tuple** est comme une liste mais **non modifiable** : point = (3, 4). On l''utilise pour des données fixes, ou pour retourner plusieurs valeurs d''une fonction.

## Lire une liste au clavier

~~~python
valeurs = list(map(int, input().split()))
~~~', array['Les indices commencent à 0 ; -1 désigne le dernier.', 'append, sort, len, sum, in sont essentiels.', 'Un tuple ne peut pas être modifié.']::text[], '[{"language":"python","title":"Manipuler une liste","code":"notes = list(map(float, input().split()))\nprint(\"Notes :\", notes)\nprint(\"Moyenne :\", round(sum(notes) / len(notes), 2))\nprint(\"Admis :\", [n for n in notes if n >= 10])\nprint(\"Triées :\", sorted(notes))","stdin":"12 8.5 15 9 17"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'listes-tuples'), 'py-listes-quiz', 'Listes', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-listes-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-listes-quiz'), 'qcm', 'L = [4, 8, 15]. Que vaut L[1] ?', null, '["4","8","15","Erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-listes-quiz'), 'qcm', 'Que vaut [x * 2 for x in range(3)] ?', null, '["[2, 4, 6]","[0, 2, 4]","[0, 1, 2]","[1, 2, 3]"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-listes-quiz'), 'vrai_faux', 'On peut modifier un élément d''un tuple.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'structures-donnees'), (select id from public.courses where slug = 'python'), 'dictionnaires-ensembles', 'Dictionnaires et ensembles', 'debutant', 35, array['Associer des clés à des valeurs avec un dictionnaire.', 'Éliminer les doublons avec un ensemble.']::text[], '{}'::text[], '## Les dictionnaires

Un **dictionnaire** associe des **clés** à des **valeurs** :

~~~python
etudiant = {"nom": "Amani", "age": 20, "faculte": "Informatique"}
print(etudiant["nom"])
etudiant["age"] = 21          # modification
etudiant["moyenne"] = 14.2    # ajout
~~~

- **d.get(cle, defaut)** évite une erreur si la clé n''existe pas.
- **cle in d** teste la présence d''une clé.

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

Opérations : union (|), intersection (&), différence (-). Le test **x in ensemble** est très rapide.', array['Un dictionnaire associe clé → valeur.', 'get() fournit une valeur par défaut.', 'Un set élimine les doublons.']::text[], '[{"language":"python","title":"Fréquence des mots","code":"texte = input().lower()\ncompte = {}\nfor mot in texte.split():\n    compte[mot] = compte.get(mot, 0) + 1\nfor mot in sorted(compte):\n    print(mot, compte[mot])\nprint(\"Mots distincts :\", len(set(texte.split())))","stdin":"le code le plus simple est le meilleur code"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'python'), 'fonctions-modules', 'Fonctions et modules', null, 3, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'python') and slug = 'fonctions-modules'), (select id from public.courses where slug = 'python'), 'fonctions', 'Fonctions', 'debutant', 40, array['Définir des fonctions avec def.', 'Utiliser paramètres par défaut et valeurs de retour multiples.', 'Comprendre la portée des variables.']::text[], '{}'::text[], '## Définir une fonction

~~~python
def carre(x):
    return x * x

print(carre(5))   # 25
~~~

Une fonction sans **return** renvoie **None** : c''est l''équivalent d''une procédure.

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
    """Retourne la moyenne d''une liste non vide de notes."""
    return sum(notes) / len(notes)
~~~

## Récursivité

~~~python
def fact(n):
    return 1 if n == 0 else n * fact(n - 1)
~~~', array['def définit une fonction, return renvoie le résultat.', 'Les paramètres peuvent avoir des valeurs par défaut.', 'Les variables d''une fonction sont locales.']::text[], '[{"language":"python","title":"Fonctions","code":"def est_premier(n):\n    \"\"\"Retourne True si n est un nombre premier.\"\"\"\n    if n < 2:\n        return False\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            return False\n        d += 1\n    return True\n\npremiers = [k for k in range(2, 50) if est_premier(k)]\nprint(premiers)"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'python'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'python') and slug = 'fonctions'), 'py-fonctions-quiz', 'Fonctions', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'py-fonctions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-fonctions-quiz'), 'qcm', 'Que renvoie une fonction sans instruction return ?', null, '["0","None","False","Une erreur"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'py-fonctions-quiz'), 'qcm', 'def f(a, b=2): return a * b. Que vaut f(5) ?', null, '["5","7","10","Erreur"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
commit;
