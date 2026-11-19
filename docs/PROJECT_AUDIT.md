# Audit du projet — ZYNORA Cloud Office Engine (phase 1)

Date : 19/11/2026 · Branche : `claude/dazzling-babbage-7kluja` · Référentiel : *Master prompt ZYNORA Cloud
Office Engine*. **Aucune modification structurelle n'a été faite** : ce document est le seul livrable
de la phase 1.

---

## 1. Résumé

| Question | Réponse courte |
|---|---|
| Que contient le dépôt ? | **Deux applications distinctes** : la plateforme web **ZENTECH** (Next.js 16 + Supabase, hébergée sur Vercel) et **ZYNORA Office** (`zynora-office/`), suite bureautique **de bureau et mobile** (Tauri 2 : Rust + React) qui fonctionne **hors ligne**. |
| ZYNORA WORD et ZYNORA EXCEL existent-ils ? | **Oui, dans l'application de bureau** (`zynora-office/apps/desktop`) : ZYNORA Word (ProseMirror + moteur DOCX Rust) et ZYNORA Sheets, le tableur (moteur de calcul IronCalc). **Il n'existe aucun éditeur bureautique dans le site web ZENTECH**, ni aucun service cloud, multi-utilisateur ou collaboratif pour les documents. |
| Le « Cloud Office Engine » existe-t-il ? | **Non.** Les moteurs actuels sont des bibliothèques Rust locales (une machine, un utilisateur). Le stockage cloud, les sessions d'édition, le partage, la collaboration et l'IA bureautique sont **à construire**. |
| Point bloquant principal | Un moteur bureautique serveur (ONLYOFFICE ou Collabora) **ne peut pas être hébergé sur Vercel** (fonctions sans état, durée et taille limitées). Il faut un **serveur dédié** (VPS ou conteneurs) et, pour un usage commercial SaaS, une **licence payante** : décisions qui reviennent au propriétaire. |
| Recommandation | Voir §10 : intégrer **ONLYOFFICE Docs Developer Edition** (licence commerciale) dans ZENTECH pour la version cloud, **après validation du budget**, en conservant ZYNORA Office (bureau, hors ligne) et ses moteurs. Collabora Online est l'alternative sérieuse. |

---

## 2. Méthode

Lecture de l'ensemble du dépôt (117 commits) : manifestes, routes, migrations SQL, bibliothèques,
workflows CI, documentation existante (`docs/AUDIT.md`, `docs/ARCHITECTURE.md`, `docs/SECURITE.md`,
`docs/DEPLOIEMENT.md`, `zynora-office/*.md`). Recherche de secrets versionnés. Tentative de lecture
de l'infrastructure réelle (API Supabase et Vercel) : **refusée** depuis cet environnement (jeton non
accepté), l'audit de l'infrastructure se fonde donc sur le code et la documentation. Vérification des
licences ONLYOFFICE et Collabora sur leurs pages officielles (sources en §13).

---

## 3. Technologies détectées

### 3.1 ZENTECH — plateforme web (racine du dépôt)

| Élément | Constat |
|---|---|
| Framework | **Next.js 16.4.5** (App Router, `src/proxy.ts`), React 19.3, TypeScript strict |
| Interface | Tailwind CSS 4, composants maison (`src/components/ui`), Monaco (éditeur de code) |
| Données | **Supabase** : PostgreSQL (34 tables, 16 migrations versionnées, **RLS sur toutes les tables**), Auth, Storage |
| Authentification | Supabase Auth (e-mail, Google facultatif), **MFA** (`/verification-mfa`), rôles `étudiant` / `enseignant` (permissions fines) / `administrateur`, comptes suspendus, limitation des tentatives par IP (`rate_limit_hit` en base) |
| Stockage | Buckets Supabase **`ressources` et `avatars`, tous deux publics**. Les projets de l'IDE sont stockés **en JSON dans PostgreSQL** (`projects`, `project_versions`, ≤ 2,5 Mo), avec révisions et détection de conflits |
| API | 18 routes (`src/app/api/*`, `auth/*`, exports PDF) : exécution de code (Judge0), corrections, quiz, professeur IA (flux, quotas, coûts), projets et versions, progression, santé |
| IA | Couche fournisseur interchangeable (`src/lib/ai` : Anthropic, API compatibles OpenAI), quotas et contrôle des coûts, appels **côté serveur uniquement** |
| Hébergement | **Vercel**, plan **Hobby** selon `docs/DEPLOIEMENT.md` ; HTTPS automatique |
| CI | `.github/workflows/ci.yml` (ZENTECH), `zynora-office.yml`, `zynora-site.yml` |
| Taille | ≈ 322 fichiers TypeScript dans `src/` |

