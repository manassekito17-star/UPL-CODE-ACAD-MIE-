-- UPL CODE ACADEMY MK — installation, partie 2 (contenu), morceau 8 sur 14.
-- À exécuter dans l'ordre, après 1-structure.sql. Peut être relancé sans risque.
begin;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-objet'), (select id from public.courses where slug = 'php'), 'php-heritage-interfaces', 'Héritage, polymorphisme, interfaces, traits et namespaces', 'intermediaire', 45, array['Réutiliser du code par héritage.', 'Exploiter le polymorphisme.', 'Définir des contrats avec les interfaces.', 'Partager du code avec les traits et organiser avec les namespaces.']::text[], array['Classes et objets']::text[], '## Héritage

Une classe **fille** hérite des propriétés et méthodes de sa classe **mère** avec **extends**. Elle peut ajouter des éléments ou **redéfinir** une méthode ; **parent::methode()** appelle la version de la mère.

~~~php
<?php
class Personne
{
    public function __construct(protected string $nom) {}
    public function presenter(): string { return "Je suis {$this->nom}"; }
}

class Enseignant extends Personne
{
    public function __construct(string $nom, private string $cours) { parent::__construct($nom); }
    public function presenter(): string { return parent::presenter() . ", j''enseigne {$this->cours}"; }
}
~~~

## Classes abstraites

Une classe **abstract** ne peut pas être instanciée ; elle peut déclarer des méthodes **abstract** que chaque fille doit écrire.

## Polymorphisme

Des objets de classes différentes répondent au **même appel** chacun à leur manière. Une boucle peut appeler **->presenter()** sur une liste mêlant étudiants et enseignants : chaque objet utilise sa propre version.

## Interfaces

Une **interface** est un contrat : la liste des méthodes qu''une classe s''engage à fournir (**implements**). Une classe peut implémenter plusieurs interfaces. Le code qui reçoit un objet typé par l''interface fonctionne avec toutes les implémentations : c''est la base des architectures professionnelles (un « dépôt » de données en mémoire pour les tests, en base de données en production).

## Traits

Un **trait** regroupe des méthodes à copier dans plusieurs classes sans lien d''héritage (par exemple un horodatage de création) : **use Horodatable;** dans la classe.

## Namespaces

Les **espaces de noms** évitent les conflits de noms entre bibliothèques : **namespace App\Modeles;** en tête du fichier, puis **use App\Modeles\Etudiant;** ailleurs. Composer s''appuie dessus pour charger automatiquement les classes (norme PSR-4).', array['extends hérite ; parent:: appelle la version de la mère.', 'Une interface est un contrat ; implements s''y engage.', 'Polymorphisme : même appel, comportements différents.', 'Traits : partage de méthodes ; namespaces : organisation des classes.']::text[], '[{"language":"php","title":"Polymorphisme avec une interface","code":"<?php\ninterface Payable\n{\n    public function montant(): float;\n}\n\nabstract class Personne implements Payable\n{\n    public function __construct(protected string $nom) {}\n    abstract public function role(): string;\n    public function fiche(): string\n    {\n        return sprintf(\"%-8s %-12s %8.2f $\", $this->nom, $this->role(), $this->montant());\n    }\n}\n\ntrait Prime\n{\n    public function prime(float $base): float { return $base * 0.1; }\n}\n\nclass Enseignant extends Personne\n{\n    use Prime;\n    public function __construct(string $nom, private float $salaire) { parent::__construct($nom); }\n    public function role(): string { return \"enseignant\"; }\n    public function montant(): float { return $this->salaire + $this->prime($this->salaire); }\n}\n\nclass Etudiant extends Personne\n{\n    public function __construct(string $nom, private float $frais) { parent::__construct($nom); }\n    public function role(): string { return \"étudiant\"; }\n    public function montant(): float { return -$this->frais; }\n}\n\n$personnes = [new Enseignant(\"Mukendi\", 800), new Etudiant(\"Kito\", 450)];\nforeach ($personnes as $p) {\n    echo $p->fiche(), \"\\n\";\n}"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-heritage-interfaces'), 'php-heritage-quiz', 'Vérification — Héritage et interfaces', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-heritage-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-heritage-quiz'), 'qcm', 'Quel mot-clé crée une classe fille ?', null, '["implements","extends","use","inherits"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-heritage-quiz'), 'qcm', 'Peut-on instancier une classe abstraite ?', null, '["Oui","Non"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-heritage-quiz'), 'qcm', 'Combien d''interfaces une classe peut-elle implémenter ?', null, '["Une seule","Deux au plus","Plusieurs","Aucune"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-objet'), (select id from public.courses where slug = 'php'), 'php-exceptions', 'Exceptions et gestion des erreurs', 'intermediaire', 30, array['Lever et intercepter des exceptions.', 'Créer ses propres exceptions.', 'Utiliser finally pour libérer les ressources.']::text[], array['Héritage et interfaces']::text[], '## Lever une exception

Quand une situation empêche une fonction de faire son travail, elle **lève** une exception avec **throw** :

~~~php
<?php
function diviser(float $a, float $b): float
{
    if ($b == 0) {
        throw new DivisionByZeroError("Division par zéro");
    }
    return $a / $b;
}
~~~

## Intercepter avec try / catch

~~~php
<?php
try {
    echo diviser(10, 0);
} catch (DivisionByZeroError $e) {
    echo "Erreur : ", $e->getMessage();
} finally {
    echo "Toujours exécuté";
}
~~~

Le bloc **finally** s''exécute dans tous les cas (fermeture d''un fichier, d''une transaction…).

## La hiérarchie

Tout ce qui peut être levé implémente **Throwable**. Deux familles : **Exception** (erreurs prévisibles de l''application : donnée invalide, ressource introuvable) et **Error** (erreurs du moteur : TypeError, DivisionByZeroError). On intercepte du plus précis au plus général.

## Exceptions personnalisées

~~~php
<?php
class NoteInvalideException extends InvalidArgumentException {}
~~~

Une exception propre au métier rend le code lisible et permet de réagir précisément (afficher un message à l''utilisateur, journaliser, annuler une transaction).

## En production

Les messages techniques (requête SQL, chemin des fichiers) ne doivent pas être montrés aux visiteurs : on affiche un message générique et on enregistre le détail dans un journal (**error_log**).', array['throw lève, try/catch intercepte, finally s''exécute toujours.', 'Exception = erreurs de l''application ; Error = erreurs du moteur.', 'Créer ses exceptions rend le traitement précis.']::text[], '[{"language":"php","title":"Exception personnalisée","code":"<?php\nclass NoteInvalideException extends InvalidArgumentException {}\n\nfunction verifierNote(mixed $saisie): float\n{\n    if (!is_numeric($saisie)) {\n        throw new NoteInvalideException(\"« $saisie » n''est pas un nombre\");\n    }\n    $note = (float) $saisie;\n    if ($note < 0 || $note > 20) {\n        throw new NoteInvalideException(\"$note est hors de l''intervalle 0–20\");\n    }\n    return $note;\n}\n\nforeach ([\"15\", \"abc\", \"23\", \"9.5\"] as $saisie) {\n    try {\n        echo \"Note acceptée : \", verifierNote($saisie), \"\\n\";\n    } catch (NoteInvalideException $e) {\n        echo \"Refusée : \", $e->getMessage(), \"\\n\";\n    }\n}"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-exceptions'), 'php-exceptions-quiz', 'Vérification — Exceptions', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-exceptions-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-exceptions-quiz'), 'qcm', 'Quel bloc s''exécute même si une exception est levée ?', null, '["catch","finally","else","default"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-exceptions-quiz'), 'qcm', 'Quelle interface est commune à Exception et Error ?', null, '["Countable","Throwable","Stringable","Iterator"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-exceptions-quiz'), 'vrai_faux', 'On peut afficher le message SQL complet d''une exception aux visiteurs en production.', null, '["Vrai","Faux"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'php'), 'php-donnees-api', 'Bases de données avec PDO, JSON et API', null, 5, 3)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-donnees-api'), (select id from public.courses where slug = 'php'), 'php-pdo', 'PDO : se connecter et interroger une base de données', 'intermediaire', 50, array['Se connecter à une base avec PDO.', 'Exécuter des requêtes préparées (CRUD).', 'Comprendre et empêcher l''injection SQL.', 'Utiliser les transactions.']::text[], array['Exceptions', 'Parcours SQL, niveau 1']::text[], '## PDO, une interface unique

