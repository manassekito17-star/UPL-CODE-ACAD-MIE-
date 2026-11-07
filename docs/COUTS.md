# Lancement à budget zéro — UPL CODE ACADEMY MK

Les limites des offres gratuites citées ici sont **indicatives (novembre 2026)**. Elles changent souvent : vérifiez-les sur les pages officielles de chaque fournisseur. La page **Administration → Consommation et coûts** compare l'usage réel à ces limites, avec une alerte à 80 % et à 100 %.

## 1. Audit des coûts potentiels (avant modification)

| Poste | Constat | Risque de coût | Mesure prise |
|---|---|---|---|
| Professeur IA | Seul fournisseur intégré : Anthropic, facturé à l'usage, sans offre gratuite | **Élevé** | Fournisseur compatible OpenAI ajouté (offres gratuites possibles) ; tout fournisseur payant est **bloqué** sauf autorisation explicite avec budget ; plafond global quotidien ; coût enregistré à 0 pour une offre gratuite |
| Exécution Judge0 | Python et JavaScript partaient sur Judge0 quand il était configuré ; chaque test corrigé = 1 appel | Moyen (offre RapidAPI limitée par jour, ou VM à héberger) | « Navigateur d'abord » : Python et JS s'exécutent chez l'étudiant ; quotas **atomiques en base** par étudiant et global par jour, réservés **avant** chaque appel |
| Limiteur de requêtes | En mémoire, par instance : contournable sur un hébergement sans serveur | Moyen | Les quotas qui protègent des coûts (IA, Judge0) sont comptés **en base** ; le limiteur en mémoire reste une protection d'appoint |
| Hébergement Vercel | Hobby réservé à un usage **personnel non commercial** | Juridique | À respecter tant que la plateforme est gratuite et non commerciale ; offre payante = passage à Pro (voir §5) |
| Supabase | Free : 500 Mo de base, 1 Go de fichiers, ~50 000 utilisateurs actifs par mois, mise en pause après ~7 jours d'inactivité | Faible | Jauges et alertes ; ressources de cours limitées à 20 Mo par fichier ; projets IDE à 2 M caractères |
| E-mails d'authentification | Le service d'e-mails intégré de Supabase est très limité (quelques messages par heure) | Fonctionnel | Brancher un SMTP avec offre gratuite (voir §4) |
| Éditeur, Pyodide | Chargés depuis des CDN publics (jsDelivr) | Aucun | — |

## 2. Services gratuits utilisés

| Service | Rôle | Limites principales (indicatives) |
|---|---|---|
| GitHub Free | Code source, intégration continue (GitHub Actions) | Actions gratuites et illimitées pour un dépôt public ; quota de minutes par mois pour un dépôt privé |
| Vercel Hobby | Hébergement Next.js | Usage non commercial ; ~100 Go de transfert par mois ; quotas d'exécution des fonctions. En cas de dépassement, la fonctionnalité est bloquée jusqu'à la période suivante (pas de facturation) |
| Supabase Free | Authentification, base PostgreSQL (RLS), stockage | 500 Mo de base, 1 Go de fichiers, ~5 Go de trafic par mois, 50 000 utilisateurs actifs par mois, 2 projets, pause après ~7 jours sans activité |
| Monaco Editor, Pyodide, interpréteur maison, linkedom, css-tree, pdf-lib, fflate | Édition, exécution navigateur, correction HTML/CSS, PDF, ZIP | Open source, aucun coût |
| IA (au choix, facultatif) | Professeur IA | Exemple : l'offre gratuite de Gemini est limitée par modèle, en requêtes par minute et par jour (de l'ordre de 100 à 1 000 par jour selon le modèle, réinitialisées à minuit, heure du Pacifique). Groq, OpenRouter (modèles « :free ») et Mistral ont aussi des offres gratuites à quotas |
| Judge0 (facultatif) | C, Java, correction serveur | Offre gratuite RapidAPI limitée par jour ; ou auto-hébergement sur une VM gratuite (ex. offres « Always Free ») |

## 3. Fonctionnalités opérationnelles en version gratuite

Sans aucun service payant :

- **Formation complète :**
  - 7 parcours en 4 niveaux : cours, exemples, exercices corrigés automatiquement, quiz, TD, interrogations, évaluations, projets ;
  - test de positionnement, examens de niveau, bulletin et certificats internes vérifiables.
- **Exécution :**
  - pseudocode (interpréteur), Python (Pyodide), JavaScript (Web Worker isolé) et aperçu HTML/CSS/JS, **dans le navigateur** ;
  - correction officielle **sur le serveur, sans coût** pour le pseudocode et le HTML/CSS (analyse structurelle).
