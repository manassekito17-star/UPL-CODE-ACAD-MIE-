# Mettre UPL CODE ACADEMY MK en ligne — guide pas à pas (débutant)

Durée : environ 1 heure. Coût : 0 $ (offres gratuites). Il faut seulement :

- un compte **GitHub** (vous en avez un) ;
- une adresse **Gmail**.

> **Règle d'or :** les clés secrètes (« service_role », « Client secret » de Google) ne se collent **jamais** dans le code, dans GitHub ni dans une conversation. Elles vont uniquement dans les tableaux de bord de Supabase et de Vercel.

Dans ce guide, `VOTRE-SITE` désigne l'adresse que Vercel vous donnera (par exemple `upl-code-academy-mk.vercel.app`) et `VOTRE-REF` l'identifiant de votre projet Supabase (par exemple `abcdefghijkl`).

---

## Étape 0 — Mettre le code à publier sur la branche principale

Tout le travail récent est sur la branche `claude/upl-code-academy-specs-vl0z7e` ; la branche `main` contient une ancienne version. Deux possibilités :

- **Recommandé :** sur GitHub, ouvrez le dépôt, cliquez **Pull requests → New pull request**, choisissez `main` ← `claude/upl-code-academy-specs-vl0z7e`, puis **Create pull request** et **Merge**.
- **Ou :** dans Vercel (étape 3), réglez la *Production Branch* sur `claude/upl-code-academy-specs-vl0z7e` (Settings → Git).

## Étape 1 — Supabase (base de données et comptes)

1. Allez sur **https://supabase.com**, cliquez **Start your project**, puis connectez-vous **avec GitHub**.
2. Cliquez **New project** :
   - **Name** : `upl-code-academy-mk` ;
   - **Database Password** : cliquez *Generate*, puis **copiez-le dans un endroit sûr** (gestionnaire de mots de passe) ;
   - **Region** : la plus proche de vos étudiants (par exemple *Central EU (Frankfurt)*) ;
   - offre **Free**. Cliquez **Create new project** et attendez environ 2 minutes.
3. **Créer les tables et les cours (sans rien installer sur votre ordinateur)** :
   1. Sur GitHub, ouvrez `supabase/installation/1-structure.sql` et cliquez l'icône **Copy raw file**.
   2. Dans Supabase : menu de gauche **SQL Editor** (icône `>_`) → **New query** → collez → **Run**. Le message attendu est « Success. No rows returned ».
   3. Recommencez avec `supabase/installation/2-contenu.sql` : **New query** → collez → **Run**. Le fichier est gros (environ 1 Mo) : attendez la fin.
   4. Contrôle : **Table Editor** → la table `courses` contient 7 lignes.

   *Variante en ligne de commande, si Node.js est installé :* `npx supabase login`, `npx supabase link --project-ref VOTRE-REF`, puis `npx supabase db push --include-seed`. N'utilisez pas les deux méthodes sur le même projet.
4. **Récupérer les clés** : **Project Settings → API Keys** (ou **API**). Notez trois choses :
   - **Project URL** (`https://VOTRE-REF.supabase.co`) ;
   - **anon / publishable key** ;
   - **service_role / secret key** : elle est secrète, ne la partagez jamais.
5. **Réglages des comptes** : **Authentication → Sign In / Providers → Email**. Laissez **Confirm email** activé : il garantit qu'une même personne ne crée pas deux comptes (voir « Comptes Google et e-mail » plus bas).
6. **Facultatif :** l'envoi d'e-mails intégré de Supabase est très limité (quelques messages par heure). Pour de vrais utilisateurs, branchez un service d'e-mails gratuit (Brevo, Resend…) dans **Authentication → Emails → SMTP Settings**.

## Étape 2 — Google (bouton « Continuer avec Google »)

1. Allez sur **https://console.cloud.google.com** et connectez-vous avec votre Gmail.
2. En haut, cliquez sur le sélecteur de projet, puis **New project**. Nom : `UPL CODE ACADEMY MK`. Cliquez **Create**.
3. Menu ☰ → **APIs & Services → OAuth consent screen**. Selon les versions, la page s'appelle **Google Auth Platform**. Cliquez **Get started** :
   - **App name** : `UPL CODE ACADEMY MK` ; **User support email** : votre Gmail ;
   - **Audience** : **External** ;
   - **Contact information** : votre Gmail. Acceptez puis cliquez **Create**.
4. Rubrique **Audience** → **Publish app** (« In production »). Les autorisations utilisées (nom, e-mail, photo) ne demandent pas de vérification par Google.
5. Rubrique **Clients** → **Create client** :
   - **Application type** : **Web application** ; **Name** : `UPL CODE ACADEMY MK — web` ;
   - **Authorized JavaScript origins** : `https://VOTRE-SITE`. Si vous ne la connaissez pas encore, revenez ici après l'étape 3 ;
   - **Authorized redirect URIs** : `https://VOTRE-REF.supabase.co/auth/v1/callback`. Supabase affiche cette adresse exacte à l'étape 2.7 ;
   - cliquez **Create**. Copiez le **Client ID** et le **Client secret**.