**PDO** (PHP Data Objects) dialogue avec MySQL, MariaDB, PostgreSQL, SQLite… avec le même code. Seule la **chaîne de connexion** (DSN) change :

~~~php
<?php
// MySQL / MariaDB sur un serveur
$pdo = new PDO("mysql:host=localhost;dbname=universite;charset=utf8mb4", "utilisateur", "mot_de_passe");
// SQLite (fichier ou mémoire) — utilisé sur la plateforme
$pdo = new PDO("sqlite::memory:");
~~~

Options recommandées : **PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION** (les erreurs SQL deviennent des exceptions) et **PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC** (lignes sous forme de tableaux associatifs).

Sur la plateforme, PHP tourne dans votre navigateur : il n''y a pas de serveur MySQL. Les exemples utilisent **SQLite** avec PDO. Le code PDO est identique ; seules quelques syntaxes SQL diffèrent (AUTO_INCREMENT en MySQL, AUTOINCREMENT en SQLite).

## L''injection SQL

Ne construisez **jamais** une requête en collant une donnée de l''utilisateur :

~~~php
<?php
// DANGEREUX
$sql = "SELECT * FROM utilisateurs WHERE email = ''" . $_POST["email"] . "''";
~~~

Avec l''e-mail **'' OR ''1''=''1**, la condition devient toujours vraie : l''attaquant lit toute la table, voire la supprime.

## Les requêtes préparées

La requête et les données voyagent **séparément** : la donnée ne peut jamais être interprétée comme du SQL.

~~~php
<?php
$stmt = $pdo->prepare("SELECT * FROM etudiants WHERE filiere = :filiere AND age >= :age");
$stmt->execute(["filiere" => $filiere, "age" => 18]);
$lignes = $stmt->fetchAll();
~~~

**fetch()** lit une ligne, **fetchAll()** toutes, **fetchColumn()** une seule valeur ; **rowCount()** donne le nombre de lignes modifiées et **lastInsertId()** l''identifiant créé.

## CRUD

| Opération | SQL | Méthode PDO |
|---|---|---|
| Créer | INSERT | prepare + execute, lastInsertId |
| Lire | SELECT | prepare + execute, fetch / fetchAll |
| Modifier | UPDATE | prepare + execute, rowCount |
| Supprimer | DELETE | prepare + execute, rowCount |

## Transactions

Plusieurs requêtes qui doivent réussir **ensemble** (virement : débit puis crédit) se placent dans une transaction : **beginTransaction()**, puis **commit()** si tout va bien, **rollBack()** en cas d''exception.', array['PDO : même code pour MySQL, PostgreSQL, SQLite ; seule la DSN change.', 'Jamais de donnée collée dans le SQL : requêtes préparées obligatoires.', 'fetch, fetchAll, fetchColumn, rowCount, lastInsertId.', 'beginTransaction / commit / rollBack : tout ou rien.']::text[], '[{"language":"php","title":"CRUD complet avec PDO et SQLite","code":"<?php\n$pdo = new PDO(\"sqlite::memory:\", null, null, [\n    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\n    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,\n]);\n$pdo->exec(\"CREATE TABLE etudiants (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, filiere TEXT NOT NULL, moyenne REAL)\");\n\n$ajout = $pdo->prepare(\"INSERT INTO etudiants (nom, filiere, moyenne) VALUES (:nom, :filiere, :moyenne)\");\nforeach ([[\"Kito\", \"Informatique\", 14.5], [\"Mbuyi\", \"Droit\", 11], [\"Kabila\", \"Informatique\", 9.5]] as [$nom, $filiere, $moyenne]) {\n    $ajout->execute(compact(\"nom\", \"filiere\", \"moyenne\"));\n}\necho \"Dernier identifiant : \", $pdo->lastInsertId(), \"\\n\";\n\n$maj = $pdo->prepare(\"UPDATE etudiants SET moyenne = :m WHERE nom = :n\");\n$maj->execute([\"m\" => 10.5, \"n\" => \"Kabila\"]);\necho \"Lignes modifiées : \", $maj->rowCount(), \"\\n\";\n\n$liste = $pdo->prepare(\"SELECT nom, moyenne FROM etudiants WHERE filiere = ? ORDER BY moyenne DESC\");\n$liste->execute([\"Informatique\"]);\nforeach ($liste->fetchAll() as $e) {\n    echo $e[\"nom\"], \" : \", $e[\"moyenne\"], \"\\n\";\n}\n\n// Tentative d''injection : traitée comme un simple texte\n$liste->execute([\"'' OR ''1''=''1\"]);\necho \"Résultats de l''injection : \", count($liste->fetchAll()), \"\\n\";"},{"language":"php","title":"Transaction : tout ou rien","code":"<?php\n$pdo = new PDO(\"sqlite::memory:\", null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);\n$pdo->exec(\"CREATE TABLE comptes (nom TEXT PRIMARY KEY, solde INTEGER NOT NULL CHECK (solde >= 0))\");\n$pdo->exec(\"INSERT INTO comptes VALUES (''A'', 100), (''B'', 50)\");\n\nfunction virement(PDO $pdo, string $de, string $vers, int $montant): void\n{\n    $pdo->beginTransaction();\n    try {\n        $pdo->prepare(\"UPDATE comptes SET solde = solde + ? WHERE nom = ?\")->execute([$montant, $vers]);\n        $pdo->prepare(\"UPDATE comptes SET solde = solde - ? WHERE nom = ?\")->execute([$montant, $de]);\n        $pdo->commit();\n        echo \"Virement de $montant réussi\\n\";\n    } catch (PDOException $e) {\n        $pdo->rollBack();\n        echo \"Virement de $montant annulé (solde insuffisant)\\n\";\n    }\n}\n\nvirement($pdo, \"A\", \"B\", 30);\nvirement($pdo, \"A\", \"B\", 500);\nforeach ($pdo->query(\"SELECT nom, solde FROM comptes\") as $c) {\n    echo $c[\"nom\"], \" : \", $c[\"solde\"], \"\\n\";\n}"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-pdo'), 'php-pdo-quiz', 'Vérification — PDO', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-pdo-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-pdo-quiz'), 'qcm', 'Qu''est-ce qui protège contre l''injection SQL ?', null, '["htmlspecialchars","Les requêtes préparées","trim","Un mot de passe long"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-pdo-quiz'), 'qcm', 'Quelle méthode renvoie l''identifiant de la dernière ligne insérée ?', null, '["rowCount()","lastInsertId()","fetch()","insertId"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-pdo-quiz'), 'qcm', 'Que fait rollBack() ?', null, '["Valide la transaction","Annule les modifications de la transaction","Ferme la connexion","Supprime la table"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-pdo-quiz'), 'vrai_faux', 'Le code PDO change complètement entre MySQL et SQLite.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Seules la chaîne de connexion et quelques syntaxes SQL changent.' from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-donnees-api'), (select id from public.courses where slug = 'php'), 'php-json-api', 'JSON et API REST en PHP', 'intermediaire', 35, array['Encoder et décoder du JSON.', 'Comprendre les principes d''une API REST.', 'Produire une réponse d''API avec le bon code HTTP.']::text[], array['PDO']::text[], '## JSON