- **Outils :**
  - éditeur, **UPL IDE** (projets à dossiers synchronisés, historique, import/export ZIP, aperçu, thèmes) ;
  - **laboratoire** d'algorithmique pas à pas.
- **Comptes et suivi :** rôles, administration pédagogique, suivi, annonces, journaux.

Dépendent d'un service externe, **facultatif** :

- **Professeur IA**, avec un fournisseur à offre gratuite. Sans modèle connecté, l'interface l'indique (« Aucun modèle d'IA n'est connecté… les cours restent accessibles ») et **aucune réponse n'est simulée**.
- **C et Java, et la correction officielle Python/JavaScript**, avec Judge0. Sans Judge0, C et Java affichent clairement leur indisponibilité. Les exercices Python et JS proposent une vérification locale non enregistrée.

Pas encore disponibles : terminal, débogueur, Git, extensions, déploiement des projets étudiants (ils demandent des environnements isolés payants ou à héberger).

## 4. Configuration à budget zéro

1. **Supabase Free** : créer le projet, appliquer les migrations, renseigner `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. **Vercel Hobby** : importer le dépôt, définir les variables. Ne pas activer d'option payante.
3. **IA (facultatif)** : `AI_PROVIDER=openai_compatible`, `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` et `AI_BILLING=gratuit` (voir `.env.example`). Créer la clé sur un compte **sans carte bancaire** ou sans facturation activée chez le fournisseur.
4. **Judge0 (facultatif)** : offre gratuite RapidAPI (`JUDGE0_URL`, `JUDGE0_RAPIDAPI_KEY`) ou instance auto-hébergée. Régler **Exécutions serveur / jour (plateforme)** **sous** le quota de l'offre.
5. **E-mails** : brancher un SMTP avec offre gratuite (Supabase → Authentication → SMTP).
6. **Administration → Paramètres** :
   - laisser « Autoriser un fournisseur d'IA payant » **décoché** ;
   - régler les questions par jour (par étudiant et pour toute la plateforme) sous le quota du fournisseur ;
   - laisser « Python et JavaScript dans le navigateur » coché.

## 5. Garder le budget à zéro

- **Contrôler chaque semaine :**
  - consulter **Administration → Consommation et coûts** : jauges IA, Judge0, base, fichiers et utilisateurs actifs, alertes à 80 et 100 % ;
  - consulter le tableau de bord **Usage** de Vercel et la page **Usage** de Supabase.
- **Ne rien activer de payant :**
  - ne jamais enregistrer de moyen de paiement chez un fournisseur sans décision explicite ;
  - un fournisseur d'IA non déclaré `gratuit` est automatiquement bloqué.
- **Empêcher la mise en pause de Supabase Free** (~7 jours sans activité) : l'usage régulier de la plateforme suffit. Pour une période creuse, une tâche planifiée gratuite (GitHub Actions) qui appelle le site est possible.
- **Surveiller la taille de la base :** les tables qui grossissent sont `execution_results`, `ai_messages`, `submissions` et `project_versions` (30 versions par projet au plus). Archiver ou purger les anciennes exécutions si la jauge approche 80 %.
- **Stockage :** privilégier des liens vers des vidéos (YouTube, etc.) plutôt que des fichiers déposés.

## 6. Coûts futurs possibles (rien n'est activé)

| Situation | Coût probable |
|---|---|
| Activité commerciale (offre premium payante, publicité) | Vercel Pro obligatoire (usage commercial) |
| Plus de 500 Mo de données ou besoin d'éviter la mise en pause | Supabase Pro |
| Professeur IA au-delà des quotas gratuits ou modèle plus puissant | Facturation à l'usage du fournisseur, plafonnée par le budget mensuel des paramètres |
| C, Java et correction serveur à grande échelle | Offre Judge0 payante ou VM dédiée |
| Terminal, environnements par projet, déploiement des projets étudiants | Conteneurs isolés (VM ou service géré) |

## 7. Architecture prête pour une offre premium

- La colonne `profiles.plan` (`gratuit` / `premium`) ne peut être modifiée que par un administrateur (déclencheur en base, testé).
- `src/lib/plans.ts` calcule les droits d'un utilisateur : questions IA et exécutions serveur par jour. Tant que `plans.premium_enabled` est faux, **tout le monde reçoit les limites gratuites**.
- Les quotas passent tous par `entitlements()` et `consume_quota()` (fonction SQL atomique) : ajouter une offre revient à définir ses limites, sans reconstruire la plateforme.
- Aucun paiement n'est implémenté. Une future offre payante nécessitera un prestataire de paiement, les conditions de vente et le passage de Vercel en Pro.
