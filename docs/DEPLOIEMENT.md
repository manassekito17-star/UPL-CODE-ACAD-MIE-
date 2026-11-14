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
3. **Créer les tables et les cours (sans rien installer sur votre ordinateur)**. Pour chaque fichier ci-dessous, **dans l'ordre** :
   1. ouvrez le lien (texte brut) → **Ctrl + A** → **Ctrl + C** ;
   2. Supabase → **SQL Editor** (icône `>_`) → **New query** → **Ctrl + V** → **Run** → « Success. No rows returned ».

   | Ordre | Fichier |
   |---|---|
   | 1 | `supabase/installation/1-structure.sql` (tables, sécurité) |
   | 2 à 11 | `supabase/installation/2-contenu-01.sql` … `2-contenu-10.sql` (cours, exercices, quiz) |

   Liens en texte brut : `https://raw.githubusercontent.com/manassekito17-star/UPL-CODE-ACAD-MIE-/main/supabase/installation/1-structure.sql`, puis `https://raw.githubusercontent.com/manassekito17-star/UPL-CODE-ACAD-MIE-/main/supabase/installation/2-contenu-01.sql`, etc. (remplacez `main` par le nom de la branche si elle n'a pas encore été fusionnée).

   Le fichier `1-structure.sql` accorde aussi les droits d'accès de l'API aux tables. Les projets Supabase récents ne les donnent plus automatiquement ; sans eux, le catalogue reste vide (« permission denied for table courses »).

   Le contenu est découpé en 10 morceaux car un envoi trop gros échoue avec « Failed to fetch ». Un morceau qui échoue peut être **relancé sans risque**. Contrôle final : **Table Editor** → table `courses` = 7 lignes.

   *Variante en ligne de commande, si Node.js est installé :* `npx supabase login`, `npx supabase link --project-ref VOTRE-REF`, puis `npx supabase db push --include-seed`. N'utilisez pas les deux méthodes sur le même projet.
4. **Récupérer les clés** : **Project Settings → API Keys** (onglet **Legacy API Keys**). Copiez chaque clé avec le **bouton Copy 📋**, jamais en sélectionnant le texte : l'écran n'en montre que le début, suivi de « … ». Notez trois choses :
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
4. Rubrique **Branding** :
   - **App domain** : page d'accueil `https://VOTRE-SITE`, confidentialité `https://VOTRE-SITE/confidentialite`, conditions `https://VOTRE-SITE/conditions` ;
   - **Authorized domains** : `VOTRE-SITE` et `VOTRE-REF.supabase.co` ;
   - pas de logo : il déclencherait une vérification de plusieurs semaines.

   Rubrique **Audience** → **Publish app** (« In production »). Les autorisations utilisées (nom, e-mail, photo) ne demandent pas de vérification par Google. Vérifiez toujours, en haut de la console, que le bon projet est sélectionné.
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

   **Type** : choisissez **Config** pour toutes les variables `NEXT_PUBLIC_…`, qui sont publiques par nature, et **Sensitive** uniquement pour `SUPABASE_SERVICE_ROLE_KEY`. Une variable enregistrée en « Sensitive » ne peut plus être changée en « Config » : il faut la supprimer, puis la recréer.
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

## Connexion obligatoire

Toute la plateforme demande un compte, Google (Gmail) ou e-mail et mot de passe. Les cours, les exercices, UPL IDE, l'éditeur, le laboratoire et le professeur IA mènent à la page de connexion, puis reviennent à la page demandée.

Restent publics :
- l'accueil ;
- la connexion, l'inscription et le mot de passe oublié ;
- les pages Confidentialité et Conditions (exigées par Google) ;
- la vérification des certificats ;
- les fichiers techniques (manifeste, service worker, icônes).

La liste se trouve dans `src/lib/supabase/proxy.ts` (`PUBLIC_PATHS`). Une fois installé et préparé, UPL IDE s'ouvre aussi sans Internet, avec la copie gardée sur l'appareil.

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

Commencez par ouvrir `https://VOTRE-SITE/api/sante`. Cette page indique, sans jamais afficher les clés :
- si l'URL et les clés sont bien saisies (type, espaces, « … ») ;
- si elles appartiennent au même projet ;
- le message exact de Supabase lors de la lecture du catalogue.

Une modification de variable dans Vercel ne s'applique qu'après un **Redeploy**.

| Symptôme | Cause probable | Solution |
|---|---|---|
| « redirect_uri_mismatch » chez Google | adresse de retour non autorisée | étape 2.5 : `https://VOTRE-REF.supabase.co/auth/v1/callback` exactement |
| Retour sur la page de connexion après Google | Redirect URLs Supabase | étape 4.1 |
| Le bouton Google n'apparaît pas | variable absente | `NEXT_PUBLIC_AUTH_GOOGLE=true` sur Vercel, puis Redeploy |
| « Mode démonstration » affiché | variables Supabase absentes | étape 3.3, puis Redeploy |
| Catalogue vide, `/api/sante` : « permission denied for table courses » (42501) | droits d'accès de l'API absents (projets récents) | lancer `supabase/migrations/20261110000001_droits_acces_api.sql` dans le SQL Editor |
| `/api/sante` : clé « illisible » ou « espace à l'intérieur » | clé copiée raccourcie (« … ») | recopier avec le bouton Copy 📋, recréer la variable, Redeploy |
| Supabase : « Invalid characters » dans Client IDs | `/` ou espace en trop | la valeur se termine exactement par `.apps.googleusercontent.com` |
| Google : « Publish app » grisé | Branding incomplet | étape 2.4 (pages et domaines autorisés) |
| Projet Supabase en pause | 7 jours sans activité (offre Free) | bouton **Restore** dans Supabase |

## Accès rapide sans mot de passe (profil Nom / Prénom / Poste / Sexe / Filière)

L'accès rapide utilise les **connexions anonymes de Supabase Auth** : chaque profil est un vrai utilisateur (identifiant interne unique, session sécurisée par cookies, rôle « etudiant » imposé par la base). À activer une fois :

1. **Supabase → SQL Editor** : exécuter `supabase/migrations/20261114000001_acces_rapide.sql` (relançable sans risque).
2. **Supabase → Authentication → Sign In / Providers** : activer **« Allow anonymous sign-ins »**.
3. Même page : activer **« Allow manual linking »** (bouton « Lier mon profil à Google » de la page Mon profil).

Limites, affichées aux utilisateurs : le profil n'est pas vérifié (nom et prénom ne prouvent pas l'identité) ; il est gardé sur l'appareil (session fermée après 30 jours sans visite ou à la déconnexion) ; pour le retrouver sur un autre appareil, il faut le lier à Google ou à une adresse e-mail. Le poste « Enseignant » déclaré ne donne aucun droit : les rôles restent attribués par un administrateur. Limite : 10 accès rapides par heure et par adresse IP (plus la limite propre à Supabase).

## Message d'accueil et avis des utilisateurs (5 étoiles)

À l'ouverture de la plateforme, chaque utilisateur connecté voit une fois la fenêtre « Message de l'administration » : la dernière annonce publiée (**Administration → Annonces**) ou, à défaut, le message de bienvenue. La note sur 5 étoiles (avec commentaire facultatif, un avis par utilisateur, modifiable) n'est proposée qu'aux comptes créés depuis au moins 7 jours : sous le message pour les comptes plus anciens, ou dans une fenêtre « Votre avis compte » quand un nouveau compte atteint 7 jours d'utilisation. Les avis se lisent dans **Administration → Avis des utilisateurs** (administrateurs uniquement).

À activer une fois : **Supabase → SQL Editor** : exécuter `supabase/migrations/20261115000001_avis.sql` (relançable sans risque). Tant que ce script n'est pas exécuté, le message s'affiche normalement et l'envoi d'un avis indique « Les avis ne sont pas encore activés ».
