-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 6 sur 14.
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

-- ===== K+ — programmer en français =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('kplus', 'kplus', (select id from public.course_categories where slug = 'programmation'), 'Parcours F', 'K+ — programmer en français', 'Programmer en français, jusqu''aux sites web dynamiques.', 'K+ est un langage de programmation dont les mots-clés sont en français (si … alors … fin, afficher, demander). Ce parcours commence par les bases de la programmation, puis apprend à créer de vrais sites web dynamiques : boutons, champs de saisie, listes qui se remplissent, minuteries, et publication du site.', 'debutant', array['Aucun : le parcours commence au tout début.']::text[], array['Écrire des programmes K+ : variables, calculs, conditions, boucles et fonctions.', 'Comprendre et corriger les messages d''erreur.', 'Créer des pages web qui réagissent aux actions du visiteur.', 'Publier un site créé avec K+.']::text[], 16, 'publie', 8, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'kplus'), 'bases', 'Les bases du langage K+', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'kplus') and slug = 'bases'), (select id from public.courses where slug = 'kplus'), 'kplus-introduction', 'Découvrir K+', 'debutant', 20, array['Savoir ce qu''est K+ et à quoi il sert.', 'Écrire et exécuter un premier programme avec afficher.', 'Écrire des commentaires.']::text[], '{}'::text[], '## Un langage de programmation en français

**K+** est un langage de programmation dont les mots-clés sont en français. Un programme K+ se lit presque comme une phrase :

~~~kplus
si age >= 18 alors
    afficher("Tu es majeur")
fin
~~~

Les fichiers K+ portent l''extension **.kplus**. Sur la plateforme, le vrai moteur K+ tourne dans votre navigateur : vos programmes s''exécutent même sans Internet une fois l''éditeur préparé.

## Afficher

**afficher(…)** écrit une ou plusieurs valeurs, séparées par une espace, puis passe à la ligne :

~~~kplus
afficher("Bienvenue dans K+")
afficher("2 + 3 =", 2 + 3)
~~~

## Commentaires

Un commentaire est ignoré par le moteur : il sert à expliquer le programme aux humains.

- **#** commente jusqu''à la fin de la ligne ;
- **/* … */** commente plusieurs lignes.

## Une instruction par ligne

En K+, chaque instruction occupe sa propre ligne : il n''y a pas de point-virgule. Les blocs (si, boucles, fonctions) se terminent par le mot-clé **fin**.', array['afficher(…) écrit des valeurs puis passe à la ligne.', '# et /* … */ écrivent des commentaires.', 'Une instruction par ligne ; les blocs se terminent par fin.']::text[], '[{"language":"kplus","title":"Premier programme","code":"# Mon premier programme K+\nafficher(\"Bienvenue dans K+\")\nafficher(\"2 + 3 =\", 2 + 3)\nafficher()          # ligne vide\nafficher(\"À bientôt !\")","explanation":"afficher() sans argument écrit une ligne vide."}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-introduction'), 'kplus-introduction-quiz', 'Découvrir K+', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'kplus-introduction-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-introduction-quiz'), 'qcm', 'Quelle est l''extension des fichiers K+ ?', null, '[".kp",".kplus",".k",".txt"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-introduction-quiz'), 'qcm', 'Qu''affiche afficher("A", 1 + 1) ?', null, '["A 2","A1+1","A2","\"A\" 2"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-introduction-quiz'), 'vrai_faux', 'En K+, chaque instruction se termine par un point-virgule.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Une instruction par ligne, sans point-virgule.' from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'kplus') and slug = 'bases'), (select id from public.courses where slug = 'kplus'), 'kplus-variables', 'Variables, constantes et types', 'debutant', 30, array['Déclarer une variable et une constante.', 'Connaître les types de K+.', 'Lire une saisie avec demander et la convertir.']::text[], '{}'::text[], '## Déclarer une variable

Une variable est une boîte qui porte un nom et contient une valeur. On la **déclare** avec le mot-clé **variable**, puis on peut changer sa valeur :

~~~kplus
variable age = 20
age = age + 1
~~~

Utiliser une variable non déclarée provoque une **Erreur de nom** : K+ refuse de deviner.

## Constantes

Une **constante** ne change jamais : `constante PI = 3.14159`. La modifier provoque une **Erreur de constante**.

## Les types

| Type | Exemples |
|---|---|
| entier | 0, 42, -7, 1_000_000 |
| décimal | 3.14, 2.0 (avec un point, pas une virgule) |
| texte | "Bonjour" |
| booléen | vrai, faux |
| nul | nul (absence de valeur) |
| liste | [1, 2, 3] |

**type(x)** donne le type d''une valeur.

## Lire une saisie

**demander("question")** lit une ligne tapée par l''utilisateur et la renvoie **sous forme de texte**. Pour calculer, on la convertit avec **entier(…)** ou **decimal(…)** :

