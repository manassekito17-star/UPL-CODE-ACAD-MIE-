# État du projet — ZYNORA OFFICE

_Mise à jour : 19/11/2026 — Phase 3 : première version de ZYNORA Word ; PR n° 50._

## Terminé (et testé)

### Phases 0 et 1 — Fondations et ZYNORA Core (validées sur Linux, Windows et macOS)
Application Tauri 2 sans permission système pour l'interface, design system, base SQLite à
migrations, sécurité des imports, bibliothèque de documents (import validé, dossiers, renommage,
favoris, récents, recherche, corbeille avec restauration), détection d'arrêt brutal.

### Phase 2 — ZYNORA Sheets
- **Moteur IronCalc validé par prototype**, puis intégré (`packages/spreadsheet-engine`).
- **Interface de tableur** aux conventions familières, identité ZYNORA : ruban (Accueil,
  Insertion, Disposition), zone de nom, barre de formule, grille virtualisée, onglets de feuilles,
  barre d'état (somme, moyenne, nombre de la sélection).
- Formules calculées par le moteur (fonctions en français), références relatives, absolues et
  entre feuilles, erreurs de calcul, recalcul des dépendances.
- Mise en forme : gras, italique, souligné, barré, couleur du texte et du fond, alignements,
  formats de nombre (standard, nombre, pourcentage, monétaire, date), fusion (enregistrée).
- Lignes et colonnes (insertion, suppression), feuilles (ajout, renommage, suppression),
  copier/couper/coller (formules ajustées), annuler/rétablir, somme automatique, raccourcis.
- XLSX (ouverture revalidée, enregistrement atomique, nouveau classeur) ; CSV (import, export).
- **Sauvegarde automatique et récupération** (reportées de la phase 1) : copie toutes les 30 s
  hors du document, proposée au démarrage ; confirmation avant de fermer sans enregistrer.

### Version smartphone (en cours)
- Interface adaptative vérifiée en émulation iPhone 13 : navigation en bas d'écran, zones sûres,
  ruban défilant, colonnes secondaires masquées, aucune largeur excédentaire.
- Cœur Rust adapté (point d'entrée mobile, bibliothèque dans l'espace privé de l'application,
  choix de dossier désactivé, import non pris en charge signalé explicitement).
- Le cœur Rust **compile pour Android arm64** ; projet Android Tauri généré et versionné ;
  job CI « Android » ajouté pour assembler l'APK de test.

### Ruban complet de Sheets et publication
- 5 onglets réels : Accueil (6 groupes), Insertion, Formules, Données, Affichage (détail dans
  COMPATIBILITY.md). Onglets « Mise en page » et « Révision » volontairement absents tant que
  l'impression, les commentaires et la protection ne sont pas implémentés.
- Page `/zynora-office` sur le site ZENTECH (PR n° 50, à fusionner) et version GitHub
  « zynora-office-preview » publiée automatiquement après réussite de la CI.

### Phase 3 — ZYNORA Word (première version, validée sur Linux, Windows, macOS et Android)
- **Moteur** `packages/document-engine` (docx-rs, MIT) : modèle de document, lecture et écriture
  DOCX, texte brut ; tout élément que ZYNORA ne sait pas réécrire est **relevé**.
- **Aucune perte silencieuse** : un document dont la lecture a relevé des éléments non conservés
  n'est jamais remplacé — refus appliqué dans le cœur Rust, copie imposée côté interface.
- **Éditeur** ProseMirror (MIT) : page aux dimensions et marges du document, ruban Accueil,
  Insertion, Mise en page, Révision, Affichage, chaque bouton fonctionnel et enregistré
  (détail : COMPATIBILITY.md), barre d'état, impression, sauvegarde automatique et récupération.
- Word activé dans la navigation, l'accueil et la bibliothèque.

## En cours
- Rien en cours d'exécution : CI n° 24 (commit 3012132) verte sur les 5 jobs — Linux (dont tests
  croisés LibreOffice XLSX/DOCX, paquets et bout en bout 25/25), Windows, macOS, Android — et
  version « zynora-office-preview » republiée avec Word.

## Restant
- **Sheets** : affichage des cellules fusionnées dans la grille, bordures, tri, filtres,
  graphiques, impression et export PDF, corpus de fichiers produits par **Microsoft Excel**
  (2010 → 365), hauteurs de ligne personnalisées à l'écran, réconciliation de la corbeille.
- **Smartphone** : import depuis le stockage du téléphone (adresses `content://`), tests sur
  émulateur Android, édition tactile avancée (sélection par glissement), **iOS** (Mac + Xcode +
  compte Apple Developer), APK signé pour la distribution.
- **Word** : images, pagination automatique à l'écran, en-têtes et pieds de page, notes, table des
  matières, cellules fusionnées, ODT, export PDF, corpus de fichiers produits par **Microsoft Word**.
