# UPL ACADEMY multiniveaux

Le catalogue compte sept parcours indépendants : Algorithmique et pseudocode, HTML, CSS, Python, Langage C, JavaScript et Java. Chaque parcours a **quatre niveaux** : 1 Très débutant, 2 Débutant, 3 Intermédiaire, 4 Professionnel.

L'architecture est générique, si bien qu'un nouveau parcours (SQL, TypeScript, PHP, React, Next.js, mobile, bases de données, cybersécurité, IA…) n'a besoin d'aucune modification du code. Il suffit de :

- un langage dans la table `languages` (ou dans `src/lib/execution/languages.ts` s'il doit être exécuté) ;
- un fichier de cours ;
- un plan de niveaux (`LevelPlan`).

## État réel du contenu

Légende : « p » = chapitres publiés et complets, « a » = chapitres annoncés au programme mais pas encore rédigés, « E » = nombre de questions de l'examen de fin de niveau.

| Parcours | Niveau 1 | Niveau 2 | Niveau 3 | Niveau 4 | Positionnement |
|---|---|---|---|---|---|
| Algorithmique | 7 p · E 12 | 7 p · E 10 | 4 p + 2 a · E 10 | 1 p + 5 a · pas d'examen | 12 questions |
| HTML | 4 p · E 10 | 5 a | 4 a | 4 a | 12 questions |
| CSS | 3 p · E 10 | 5 a | 4 a | 5 a | 12 questions |
| Python | 5 p · E 8 | 4 p · E 6 | 5 p + 1 a | 1 p + 5 a | 8 questions |
| Langage C | 5 p · E 6 | 3 p | 4 p | 1 p + 4 a | 8 questions |
| JavaScript | 4 p · E 6 | 4 p | 2 p + 2 a | 1 p + 5 a | 8 questions |
| Java | 4 p · E 6 | 4 p | 3 p | 1 p + 4 a | 8 questions |

Comment lire ce tableau :

- **Chapitres annoncés.** Ils sont affichés « au programme (en préparation, pas encore publiés) » et ne sont jamais présentés comme disponibles.
- **Niveaux sans examen.** Ils ne peuvent pas être validés, et l'interface l'indique.
- **Les 7 chapitres HTML/CSS** (HTML 4, CSS 3) remplissent les 14 composantes du contrôle de complétude, vérifiées par les tests. Les composantes exigées incluent les prérequis, un projet pratique vérifié par un exercice noté et des démonstrations avec aperçu.
- **Les chapitres hérités des autres parcours** ont été rangés par niveau sans être réécrits.

Conformément à la consigne « ne pas générer des centaines de leçons superficielles », les niveaux 2 à 4 d'HTML/CSS et les chapitres avancés restent à rédiger.

## Évaluation et passage de niveau

- **Test de positionnement** (`/formations/<parcours>/positionnement`).
  - Chaque question est étiquetée par le niveau qu'elle évalue.
  - Un niveau est acquis à partir de 70 % de bonnes réponses.
  - Le test recommande le premier niveau non acquis ; les niveaux précédents passent alors au statut « dispensé ».
  - Le résultat est enregistré dans `placement_results`. Les bonnes réponses ne sont pas renvoyées, pour que le test ne puisse pas être repassé à l'identique.
- **Critères de passage**, réglables par niveau dans l'administration :
  - un pourcentage de chapitres validés (100 % par défaut) ;
  - une note minimale à l'examen de fin de niveau (70 % par défaut).
- **Décision côté serveur.** Les règles sont pures et testées (`src/lib/levels/rules.ts`). L'écriture se fait dans `level_progress` avec la clé service_role, et l'étudiant ne peut rien écrire lui-même (vérifié par RLS).
- **Verrouillage.**
  - L'examen du niveau N+1 n'est accessible qu'une fois le niveau N validé ou dispensé, et cette règle est vérifiée par l'API.
  - Le contenu reste consultable librement.
- **Chapitres à revoir.** Ce sont les évaluations échouées et les exercices échoués plusieurs fois ; ils apparaissent dans le **bulletin** (`/bulletin`, avec une version PDF).
- **Certificat interne de niveau**, délivré automatiquement à la validation.
  - Il a un code de vérification public (`/certificats/<code>`, via une fonction SQL qui ne révèle que le nom, le parcours, le niveau, le score et la date).
  - Le PDF est réservé à son titulaire.
  - Il porte partout la mention : *document interne, ni diplôme ni crédits académiques officiels*.

## UPL IDE

- **Projets HTML/CSS/JS** à trois fichiers, avec aperçu en direct.
  - L'aperçu s'affiche dans une `iframe sandbox="allow-scripts"` : origine opaque, donc ni cookies, ni stockage, ni accès à la page parente.
  - Une CSP sans réseau est injectée dans le document.
  - La console de la page est relayée par `postMessage`, et seuls les messages provenant de cette iframe sont acceptés.
- **Correction des exercices web** par analyse structurelle sur le serveur (linkedom, css-tree), qui vérifie éléments, textes, attributs et règles CSS.
  - Le JavaScript de l'étudiant n'est jamais exécuté sur le serveur ; `/api/execute` refuse HTML et CSS.
- **Démonstrations depuis un chapitre** (exemples et code commenté) : « Ouvrir dans UPL IDE », puis retour au cours à l'aide du paramètre `?retour=`. Ce paramètre n'accepte que des chemins `/formations/...`.
- **Langages compilés ou serveur** : Judge0 isolé quand il est configuré (inchangé).

## Professeur IA spécialisé

Le serveur reconstitue lui-même le contexte ; le navigateur ne peut pas l'imposer. Ce contexte comprend :

- le programme du parcours (niveaux, chapitres publiés et annoncés) ;
- le chapitre en cours et son projet ;
- le niveau mesuré de l'étudiant.

Modes disponibles :

- enseigner ;
- interroger ;
- accompagner un projet ;
- expliquer du code ;
- analyser une erreur ;
- indice ;
- générer un exercice ;
- préparer une évaluation.

Le professeur ne donne ni les solutions des exercices notés ni les réponses des épreuves de la plateforme.

Un fournisseur de **test** (`AI_PROVIDER=test` avec `UPL_ALLOW_TEST_AI=true`) n'appelle aucune IA et l'annonce ; il sert à vérifier ce câblage dans les tests de bout en bout. **Les réponses réelles du modèle n'ont pas été testées ici, faute de clé API dans cet environnement.**

## Administration pédagogique

La page `/admin/formations/<parcours>/niveaux` permet de modifier, pour chaque niveau :

- le titre, la description et les objectifs ;
- les chapitres au programme ;
- les critères de passage ;
- l'examen, au format texte `? / + / - / >`.

Elle permet aussi de saisir le test de positionnement, où chaque question porte une ligne `@ niveau n`. Elle affiche des statistiques par niveau si l'utilisateur a la permission « suivi » : validés, dispensés, positionnés, tentatives et réussites à l'examen.

Les autres réglages se font sur la page du parcours et sur la page de chaque leçon :

- rattacher les modules à un niveau ;
- éditer l'interrogation et l'évaluation de chaque chapitre ;
- ajouter des ressources de chapitre : un lien `https` ou un fichier (PDF, image, MP4, DOCX, PPTX, 20 Mo au maximum) placé dans le stockage `ressources`.

## Reste à faire

- Rédiger les niveaux 2 à 4 d'HTML et de CSS, ainsi que les chapitres annoncés des autres parcours.
- Ajouter les examens des niveaux qui n'en ont pas encore (algorithmique N4, Python N3–N4, C/JS/Java N2–N4).
- Remplacer l'éditeur JSON de la structure pédagogique par un éditeur visuel.
- Ajouter des vidéos intégrées dans le cours (aujourd'hui ce sont des liens).
- Contrôler côté serveur la durée des interrogations et examens.
- Tester le professeur IA avec un vrai modèle, une fois la clé API configurée.