**JSON** est le format d''échange des API : objets {"cle": valeur}, listes [ … ], nombres, textes, true/false/null.

- **json_encode($tableau)** produit du JSON ; l''option **JSON_PRETTY_PRINT** l''indente, **JSON_UNESCAPED_UNICODE** garde les accents lisibles ;
- **json_decode($texte, true)** renvoie un tableau associatif ; avec **JSON_THROW_ON_ERROR**, un JSON invalide lève une exception.

## Une API REST

Une API expose des **ressources** (étudiants, produits) à des adresses, et l''action dépend de la **méthode HTTP** :

| Méthode | Adresse | Action | Code de réponse |
|---|---|---|---|
| GET | /api/etudiants | liste | 200 |
| GET | /api/etudiants/7 | détail | 200 ou 404 |
| POST | /api/etudiants | création | 201 |
| PUT / PATCH | /api/etudiants/7 | modification | 200 |
| DELETE | /api/etudiants/7 | suppression | 204 |

Codes d''erreur courants : **400** (données invalides), **401** (non connecté), **403** (interdit), **404** (introuvable), **422** (validation), **500** (erreur serveur).

## Répondre en JSON

~~~php
<?php
header("Content-Type: application/json; charset=utf-8");
http_response_code(201);
echo json_encode(["id" => 7, "nom" => "Kito"]);
~~~

Le corps d''une requête POST en JSON se lit avec **file_get_contents("php://input")** puis json_decode. On valide ces données exactement comme un formulaire.

## Routage simple

Un **routeur** associe méthode + chemin à une fonction. Les frameworks (Laravel, Symfony, Slim) fournissent des routeurs complets ; écrire le sien une fois aide à comprendre leur fonctionnement.', array['json_encode / json_decode(…, true).', 'REST : ressource + méthode HTTP + code de réponse.', 'Content-Type: application/json et http_response_code().']::text[], '[{"language":"php","title":"Mini API avec routeur","code":"<?php\n$etudiants = [1 => [\"id\" => 1, \"nom\" => \"Kito\"], 2 => [\"id\" => 2, \"nom\" => \"Mbuyi\"]];\n\nfunction repondre(int $code, mixed $donnees): void\n{\n    echo \"HTTP $code\\n\", json_encode($donnees, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), \"\\n\\n\";\n}\n\nfunction traiter(string $methode, string $chemin, array &$etudiants, ?string $corps = null): void\n{\n    if ($methode === \"GET\" && $chemin === \"/api/etudiants\") {\n        repondre(200, array_values($etudiants));\n    } elseif ($methode === \"GET\" && preg_match(\"#^/api/etudiants/(\\d+)$#\", $chemin, $m)) {\n        isset($etudiants[(int) $m[1]]) ? repondre(200, $etudiants[(int) $m[1]]) : repondre(404, [\"erreur\" => \"Étudiant introuvable\"]);\n    } elseif ($methode === \"POST\" && $chemin === \"/api/etudiants\") {\n        $donnees = json_decode($corps ?? \"\", true);\n        if (!is_array($donnees) || trim($donnees[\"nom\"] ?? \"\") === \"\") {\n            repondre(422, [\"erreur\" => \"Le nom est obligatoire\"]);\n            return;\n        }\n        $id = max(array_keys($etudiants)) + 1;\n        $etudiants[$id] = [\"id\" => $id, \"nom\" => trim($donnees[\"nom\"])];\n        repondre(201, $etudiants[$id]);\n    } else {\n        repondre(404, [\"erreur\" => \"Route inconnue\"]);\n    }\n}\n\ntraiter(\"GET\", \"/api/etudiants/2\", $etudiants);\ntraiter(\"POST\", \"/api/etudiants\", $etudiants, ''{\"nom\": \"Kabila\"}'');\ntraiter(\"POST\", \"/api/etudiants\", $etudiants, ''{\"nom\": \"\"}'');\ntraiter(\"GET\", \"/api/etudiants/9\", $etudiants);"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-json-api'), 'php-json-quiz', 'Vérification — JSON et API', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-json-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-json-quiz'), 'qcm', 'Quel code HTTP pour une ressource créée ?', null, '["200","201","204","404"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-json-quiz'), 'qcm', 'Que renvoie json_decode(''{"a":1}'', true) ?', null, '["un objet stdClass","un tableau associatif","une chaîne","null"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-json-quiz'), 'qcm', 'Quelle méthode HTTP pour supprimer ?', null, '["GET","POST","DELETE","PATCH"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'php'), 'php-professionnel', 'PHP professionnel : sécurité, architecture et tests', null, 6, 4)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-professionnel'), (select id from public.courses where slug = 'php'), 'php-securite', 'Sécurité d''une application PHP', 'avance', 50, array['Stocker les mots de passe avec password_hash.', 'Se protéger du XSS, de l''injection SQL et du CSRF.', 'Sécuriser les sessions et les téléversements de fichiers.']::text[], array['PDO', 'Formulaires et sessions']::text[], '## Les mots de passe

On ne stocke **jamais** un mot de passe en clair, ni avec md5 ou sha1 (trop rapides à casser). On utilise :

~~~php
<?php
$empreinte = password_hash($motDePasse, PASSWORD_DEFAULT); // bcrypt ou argon2, avec sel aléatoire
if (password_verify($saisie, $empreinte)) { /* connecté */ }
~~~

**password_needs_rehash()** permet de renforcer l''empreinte lorsque l''algorithme évolue.

## Les principales failles

| Faille | Principe | Protection |
|---|---|---|
| Injection SQL | une donnée modifie la requête | requêtes préparées (PDO) |
| XSS | un script injecté s''exécute chez les visiteurs | htmlspecialchars à l''affichage, en-tête Content-Security-Policy |
| CSRF | un autre site fait envoyer un formulaire à la victime connectée | jeton aléatoire en session, vérifié à chaque POST ; cookies SameSite |
| Fixation / vol de session | l''identifiant de session est deviné ou volé | session_regenerate_id(true) à la connexion ; cookies httponly, secure, samesite |
| Téléversement malveillant | un fichier .php déguisé est envoyé puis exécuté | vérifier taille et type réel, renommer avec un nom aléatoire, stocker hors du dossier public |
| Force brute | essais répétés de mots de passe | limiter les tentatives, délai progressif |

## Le jeton CSRF

~~~php
<?php
$_SESSION["csrf"] ??= bin2hex(random_bytes(32));
// dans le formulaire : <input type="hidden" name="csrf" value="…">
if (!hash_equals($_SESSION["csrf"], $_POST["csrf"] ?? "")) {
    http_response_code(403);
    exit("Requête refusée");
}
~~~