~~~kplus
variable age = entier(demander("Votre âge ? "))
~~~

Sur la plateforme, les réponses se tapent dans la zone **Entrées**, une par ligne.', array['variable crée une variable ; constante une valeur fixe.', 'Types : entier, décimal, texte, booléen, nul, liste.', 'demander renvoie toujours un texte : convertir avec entier ou decimal.']::text[], '[{"language":"kplus","title":"Variables et types","code":"variable nom = \"Awa\"\nvariable age = 20\nconstante PI = 3.14159\nafficher(nom, \"a\", age, \"ans\")\nafficher(type(nom), type(age), type(PI), type(vrai))"},{"language":"kplus","title":"Lire et convertir une saisie","code":"variable nom = demander(\"Votre nom ? \")\nvariable age = entier(demander(\"Votre âge ? \"))\nafficher(\"Bonjour\", nom, \"- l''an prochain vous aurez\", age + 1, \"ans.\")","stdin":"Awa\n20\n","explanation":"demander renvoie un texte : entier(…) le convertit pour pouvoir calculer."}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-variables'), 'kplus-variables-quiz', 'Variables et types', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'kplus-variables-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-variables-quiz'), 'qcm', 'Que renvoie demander(…) ?', null, '["un entier","un texte","un décimal","ça dépend de la saisie"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-variables-quiz'), 'qcm', 'Comment écrit-on trois et demi en K+ ?', null, '["3,5","3.5","3½","\"3.5\""]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-variables-quiz'), 'vrai_faux', 'On peut changer la valeur d''une constante.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'kplus') and slug = 'bases'), (select id from public.courses where slug = 'kplus'), 'kplus-calculs', 'Calculs et textes', 'debutant', 30, array['Utiliser les opérateurs et leurs priorités.', 'Distinguer division, modulo et puissance.', 'Assembler des textes.']::text[], '{}'::text[], '## Les opérateurs

| Opérateur | Rôle | Exemple |
|---|---|---|
| + - * | addition, soustraction, multiplication | 2 + 3 * 4 vaut 14 |
| / | division (résultat décimal) | 7 / 2 vaut 3.5 ; 10 / 2 vaut 5.0 |
| % | reste de la division | 17 % 5 vaut 2 |
| ^ | puissance | 2 ^ 10 vaut 1024 |

La multiplication et la division passent avant l''addition ; les parenthèses changent l''ordre : (2 + 3) * 4 vaut 20.

Pour une division entière, on garde la partie entière : **entier(17 / 5)** vaut 3. Diviser par zéro provoque une **Erreur de division par zéro**.

## Les textes

Le signe **+** assemble deux textes : "Bon" + "jour" donne "Bonjour". Pour assembler un texte et un nombre, on convertit le nombre avec **texte(…)** : K+ refuse "Âge : " + 20, pour éviter les surprises.

Fonctions utiles : **longueur(t)**, **arrondir(x, n)**, **racine(x)**, **absolu(x)**.', array['/ donne toujours un décimal ; % donne le reste ; ^ la puissance.', '+ assemble deux textes ; texte(…) convertit un nombre.', 'entier(a / b) donne la partie entière.']::text[], '[{"language":"kplus","title":"Opérateurs","code":"afficher(2 + 3 * 4, (2 + 3) * 4)\nafficher(7 / 2, 10 / 2, 17 % 5, 2 ^ 10)\nafficher(entier(17 / 5), arrondir(3.14159, 2))"},{"language":"kplus","title":"Assembler des textes","code":"variable prenom = \"Awa\"\nvariable note = 15\nafficher(\"Élève : \" + prenom)\nafficher(\"Note : \" + texte(note) + \"/20\")\nafficher(\"Le prénom a\", longueur(prenom), \"lettres\")"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'kplus') and slug = 'bases'), (select id from public.courses where slug = 'kplus'), 'kplus-conditions', 'Conditions', 'debutant', 30, array['Écrire si … alors … sinon … fin.', 'Enchaîner plusieurs cas avec sinon si.', 'Combiner des conditions avec et, ou, non.']::text[], '{}'::text[], '## si … alors … fin

~~~kplus
si note >= 10 alors
    afficher("Admis")
sinon
    afficher("Ajourné")
fin
~~~

Un seul **fin** termine tout le bloc. Pour plusieurs cas, on écrit **sinon si** :

~~~kplus
si note >= 16 alors
    afficher("Très bien")
sinon si note >= 10 alors
    afficher("Admis")
sinon
    afficher("Ajourné")
fin
~~~

## Comparer et combiner

Comparaisons : == (égal), != (différent), <, <=, >, >=. Pour comparer, on écrit **==** : un seul = sert à donner une valeur.