### 3.2 ZYNORA Office — suite bureautique (`zynora-office/`, isolée)

| Élément | Constat |
|---|---|
| Plateforme | **Tauri 2.12** : cœur **Rust** (toolchain 1.97) + interface React 19 / TypeScript ; Windows, macOS, Linux, Android (iOS : Mac requis) |
| Tableur | `packages/spreadsheet-engine` sur **IronCalc 0.9.1** (MIT/Apache) : formules en français, XLSX, CSV, styles, feuilles, historique |
| Traitement de texte | `packages/document-engine` sur **docx-rs 0.4.22** (MIT) : modèle, DOCX, TXT, images, **relevé des éléments non conservés** ; éditeur **ProseMirror** (MIT) |
| Stockage | Local : bibliothèque de fichiers, **SQLite** (récents, favoris, corbeille, journal, récupération) ; écriture atomique ; copies de récupération |
| Sécurité | Interface **sans aucune permission Tauri**, CSP stricte, inspection des archives (ZIP, XXE, bombes, macros), décodage d'images borné |
| Distribution | Installateurs non signés (MSI/EXE, DMG, DEB/RPM/AppImage, APK) publiés par la CI ; page `/zynora-office` sur ZENTECH ; site dédié (GitHub Pages, à activer) |
| Qualité | CI 3 systèmes + Android, tests Rust et Vitest, tests croisés LibreOffice, bout en bout (26 vérifications sur le binaire compilé) |

Documentation détaillée : `zynora-office/ARCHITECTURE.md`, `COMPATIBILITY.md`, `PROJECT_STATUS.md`.

---

## 4. Couverture fonctionnelle actuelle face au master prompt

Légende : ✅ fait et testé · 🟡 partiel · ❌ absent. Détail : `zynora-office/COMPATIBILITY.md`.

### 4.1 ZYNORA WORD

| Rubrique | État | Détail |
|---|---|---|
| A. Fichier | 🟡 | Nouveau, ouvrir, enregistrer, **enregistrer une copie** (imposée si le fichier contient des éléments non conservés), sauvegarde auto et récupération, impression (PDF via le dialogue système). ❌ export PDF intégré, partage, historique des versions, protection |
| B. Accueil | ✅ | Presse-papiers, police, taille, casse, G/I/S/barré, indice/exposant, couleurs, surlignage, alignements, listes à 9 niveaux, retraits, interligne, styles, rechercher/remplacer. ❌ bordures de paragraphe |
| C. Insertion | 🟡 | Sauts de page, tableaux, **images**, liens, symboles, dates. ❌ formes, icônes, graphiques, SmartArt, signets, en-têtes/pieds, numéros de page, zones de texte, WordArt, équations, objets |
| D. Conception | ❌ | Thèmes, filigranes, couleur et bordures de page |
| E. Disposition | 🟡 | Marges, orientation, taille, sauts de page, retraits, espacements. ❌ colonnes, sections, numérotation des lignes, habillage |
| F. Références | ❌ | Table des matières, notes, citations, index… |
| G. Publipostage | ❌ | |
| H. Révision | 🟡 | Orthographe du système, statistiques. ❌ grammaire, traduction, commentaires, suivi des modifications, comparaison, protection |
| I. Affichage | 🟡 | Page, Web, zoom, règle, marques de mise en forme. ❌ pagination à l'écran, mode lecture, volet de navigation, pages multiples, plein écran |
| Formats | 🟡 | DOCX (aller-retour testé, tests croisés LibreOffice), TXT. ❌ DOC, ODT, RTF, export PDF |

