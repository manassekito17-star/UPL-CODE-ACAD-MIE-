# État du projet — ZYNORA OFFICE

_Mise à jour : 18/11/2026 — fin de la phase 0 (fondations)._

## Terminé (et testé)
- Monorepo pnpm + Cargo isolé dans `zynora-office/`, exclu du lint et du typage de ZENTECH
  (vérifié : `npm run lint` et `tsc` de ZENTECH passent toujours).
- Application Tauri 2 + React + TypeScript : démarre, lit et écrit ses paramètres dans SQLite.
- Design system ZYNORA : jetons clair/sombre (contrastes AA calculés), composants accessibles.
- Thèmes clair / sombre / système ; langues français / anglais ; raccourci `Ctrl+,`.
- Base locale : migrations, paramètres typés, journal des opérations sensibles.
- Briques de sécurité pour l'import : noms, chemins, format réel, archives ZIP/XML.
- Paquets Linux produits localement : DEB, RPM, AppImage (non signés).
- Contrôle des licences (446 dépendances autorisées), CI 3 systèmes écrite.

## En cours
- Premier passage de la CI Windows et macOS (configurée, résultat à confirmer après le push).

## Restant
Voir [ROADMAP.md](ROADMAP.md) : phase 1 (Core : fichiers, récents, favoris, corbeille, sauvegarde
automatique, récupération), puis Sheets, Word, Slides, fonctions avancées, IA, synchronisation,
publication signée.

## Erreurs et limites connues
- **Aucun éditeur disponible** (affichés « Phase N — pas encore disponible »).
- Si la base locale ne peut pas être ouverte (ex. créée par une version plus récente), l'application
  quitte avec un message en console au lieu d'une boîte de dialogue → à traiter en phase 1.
- Installateurs non signés : avertissements SmartScreen (Windows) et Gatekeeper (macOS).
- Pas de test de bout en bout sur macOS (aucun pilote WebDriver pour WKWebView).
- Les captures d'écran WebDriver sous WebKitGTK peuvent être en retard d'une image : une pause est
  appliquée avant capture (sans effet sur les assertions du test).
- Emplacement provisoire dans le dépôt ZENTECH (dépôt dédié recommandé).

## Tests

| Suite | Résultat (Linux, 18/11/2026) |
|---|---|
| Rust `zynora-security` | ✅ 12 / 12 |
| Rust `zynora-database` | ✅ 7 / 7 |
| Vitest design system | ✅ 6 / 6 |
| Vitest application | ✅ 8 / 8 |
| node:test scripts | ✅ 2 / 2 |
| TypeScript strict | ✅ |
| `cargo fmt` + `clippy -D warnings` | ✅ |
| Licences | ✅ 446 / 446 |
| Bout en bout (binaire compilé) | ✅ 6 / 6 vérifications |
| CI Windows / macOS | ⏳ pas encore exécutée |

**Tests échoués : aucun.**

## Décisions prises par défaut (modifiables)
1. Emplacement : dossier isolé du dépôt actuel (aucun dépôt dédié disponible dans la session).
2. ONLYOFFICE écarté (AGPL + logo obligatoire) ; IronCalc retenu pour Sheets.
3. Ordre : Sheets (phase 2) avant Word (phase 3).
4. Licence de ZYNORA OFFICE : non choisie, à décider par le porteur de projet.

## Prochaine tâche
**Phase 1 — ZYNORA Core**, dans cet ordre :
1. Dialogues natifs ouvrir/enregistrer (`tauri-plugin-dialog`, permission limitée) ; toute lecture
   passe par `zynora-security`.
2. Écriture atomique (fichier temporaire + `fsync` + renommage) et sauvegarde de l'ancienne version.
3. Migration SQLite v2 : documents récents, favoris, corbeille, points de récupération.
4. Tableau de bord : récents, favoris, recherche par nom.
5. Récupération après incident (test : processus tué pendant l'écriture).
6. Boîte de dialogue d'erreur au démarrage si la base est inutilisable.