Combinaisons : **et**, **ou**, **non** — par exemple `si age >= 18 et age < 65 alors`.

K+ exige une vraie condition (vrai ou faux) : `si 1 alors` est une erreur.', array['si … alors … sinon si … sinon … fin.', '== compare, = donne une valeur.', 'et, ou, non combinent des conditions.']::text[], '[{"language":"kplus","title":"Mention","code":"variable note = entier(demander())\nsi note >= 16 alors\n    afficher(\"Très bien\")\nsinon si note >= 14 alors\n    afficher(\"Bien\")\nsinon si note >= 10 alors\n    afficher(\"Admis\")\nsinon\n    afficher(\"Ajourné\")\nfin","stdin":"15\n"}]'::jsonb, null, 'publie', 4, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'kplus'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'kplus') and slug = 'kplus-conditions'), 'kplus-conditions-quiz', 'Conditions', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'kplus-conditions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-conditions-quiz'), 'qcm', 'Combien de « fin » faut-il pour si … sinon si … sinon ?', null, '["1","2","3","aucun"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-conditions-quiz'), 'qcm', 'Quel opérateur teste l''égalité ?', null, '["=","==","===","egal"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'kplus-conditions-quiz'), 'vrai_faux', '« si 1 alors » est accepté par K+.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'La condition doit valoir vrai ou faux.' from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'kplus') and slug = 'bases'), (select id from public.courses where slug = 'kplus'), 'kplus-boucles', 'Boucles', 'debutant', 35, array['Répéter avec tant que.', 'Compter avec pour … de … à.', 'Parcourir une liste avec pour chaque.']::text[], '{}'::text[], '## tant que

~~~kplus
variable i = 1
tant que i <= 3 faire
    afficher(i)
    i = i + 1
fin
~~~

## pour (compteur)

`pour i de 1 à 5 faire … fin` : les deux bornes sont incluses. On peut ajouter un **pas** : `pour i de 10 à 0 pas -2 faire`. Attention : le mot-clé **à** prend un accent.

## pour chaque

`pour chaque fruit dans ["pomme", "kiwi"] faire … fin` parcourt une liste (ou les lettres d''un texte).

## arreter et continuer

**arreter** quitte la boucle ; **continuer** passe au tour suivant.', array['tant que répète tant que la condition est vraie.', 'pour i de a à b [pas p] : bornes incluses.', 'pour chaque parcourt une liste ou un texte.']::text[], '[{"language":"kplus","title":"Les trois boucles","code":"pour i de 1 à 3 faire\n    afficher(\"tour\", i)\nfin\npour chaque fruit dans [\"pomme\", \"kiwi\"] faire\n    afficher(fruit)\nfin\nvariable n = 0\ntant que n < 10 faire\n    n = n + 4\nfin\nafficher(\"n =\", n)"}]'::jsonb, null, 'publie', 5, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'kplus') and slug = 'bases'), (select id from public.courses where slug = 'kplus'), 'kplus-fonctions-listes', 'Fonctions, listes et erreurs', 'debutant', 40, array['Écrire et appeler une fonction.', 'Manipuler une liste.', 'Gérer une erreur avec essayer … attraper.']::text[], '{}'::text[], '## Fonctions

~~~kplus
fonction carre(x)
    retourner x * x
fin
afficher(carre(7))
~~~

Une fonction se déclare **avant** d''être appelée. Sans **retourner**, elle renvoie nul.

## Listes

`variable notes = [12, 15, 9]` ; `notes[0]` est le **premier** élément (on compte à partir de 0) ; **longueur(notes)** ; **ajouter(notes, 18)** ajoute à la fin.

## Gérer les erreurs

~~~kplus
essayer
    afficher(10 / 0)
attraper erreur
    afficher("Problème :", erreur)
fin
~~~

**lever "message"** déclenche sa propre erreur, par exemple quand une donnée est invalide.', array['fonction nom(paramètres) … retourner … fin.', 'Les listes commencent à l''indice 0.', 'essayer … attraper gère une erreur ; lever en déclenche une.']::text[], '[{"language":"kplus","title":"Maximum d''une liste","code":"fonction maximum(liste)\n    variable max = liste[0]\n    pour chaque x dans liste faire\n        si x > max alors\n            max = x\n        fin\n    fin\n    retourner max\nfin\nvariable notes = [12, 15, 9]\najouter(notes, 18)\nafficher(\"Notes :\", notes)\nafficher(\"Maximum :\", maximum(notes))"},{"language":"kplus","title":"Erreur attrapée","code":"essayer\n    afficher(entier(\"douze\"))\nattraper erreur\n    afficher(\"Saisie invalide :\", erreur)\nfin"}]'::jsonb, null, 'publie', 6, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'kplus'), 'sites-web', 'Sites web dynamiques avec K+', null, 2, 2)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
commit;
