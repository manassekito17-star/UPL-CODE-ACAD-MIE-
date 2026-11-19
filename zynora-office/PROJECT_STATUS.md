# État du projet — ZYNORA OFFICE

_Mise à jour : 19/11/2026 — phase 2 (ZYNORA Sheets) : cœur livré ; version smartphone : en cours._

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

## En cours
- Exécution de la CI : Linux, Windows, macOS et **premier APK Android** (l'assemblage local de
  l'APK a été bloqué par les limites de débit de Maven Central depuis le conteneur de développement).

## Restant
- **Sheets** : affichage des cellules fusionnées dans la grille, bordures, tri, filtres,
  graphiques, impression et export PDF, corpus de fichiers produits par **Microsoft Excel**
  (2010 → 365), hauteurs de ligne personnalisées à l'écran, réconciliation de la corbeille.
- **Smartphone** : import depuis le stockage du téléphone (adresses `content://`), tests sur
  émulateur Android, édition tactile avancée (sélection par glissement), **iOS** (Mac + Xcode +
  compte Apple Developer), APK signé pour la distribution.
- Phases suivantes : **Word** (phase 3), Slides (phase 4), fonctions avancées, IA, synchronisation,
  publication signée (voir ROADMAP.md).

## Erreurs corrigées pendant la phase 2
- Formats de nombre : syntaxe canonique Excel (« 0.00 ») ; l'affichage suit la langue.
- Boutons d'alignement affichés comme enfoncés pour l'alignement par défaut des nombres.
- Tests LibreOffice en parallèle : profil utilisateur partagé → un profil par test.
- Test de bout en bout : la recherche XPath par `text()` n'est pas fiable sous WebKitWebDriver →
  lecture directe du DOM.

## Erreurs et limites connues
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
| Rust `zynora-spreadsheet-engine` | ✅ 15 / 15 (+ 2 / 2 croisés LibreOffice) |
| Rust `zynora-desktop` | ✅ 3 / 3 |
| Vitest design system | ✅ 11 / 11 |
| Vitest application (dont 12 Sheets, 3 références) | ✅ 34 / 34 |
| node:test scripts | ✅ 2 / 2 |
| TypeScript strict, `cargo fmt`, `clippy -D warnings` | ✅ |
| Licences | ✅ 472 / 472 |
| Bout en bout (binaire compilé, vrai disque, vrai moteur) | ✅ 19 / 19 vérifications |
| Interface téléphone (émulation iPhone 13) | ✅ vérifiée visuellement |
| Compilation Rust Android arm64 | ✅ |
| APK Android | ⏳ CI |

**Tests échoués actuellement : aucun en local.**

## Décisions prises (modifiables)
1. Emplacement : dossier isolé du dépôt actuel (dépôt dédié recommandé).
2. ONLYOFFICE écarté (AGPL + logo obligatoire) ; **IronCalc validé et intégré**.
3. Ordre : Sheets (phase 2) avant Word (phase 3).
4. Interface « familière » des tableurs **sans copie** de l'interface, des icônes ou des marques
   de Microsoft (demande « ressembler à 100 % » adaptée : voir ARCHITECTURE.md, D13).
5. Version smartphone avec Tauri 2 mobile (même code) ; iOS nécessite un Mac.
6. Licence de ZYNORA OFFICE : non choisie.

## Prochaine tâche
1. Confirmer la CI (dont l'APK Android) et corriger si nécessaire.
2. **Phase 3 — ZYNORA Word** : prototype de validation ProseMirror + pagination + lecture/écriture
   DOCX (ARCHITECTURE.md, D4), avec la même méthode que pour Sheets (prototype mesuré avant
   intégration).
3. En parallèle : fin de Sheets (fusions affichées, bordures, tri/filtres) et import mobile.
