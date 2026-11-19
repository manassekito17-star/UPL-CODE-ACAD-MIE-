# Site ZYNORA Office

Site vitrine et de téléchargement, **Next.js 16 compilé avec Turbopack**, exporté en HTML statique
(`out/`) : aucun serveur, aucune base de données, hébergeable n'importe où.

```bash
pnpm --filter @zynora/site dev     # développement (Turbopack)
pnpm --filter @zynora/site build   # export statique dans apps/site/out
pnpm --filter @zynora/site test    # compilation + vérification des pages et des liens
```

## Hébergement

### GitHub Pages (automatique, recommandé)
Le workflow `.github/workflows/zynora-site.yml` compile et publie le site à chaque modification sur
`main`. **Une seule action manuelle, une fois** : dans GitHub, *Settings → Pages → Build and
deployment → Source : GitHub Actions*. Adresse : `https://<compte>.github.io/<dépôt>/`.

### Vercel (alternative)
*Add New → Project* → importer le dépôt → **Root Directory : `zynora-office/apps/site`**,
framework Next.js (détecté). Aucune variable d'environnement n'est nécessaire.

## Liens de téléchargement
Ils pointent vers la version GitHub « zynora-office-preview », publiée par la CI après réussite de
tous les tests (`.github/workflows/zynora-office.yml`).
