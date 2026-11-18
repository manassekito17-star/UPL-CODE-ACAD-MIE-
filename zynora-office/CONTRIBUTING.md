# Contribuer à ZYNORA OFFICE

## Avant d'envoyer une modification
```bash
pnpm check        # types, tests JS et Rust, fmt, clippy, licences
pnpm build && pnpm test:e2e   # si l'interface ou les commandes changent (Linux)
```

## Conventions
- **Langue** : documentation, messages d'interface et noms de tests en français ; identifiants de
  code en anglais. Toute chaîne d'interface passe par `apps/desktop/src/i18n.ts` (FR et EN).
- **Rust** : `unsafe` interdit ; pas d'`unwrap()` hors tests ; erreurs typées (`thiserror`) avec
  messages lisibles par l'utilisateur.
- **TypeScript** : mode strict ; pas de `any`.
- **IPC** : toute nouvelle commande prend des arguments typés fermés, est documentée dans
  ARCHITECTURE.md (§3) et n'ouvre aucune permission Tauri générique.
- **Base** : ne jamais modifier une migration publiée ; en ajouter une.
- **Dépendances** : versions exactes ; justification dans LICENSES.md ; `pnpm check:licenses` doit passer.
- **Design** : uniquement les jetons de `packages/design-system/src/tokens.css` ; contraste AA.
- **Honnêteté fonctionnelle** : pas de bouton décoratif, pas de résultat simulé. Une fonction non
  prête est affichée comme indisponible.

## Commits
Message court à l'impératif, en français, décrivant le changement visible. Mettre à jour
CHANGELOG.md et PROJECT_STATUS.md quand une fonctionnalité change d'état.