### 4.2 ZYNORA EXCEL (ZYNORA Sheets)

| Rubrique | État | Détail |
|---|---|---|
| A. Classeur | 🟡 | Créer, ouvrir, enregistrer, plusieurs feuilles, renommer, supprimer, références entre feuilles. ❌ déplacer/copier/masquer/protéger une feuille |
| B. Cellules | 🟡 | Sélection, saisie, copier/couper/coller, fusion (enregistrée, affichage en grille à faire), bordures, couleurs, formats, alignements, largeur des colonnes. ❌ recopie incrémentée, formats personnalisés, hauteur des lignes à l'écran |
| C. Formules | 🟡 | Moteur IronCalc (calcul réel, recalcul automatique, références relatives/absolues/mixtes/inter-feuilles, erreurs) ; catalogue de 75 fonctions vérifiées FR/EN. ❌ matricielles dynamiques, fonctions de base de données (selon IronCalc), aide contextuelle par argument |
| D. Graphiques | ❌ | |
| E. Données | 🟡 | Tri, suppression des doublons, import CSV. ❌ filtres, validation, listes déroulantes, texte en colonnes, consolidation, imports JSON/XML/SQL/API |
| F. Analyse | ❌ | Tableaux croisés, prévisions, solveur… |
| G. Automatisation | ❌ | Les macros sont **détectées et refusées** (sécurité) |
| Formats | 🟡 | XLSX (3 cycles sans perte, tests croisés LibreOffice), CSV. ❌ XLS, ODS |

### 4.3 Composants du Cloud Office Engine (§4 du master prompt)

| Composant | Existant réutilisable | Manquant |
|---|---|---|
| A. Office Core | Sessions d'édition **locales** (Tauri) ; utilisateurs et rôles **ZENTECH** (Supabase) | Sessions serveur, permissions par document, versions |
| B. Document Processing | `document-engine` (Rust, local) | Service serveur, pagination, sections, conversion |
| C. Spreadsheet Processing | `spreadsheet-engine` (Rust, local) | Service serveur, graphiques, tableaux croisés, validation |
| D. Cloud Storage | Modèle « projets + versions » de l'IDE (JSON en base), Storage Supabase | Bucket **privé** de documents, quotas, URL signées, corbeille cloud, versions de fichiers binaires |
| E. Collaboration | — | Tout (co-édition, présence, commentaires, partage, révocation) |
| F. AI Office | Couche IA ZENTECH (fournisseurs, quotas, coûts, côté serveur) | Actions bureautiques, consentement à l'envoi de données |

---

## 5. Dépendances et licences

| Domaine | Constat |
|---|---|
| ZYNORA Office | Contrôle automatique : **533 dépendances (npm de production + toutes les crates Rust), toutes sous licence autorisée** ; 2 exceptions documentées et jamais livrées (`zynora-office/LICENSES.md`) |
| ZENTECH | Dépendances npm usuelles (Next, Supabase, Monaco, pdf-lib, SDK Anthropic…) ; plages `^` dans `package.json` mais `package-lock.json` versionné |
| ZYNORA Office lui-même | **Licence non encore choisie** par le propriétaire (décision ouverte) |
| ONLYOFFICE (édition communautaire) | **AGPL-3.0** avec obligation de conserver le logo (7(b)) — déjà **écarté** pour l'application de bureau (`zynora-office/ARCHITECTURE.md`, D2). Utiliser le serveur communautaire dans un SaaS fermé n'est **pas** acquis : voir §9 |

---

## 6. Sécurité — constats