**hash_equals** compare en temps constant ; **random_bytes** produit un aléa cryptographique (jamais rand()).

## Téléversement de fichiers

Avec **$_FILES** : vérifier **error === UPLOAD_ERR_OK**, la **taille**, le **type réel** (extension fileinfo : finfo_file), générer un nom aléatoire et déplacer avec **move_uploaded_file** dans un dossier où PHP ne s''exécute pas. Ne jamais faire confiance au nom ni au type envoyés par le navigateur.

## Principes généraux

- **moindre privilège** : l''utilisateur de la base n''a que les droits nécessaires ;
- **défense en profondeur** : plusieurs protections indépendantes ;
- **secrets hors du code** : mots de passe de base et clés dans des variables d''environnement, jamais dans Git ;
- **mises à jour** : PHP et les dépendances (composer audit).', array['password_hash / password_verify, jamais md5 ni mot de passe en clair.', 'Préparer (SQL), échapper (HTML), jeton (CSRF), régénérer (session).', 'Fichiers téléversés : taille, type réel, nom aléatoire, hors du dossier public.']::text[], '[{"language":"php","title":"Inscription et connexion sécurisées","code":"<?php\n$pdo = new PDO(\"sqlite::memory:\", null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);\n$pdo->exec(\"CREATE TABLE utilisateurs (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, mot_de_passe TEXT NOT NULL)\");\n\nfunction inscrire(PDO $pdo, string $email, string $mdp): string\n{\n    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($mdp) < 10) {\n        return \"Inscription refusée : e-mail invalide ou mot de passe trop court\";\n    }\n    $pdo->prepare(\"INSERT INTO utilisateurs (email, mot_de_passe) VALUES (?, ?)\")->execute([$email, password_hash($mdp, PASSWORD_DEFAULT)]);\n    return \"Compte créé pour $email\";\n}\n\nfunction connecter(PDO $pdo, string $email, string $mdp): string\n{\n    $stmt = $pdo->prepare(\"SELECT mot_de_passe FROM utilisateurs WHERE email = ?\");\n    $stmt->execute([$email]);\n    $empreinte = $stmt->fetchColumn();\n    // Même message dans les deux cas : on ne révèle pas si l''e-mail existe.\n    return $empreinte !== false && password_verify($mdp, $empreinte) ? \"Connexion réussie\" : \"Identifiants incorrects\";\n}\n\necho inscrire($pdo, \"kito@upl.cd\", \"court\"), \"\\n\";\necho inscrire($pdo, \"kito@upl.cd\", \"Un-mot-de-passe-solide\"), \"\\n\";\necho connecter($pdo, \"kito@upl.cd\", \"mauvais\"), \"\\n\";\necho connecter($pdo, \"kito@upl.cd\", \"Un-mot-de-passe-solide\"), \"\\n\";\n$stocke = $pdo->query(\"SELECT mot_de_passe FROM utilisateurs\")->fetchColumn();\necho \"Stocké en base : \", substr($stocke, 0, 7), \"… (\", strlen($stocke), \" caractères, jamais le mot de passe)\\n\";\necho \"Jeton CSRF : \", strlen(bin2hex(random_bytes(32))), \" caractères aléatoires\\n\";"}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-securite'), 'php-securite-quiz', 'Vérification — Sécurité', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-securite-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-securite-quiz'), 'qcm', 'Quelle fonction pour stocker un mot de passe ?', null, '["md5","sha1","password_hash","base64_encode"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-securite-quiz'), 'qcm', 'Contre quelle attaque protège un jeton dans les formulaires ?', null, '["XSS","CSRF","Injection SQL","Force brute"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-securite-quiz'), 'qcm', 'Quelle fonction pour générer un jeton de sécurité ?', null, '["rand()","uniqid()","random_bytes()","time()"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-securite-quiz'), 'vrai_faux', 'On peut se fier au type MIME envoyé par le navigateur pour un fichier téléversé.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'php') and slug = 'php-professionnel'), (select id from public.courses where slug = 'php'), 'php-architecture-tests', 'Architecture MVC, middleware et tests automatisés', 'avance', 50, array['Organiser une application en couches (MVC).', 'Comprendre le rôle d''un routeur et des middlewares.', 'Écrire des tests automatisés.']::text[], array['Sécurité d''une application PHP', 'Héritage et interfaces']::text[], '## Pourquoi une architecture ?

Un script de 2 000 lignes qui mélange SQL, HTML et règles métier devient impossible à maintenir. On sépare les **responsabilités** :

- **Modèle** : les données et les règles métier (classes Etudiant, dépôts d''accès à la base) ;
- **Vue** : l''affichage (gabarits HTML, sans requêtes SQL) ;
- **Contrôleur** : reçoit la requête, appelle le modèle, choisit la vue.

## Arborescence type

~~~text
public/index.php        ← point d''entrée unique (front controller)
src/Controleurs/        ← EtudiantControleur.php
src/Modeles/            ← Etudiant.php, EtudiantDepot.php
src/Middlewares/        ← Authentification.php
vues/                   ← etudiants/liste.php
config/                 ← paramètres (sans secrets)
tests/                  ← tests automatisés
vendor/                 ← dépendances installées par Composer
~~~

