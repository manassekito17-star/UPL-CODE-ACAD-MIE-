-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 6 sur 13.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'fonctions-donnees'), (select id from public.courses where slug = 'javascript'), 'tableaux-objets', 'Tableaux et objets', 'debutant', 35, array['Manipuler des tableaux avec map, filter, reduce.', 'Créer et parcourir des objets.']::text[], '{}'::text[], '## Tableaux

~~~javascript
const notes = [12, 15, 9, 17];
notes.push(11);
console.log(notes.length, notes[0]);
~~~

| Méthode | Rôle |
|---|---|
| map(f) | transforme chaque élément |
| filter(f) | garde les éléments qui vérifient f |
| reduce(f, init) | combine en une valeur |
| find(f) | premier élément qui vérifie f |
| sort((a, b) => a - b) | tri numérique |

> sort() sans argument trie **comme des chaînes** : [10, 9, 1].sort() donne [1, 10, 9].

## Objets

~~~javascript
const etudiant = { nom: "Amani", age: 20 };
etudiant.moyenne = 14.2;
for (const [cle, valeur] of Object.entries(etudiant)) console.log(cle, valeur);
~~~

## Déstructuration

const { nom, age } = etudiant; et const [premier, ...reste] = notes;', array['map, filter, reduce évitent beaucoup de boucles.', 'sort numérique : (a, b) => a - b.', 'Les objets associent des clés à des valeurs.']::text[], '[{"language":"javascript","title":"map, filter, reduce","code":"const promo = [\n  { nom: \"Amani\", moyenne: 14.5 },\n  { nom: \"Grâce\", moyenne: 17 },\n  { nom: \"Josué\", moyenne: 8.5 },\n];\nconst admis = promo.filter((e) => e.moyenne >= 10).map((e) => e.nom);\nconst moyenne = promo.reduce((s, e) => s + e.moyenne, 0) / promo.length;\nconsole.log(\"Admis :\", admis.join(\", \"));\nconsole.log(\"Moyenne générale :\", moyenne.toFixed(2));"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'javascript'), 'web', 'JavaScript dans la page', null, 3, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'web'), (select id from public.courses where slug = 'javascript'), 'dom', 'Le DOM', 'intermediaire', 30, array['Sélectionner et modifier des éléments HTML.']::text[], '{}'::text[], '## Qu''est-ce que le DOM ?

Le **DOM** (Document Object Model) est la représentation de la page HTML sous forme d''arbre d''objets que JavaScript peut lire et modifier.

## Sélectionner

~~~javascript
const titre = document.querySelector("h1");
const boutons = document.querySelectorAll(".btn");
~~~

## Modifier

~~~javascript
titre.textContent = "Nouveau titre";
titre.classList.add("important");
titre.style.color = "navy";
~~~

## Créer des éléments

~~~javascript
const li = document.createElement("li");
li.textContent = "Python";
document.querySelector("ul").append(li);
~~~

Préférez **textContent** à innerHTML pour insérer du texte venant d''un utilisateur : innerHTML peut exécuter du code malveillant (faille XSS).