| # | Constat | Gravité | Recommandation |
|---|---|---|---|
| S1 | Aucun secret versionné (recherche de clés API, JWT, clés privées : 0 résultat) ; `.env.example` seulement | ✅ | Conserver |
| S2 | RLS active sur toutes les tables, clés `service_role` côté serveur uniquement, quotas IA, MFA, limitation des tentatives | ✅ | Réutiliser ces mécanismes pour les documents |
| S3 | Buckets **`ressources` et `avatars` publics** | Faible aujourd'hui (contenu public) — **bloquant** pour des documents | Créer un bucket **privé** `documents` avec chemins par utilisateur, RLS sur `storage.objects`, **URL signées à courte durée** |
| S4 | Vercel **Hobby** : selon les conditions de Vercel, ce plan est réservé à un usage personnel non commercial | Juridique | Passer au plan Pro (ou autre hébergeur) avant toute exploitation commerciale |
| S5 | Fonctions Vercel : durée et taille de requête limitées ; pas de processus permanent ni de WebSocket persistant | Architecture | Serveur bureautique et collaboration **hors de Vercel** (VPS/conteneurs) ; envois de fichiers **directement vers le stockage** par URL signée |
| S6 | Installateurs ZYNORA Office non signés | Moyen | Signature Windows/macOS (phase Production) |
| S7 | Callbacks d'un serveur bureautique (futur) | Critique si mal fait | JWT signé et vérifié, liste d'adresses autorisées, URL de document temporaires, aucun secret côté navigateur |

---

## 7. Infrastructure actuelle et limites

```
Navigateur ──HTTPS──▶ Vercel (Next.js ZENTECH, fonctions serveur)
                         │
                         ├──▶ Supabase (PostgreSQL + RLS, Auth + MFA, Storage public)
                         ├──▶ Judge0 (exécution de code, facultatif)
                         └──▶ Fournisseur IA (facultatif, quotas)

Poste de l'utilisateur : ZYNORA Office (Tauri) ── fichiers locaux + SQLite (hors ligne)
```

- Rien n'héberge aujourd'hui un **processus serveur permanent** : indispensable pour un moteur
  bureautique (plusieurs cœurs et plusieurs Go de mémoire selon le nombre de connexions : à
  dimensionner d'après la documentation de l'éditeur retenu) et pour la co-édition (WebSocket).