Seul le dossier **public/** est accessible depuis le web : le code et la configuration restent hors d''atteinte.

## Composer et l''autochargement

**Composer** installe les bibliothèques (composer require) et génère un **autochargeur** : avec la norme **PSR-4**, la classe App\Modeles\Etudiant est cherchée dans src/Modeles/Etudiant.php ; un seul **require "vendor/autoload.php"** suffit.

## Routeur et middlewares

Le **routeur** associe une adresse à une action de contrôleur. Un **middleware** est une couche traversée par chaque requête avant le contrôleur : vérifier la connexion, le rôle (étudiant, enseignant, administrateur), limiter le débit, journaliser. Chaque middleware peut laisser passer la requête ou répondre lui-même (403, redirection).

## Injection de dépendances

Une classe **reçoit** ce dont elle a besoin (dans son constructeur) au lieu de le créer : un contrôleur reçoit un **EtudiantDepot** (interface). En test, on lui donne un dépôt en mémoire ; en production, un dépôt PDO.

## Tests automatisés

Un **test unitaire** vérifie une petite unité (une fonction, une méthode) ; un **test d''intégration** vérifie plusieurs couches ensemble (contrôleur + base). En PHP, l''outil standard est **PHPUnit** (installé avec Composer) : **$this->assertSame(14.0, $e->moyenne());**. Les tests s''exécutent à chaque modification, souvent automatiquement (intégration continue).

## Vers Laravel

**Laravel** fournit tout cela prêt à l''emploi : routeur, contrôleurs, modèles Eloquent, vues Blade, middlewares, migrations, validation, authentification et tests. Comprendre les briques ci-dessus permet de l''utiliser en sachant ce qui se passe.', array['MVC : Modèle (données), Vue (affichage), Contrôleur (orchestration).', 'public/ seul exposé ; Composer + PSR-4 chargent les classes.', 'Routeur et middlewares filtrent les requêtes ; on injecte les dépendances.', 'Tests unitaires et d''intégration (PHPUnit) à chaque modification.']::text[], '[{"language":"php","title":"Mini-framework : routeur, middleware, contrôleur et tests","code":"<?php\ndeclare(strict_types=1);\n\ninterface EtudiantDepot { public function tous(): array; }\n\nfinal class DepotMemoire implements EtudiantDepot\n{\n    public function __construct(private array $donnees) {}\n    public function tous(): array { return $this->donnees; }\n}\n\nfinal class EtudiantControleur\n{\n    public function __construct(private EtudiantDepot $depot) {}\n    public function liste(): string\n    {\n        return implode(\", \", array_map(fn(array $e): string => $e[\"nom\"], $this->depot->tous()));\n    }\n}\n\n/** Middleware : refuse la requête si l''utilisateur n''a pas le rôle demandé. */\nfunction exigerRole(string $role, callable $suivant): callable\n{\n    return fn(array $requete): string => ($requete[\"role\"] ?? \"\") === $role ? $suivant($requete) : \"403 Accès refusé\";\n}\n\n$controleur = new EtudiantControleur(new DepotMemoire([[\"nom\" => \"Kito\"], [\"nom\" => \"Mbuyi\"]]));\n$routes = [\"GET /admin/etudiants\" => exigerRole(\"administrateur\", fn(array $r): string => \"200 \" . $controleur->liste())];\n\nfunction dispatcher(array $routes, array $requete): string\n{\n    return isset($routes[$requete[\"route\"]]) ? $routes[$requete[\"route\"]]($requete) : \"404 Introuvable\";\n}\n\necho dispatcher($routes, [\"route\" => \"GET /admin/etudiants\", \"role\" => \"administrateur\"]), \"\\n\";\necho dispatcher($routes, [\"route\" => \"GET /admin/etudiants\", \"role\" => \"etudiant\"]), \"\\n\";\necho dispatcher($routes, [\"route\" => \"GET /inconnu\"]), \"\\n\";\n\n// Tests unitaires minimalistes (PHPUnit fait la même chose, en plus complet)\nfunction verifier(string $nom, bool $condition): void { echo ($condition ? \"✓ \" : \"✗ \"), $nom, \"\\n\"; }\nverifier(\"la liste contient Kito\", str_contains($controleur->liste(), \"Kito\"));\nverifier(\"un étudiant est refusé\", dispatcher($routes, [\"route\" => \"GET /admin/etudiants\", \"role\" => \"etudiant\"]) === \"403 Accès refusé\");"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'php') and slug = 'php-architecture-tests'), 'php-architecture-quiz', 'Vérification — Architecture', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-architecture-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-architecture-quiz'), 'qcm', 'Dans MVC, qui contient les requêtes SQL ?', null, '["La vue","Le modèle (ou le dépôt)","Le contrôleur uniquement","Le fichier CSS"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-architecture-quiz'), 'qcm', 'Quel est le rôle d''un middleware d''authentification ?', null, '["Afficher la page","Filtrer les requêtes avant le contrôleur","Créer les tables","Compiler PHP"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-architecture-quiz'), 'qcm', 'Quel outil installe les dépendances PHP ?', null, '["npm","pip","Composer","Maven"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
delete from public.modules m where m.course_id = (select id from public.courses where slug = 'php') and m.slug not in ('php-premiers-pas', 'php-controle-donnees', 'php-web', 'php-objet', 'php-donnees-api', 'php-professionnel') and not exists (select 1 from public.lessons l where l.module_id = m.id);
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'php'), 1, 'Niveau 1 — Très débutant : premières pages dynamiques', 'Comprendre le rôle de PHP côté serveur et écrire ses premiers scripts : echo, variables, types, constantes, opérateurs, concaténation et premières conditions. Projet : une page personnalisée.', array['Expliquer le fonctionnement client / serveur.', 'Écrire et exécuter un script PHP.', 'Manipuler variables, types, constantes et opérateurs.', 'Produire une page HTML qui change selon les données.']::text[], '{}'::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), null, 'php-examen-niveau-1', 'Examen du niveau 1 — Premiers pas en PHP', false, 70, 'publie', 'examen_niveau', null, 1)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-examen-niveau-1');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'qcm', 'Que reçoit le navigateur quand il demande une page PHP ?', null, '["Le code PHP","Le HTML produit par PHP","Un fichier binaire","Le code et le HTML"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'qcm', 'Quel symbole commence le nom d''une variable ?', null, '["@","#","$","&"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'qcm', 'Qu''affiche echo "Total : " . 2 + 3; en PHP 8 ?', null, '["Total : 5","Total : 23","une erreur","5"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, 'En PHP 8, + et - sont prioritaires sur le point : 2 + 3 est calculé d''abord.' from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'qcm', 'Que vaut 7 % 3 ?', null, '["2","1","2.33","0"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'qcm', 'Que vaut "7" === 7 ?', null, '["true","false"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'qcm', 'Comment déclarer une constante ?', null, '["$TAUX = 0.16;","const TAUX = 0.16;","constant TAUX 0.16;","let TAUX = 0.16;"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'qcm', 'Quelle forme affiche une valeur au milieu du HTML ?', null, '["<? echo ?>","<?= $valeur ?>","{{ $valeur }}","<%= valeur %>"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-1'), 'vrai_faux', 'Une donnée saisie au clavier ou dans un formulaire arrive sous forme de chaîne.', null, '["Vrai","Faux"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'php'), 2, 'Niveau 2 — Débutant : programmes et formulaires', 'Structures de contrôle, tableaux, fonctions, chaînes et dates, puis le web : formulaires GET/POST, validation, sécurité de l''affichage, sessions, cookies et inclusion de fichiers. Projets : inscription, calculatrice, gestion de notes.', array['Choisir la bonne structure de contrôle.', 'Organiser les données en tableaux associatifs.', 'Écrire des fonctions réutilisables.', 'Traiter un formulaire de façon sûre et conserver un état avec les sessions.']::text[], array['Projet guidé : formulaire de connexion complet (pages, session, déconnexion)', 'Projet guidé : formulaire de contact avec validation et message de confirmation']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), null, 'php-examen-niveau-2', 'Examen du niveau 2 — Programmes et formulaires', false, 70, 'publie', 'examen_niveau', null, 2)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-examen-niveau-2');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Que se passe-t-il sans break dans un case de switch ?', null, '["Erreur","L''exécution continue dans le cas suivant","Le switch s''arrête","Rien"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Quelle boucle pour parcourir un tableau associatif ?', null, '["for","foreach ($t as $cle => $valeur)","while","do…while"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Que renvoie count([3, 5, 8]) ?', null, '["8","3","16","2"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Quelle fonction découpe une chaîne en tableau ?', null, '["implode","explode","split","substr"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Une variable créée dans une fonction est visible…', null, '["partout","dans la fonction seulement","dans les fichiers inclus","dans la session"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Quel tableau contient les champs d''un formulaire method="post" ?', null, '["$_GET","$_POST","$_FORM","$_REQUEST_POST"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Avant d''afficher une saisie dans une page, on utilise…', null, '["htmlspecialchars","trim","intval","json_encode"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Où sont conservées les données de $_SESSION ?', null, '["Dans le navigateur","Sur le serveur","Dans l''URL","Dans le cache"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-2'), 'qcm', 'Quelle instruction arrête le script si le fichier inclus est absent ?', null, '["include","require","use","import"]'::jsonb, 8, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'php'), 3, 'Niveau 3 — Intermédiaire : objets, données et API', 'Programmation orientée objet (classes, encapsulation, héritage, polymorphisme, interfaces, traits, namespaces), exceptions, base de données avec PDO, JSON et API REST.', array['Modéliser un domaine avec des classes.', 'Gérer les erreurs avec des exceptions.', 'Accéder à une base de données de façon sûre avec PDO.', 'Produire et consommer du JSON dans une API REST.']::text[], array['Fichiers : lecture, écriture et téléversement sécurisé', 'Architecture MVC appliquée à un projet', 'Composer et autoloading (PSR-4)', 'Projets : gestion des étudiants, authentification, gestion des produits et des articles, tableau de bord administrateur']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), null, 'php-examen-niveau-3', 'Examen du niveau 3 — Objets, données et API', false, 70, 'publie', 'examen_niveau', null, 3)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-examen-niveau-3');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Quel mot-clé crée un objet ?', null, '["class","new","object","create"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Quelle visibilité réserve une propriété à la classe ?', null, '["public","protected","private","final"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Que permet une interface ?', null, '["Hériter du code","Définir un contrat de méthodes","Créer des variables globales","Se connecter à la base"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Quel bloc s''exécute toujours, exception ou non ?', null, '["catch","finally","try","throw"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Que protège une requête préparée ?', null, '["Le XSS","L''injection SQL","Le CSRF","La force brute"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Que fait $pdo->rollBack() ?', null, '["Valide","Annule la transaction","Ferme la connexion","Rejoue la requête"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Quel code HTTP pour « ressource introuvable » ?', null, '["200","201","404","500"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-3'), 'qcm', 'Que renvoie json_decode sur un JSON invalide (sans option) ?', null, '["false","null","une exception","\"\""]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values ((select id from public.courses where slug = 'php'), 4, 'Niveau 4 — Professionnel : sécurité, architecture et mise en production', 'Sécurité d''une application (mots de passe, XSS, injection SQL, CSRF, sessions, fichiers), architecture professionnelle (MVC, routeur, middlewares, injection de dépendances), tests automatisés, Composer, Laravel et déploiement.', array['Sécuriser une application PHP de bout en bout.', 'Concevoir une architecture maintenable.', 'Tester automatiquement son code.', 'Préparer un déploiement et la maintenance.']::text[], array['PHP moderne : enums, readonly, attributs, types avancés', 'API sécurisées : authentification par jeton, rôles et permissions', 'Tests unitaires et d''intégration avec PHPUnit', 'Introduction à Laravel (routes, Eloquent, Blade, migrations)', 'Optimisation : cache, OPcache, requêtes et profilage', 'Déploiement et maintenance d''une application PHP', 'Projet final : application web complète (authentification, rôles, CRUD, API, tests)']::text[], 100, 70)
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), null, 'php-examen-niveau-4', 'Examen du niveau 4 — PHP professionnel', false, 70, 'publie', 'examen_niveau', null, 4)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-examen-niveau-4');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-4'), 'qcm', 'Quelle fonction pour stocker un mot de passe ?', null, '["md5","sha1","password_hash","base64_encode"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-4'), 'qcm', 'Contre quelle attaque protège un jeton caché dans chaque formulaire ?', null, '["XSS","CSRF","Injection SQL","DDoS"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-4'), 'qcm', 'Que faire juste après une connexion réussie ?', null, '["session_destroy()","session_regenerate_id(true)","setcookie(\"mdp\", …)","rien"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-4'), 'qcm', 'Quel dossier doit être le seul accessible depuis le web ?', null, '["src/","vendor/","public/","config/"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-4'), 'qcm', 'Qu''est-ce qu''un middleware ?', null, '["Une vue","Une couche traversée par la requête avant le contrôleur","Une table SQL","Un fichier CSS"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-4'), 'qcm', 'Quel outil standard pour les tests unitaires en PHP ?', null, '["Jest","PHPUnit","pytest","JUnit"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-examen-niveau-4'), 'vrai_faux', 'Les mots de passe de la base de données doivent être écrits dans le code source versionné.', null, '["Vrai","Faux"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), null, 'php-positionnement', 'Test de positionnement — PHP', false, 0, 'publie', 'positionnement', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-positionnement');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Où s''exécute PHP ?', null, '["Dans le navigateur","Sur le serveur","Dans la base","Nulle part"]'::jsonb, 0, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Quel opérateur concatène des chaînes ?', null, '["+",".","&","concat"]'::jsonb, 1, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Que vaut 17 % 5 ?', null, '["3","2","3.4","12"]'::jsonb, 2, 1) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Comment parcourir clés et valeurs d''un tableau ?', null, '["for ($t)","foreach ($t as $k => $v)","while ($t)","each($t)"]'::jsonb, 3, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Que contient $_POST ?', null, '["Les cookies","Les champs d''un formulaire envoyé en POST","La session","Les fichiers"]'::jsonb, 4, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Quelle fonction protège l''affichage contre le XSS ?', null, '["htmlspecialchars","trim","strlen","md5"]'::jsonb, 5, 2) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Que désigne $this ?', null, '["La classe mère","L''objet courant","Le fichier","La session"]'::jsonb, 6, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Quel mécanisme empêche l''injection SQL avec PDO ?', null, '["Les requêtes préparées","Les exceptions","Les sessions","Les transactions"]'::jsonb, 7, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Quel mot-clé lève une exception ?', null, '["catch","throw","raise","error"]'::jsonb, 8, 3) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Quelle protection contre le CSRF ?', null, '["htmlspecialchars","Un jeton aléatoire vérifié à chaque POST","md5","Un captcha seulement"]'::jsonb, 9, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Dans MVC, quelle couche contient les gabarits HTML ?', null, '["Modèle","Vue","Contrôleur","Routeur"]'::jsonb, 10, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-positionnement'), 'qcm', 'Quel outil gère les dépendances PHP ?', null, '["Composer","npm","pip","apt"]'::jsonb, 11, 4) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'php'), null, 'php-evaluation-finale', 'Évaluation finale — PHP', true, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'php-evaluation-finale');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'qcm', 'Où s''exécute le code PHP d''un site ?', null, '["Navigateur","Serveur","Base de données","CSS"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'qcm', 'Quel opérateur concatène deux chaînes ?', null, '["+",".","&","concat"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'qcm', 'Quelle boucle parcourt un tableau associatif avec ses clés ?', null, '["for","while","foreach ($t as $k => $v)","do…while"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[2]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'qcm', 'Quelle fonction échappe le HTML à l''affichage ?', null, '["htmlspecialchars","strip_tags","trim","addslashes"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'qcm', 'Quel mécanisme empêche l''injection SQL ?', null, '["Les requêtes préparées","Les sessions","Les cookies","json_encode"]'::jsonb, 4, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'qcm', 'Quelle fonction pour vérifier un mot de passe haché ?', null, '["password_verify","md5","hash_equals seul","crypt"]'::jsonb, 5, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'qcm', 'Quel mot-clé crée une classe fille ?', null, '["implements","extends","trait","new"]'::jsonb, 6, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'php-evaluation-finale'), 'vrai_faux', 'Les données de $_SESSION sont stockées dans le navigateur.', null, '["Vrai","Faux"]'::jsonb, 7, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;

-- ===== Formation complète SQL — maîtriser les bases de données =====
insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values ('sql', 'sql', (select id from public.course_categories where slug = 'donnees'), 'Parcours I', 'Formation complète SQL — maîtriser les bases de données', 'Créer, interroger et concevoir des bases de données relationnelles.', 'Toute application sérieuse (université, pharmacie, banque, boutique) range ses données dans une base relationnelle. Cette formation va de la première table jusqu''aux jointures, sous-requêtes, transactions, normalisation, conception MERISE, déclencheurs et sécurité. Chaque requête s''exécute réellement avec SQLite dans votre navigateur ; les différences avec MySQL et PostgreSQL sont expliquées.', 'debutant', array['Aucun prérequis pour le niveau 1.', 'Notions d''algorithmique utiles à partir du niveau 2.']::text[], array['Créer des tables et manipuler les données (CREATE, INSERT, SELECT, UPDATE, DELETE).', 'Écrire des requêtes avec filtres, tris, agrégats, jointures et sous-requêtes.', 'Concevoir une base normalisée à partir d''un cahier des charges (MERISE).', 'Garantir l''intégrité, la sécurité et les performances d''une base.']::text[], 50, 'publie', 10, now())
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;
insert into public.modules (course_id, slug, title, description, position, level_number) values ((select id from public.courses where slug = 'sql'), 'sql-fondements', 'Les fondements des bases de données', null, 1, 1)
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-fondements'), (select id from public.courses where slug = 'sql'), 'sql-introduction', 'Qu''est-ce qu''une base de données ? Tables, lignes, clés', 'debutant', 35, array['Définir base de données, SGBD, table, colonne, ligne.', 'Expliquer le rôle des clés primaires et étrangères.', 'Situer MySQL, MariaDB, PostgreSQL et SQLite.']::text[], '{}'::text[], '## Pourquoi une base de données ?

Une université doit retrouver en une seconde les notes d''un étudiant parmi des milliers, empêcher deux étudiants d''avoir le même matricule, et permettre à plusieurs secrétaires de travailler en même temps sans écraser leurs modifications. Un fichier Excel ne suffit plus : on utilise une **base de données** gérée par un **SGBD** (système de gestion de bases de données).

## Le modèle relationnel

Les données sont rangées dans des **tables** :

| id | nom | postnom | age | filiere |
|---|---|---|---|---|
| 1 | Kito | Manasse | 23 | Informatique |
| 2 | Mbuyi | Grace | 19 | Droit |

- une **colonne** (ou attribut) a un nom et un **type** (nombre, texte, date…) ;
- une **ligne** (ou enregistrement) décrit un élément : ici, un étudiant ;
- le **schéma** est la description des tables et de leurs colonnes.

## Les clés

- la **clé primaire** (PRIMARY KEY) identifie chaque ligne de façon **unique** et n''est jamais vide : ici **id** ;
- une **clé étrangère** (FOREIGN KEY) est une colonne qui fait référence à la clé primaire d''une autre table : la table des inscriptions contient **etudiant_id**, qui renvoie à **etudiants.id**. C''est ainsi que les tables sont **reliées**.

## SQL, le langage

**SQL** (Structured Query Language) sert à :

- **définir** la structure : CREATE, ALTER, DROP ;
- **manipuler** les données : INSERT, SELECT, UPDATE, DELETE ;
- **contrôler** les accès : GRANT, REVOKE ; et les transactions : COMMIT, ROLLBACK.

Les mots-clés ne sont pas sensibles à la casse (on les écrit en majuscules par convention) ; chaque instruction se termine par un **point-virgule**.

## Les principaux SGBD

| SGBD | Utilisation typique |
|---|---|
| **MySQL** / **MariaDB** | sites web (PHP, WordPress), hébergements mutualisés |
| **PostgreSQL** | applications professionnelles, données complexes, très conforme à la norme SQL |
| **SQLite** | base dans un simple fichier : téléphones, navigateurs, applications de bureau, tests |
| Oracle, SQL Server | grandes entreprises (payants) |

## Le laboratoire de la plateforme

Vos requêtes sont exécutées par **SQLite** (version 3), compilé en WebAssembly, **dans votre navigateur** : chaque étudiant a sa propre base, isolée. **SQLite n''est pas identique à MySQL ni à PostgreSQL** : le SQL de base (CREATE, INSERT, SELECT, JOIN, GROUP BY…) est le même, mais certains types et certaines instructions diffèrent. La formation le signale chaque fois, avec la syntaxe de chaque système.', array['Une base relationnelle range les données dans des tables (colonnes × lignes).', 'La clé primaire identifie une ligne ; la clé étrangère relie deux tables.', 'SQL définit, manipule et contrôle les données.', 'Le laboratoire utilise SQLite : proche, mais pas identique, de MySQL et PostgreSQL.']::text[], '[{"language":"sql","title":"Première requête sur la table etudiants","code":"SELECT * FROM etudiants;","stdin":"CREATE TABLE etudiants (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  nom TEXT NOT NULL,\n  postnom TEXT NOT NULL,\n  age INTEGER,\n  filiere TEXT\n);\nINSERT INTO etudiants (nom, postnom, age, filiere) VALUES\n  (''Kito'', ''Manasse'', 23, ''Informatique''),\n  (''Mbuyi'', ''Grace'', 19, ''Droit''),\n  (''Kabila'', ''Mutombo'', 21, ''Informatique''),\n  (''Ilunga'', ''Sarah'', 25, ''Médecine''),\n  (''Tshala'', ''Benie'', 20, ''Droit''),\n  (''Nsimba'', ''Joel'', 22, NULL);","explanation":"La table a été créée et remplie par les « données de départ » ; * signifie « toutes les colonnes »."}]'::jsonb, null, 'publie', 1, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-introduction'), 'sql-introduction-quiz', 'Vérification — Bases de données', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-introduction-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-introduction-quiz'), 'qcm', 'Que contient une ligne d''une table ?', null, '["Un type de donnée","Les informations d''un élément (un étudiant…)","Le nom de la base","Une requête"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-introduction-quiz'), 'qcm', 'Quel est le rôle d''une clé primaire ?', null, '["Relier deux tables","Identifier chaque ligne de façon unique","Trier la table","Chiffrer les données"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-introduction-quiz'), 'qcm', 'Une clé étrangère…', null, '["fait référence à la clé primaire d''une autre table","est toujours un texte","est facultative partout","remplace la clé primaire"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-introduction-quiz'), 'vrai_faux', 'SQLite et MySQL acceptent exactement les mêmes instructions.', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'Le cœur du langage est commun, mais des types et instructions diffèrent.' from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-fondements'), (select id from public.courses where slug = 'sql'), 'sql-create-insert', 'Créer une table et insérer des données', 'debutant', 40, array['Créer une table avec CREATE TABLE.', 'Choisir les types de colonnes.', 'Insérer une ou plusieurs lignes avec INSERT.']::text[], array['Qu''est-ce qu''une base de données ?']::text[], '## CREATE TABLE

~~~sql
CREATE TABLE etudiants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  postnom TEXT NOT NULL,
  age INTEGER,
  filiere TEXT
);
~~~

Chaque colonne : **nom**, **type**, puis des **contraintes** facultatives (NOT NULL : valeur obligatoire).

## Les types selon le SGBD

| Donnée | SQLite | MySQL / MariaDB | PostgreSQL |
|---|---|---|---|
| entier | INTEGER | INT | INTEGER |
| décimal exact | NUMERIC | DECIMAL(10,2) | NUMERIC(10,2) |
| réel | REAL | DOUBLE | DOUBLE PRECISION |
| texte court | TEXT | VARCHAR(100) | VARCHAR(100) ou TEXT |
| date | TEXT (''2026-11-10'') | DATE | DATE |
| booléen | INTEGER (0 / 1) | BOOLEAN (TINYINT) | BOOLEAN |

SQLite est souple : il accepte VARCHAR(100) ou DATE, mais **ne limite pas la longueur** du texte et range les dates comme du texte. MySQL et PostgreSQL appliquent strictement les types.

## Numérotation automatique de la clé primaire

| SGBD | Syntaxe |
|---|---|
| SQLite | id INTEGER PRIMARY KEY AUTOINCREMENT |
| MySQL / MariaDB | id INT AUTO_INCREMENT PRIMARY KEY |
| PostgreSQL | id SERIAL PRIMARY KEY ou id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY |

## INSERT INTO

~~~sql
INSERT INTO etudiants (nom, postnom, age, filiere)
VALUES (''Kito'', ''Manasse'', 23, ''Informatique'');
~~~

- on liste les colonnes, puis les valeurs **dans le même ordre** ;
- les textes sont entre **apostrophes** ; une apostrophe dans le texte se double : ''L''''Université'' ;
- on n''indique pas **id** : il est attribué automatiquement ;
- plusieurs lignes en une instruction : VALUES (…), (…), (…);
- **NULL** (sans apostrophes) signifie « valeur inconnue ».

## Supprimer une table

**DROP TABLE etudiants;** supprime la table et toutes ses données (définitivement). **CREATE TABLE IF NOT EXISTS** évite une erreur si la table existe déjà.

Dans l''éditeur, chaque exécution part d''une **base neuve** : votre script doit donc créer ses tables avant de les remplir.', array['CREATE TABLE nom (colonne TYPE contraintes, …);', 'INSERT INTO table (colonnes) VALUES (valeurs), (…);', 'La numérotation automatique s''écrit différemment selon le SGBD.']::text[], '[{"language":"sql","title":"Créer, remplir et afficher","code":"CREATE TABLE etudiants (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  nom TEXT NOT NULL,\n  postnom TEXT NOT NULL,\n  age INTEGER,\n  filiere TEXT\n);\n\nINSERT INTO etudiants (nom, postnom, age, filiere) VALUES (''Kito'', ''Manasse'', 23, ''Informatique'');\nINSERT INTO etudiants (nom, postnom, age, filiere) VALUES\n  (''Mbuyi'', ''Grace'', 19, ''Droit''),\n  (''L''''Heureux'', ''Paul'', 20, NULL);\n\nSELECT * FROM etudiants;"}]'::jsonb, null, 'publie', 2, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-create-insert'), 'sql-create-insert-quiz', 'Vérification — CREATE et INSERT', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-create-insert-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-create-insert-quiz'), 'qcm', 'Comment écrire un texte dans une requête SQL ?', null, '["\"Kito\"","''Kito''","Kito","`Kito`"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-create-insert-quiz'), 'qcm', 'Quelle syntaxe numérote automatiquement en MySQL ?', null, '["AUTOINCREMENT","AUTO_INCREMENT","SERIAL","IDENTITY(1,1)"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-create-insert-quiz'), 'qcm', 'Comment insérer la valeur inconnue ?', null, '["''NULL''","NULL","0","''''"]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-create-insert-quiz'), 'vrai_faux', 'SQLite refuse un texte plus long que la longueur de VARCHAR(10).', null, '["Vrai","Faux"]'::jsonb, 3, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, 'SQLite ne limite pas la longueur ; MySQL et PostgreSQL, si.' from qq;
insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values ((select id from public.modules where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-fondements'), (select id from public.courses where slug = 'sql'), 'sql-select', 'Lire les données : SELECT et WHERE', 'debutant', 35, array['Choisir les colonnes affichées.', 'Filtrer les lignes avec WHERE.', 'Renommer avec AS et calculer des colonnes.']::text[], array['Créer une table et insérer des données']::text[], '## Choisir les colonnes

~~~sql
SELECT nom, postnom FROM etudiants;
~~~

**SELECT *** affiche toutes les colonnes ; en pratique, on nomme les colonnes utiles (plus lisible et plus rapide).

## Filtrer avec WHERE

~~~sql
SELECT nom, age FROM etudiants WHERE age >= 21;
SELECT nom FROM etudiants WHERE filiere = ''Droit'';
~~~

Opérateurs : **=**, **<>** (ou !=), **<**, **>**, **<=**, **>=**.

## Valeurs inconnues : IS NULL

On ne compare **jamais** à NULL avec = : **filiere = NULL** n''est jamais vrai. On écrit **filiere IS NULL** ou **IS NOT NULL**.

## Alias et colonnes calculées

~~~sql
SELECT nom AS etudiant, age + 1 AS age_annee_prochaine FROM etudiants;
~~~

La concaténation de textes s''écrit **||** en SQLite et PostgreSQL (nom || '' '' || postnom), et **CONCAT(nom, '' '', postnom)** en MySQL (CONCAT existe aussi en PostgreSQL et dans SQLite récent).

## L''ordre d''écriture

~~~sql
SELECT colonnes FROM table WHERE condition;
~~~

Le SGBD lit d''abord **FROM** (quelle table), puis **WHERE** (quelles lignes), puis **SELECT** (quelles colonnes).', array['SELECT colonnes FROM table WHERE condition;', 'IS NULL / IS NOT NULL, jamais = NULL.', 'AS renomme une colonne ; || concatène (SQLite, PostgreSQL).']::text[], '[{"language":"sql","title":"Filtrer et renommer","code":"SELECT nom || '' '' || postnom AS etudiant, age\nFROM etudiants\nWHERE filiere = ''Informatique'';\n\nSELECT nom FROM etudiants WHERE filiere IS NULL;","stdin":"CREATE TABLE etudiants (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  nom TEXT NOT NULL,\n  postnom TEXT NOT NULL,\n  age INTEGER,\n  filiere TEXT\n);\nINSERT INTO etudiants (nom, postnom, age, filiere) VALUES\n  (''Kito'', ''Manasse'', 23, ''Informatique''),\n  (''Mbuyi'', ''Grace'', 19, ''Droit''),\n  (''Kabila'', ''Mutombo'', 21, ''Informatique''),\n  (''Ilunga'', ''Sarah'', 25, ''Médecine''),\n  (''Tshala'', ''Benie'', 20, ''Droit''),\n  (''Nsimba'', ''Joel'', 22, NULL);"}]'::jsonb, null, 'publie', 3, now())
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;
insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values ((select id from public.courses where slug = 'sql'), (select id from public.lessons where course_id = (select id from public.courses where slug = 'sql') and slug = 'sql-select'), 'sql-select-quiz', 'Vérification — SELECT', false, 60, 'publie', 'verification', null, null)
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;
delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = 'sql-select-quiz');
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-select-quiz'), 'qcm', 'Comment trouver les étudiants sans filière ?', null, '["WHERE filiere = NULL","WHERE filiere IS NULL","WHERE filiere = ''''","WHERE NULL"]'::jsonb, 0, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-select-quiz'), 'qcm', 'Quel mot-clé renomme une colonne du résultat ?', null, '["RENAME","AS","ALIAS","TO"]'::jsonb, 1, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[1]'::jsonb, null from qq;
with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = 'sql-select-quiz'), 'qcm', 'Quel opérateur signifie « différent de » ?', null, '["<>","=!","><","NOT="]'::jsonb, 2, null) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, '[0]'::jsonb, null from qq;
commit;
