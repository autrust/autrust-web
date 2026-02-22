# Guide de Déploiement — AuTrust

Ce guide explique comment mettre votre site AuTrust en ligne.

## ⚡ Résumé : déployer en 5 étapes

1. **Supabase** : crée un projet sur [supabase.com](https://supabase.com) → **Settings** → **Database** → copie l’**URI** (Connection string).
2. **GitHub** : pousse ton code sur un repo GitHub (`git init` puis `git remote add origin ...` puis `git push -u origin main`).
3. **Vercel** : va sur [vercel.com](https://vercel.com) → **Add New Project** → importe le repo GitHub.
4. **Variables d’environnement** (dans Vercel → Settings → Environment Variables) :
   - `DATABASE_URL` = l’URI Supabase (postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres)
   - `APP_URL` = `https://ton-projet.vercel.app` (remplace par l’URL donnée par Vercel)
   - `NEXT_PUBLIC_APP_URL` = même valeur que `APP_URL`
   - `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` si tu utilises Stripe
5. **Deploy** : clique sur **Deploy**. Le build utilise automatiquement PostgreSQL si `DATABASE_URL` est une URL Postgres.

Ensuite : dans Supabase, exécute **une seule fois** `npx prisma db push` en local avec `DATABASE_URL` pointant vers Supabase pour créer les tables.

---

## ✅ Avant de mettre en ligne (checklist)

- [ ] **Variables d'environnement** : `DATABASE_URL`, `APP_URL`, `NEXT_PUBLIC_APP_URL`, `STRIPE_*` (voir ci-dessous).
- [ ] **Mentions légales** : Remplacer les placeholders dans `lib/legal-content.ts` (ou via surcharge) : numéro BCE, TVA, adresse, contact (contact@autrust.eu), hébergeur, date d'entrée en vigueur. Les textes utilisent `[[BE0XXX.XXX.XXX]]`, `[[Adresse complète]]`, etc.
- [ ] **Stripe** : Clés live + webhook configuré sur l’URL de production (`/api/webhooks/stripe` ou `/api/stripe/webhook`).
- [ ] **Photos** : Les uploads vont dans `public/uploads` (fichiers locaux). En production Vercel, le système de fichiers est éphémère — prévoir un stockage persistant (S3, Supabase Storage, etc.) si tu veux conserver les photos après déploiement.
- [ ] **Page Contact** : La page `/contact` existe et envoie les messages vers l’API « signaler un problème » (visible dans l’admin).
- [ ] **Rate limiting** : Déjà actif en mémoire sur login, register, OTP, upload. Pour une grosse charge, envisager Redis (ex. Upstash) comme indiqué dans `SECURITY.md`.
- [ ] **Cloudflare** (recommandé) : Mettre Cloudflare devant autrust.be pour WAF, DDoS, rate limit, Turnstile, firewall et logs. Voir `docs/CLOUDFLARE_SETUP.md`. Env optionnels : `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.

---

## 📋 Prérequis

- Un compte GitHub (pour versionner le code)
- Un compte sur une plateforme de déploiement (Vercel recommandé)
- Une base de données PostgreSQL (Supabase gratuit recommandé)
- Un compte Stripe (pour les paiements)

---

## 🚀 Option 1 : Vercel (Recommandé pour Next.js)

**Avantages** : Gratuit, optimisé pour Next.js, déploiement automatique depuis GitHub

### Étape 1 : Préparer la base de données (Supabase)

1. **Créer un compte Supabase**
   - Va sur [supabase.com](https://supabase.com)
   - Crée un compte gratuit
   - Crée un nouveau projet (choisir une région proche, ex: Europe West)

2. **Récupérer la connection string**
   - Dans ton projet Supabase → **Settings** → **Database**
   - Section **Connection string** → sélectionne **URI**
   - Copie l'URL (ressemble à : `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
   - **Note le mot de passe** (tu ne pourras plus le voir après)

3. **Migrer le schéma Prisma vers PostgreSQL**
   
   **Option A : Utiliser le script automatique** (recommandé)
   ```bash
   # Dans .env, mets temporairement l'URL Supabase pour tester
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   
   # Les dépendances PostgreSQL (@prisma/adapter-pg) sont déjà dans package.json
   
   # Lance le script de préparation
   node scripts/prepare-production.mjs
   
   # Applique le schéma à la base
   npx prisma db push
   ```
   
   **Option B : Modification manuelle**
   - Modifie `prisma/schema.prisma` :
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Les dépendances sont déjà dans le projet (`@prisma/adapter-pg`).
   - Génère le client : `npx prisma generate`
   - Applique le schéma : `npx prisma db push`

### Étape 2 : Dépendances

Les dépendances PostgreSQL (`@prisma/adapter-pg`) sont déjà dans le projet. Un simple `npm install` suffit.

### Étape 3 : Préparer le code pour la production

1. **Créer un fichier `.env.production.example`** (pour référence) :
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   APP_URL="https://ton-domaine.vercel.app"
   NEXT_PUBLIC_APP_URL="https://ton-domaine.vercel.app"
   STRIPE_SECRET_KEY="sk_live_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   NEXTAUTH_SECRET="génère-un-secret-aléatoire"
   NEXTAUTH_URL="https://ton-domaine.vercel.app"
   ```

2. **Le fichier `lib/db.ts` détecte automatiquement** SQLite ou PostgreSQL selon `DATABASE_URL`. Aucune modification nécessaire ! ✅

### Étape 4 : Mettre le code sur GitHub

1. **Initialiser Git** (si pas déjà fait) :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Créer un repo sur GitHub** :
   - Va sur [github.com](https://github.com)
   - Crée un nouveau repository (ex: `autrust-web`)
   - **Ne coche PAS** "Initialize with README"

3. **Pousser le code** :
   ```bash
   git remote add origin https://github.com/TON-USERNAME/autrust-web.git
   git branch -M main
   git push -u origin main
   ```

### Étape 5 : Déployer sur Vercel

1. **Créer un compte Vercel**
   - Va sur [vercel.com](https://vercel.com)
   - Connecte-toi avec GitHub

2. **Importer le projet**
   - Clique sur **"Add New Project"**
   - Sélectionne ton repo GitHub `autrust-web`
   - Vercel détecte automatiquement Next.js

3. **Configurer les variables d'environnement**
   - Dans **Environment Variables**, ajoute :
     - `DATABASE_URL` → URL Supabase
     - `APP_URL` → `https://ton-projet.vercel.app` (Vercel te donne l'URL)
     - `NEXT_PUBLIC_APP_URL` → même valeur que `APP_URL`
     - `STRIPE_SECRET_KEY` → Clé secrète Stripe (mode production)
     - `STRIPE_WEBHOOK_SECRET` → Secret webhook Stripe
     - `NEXTAUTH_SECRET` → Génère avec : `openssl rand -base64 32`
     - `NEXTAUTH_URL` → `https://ton-projet.vercel.app`

4. **Configurer le build**
   - **Build Command** : `npm run build`
   - **Output Directory** : `.next` (par défaut)
   - **Install Command** : `npm install`

5. **Déployer**
   - Clique sur **"Deploy"**
   - Attends 2-3 minutes
   - Ton site est en ligne ! 🎉

### Étape 6 : Configurer Stripe Webhooks

1. **Dans Stripe Dashboard** :
   - Va dans **Developers** → **Webhooks**
   - Clique **"Add endpoint"**
   - URL : `https://ton-projet.vercel.app/api/webhooks/stripe`
   - Événements à écouter : `checkout.session.completed`, `payment_intent.succeeded`
   - Copie le **Signing secret** → ajoute-le dans Vercel comme `STRIPE_WEBHOOK_SECRET`

### Étape 7 : Configurer un domaine personnalisé (optionnel)

1. Dans Vercel → **Settings** → **Domains**
2. Ajoute ton domaine (ex: `autrust.com`)
3. Suis les instructions DNS

---

## 🚀 Option 2 : Railway

**Avantages** : Base de données PostgreSQL incluse, déploiement simple

1. Va sur [railway.app](https://railway.app)
2. Crée un compte avec GitHub
3. **"New Project"** → **"Deploy from GitHub repo"**
4. Sélectionne ton repo
5. Railway détecte Next.js automatiquement
6. Ajoute une **PostgreSQL Database** dans le même projet
7. Configure les variables d'environnement (Railway génère `DATABASE_URL` automatiquement)
8. Déploie !

---

## 🚀 Option 3 : Render

**Avantages** : Gratuit avec limitations, PostgreSQL inclus

1. Va sur [render.com](https://render.com)
2. Crée un compte
3. **"New +"** → **"Web Service"**
4. Connecte GitHub et sélectionne ton repo
5. **"New PostgreSQL"** pour créer la base
6. Configure les variables d'environnement
7. Déploie !

---

## 📝 Checklist Post-Déploiement

- [ ] Site accessible en ligne
- [ ] Base de données connectée (teste une création d'annonce)
- [ ] Stripe fonctionne (teste un paiement en mode test)
- [ ] Webhooks Stripe configurés
- [ ] Variables d'environnement toutes configurées
- [ ] Sitemap accessible : `https://ton-domaine.com/sitemap.xml`
- [ ] Robots.txt accessible : `https://ton-domaine.com/robots.txt`
- [ ] Soumettre le sitemap dans Google Search Console

---

## 🔧 Dépannage

### Erreur "DATABASE_URL is not set"
→ Vérifie que la variable est bien dans Vercel/Railway/Render

### Erreur de build Prisma
→ Assure-toi d'avoir migré vers PostgreSQL (le build le fait automatiquement si DATABASE_URL est une URL Postgres)

### Stripe webhooks ne fonctionnent pas
→ Vérifie que l'URL du webhook est correcte et que `STRIPE_WEBHOOK_SECRET` est bien configuré

### Photos ne s'affichent pas
→ En production, utilise un service de stockage (Supabase Storage, Cloudinary, AWS S3) au lieu de `/public/uploads/`

---

## 💡 Conseils

- **Backups** : Supabase fait des backups automatiques (gratuit)
- **Monitoring** : Utilise Vercel Analytics ou Sentry pour surveiller les erreurs
- **Performance** : Active le CDN Vercel (automatique)
- **SEO** : Soumets le sitemap dans Google Search Console après déploiement

---

Besoin d'aide ? Consulte la [documentation Vercel](https://vercel.com/docs) ou [Supabase](https://supabase.com/docs).