- Phases suivantes : Slides (phase 4), fonctions avancées, IA, synchronisation, publication
  signée (voir ROADMAP.md).

## Erreurs corrigées pendant la phase 2
- Formats de nombre : syntaxe canonique Excel (« 0.00 ») ; l'affichage suit la langue.
- Boutons d'alignement affichés comme enfoncés pour l'alignement par défaut des nombres.
- Tests LibreOffice en parallèle : profil utilisateur partagé → un profil par test.
- Test de bout en bout : la recherche XPath par `text()` n'est pas fiable sous WebKitWebDriver →
  lecture directe du DOM.

## Erreurs corrigées pendant la phase 3
- CI : typage du site sans types Node (échec Windows/Linux/macOS, run n° 18) ; test du ruban
  Sheets dépendant d'un chargement asynchrone (intermittent, run n° 23). Pannes externes
  constatées (archives Ubuntu 503, Maven Central 429) : nouvelles tentatives apt ajoutées,
  jobs relancés, aucun test désactivé.
- Listes à puces affichées numérotées par LibreOffice : identifiant de numérotation en conflit
  avec celui que docx-rs déclare déjà → identifiants dédiés (détecté par le test croisé).
- Profil release en `panic = "abort"` : une panique d'un lecteur aurait fermé l'application →
  `unwind` + `catch_unwind` (ARCHITECTURE.md, D15).

## Erreurs et limites connues
- Word : affichage en page continue (pas de découpage automatique en pages à l'écran) ; les
  documents contenant images, notes, en-têtes… s'ouvrent en lecture-modification mais ne peuvent
  être enregistrés que sous forme de copie, sans ces éléments.
- Cellules fusionnées : la fusion est enregistrée dans le fichier mais la grille ne l'affiche pas
  encore comme une seule cellule.
- ODS non pris en charge par le moteur (message explicite) ; CSV : première feuille seulement.
- Sur téléphone, l'import depuis le stockage n'est pas encore possible (refus explicite).
- Si l'application s'arrête au milieu d'une mise à la corbeille, l'élément reste dans
  `.zynora/corbeille` sans apparaître dans la liste (aucune perte).
- Installateurs non signés ; pas d'e2e sur macOS ni sur Android pour l'instant.

## Tests

| Suite | Résultat (Linux, 19/11/2026) |
|---|---|
| Rust `zynora-security` | ✅ 13 / 13 |
| Rust `zynora-database` | ✅ 13 / 13 |
| Rust `zynora-file-manager` | ✅ 13 / 13 |
| Rust `zynora-spreadsheet-engine` | ✅ 24 / 24 (+ 2 / 2 croisés LibreOffice) |
| Rust `zynora-document-engine` | ✅ 8 / 8 (+ 1 / 1 croisé LibreOffice) |
| Rust `zynora-desktop` | ✅ 6 / 6 |
| Vitest design system | ✅ 11 / 11 |
| Vitest application (dont 12 Sheets, 11 ruban, 15 Word) | ✅ 60 / 60 |
| node:test scripts | ✅ 2 / 2 |
| TypeScript strict, `cargo fmt`, `clippy -D warnings` | ✅ |
| Licences | ✅ 531 / 531 |
| Bout en bout (binaire compilé, vrai disque, vrais moteurs) | ✅ 25 / 25 vérifications |
| Interface téléphone (émulation iPhone 13) | ✅ vérifiée visuellement |
| Compilation Rust Android arm64 | ✅ |
| APK Android | ✅ CI (run n° 24) |
| CI complète (Linux, Windows, macOS, Android, publication) | ✅ run n° 24 |

**Tests échoués actuellement : aucun en local.**

## Décisions prises (modifiables)
1. Emplacement : dossier isolé du dépôt actuel (dépôt dédié recommandé).
2. ONLYOFFICE écarté (AGPL + logo obligatoire) ; **IronCalc validé et intégré**.
3. Ordre : Sheets (phase 2) avant Word (phase 3).
7. Word : docx-rs au lieu d'un analyseur maison conservant le XML ; en contrepartie, copie imposée
   pour tout document contenant des éléments non pris en charge (ARCHITECTURE.md, D4).
4. Interface « familière » des tableurs **sans copie** de l'interface, des icônes ou des marques
   de Microsoft (demande « ressembler à 100 % » adaptée : voir ARCHITECTURE.md, D13).
5. Version smartphone avec Tauri 2 mobile (même code) ; iOS nécessite un Mac.
6. Licence de ZYNORA OFFICE : non choisie.

## Prochaine tâche
1. Word : images (lecture, affichage, réécriture), pagination à l'écran, en-têtes et pieds de page,
   export PDF ; corpus de documents Microsoft Word.
2. En parallèle : fin de Sheets (fusions affichées, filtres, graphiques) et import mobile.