6. **Ne mettez pas** ces deux valeurs dans GitHub.
7. Retour dans **Supabase → Authentication → Sign In / Providers → Google** :
   - activez **Enable Sign in with Google** ;
   - collez le **Client ID** et le **Client Secret**, puis **Save** ;
   - vérifiez que le **Callback URL** affiché est celui de l'étape 2.5.

## Étape 3 — Vercel (hébergement du site, HTTPS automatique)

1. Allez sur **https://vercel.com/signup** et choisissez **Hobby**, puis **Continue with GitHub**.
2. **Add New… → Project** :
   - autorisez l'accès au dépôt `UPL-CODE-ACAD-MIE-` ;
   - cliquez **Import**.
3. Dans **Environment Variables**, ajoutez :

   | Nom | Valeur |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://VOTRE-SITE` (mettez d'abord `https://upl-code-academy-mk.vercel.app`, à corriger après le premier déploiement si l'adresse diffère) |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL de l'étape 1.4 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé anon / publishable |
   | `SUPABASE_SERVICE_ROLE_KEY` | clé service_role / secret (cochez **Sensitive**) |
   | `NEXT_PUBLIC_AUTH_GOOGLE` | `true` (une fois l'étape 2 terminée) |
   | `AI_PROVIDER` | `openai_compatible` (facultatif ; voir `docs/COUTS.md`) |

4. Cliquez **Deploy** et attendez environ 3 minutes. Vercel affiche l'adresse publique `https://VOTRE-SITE`. Le HTTPS est automatique.
5. Si l'adresse diffère de celle saisie : **Settings → Environment Variables**, corrigez `NEXT_PUBLIC_SITE_URL`, puis **Deployments → ⋯ → Redeploy**.

## Étape 4 — Relier les trois services

1. **Supabase → Authentication → URL Configuration** :
   - **Site URL** : `https://VOTRE-SITE` ;
   - **Redirect URLs** : ajoutez `https://VOTRE-SITE/auth/callback` et `https://VOTRE-SITE/**`.
2. **Google Cloud → Clients → votre client** : dans **Authorized JavaScript origins**, vérifiez `https://VOTRE-SITE`.

## Étape 5 — Créer votre compte administrateur (sécurisé)

L'inscription administrateur n'est **pas publique** : on devient administrateur uniquement par une opération côté serveur.

1. Ouvrez `https://VOTRE-SITE/inscription`, cliquez **Continuer avec Google** et choisissez votre Gmail. Votre compte étudiant est créé.
2. Dans **Supabase → SQL Editor → New query**, collez la requête suivante (remplacez l'adresse), puis cliquez **Run** :

   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'administrateur' from auth.users where email = 'votre.adresse@gmail.com'
   on conflict do nothing;
   ```

   **Ou**, depuis votre ordinateur : `npm run admin:creer -- votre.adresse@gmail.com`, avec `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans un fichier `.env.local`, qui n'est jamais envoyé sur GitHub.
3. Déconnectez-vous puis reconnectez-vous : **https://VOTRE-SITE/admin** est accessible.

## Étape 6 — Vérifications

- [ ] `https://VOTRE-SITE` s'ouvre sur téléphone, tablette et ordinateur.
- [ ] Le lien partagé dans WhatsApp, Telegram, Facebook ou Gmail affiche l'aperçu (titre et image « UPL CODE ACADEMY MK »). WhatsApp et Facebook gardent les aperçus en cache : pour Facebook, utilisez https://developers.facebook.com/tools/debug/ pour actualiser.
- [ ] **Continuer avec Google** crée le compte et mène au tableau de bord, avec la photo et l'e-mail.
- [ ] L'inscription par e-mail envoie un message de confirmation.
- [ ] **Mot de passe oublié** envoie un lien qui permet d'en choisir un nouveau.
- [ ] `/admin` refuse un compte étudiant et s'ouvre avec votre compte administrateur.

## Comptes Google et e-mail : pas de doublon

- Supabase rattache automatiquement une connexion Google au compte existant qui a **la même adresse e-mail vérifiée**. Une personne inscrite avec `prenom@gmail.com` puis connectée avec Google retrouve donc **le même compte**.
- C'est pourquoi **Confirm email** doit rester activé : un compte e-mail non confirmé n'est pas rattaché, ce qui empêche une usurpation.

## Liens à communiquer

| Usage | Adresse |
|---|---|
| Site public | `https://VOTRE-SITE` |
| Connexion | `https://VOTRE-SITE/connexion` |
| Création de compte | `https://VOTRE-SITE/inscription` |
| Administration (privée) | `https://VOTRE-SITE/admin` |

## En cas de problème

| Symptôme | Cause probable | Solution |
|---|---|---|
| « redirect_uri_mismatch » chez Google | adresse de retour non autorisée | étape 2.5 : `https://VOTRE-REF.supabase.co/auth/v1/callback` exactement |
| Retour sur la page de connexion après Google | Redirect URLs Supabase | étape 4.1 |
| Le bouton Google n'apparaît pas | variable absente | `NEXT_PUBLIC_AUTH_GOOGLE=true` sur Vercel, puis Redeploy |
| « Mode démonstration » affiché | variables Supabase absentes | étape 3.3, puis Redeploy |
| Projet Supabase en pause | 7 jours sans activité (offre Free) | bouton **Restore** dans Supabase |