- Les quotas de Supabase dépendent du plan (stockage, taille maximale d'un fichier) : à vérifier
  sur le tableau de bord du projet, inaccessible depuis cet audit.

---

## 8. Écart principal

Le master prompt décrit une **suite SaaS multi-utilisateur** ; le dépôt contient une **suite de bureau
hors ligne** (ZYNORA Office) et une **plateforme d'apprentissage** (ZENTECH) qui possède déjà
l'authentification, les rôles, la base et l'IA. Le Cloud Office Engine doit donc **relier** ces deux
mondes, sans casser ni l'un ni l'autre :

- ZENTECH apporte : comptes, rôles, MFA, RLS, journalisation, IA avec quotas, hébergement web.
- ZYNORA Office apporte : moteurs locaux, édition hors ligne, sécurité des fichiers, identité visuelle.
- À ajouter : serveur bureautique, stockage privé de documents, sessions, partage, collaboration.

---

## 9. Solutions envisageables

| Critère | **ONLYOFFICE Docs Developer Edition** | **Collabora Online** | **Moteurs ZYNORA (maison)** |
|---|---|---|---|
| Licence | **Commerciale** (Developer Edition) ; l'édition communautaire est AGPL-3.0 avec logo obligatoire | Cœur **MPL-2.0** ; CODE gratuit « pour les tests et l'usage domestique » ; abonnements Business / Enterprise | MIT/Apache (IronCalc, docx-rs, ProseMirror) ; code ZYNORA à licence à choisir |
| Usage SaaS sous la marque ZYNORA | Prévu : licences *Single Server* (250/500/1 000 connexions simultanées) ou *Cluster* ; option **White Label** incluse ; la licence *Development Server* (20 connexions) **interdit** de servir des utilisateurs finaux | Hébergement via partenaires ou abonnement ; conditions SaaS **non publiées** → à demander | Aucune contrainte |
| Prix | **Non publié** sur la FAQ officielle ; revendeurs : à partir de ≈ 1 500–1 900 $ (développement) et ≈ 6 000 $/an (serveur unique) — **à confirmer par devis** | Business : **3 €/utilisateur/mois** (jusqu'à 99 utilisateurs) ; Enterprise : sur devis | Développement interne uniquement |
| Durée | Abonnement d'**un an** à renouveler (sinon version bloquée) | Abonnement annuel (remises pluriannuelles) | — |
| Fonctions Word/Excel | Très étendues : co-édition, commentaires, suivi des modifications, tableaux croisés, graphiques, macros (JavaScript), PDF | Étendues (LibreOffice) : co-édition, commentaires, suivi, graphiques, tableaux croisés ; macros Basic limitées | Celles du §4 ; graphiques, tableaux croisés, collaboration **à développer** |
| Formats | DOCX/XLSX/PPTX natifs (OOXML) ; ODT/ODS, DOC/XLS par conversion | ODF natif ; OOXML, DOC/XLS (filtres LibreOffice) | DOCX, XLSX, CSV, TXT (testés) |
| Intégration | API Docs (éditeur intégré dans une page), **JWT**, callbacks d'enregistrement | Protocole **WOPI** (hôte WOPI à écrire : CheckFileInfo, GetFile, PutFile, verrous) | Déjà intégré (bureau) ; version web à construire (IronCalc existe en WebAssembly) |
| Personnalisation de l'interface | Thèmes, logo (White Label), plugins ; interface ONLYOFFICE | Personnalisation limitée de l'interface LibreOffice | Totale (identité ZYNORA) |
| Hébergement | Serveur dédié / Docker (dimensionnement selon les connexions) | Docker ; comparable | Navigateur + API existantes |
| Délai pour une couverture élevée | **Court** (semaines) | Court à moyen | **Long** (années pour la parité Word/Excel) |

**Conclusion** : pour une version **cloud** commercialement exploitable à court terme, ONLYOFFICE
Developer Edition est le meilleur compromis (couverture DOCX/XLSX, API JWT simple, White Label).
Collabora est pertinent si le budget par utilisateur est préféré au forfait par serveur, ou si l'ODF
est prioritaire. Les moteurs ZYNORA restent la base de l'**application de bureau hors ligne**, et
pourront à terme alimenter une version web légère sans licence.

---

## 10. Plan d'intégration proposé (sous réserve des décisions du §11)

Architecture cible (ZENTECH reste sur Vercel ; services permanents sur un serveur dédié) :

```
                 ┌──────────── Vercel : ZENTECH (Next.js) ─────────────┐
Navigateur ─────▶│ /zynora/word, /zynora/excel  (pages éditeurs)        │
  (ZYNORA)       │ API Office Core : documents, permissions, versions,  │
                 │ partage, jetons JWT d'édition, callbacks vérifiés    │
                 └───────┬───────────────────────────────┬──────────────┘
                         │ SQL + RLS / URL signées        │ JWT (secret serveur)
                 ┌───────▼────────┐              ┌────────▼──────────────────┐
                 │ Supabase       │◀── callback ─│ Serveur bureautique        │
                 │ Postgres, Auth │   signé      │ (ONLYOFFICE ou Collabora,  │
                 │ Storage PRIVÉ  │──URL signée─▶│ Docker, HTTPS, VPS dédié)  │
                 └────────────────┘              └───────────────────────────┘
Poste local : ZYNORA Office (Tauri, hors ligne) ── synchronisation avec l'API (phase 6)
```

| Phase | Contenu | Prérequis du propriétaire |
|---|---|---|
| 2. Architecture | `docs/ARCHITECTURE.md`, `docs/CLOUD_OFFICE_ENGINE.md`, schéma SQL (documents, versions, partages, sessions), contrats d'API | Choix du moteur |
| 3. Infrastructure | Migration **additive** (nouvelles tables + bucket privé, aucune table existante modifiée), API Office Core sur Vercel, serveur bureautique en Docker, JWT, callbacks | Serveur (VPS), nom de domaine, licence ou essai de 30 jours |
| 4. Word | Page éditeur ZYNORA Word web (API Docs ou WOPI), ouverture/enregistrement via le stockage privé | Licence active |
| 5. Excel | Idem pour les classeurs | — |
| 6. Cloud | Versions, corbeille, quotas, synchronisation avec l'application de bureau | — |
| 7. Collaboration | Co-édition (fournie par le moteur), partage par invitation/lien, révocation | — |
| 8. IA | Actions bureautiques via la couche IA existante, **consentement explicite** avant envoi de contenu | Fournisseur IA et budget |
| 9–11 | Audit de sécurité, tests de compatibilité (corpus réels), mise en production, sauvegardes, surveillance | Plan Vercel Pro (usage commercial) |

Règles respectées par ce plan : aucune route, table ou donnée existante supprimée ; migrations
additives et réversibles ; secrets uniquement dans les variables du serveur ; ZYNORA Office et
ZENTECH continuent de fonctionner à chaque étape.

---

## 11. Décisions requises du propriétaire

1. **Moteur cloud** : ONLYOFFICE Developer Edition (recommandé), Collabora Online, ou moteurs ZYNORA
   uniquement (pas de licence, délai long).
2. **Budget** : demande de devis ONLYOFFICE (ou Collabora) ; **aucun abonnement ne sera souscrit
   sans votre accord**. Un essai gratuit de 30 jours (ONLYOFFICE) permet de prototyper les phases 3–4.
3. **Hébergement du serveur bureautique** : fournisseur VPS (taille selon les connexions visées), région,
   nom de domaine.
4. **Hébergement de ZENTECH** : passage de Vercel Hobby à Pro avant usage commercial.
5. **Emplacement des éditeurs web** : dans ZENTECH (recommandé : comptes et rôles déjà en place) ou
   dans un site séparé.
6. **Licence de ZYNORA Office** (propriétaire, MIT/Apache, MPL…), toujours ouverte.
7. **Accès Supabase/Vercel** pour cette session (les jetons actuels sont refusés) si vous souhaitez
   que je configure moi-même l'infrastructure.

---

## 12. Risques

| Risque | Impact | Atténuation |
|---|---|---|
| Utiliser l'édition communautaire AGPL d'ONLYOFFICE dans un service fermé | Juridique | Licence Developer Edition, ou Collabora sous contrat |
| Coût récurrent (licence annuelle, serveur) | Financier | Devis, essai, suivi des coûts, limites d'usage |
| Serveur bureautique exposé | Sécurité | JWT, HTTPS, pare-feu, URL temporaires, mises à jour |
| Divergence entre bureau (moteurs ZYNORA) et cloud (moteur tiers) | Compatibilité | Format pivot DOCX/XLSX, tests croisés, signalement des pertes (déjà en place) |
| Quotas Supabase / limites Vercel | Disponibilité | Stockage direct par URL signée, suivi des quotas, plans adaptés |
| Promesse de parité « 100 % Word/Excel » | Réputation | Couverture mesurée et publiée (`FEATURE_COVERAGE.md`), jamais supposée |

---

## 13. Sources (consultées le 19/11/2026)

- ONLYOFFICE, FAQ Developer Edition : https://helpcenter.onlyoffice.com/docs/faq/developer.aspx
- ONLYOFFICE, page des prix Developer Edition : https://www.onlyoffice.com/en/developer-edition-prices.aspx
- ONLYOFFICE pour les développeurs : https://www.onlyoffice.com/for-developers
- ComponentSource (revendeur) : https://www.componentsource.com/product/onlyoffice-docs-developer/prices
- Collabora Online, tarifs : https://www.collaboraonline.com/pricing/
- Collabora Online : https://www.collaboraonline.com/

Les prix indiqués sont ceux des pages consultées ; seul un devis de l'éditeur fait foi.