> Les programmes de l''éditeur s''exécutent dans un environnement isolé sans page : testez le DOM dans un fichier HTML sur votre ordinateur.', array['Le DOM représente la page sous forme d''objets.', 'querySelector sélectionne, textContent modifie.', 'textContent est plus sûr qu''innerHTML.']::text[], '[{"language":"javascript","title":"Exemple (à tester dans une page HTML)","code":"// Dans une page contenant <ul id=\"langages\"></ul>\nconst langages = [\"Pseudocode\", \"Python\", \"C\", \"JavaScript\", \"Java\"];\nif (typeof document !== \"undefined\") {\n  const ul = document.querySelector(\"#langages\");\n  for (const l of langages) {\n    const li = document.createElement(\"li\");\n    li.textContent = l;\n    ul.append(li);\n  }\n} else {\n  console.log(\"Pas de page ici : voici la liste qui serait affichée :\");\n  langages.forEach((l) => console.log(\"- \" + l));\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'web'), (select id from public.courses where slug = 'javascript'), 'evenements', 'Événements', 'intermediaire', 25, array['Réagir aux actions de l''utilisateur avec addEventListener.']::text[], '{}'::text[], '## addEventListener

~~~javascript
const bouton = document.querySelector("#valider");
bouton.addEventListener("click", () => {
  console.log("Bouton cliqué !");
});
~~~

## Événements courants

click, input, change, submit, keydown, load.

## L''objet événement

~~~javascript
formulaire.addEventListener("submit", (event) => {
  event.preventDefault();   // empêche le rechargement de la page
  const nom = formulaire.elements.nom.value;
});
~~~

Toujours **valider** les données saisies avant de les utiliser.', array['addEventListener(type, fonction).', 'event.preventDefault() bloque le comportement par défaut.', 'Valider toujours les saisies.']::text[], '[{"language":"javascript","title":"Simulation d''événements","code":"// Un mini système d''événements pour comprendre le principe\nconst ecouteurs = {};\nfunction on(nom, f) {\n  if (!ecouteurs[nom]) ecouteurs[nom] = [];\n  ecouteurs[nom].push(f);\n}\nfunction emettre(nom, donnee) { (ecouteurs[nom] || []).forEach((f) => f(donnee)); }\n\non(\"click\", (d) => console.log(\"Clic sur\", d));\non(\"click\", () => console.log(\"Deuxième écouteur\"));\nemettre(\"click\", \"le bouton Valider\");"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'javascript'), 'asynchrone', 'Asynchronisme et API', null, 4, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'asynchrone'), (select id from public.courses where slug = 'javascript'), 'asynchronisme-promesses', 'Asynchronisme et promesses', 'avance', 35, array['Comprendre l''exécution asynchrone.', 'Utiliser les promesses et async/await.']::text[], '{}'::text[], '## Pourquoi l''asynchronisme ?

Certaines opérations prennent du temps (télécharger des données, attendre un délai). JavaScript ne bloque pas : il continue l''exécution et traite le résultat **plus tard**.

~~~javascript
console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");   // affiche A, C, puis B
~~~

## Les promesses

Une **promesse** représente un résultat futur : elle est **tenue** (resolve) ou **rompue** (reject).

~~~javascript
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
attendre(500).then(() => console.log("Fini"));
~~~

## async / await

~~~javascript
async function principal() {
  try {
    await attendre(500);
    console.log("Après 500 ms");
  } catch (e) {
    console.log("Erreur :", e.message);
  }
}
~~~

**await** suspend la fonction jusqu''au résultat, sans bloquer le reste du programme.', array['Le code asynchrone s''exécute plus tard.', 'Une promesse est tenue ou rompue.', 'async/await rend le code asynchrone lisible.']::text[], '[{"language":"javascript","title":"Promesses et async/await","code":"const attendre = (ms, valeur) => new Promise((resolve) => setTimeout(() => resolve(valeur), ms));\n\nasync function principal() {\n  console.log(\"Début\");\n  const a = await attendre(200, \"données A\");\n  console.log(\"Reçu :\", a);\n  const [b, c] = await Promise.all([attendre(100, \"B\"), attendre(150, \"C\")]);\n  console.log(\"En parallèle :\", b, c);\n  console.log(\"Fin\");\n}\nprincipal();"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'javascript'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'javascript') and slug = 'asynchronisme-promesses'), 'js-async-quiz', 'Asynchronisme', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'js-async-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'js-async-quiz'), 'qcm', 'Dans quel ordre s''affichent A, B, C ? console.log(''A''); setTimeout(() => console.log(''B''), 0); console.log(''C'');', null, '["A B C","A C B","B A C","C A B"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'asynchrone'), (select id from public.courses where slug = 'javascript'), 'api', 'Consommer une API', 'avance', 30, array['Appeler une API web avec fetch.', 'Traiter une réponse JSON.']::text[], '{}'::text[], '## fetch

~~~javascript
async function chargerUtilisateurs() {
  const reponse = await fetch("https://exemple.org/api/utilisateurs");
  if (!reponse.ok) throw new Error("Erreur HTTP " + reponse.status);
  const donnees = await reponse.json();
  return donnees;
}
~~~

## JSON

**JSON** est le format d''échange de données du web. **JSON.parse(texte)** le transforme en objet, **JSON.stringify(objet)** en texte.

## Bonnes pratiques

- Vérifier **reponse.ok** avant de lire les données.
- Gérer les erreurs réseau avec try/catch.
- Ne jamais placer une **clé secrète** d''API dans le code du navigateur : elle serait visible de tous.

> Pour des raisons de sécurité, les programmes de l''éditeur n''ont pas accès au réseau.', array['fetch renvoie une promesse.', 'JSON.parse / JSON.stringify.', 'Aucune clé secrète dans le navigateur.']::text[], '[{"language":"javascript","title":"JSON","code":"const texte = ''{\"cours\": \"JavaScript\", \"lecons\": 10, \"langages\": [\"fr\", \"en\"]}'';\nconst objet = JSON.parse(texte);\nconsole.log(objet.cours, \"-\", objet.lecons, \"leçons\");\nobjet.niveau = \"débutant\";\nconsole.log(JSON.stringify(objet));"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'javascript'), 'professionnel', 'Projets web', null, 5, 4)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'javascript') and slug = 'professionnel'), (select id from public.courses where slug = 'javascript'), 'projets-web', 'Projets web pratiques', 'avance', 60, array['Réaliser un petit projet complet : gestionnaire de tâches.']::text[], '{}'::text[], '## Projet : liste de tâches

Objectif : une page où l''on ajoute, coche et supprime des tâches, avec sauvegarde dans le navigateur.

### Étapes

1. **HTML** : un champ texte, un bouton, une liste ul.
2. **Modèle** : un tableau d''objets { id, texte, faite }.
3. **Affichage** : une fonction afficher() qui reconstruit la liste à partir du modèle.
4. **Événements** : ajout (submit), basculer (click sur une case), suppression.
5. **Persistance** : localStorage.setItem("taches", JSON.stringify(taches)).

### Séparer la logique de l''affichage

La logique (ajouter, basculer, supprimer) se teste sans page : c''est ce que fait l''exemple ci-dessous. L''affichage n''est qu''une traduction du modèle en HTML.

## Autres idées de projets

- Calculatrice de moyenne pondérée.
- Quiz interactif avec score.
- Convertisseur de devises (avec une API).', array['Séparer modèle, logique et affichage.', 'localStorage conserve les données dans le navigateur.', 'Tester la logique indépendamment de la page.']::text[], '[{"language":"javascript","title":"Logique du gestionnaire de tâches","code":"let taches = [];\nlet prochainId = 1;\n\nfunction ajouter(texte) {\n  if (!texte.trim()) throw new Error(\"Tâche vide\");\n  taches.push({ id: prochainId++, texte: texte.trim(), faite: false });\n}\nfunction basculer(id) {\n  taches = taches.map((t) => (t.id === id ? { ...t, faite: !t.faite } : t));\n}\nfunction supprimer(id) {\n  taches = taches.filter((t) => t.id !== id);\n}\nfunction afficher() {\n  taches.forEach((t) => console.log((t.faite ? \"[x] \" : \"[ ] \") + t.texte));\n  console.log(\"---\");\n}\n\najouter(\"Réviser les boucles\");\najouter(\"Faire l''exercice FizzBuzz\");\najouter(\"Lire la leçon sur les promesses\");\nbasculer(2);\nafficher();\nsupprimer(1);\nafficher();"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'javascript') and m.slug not in ('langage', 'fonctions-donnees', 'web', 'asynchrone', 'professionnel') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'javascript'), 1, 'Niveau 1 — Très débutant : le langage', 'Variables, types, opérateurs, conditions et boucles.', array['Écrire et exécuter du JavaScript.', 'Utiliser let, const et les types.', 'Écrire conditions et boucles.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'javascript'), null, 'javascript-examen-niveau-1', 'Examen du niveau 1 — Bases de JavaScript', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'javascript-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-examen-niveau-1'), 'qcm', 'Que vaut "3" + 4 ?', null, '["7","\"34\"","erreur","NaN"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-examen-niveau-1'), 'qcm', 'Quel mot-clé déclare une variable non réaffectable ?', null, '["var","let","const"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-examen-niveau-1'), 'vrai_faux', '=== compare la valeur et le type.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-examen-niveau-1'), 'qcm', 'Comment obtenir la division entière de 17 par 5 ?', null, '["17 // 5","Math.floor(17 / 5)","17 DIV 5","int(17 / 5)"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-examen-niveau-1'), 'qcm', 'Que parcourt for (const x of tableau) ?', null, '["les indices","les valeurs","les clés","rien"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-examen-niveau-1'), 'qcm', 'Que vaut typeof 3.5 ?', null, '["\"float\"","\"number\"","\"double\"","\"real\""]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'javascript'), 2, 'Niveau 2 — Débutant : fonctions, données et page web', 'Fonctions, tableaux et objets, DOM et événements.', array['Écrire des fonctions.', 'Manipuler tableaux et objets.', 'Modifier une page et réagir aux actions.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'javascript'), 3, 'Niveau 3 — Intermédiaire : asynchronisme et API', 'Promesses, async/await et consommation d''API.', array['Comprendre l''asynchronisme.', 'Consommer une API web.']::text[], array['Modules ES et organisation du code', 'Débogage dans le navigateur']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'javascript'), 4, 'Niveau 4 — Professionnel : applications web', 'Architecture d''une application, tests, sécurité web et performances.', array['Concevoir l''architecture d''un programme JavaScript de taille réelle.', 'Mesurer et améliorer les performances.', 'Écrire du code sûr et le tester automatiquement.', 'Mener un projet professionnel de bout en bout.']::text[], array['Architecture d''une application front-end', 'Tests automatisés', 'Sécurité web (XSS, CSRF)', 'Performances web', 'Projet professionnel']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'javascript'), null, 'javascript-positionnement', 'Test de positionnement — JavaScript', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'javascript-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Quel mot-clé déclare une variable réaffectable ?', null, '["const","let","final","def"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Que vaut 2 === "2" ?', null, '["true","false"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Quelle méthode ajoute un élément à la fin d''un tableau ?', null, '["add","push","append","insert"]'::jsonb, 2, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Quelle méthode réagit à un clic sur un élément ?', null, '["onClick()","addEventListener(\"click\", …)","listen(\"click\")","click.on()"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Que renvoie une fonction déclarée async ?', null, '["une valeur","une Promise","un callback","undefined"]'::jsonb, 4, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Quelle fonction effectue une requête HTTP ?', null, '["fetch","request","http","ajax"]'::jsonb, 5, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Quelle faille consiste à injecter du script dans une page ?', null, '["CSRF","XSS","DDoS","SQLi"]'::jsonb, 6, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-positionnement'), 'qcm', 'Quel outil sert aux tests automatisés en JavaScript ?', null, '["Vitest","Webpack","ESLint","Prettier"]'::jsonb, 7, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'javascript'), null, 'javascript-evaluation-finale', 'Évaluation finale — JavaScript', true, 70, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'javascript-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-evaluation-finale'), 'qcm', 'Que vaut "3" + 4 en JavaScript ?', null, '["7","\"34\"","Erreur","NaN"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-evaluation-finale'), 'qcm', 'Quel mot-clé déclare une variable non réaffectable ?', null, '["var","let","const","static"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-evaluation-finale'), 'vrai_faux', '=== compare la valeur et le type.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'javascript-evaluation-finale'), 'qcm', 'Quelle méthode garde les éléments vérifiant une condition ?', null, '["map","filter","reduce","forEach"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== Java =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('java', 'java', (select id from public.course_categories where slug = 'programmation'), 'Parcours E', 'Java', 'La programmation orientée objet, rigoureuse et portable.', 'Java est utilisé dans les applications d''entreprise, Android et les systèmes distribués. Ce parcours présente la syntaxe, les méthodes, puis approfondit la programmation orientée objet : classes, constructeurs, encapsulation, héritage, polymorphisme, interfaces, collections, exceptions, fichiers et structures de données.', 'intermediaire', array['Parcours Algorithmique, modules 1 à 4.', 'Notions d''objets (parcours Python, leçon POO) recommandées.']::text[], array['Écrire des programmes Java structurés.', 'Concevoir des classes selon les principes de la POO.', 'Utiliser les collections et gérer les exceptions.', 'Implémenter des structures de données.']::text[], 32, 'publie', 7, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'java'), 'bases', 'Les bases', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'bases'), (select id from public.courses where slug = 'java'), 'presentation', 'Présentation de Java', 'debutant', 20, array['Comprendre la compilation en bytecode.', 'Écrire la classe Main.']::text[], '{}'::text[], '## Compiler une fois, exécuter partout

Le code Java est compilé en **bytecode**, exécuté par la **machine virtuelle Java (JVM)**. Le même programme fonctionne sur Windows, Linux, macOS ou Android.

## Premier programme

~~~java
public class Main {
    public static void main(String[] args) {
        System.out.println("Bonjour UPL !");
    }
}
~~~

- Tout code Java est placé dans une **classe**.
- L''exécution commence par la méthode **main**.
- Sur la plateforme, la classe principale doit s''appeler **Main**.

## Lire au clavier

~~~java
import java.util.Scanner;
Scanner sc = new Scanner(System.in);
int n = sc.nextInt();
String ligne = sc.nextLine();
~~~', array['Java est compilé en bytecode exécuté par la JVM.', 'Tout est dans une classe ; main est le point d''entrée.', 'Scanner lit les entrées.']::text[], '[{"language":"java","title":"Bonjour","code":"public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Bonjour UPL !\");\n        System.out.println(\"Java a été créé en \" + 1995);\n    }\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'bases'), (select id from public.courses where slug = 'java'), 'variables-types', 'Variables et types', 'debutant', 25, array['Déclarer des variables typées.', 'Distinguer types primitifs et String.']::text[], '{}'::text[], '## Types primitifs

| Type | Contenu |
|---|---|
| int, long | entiers |
| double | réels |
| boolean | true / false |
| char | un caractère |

~~~java
int age = 20;
double moyenne = 13.5;
final double PI = 3.14159;   // constante
String nom = "Amani";        // objet, pas un primitif
~~~

## Division

7 / 2 vaut 3 (division entière) ; 7 / 2.0 vaut 3.5. Le reste s''obtient avec %.

## Comparer des chaînes

Utilisez **a.equals(b)** et non ==, qui compare les références.

## var

Depuis Java 10, **var** laisse le compilateur déduire le type : var total = 0;', array['Types primitifs : int, double, boolean, char.', 'final déclare une constante.', 'equals compare le contenu des chaînes.']::text[], '[{"language":"java","title":"Types","code":"public class Main {\n    public static void main(String[] args) {\n        int a = 7, b = 2;\n        System.out.println(a / b + \" \" + (double) a / b + \" \" + a % b);\n        String s1 = \"UPL\";\n        String s2 = new String(\"UPL\");\n        System.out.println(s1 == s2);\n        System.out.println(s1.equals(s2));\n    }\n}"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'bases'), (select id from public.courses where slug = 'java'), 'conditions-boucles', 'Conditions et boucles', 'debutant', 30, array['Utiliser if, switch, for, while et for-each.']::text[], '{}'::text[], '## Conditions

~~~java
if (note >= 10) {
    System.out.println("Admis");
} else {
    System.out.println("Ajourné");
}
~~~

Le **switch** moderne (Java 14 et plus) :

~~~java
String type = switch (jour) {
    case 6, 7 -> "Week-end";
    default -> "Semaine";
};
~~~

## Boucles

~~~java
for (int i = 1; i <= 10; i++) { ... }
while (condition) { ... }
do { ... } while (condition);
for (int note : notes) { ... }   // for-each
~~~', array['if / else, switch avec ->.', 'for, while, do…while, for-each.', 'Attention aux parenthèses dans les concaténations.']::text[], '[{"language":"java","title":"Table de multiplication","code":"import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        for (int i = 1; i <= 10; i++) {\n            System.out.println(n + \" x \" + i + \" = \" + (n * i));\n        }\n    }\n}","stdin":"6"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'bases'), (select id from public.courses where slug = 'java'), 'methodes', 'Méthodes', 'debutant', 25, array['Écrire des méthodes statiques.', 'Utiliser la surcharge.']::text[], '{}'::text[], '## Méthodes statiques

~~~java
static int carre(int x) {
    return x * x;
}
~~~

**static** signifie que la méthode appartient à la classe et non à un objet.

## Surcharge

Plusieurs méthodes peuvent porter le même nom si leurs paramètres diffèrent :

~~~java
static double aire(double r) { return Math.PI * r * r; }
static double aire(double l, double h) { return l * h; }
~~~

## Passage des paramètres

Java passe toujours **une copie** : copie de la valeur pour les primitifs, copie de la **référence** pour les objets (l''objet lui-même peut donc être modifié).', array['static : méthode de classe.', 'La surcharge varie les paramètres.', 'Les arguments sont des copies (valeurs ou références).']::text[], '[{"language":"java","title":"Méthodes","code":"public class Main {\n    static boolean estPremier(int n) {\n        if (n < 2) return false;\n        for (int d = 2; d * d <= n; d++) {\n            if (n % d == 0) return false;\n        }\n        return true;\n    }\n\n    public static void main(String[] args) {\n        StringBuilder sb = new StringBuilder();\n        for (int k = 2; k < 40; k++) {\n            if (estPremier(k)) sb.append(k).append(\" \");\n        }\n        System.out.println(sb.toString().trim());\n    }\n}"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'java'), 'objets', 'Objets et collections', null, 2, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'objets'), (select id from public.courses where slug = 'java'), 'classes-objets', 'Classes, objets et constructeurs', 'intermediaire', 35, array['Définir une classe avec attributs, constructeur et méthodes.', 'Créer des objets avec new.']::text[], '{}'::text[], '## Une classe

~~~java
class Etudiant {
    String nom;
    double moyenne;

    Etudiant(String nom, double moyenne) {   // constructeur
        this.nom = nom;
        this.moyenne = moyenne;
    }

    boolean estAdmis() {
        return moyenne >= 10;
    }
}

Etudiant e = new Etudiant("Amani", 14.5);
~~~

- Le **constructeur** porte le nom de la classe et n''a pas de type de retour.
- **this** désigne l''objet courant.
- **new** crée un objet.

## toString

Redéfinir **toString()** permet d''afficher un objet lisiblement avec System.out.println.', array['Une classe regroupe attributs et méthodes.', 'Le constructeur initialise l''objet.', 'toString définit l''affichage.']::text[], '[{"language":"java","title":"Classe Etudiant","code":"class Etudiant {\n    String nom;\n    double moyenne;\n\n    Etudiant(String nom, double moyenne) {\n        this.nom = nom;\n        this.moyenne = moyenne;\n    }\n\n    boolean estAdmis() {\n        return moyenne >= 10;\n    }\n\n    @Override\n    public String toString() {\n        return nom + \" (\" + moyenne + \")\" + (estAdmis() ? \" admis\" : \" ajourné\");\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Etudiant[] promo = { new Etudiant(\"Amani\", 14.5), new Etudiant(\"Josué\", 8.75) };\n        for (Etudiant e : promo) System.out.println(e);\n    }\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'objets'), (select id from public.courses where slug = 'java'), 'encapsulation', 'Encapsulation', 'intermediaire', 25, array['Protéger les attributs avec private.', 'Écrire des accesseurs qui valident les données.']::text[], '{}'::text[], '## Cacher l''état interne

~~~java
class Compte {
    private double solde;

    public double getSolde() { return solde; }

    public void deposer(double montant) {
        if (montant <= 0) throw new IllegalArgumentException("Montant invalide");
        solde += montant;
    }
}
~~~

Les attributs **private** ne sont accessibles que depuis la classe. L''extérieur passe par des **méthodes publiques** qui garantissent la cohérence des données (pas de solde négatif, par exemple).

## Modificateurs d''accès

| Mot-clé | Accès |
|---|---|
| private | la classe seulement |
| (aucun) | le paquetage |
| protected | paquetage et sous-classes |
| public | tout le monde |', array['private protège les attributs.', 'Les méthodes publiques valident les modifications.', 'final empêche la réaffectation.']::text[], '[{"language":"java","title":"Compte encapsulé","code":"class Compte {\n    private final String titulaire;\n    private double solde;\n\n    Compte(String titulaire) { this.titulaire = titulaire; }\n\n    public double getSolde() { return solde; }\n\n    public void deposer(double m) {\n        if (m <= 0) throw new IllegalArgumentException(\"Montant invalide\");\n        solde += m;\n    }\n\n    public void retirer(double m) {\n        if (m > solde) throw new IllegalStateException(\"Solde insuffisant\");\n        solde -= m;\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Compte c = new Compte(\"Amani\");\n        c.deposer(5000);\n        c.retirer(1200);\n        System.out.println(\"Solde : \" + c.getSolde());\n        try {\n            c.retirer(99999);\n        } catch (IllegalStateException e) {\n            System.out.println(\"Refusé : \" + e.getMessage());\n        }\n    }\n}"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'objets'), (select id from public.courses where slug = 'java'), 'collections', 'Collections', 'intermediaire', 35, array['Utiliser ArrayList, HashMap et HashSet.']::text[], '{}'::text[], '## ArrayList

~~~java
List<Integer> notes = new ArrayList<>();
notes.add(12);
notes.get(0);
notes.size();
~~~

## HashMap

~~~java
Map<String, Integer> compte = new HashMap<>();
compte.put("python", 3);
compte.merge("python", 1, Integer::sum);
compte.getOrDefault("java", 0);
~~~

## HashSet

Ensemble sans doublons, recherche rapide avec **contains**.

## Génériques

Le type entre chevrons (**<Integer>**) indique ce que contient la collection. Les collections contiennent des objets : on écrit Integer et non int.', array['ArrayList : liste dynamique.', 'HashMap / TreeMap : clé → valeur.', 'HashSet : unicité.']::text[], '[{"language":"java","title":"Compter des mots","code":"import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        String texte = \"le code le plus simple est le meilleur code\";\n        Map<String, Integer> compte = new TreeMap<>();\n        for (String mot : texte.split(\" \")) {\n            compte.merge(mot, 1, Integer::sum);\n        }\n        for (Map.Entry<String, Integer> e : compte.entrySet()) {\n            System.out.println(e.getKey() + \" \" + e.getValue());\n        }\n        System.out.println(\"Distincts : \" + new HashSet<>(Arrays.asList(texte.split(\" \"))).size());\n    }\n}"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'objets'), (select id from public.courses where slug = 'java'), 'exceptions', 'Exceptions', 'intermediaire', 25, array['Intercepter et lever des exceptions.']::text[], '{}'::text[], '## try / catch / finally

~~~java
try {
    int n = Integer.parseInt(texte);
} catch (NumberFormatException e) {
    System.out.println("Nombre invalide");
} finally {
    System.out.println("Toujours exécuté");
}
~~~

## Exceptions vérifiées

Certaines exceptions (comme **IOException**) doivent être soit interceptées, soit déclarées avec **throws** dans la signature de la méthode : le compilateur l''exige.

## Lever une exception

**throw new IllegalArgumentException("message");**', array['try / catch / finally.', 'Les exceptions vérifiées doivent être traitées ou déclarées.', 'throw lève une exception.']::text[], '[{"language":"java","title":"Conversion sécurisée","code":"public class Main {\n    public static void main(String[] args) {\n        String[] valeurs = { \"12\", \"abc\", \"0\" };\n        for (String v : valeurs) {\n            try {\n                int n = Integer.parseInt(v);\n                System.out.println(\"100 / \" + n + \" = \" + (100 / n));\n            } catch (NumberFormatException e) {\n                System.out.println(\"''\" + v + \"'' n''est pas un entier\");\n            } catch (ArithmeticException e) {\n                System.out.println(\"Division par zéro\");\n            }\n        }\n    }\n}"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'java'), 'conception', 'Conception orientée objet', null, 3, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'conception'), (select id from public.courses where slug = 'java'), 'heritage-polymorphisme', 'Héritage et polymorphisme', 'avance', 40, array['Créer une sous-classe avec extends.', 'Redéfinir une méthode.', 'Exploiter le polymorphisme.']::text[], '{}'::text[], '## Héritage

~~~java
class Forme {
    double aire() { return 0; }
}
class Cercle extends Forme {
    private final double r;
    Cercle(double r) { this.r = r; }
    @Override
    double aire() { return Math.PI * r * r; }
}
~~~

La sous-classe hérite des attributs et méthodes de la classe mère ; **super(...)** appelle le constructeur parent.

## Polymorphisme

Une variable de type **Forme** peut désigner un Cercle ou un Rectangle : la méthode appelée est celle de **l''objet réel**.

~~~java
Forme[] formes = { new Cercle(1), new Rectangle(2, 3) };
for (Forme f : formes) System.out.println(f.aire());
~~~

## Classes abstraites

Une classe **abstract** ne peut pas être instanciée et peut déclarer des méthodes sans corps, que les sous-classes doivent définir.', array['extends crée une sous-classe.', '@Override redéfinit une méthode.', 'Le polymorphisme appelle la méthode de l''objet réel.']::text[], '[{"language":"java","title":"Formes","code":"abstract class Forme {\n    abstract double aire();\n    String nom() { return getClass().getSimpleName(); }\n}\n\nclass Cercle extends Forme {\n    private final double r;\n    Cercle(double r) { this.r = r; }\n    double aire() { return Math.PI * r * r; }\n}\n\nclass Rectangle extends Forme {\n    private final double l, h;\n    Rectangle(double l, double h) { this.l = l; this.h = h; }\n    double aire() { return l * h; }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Forme[] formes = { new Cercle(1), new Rectangle(2, 3), new Cercle(2.5) };\n        for (Forme f : formes) {\n            System.out.printf(\"%s : %.2f%n\", f.nom(), f.aire());\n        }\n    }\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'java'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'java') and slug = 'heritage-polymorphisme'), 'java-heritage-quiz', 'Héritage', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'java-heritage-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-heritage-quiz'), 'vrai_faux', 'On peut créer un objet d''une classe abstraite avec new.', null, '["Vrai","Faux"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'conception'), (select id from public.courses where slug = 'java'), 'interfaces', 'Interfaces', 'avance', 25, array['Définir et implémenter une interface.']::text[], '{}'::text[], '## Un contrat

Une **interface** décrit ce qu''une classe sait faire, sans dire comment :

~~~java
interface Evaluable {
    double note();
    default boolean reussi() { return note() >= 10; }
}

class Examen implements Evaluable {
    public double note() { return 14; }
}
~~~

Une classe n''hérite que d''une seule classe, mais peut **implémenter plusieurs interfaces**.

## Interfaces utiles

**Comparable<T>** (ordre naturel), **Comparator<T>** (ordre personnalisé), **Runnable**.', array['Une interface est un contrat.', 'implements, éventuellement plusieurs.', 'Comparable définit l''ordre naturel.']::text[], '[{"language":"java","title":"Comparable","code":"import java.util.Arrays;\n\nclass Etudiant implements Comparable<Etudiant> {\n    final String nom;\n    final double moyenne;\n    Etudiant(String nom, double moyenne) { this.nom = nom; this.moyenne = moyenne; }\n    public int compareTo(Etudiant autre) { return Double.compare(autre.moyenne, moyenne); }\n    public String toString() { return nom + \" \" + moyenne; }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Etudiant[] promo = { new Etudiant(\"Amani\", 14.5), new Etudiant(\"Grâce\", 17), new Etudiant(\"Josué\", 11) };\n        Arrays.sort(promo);\n        System.out.println(Arrays.toString(promo));\n    }\n}"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'conception'), (select id from public.courses where slug = 'java'), 'fichiers', 'Fichiers', 'intermediaire', 25, array['Lire et écrire des fichiers avec java.nio.file.']::text[], '{}'::text[], '## Écrire et lire

~~~java
Path chemin = Path.of("notes.txt");
Files.writeString(chemin, "Amani;15\nGrace;17\n");
List<String> lignes = Files.readAllLines(chemin);
~~~

## try-with-resources

~~~java
try (BufferedReader r = Files.newBufferedReader(chemin)) {
    String ligne;
    while ((ligne = r.readLine()) != null) { ... }
}
~~~

La ressource est fermée automatiquement, même en cas d''erreur.', array['Files et Path simplifient les fichiers.', 'try-with-resources ferme automatiquement.', 'IOException est vérifiée.']::text[], '[{"language":"java","title":"Fichier de notes","code":"import java.io.IOException;\nimport java.nio.file.*;\nimport java.util.List;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        Path p = Paths.get(\"notes.txt\");\n        Files.write(p, List.of(\"Amani;15\", \"Grace;17\", \"Josue;9\"));\n        for (String ligne : Files.readAllLines(p)) {\n            String[] parties = ligne.split(\";\");\n            int note = Integer.parseInt(parties[1]);\n            System.out.println(parties[0] + \" : \" + (note >= 10 ? \"admis\" : \"ajourné\"));\n        }\n    }\n}"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'java'), 'professionnel', 'Java professionnel', null, 4, 4)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'java') and slug = 'professionnel'), (select id from public.courses where slug = 'java'), 'structures-donnees', 'Structures de données', 'avance', 40, array['Implémenter une pile générique.', 'Utiliser Deque et PriorityQueue.']::text[], '{}'::text[], '## Une pile générique

On peut écrire ses propres structures avec les génériques : **class Pile<T>**.

## Les structures de la bibliothèque

| Besoin | Classe |
|---|---|
| Pile / file | ArrayDeque |
| File de priorité | PriorityQueue |
| Liste chaînée | LinkedList |
| Arbre ordonné | TreeMap, TreeSet |

## Complexités

ArrayDeque : ajout/retrait aux extrémités en O(1). PriorityQueue : ajout et retrait du minimum en O(log n). TreeMap : opérations en O(log n).', array['Les génériques rendent les structures réutilisables.', 'ArrayDeque, PriorityQueue, TreeMap couvrent la plupart des besoins.', 'Connaître les complexités guide le choix.']::text[], '[{"language":"java","title":"Pile générique","code":"import java.util.ArrayList;\nimport java.util.PriorityQueue;\n\nclass Pile<T> {\n    private final ArrayList<T> elements = new ArrayList<>();\n    void empiler(T x) { elements.add(x); }\n    T depiler() {\n        if (elements.isEmpty()) throw new IllegalStateException(\"Pile vide\");\n        return elements.remove(elements.size() - 1);\n    }\n    boolean estVide() { return elements.isEmpty(); }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Pile<String> pile = new Pile<>();\n        for (String s : new String[] { \"a\", \"b\", \"c\" }) pile.empiler(s);\n        StringBuilder sb = new StringBuilder();\n        while (!pile.estVide()) sb.append(pile.depiler());\n        System.out.println(\"Dépilé : \" + sb);\n\n        PriorityQueue<Integer> pq = new PriorityQueue<>();\n        for (int x : new int[] { 42, 7, 19, 3 }) pq.add(x);\n        System.out.print(\"Par priorité :\");\n        while (!pq.isEmpty()) System.out.print(\" \" + pq.poll());\n        System.out.println();\n    }\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'java') and m.slug not in ('bases', 'objets', 'conception', 'professionnel') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'java'), 1, 'Niveau 1 — Très débutant : les bases', 'Présentation, variables, conditions, boucles et méthodes.', array['Écrire et exécuter un programme Java.', 'Utiliser types, conditions et boucles.', 'Écrire des méthodes.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'java'), null, 'java-examen-niveau-1', 'Examen du niveau 1 — Bases de Java', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'java-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-examen-niveau-1'), 'qcm', 'Comment compare-t-on le contenu de deux String ?', null, '["==","equals","=","compare"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-examen-niveau-1'), 'qcm', 'Que vaut 7 / 2 entre deux int ?', null, '["3.5","3","4","erreur"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-examen-niveau-1'), 'qcm', 'Quel mot-clé déclare une constante ?', null, '["const","final","static","let"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-examen-niveau-1'), 'qcm', 'Que vaut "Somme : " + 2 + 3 ?', null, '["\"Somme : 5\"","\"Somme : 23\"","erreur","5"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-examen-niveau-1'), 'vrai_faux', 'La surcharge permet plusieurs méthodes de même nom avec des paramètres différents.', null, '["Vrai","Faux"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-examen-niveau-1'), 'qcm', 'Où commence l''exécution d''un programme Java ?', null, '["la méthode main","le constructeur","la première classe","la méthode start"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'java'), 2, 'Niveau 2 — Débutant : objets et collections', 'Classes, encapsulation, collections et exceptions.', array['Concevoir des classes encapsulées.', 'Utiliser les collections.', 'Gérer les exceptions.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'java'), 3, 'Niveau 3 — Intermédiaire : conception orientée objet', 'Héritage, polymorphisme, interfaces et fichiers.', array['Exploiter héritage et polymorphisme.', 'Définir des interfaces.', 'Lire et écrire des fichiers.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'java'), 4, 'Niveau 4 — Professionnel : Java en entreprise', 'Structures de données, architecture, tests et performances.', array['Concevoir l''architecture d''un programme Java de taille réelle.', 'Mesurer et améliorer les performances.', 'Écrire du code sûr et le tester automatiquement.', 'Mener un projet professionnel de bout en bout.']::text[], array['Architecture en couches', 'Tests unitaires avec JUnit', 'Gestion de projet avec Maven', 'Projet professionnel']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'java'), null, 'java-positionnement', 'Test de positionnement — Java', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'java-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'qcm', 'Quelle méthode est le point d''entrée d''un programme Java ?', null, '["start","main","run","init"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'qcm', 'Quel type stocke un nombre à virgule ?', null, '["int","double","char","boolean"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'qcm', 'Quel mot-clé crée un objet ?', null, '["new","create","make","object"]'::jsonb, 2, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'qcm', 'Quelle collection stocke des paires clé → valeur ?', null, '["ArrayList","HashMap","HashSet","LinkedList"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'qcm', 'Quel mot-clé exprime l''héritage d''une classe ?', null, '["implements","extends","inherits","super"]'::jsonb, 4, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'vrai_faux', 'Une classe peut implémenter plusieurs interfaces.', null, '["Vrai","Faux"]'::jsonb, 5, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'qcm', 'Quelle bibliothèque est la référence des tests unitaires en Java ?', null, '["JUnit","Maven","Spring","Log4j"]'::jsonb, 6, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-positionnement'), 'qcm', 'Quel outil gère les dépendances d''un projet Java ?', null, '["Maven","javac","jar","javadoc"]'::jsonb, 7, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'java'), null, 'java-evaluation-finale', 'Évaluation finale — Java', true, 70, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'java-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-evaluation-finale'), 'qcm', 'Comment compare-t-on le contenu de deux String ?', null, '["==","equals","compare","="]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-evaluation-finale'), 'qcm', 'Quel mot-clé crée une sous-classe ?', null, '["implements","extends","inherits","super"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-evaluation-finale'), 'vrai_faux', 'Une classe Java peut implémenter plusieurs interfaces.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'java-evaluation-finale'), 'qcm', 'Quelle collection garantit l''unicité ?', null, '["ArrayList","HashSet","LinkedList","ArrayDeque"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== Formation complète PHP — du débutant au professionnel =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('php', 'php', (select id from public.course_categories where slug = 'web'), 'Parcours H', 'Formation complète PHP — du débutant au professionnel', 'Le langage serveur qui fait tourner une grande partie du web.', 'PHP génère des pages web dynamiques, traite les formulaires, gère les sessions et dialogue avec les bases de données. Cette formation va des premières lignes (echo, variables, conditions) jusqu''à la programmation orientée objet, PDO, les API JSON, la sécurité et l''architecture professionnelle. Chaque exemple est exécuté par le vrai PHP 8.3 dans votre navigateur.', 'debutant', array['Bases de HTML (parcours HTML, niveau 1).', 'Notions d''algorithmique : variables, conditions, boucles (parcours Algorithmique, niveau 2).']::text[], array['Écrire des pages PHP dynamiques et traiter des formulaires en toute sécurité.', 'Structurer un programme avec des fonctions, des tableaux et des classes.', 'Accéder à une base de données avec PDO et des requêtes préparées.', 'Appliquer les règles de sécurité professionnelles (XSS, injection SQL, mots de passe, sessions).']::text[], 60, 'publie', 8, now())
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
commit;
