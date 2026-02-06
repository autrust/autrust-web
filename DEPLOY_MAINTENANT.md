# Déployer maintenant — 3 étapes

Le dépôt Git est initialisé et le premier commit est fait. Il reste **3 actions** à faire de ton côté (comptes + 2 commandes).

---

## Où tu en es (en bref)

1. **Supabase** = ta base de données en ligne. Tu crées un projet, tu copies une longue URL (postgresql://...). Tu en auras besoin pour que le site affiche les annonces.
2. **GitHub** = ton code est déjà poussé (autrust/autrust-web). ✅
3. **Vercel** = l’hébergeur du site. Tu as créé un projet et un déploiement a démarré. Pour que le site fonctionne, il faut encore :
   - **Donner à Vercel l’URL de la base** (Supabase) : c’est les « variables d’environnement ».
   - **Créer les tables** dans Supabase une fois : une commande en local (`npx prisma db push`).

**Si tu n’as pas encore de projet Supabase** : fais d’abord l’étape 1 ci‑dessous, puis reviens sur Vercel pour ajouter l’URL.

---

## 1. Créer la base de données (Supabase)

1. Va sur **https://supabase.com** et connecte-toi (ou crée un compte).
2. Clique sur **New project**.
3. Choisis un nom (ex. `autrust`), un mot de passe pour la base, une région (ex. Europe West) → **Create new project**.
4. Quand le projet est prêt : **Settings** (icône engrenage) → **Database**.
5. Dans **Connection string**, sélectionne **URI** et copie l’URL (elle ressemble à `postgresql://postgres.xxxx:TON_MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`).
6. **Garde cette URL** pour l’étape 3 (Vercel).

---

## 2. Créer le repo GitHub et pousser le code

1. Va sur **https://github.com/new**.
2. Nom du repo : par ex. `autrust-web`.
3. Ne coche pas "Add a README" → **Create repository**.
4. Sur la page du repo, copie l’URL du repo (ex. `https://github.com/TON-USERNAME/autrust-web.git`).
5. Dans le terminal, à la racine du projet :

```bash
cd /Users/candel.s/autrust-web
git remote add origin https://github.com/TON-USERNAME/autrust-web.git
git push -u origin main
```

(Remplace `TON-USERNAME/autrust-web` par ton vrai repo.)

**Si Git demande un mot de passe** : utilise un **Personal Access Token**, pas ton mot de passe GitHub.

- Créer un jeton : [GitHub → Settings → Tokens](https://github.com/settings/tokens) → **Generate new token (classic)**.
- **Remonte tout en haut** de la page des permissions : coche **« repo »**. Remplis **Note**, puis **Generate token**. Copie le jeton.
- **Où coller le jeton** : dans le **terminal**, après avoir lancé `git push -u origin main`. Git affiche par ex. `Password for 'https://github.com':` → clique dans le terminal, colle le jeton (Cmd+V), puis Entrée. **Rien ne s’affiche quand tu colles** (c’est normal), ça envoie quand même.

---

## 3. Déployer sur Vercel

1. Va sur **https://vercel.com** et connecte-toi (avec GitHub si tu veux).
2. Clique sur **Add New...** → **Project**.
3. Si Vercel demande un fournisseur Git : clique sur « Portée De Git » / « Sélectionnez la portée de Git », puis autorise Vercel sur GitHub (bouton **Install** sur la page GitHub). Tu reviens sur Vercel après.
4. Importe le repo **autrust-web** (ou le nom que tu as choisi).
5. **Variables d’environnement** = tu donnes à Vercel quelques infos (comme l’URL de la base de données).  
   - Sur la page du projet Vercel, clique sur **Settings** (en haut), puis dans le menu de gauche sur **Environment Variables**.
   - Clique sur **Add** (ou « Add New ») et ajoute **une par une** :
     - **Name** : `DATABASE_URL` → **Value** : colle l’URL Supabase (postgresql://...).
     - **Name** : `APP_URL` → **Value** : l’URL de ton site (ex. `https://autrust-web-xxx.vercel.app` — tu la vois sur la page d’accueil du projet Vercel).
     - **Name** : `NEXT_PUBLIC_APP_URL` → **Value** : la même que `APP_URL`.
   - Sauvegarde chaque variable (bouton **Save**).
6. **Relancer un déploiement** pour que Vercel prenne en compte ces variables : va dans l’onglet **Deployments**, clique sur les **trois points ⋮** à droite du dernier déploiement, puis **Redeploy**.

---

## 4. Créer les tables dans Supabase (une seule fois)

Une fois le premier déploiement réussi, il faut créer les tables dans la base Supabase.

Dans ton `.env` local, mets **temporairement** l’URI Supabase :

```env
DATABASE_URL="postgresql://postgres.xxx:TON_MOT_DE_PASSE@..."
```

Puis dans le terminal :

```bash
cd /Users/candel.s/autrust-web
node scripts/prepare-production.mjs
npx prisma db push
```

Remets ensuite ton `.env` pour le dev local (SQLite) si tu veux :

```env
DATABASE_URL="file:./dev.db"
APP_URL="http://localhost:3000"
```

---

## C’est tout

Ton site sera en ligne à l’URL Vercel. Pour Stripe (paiements), ajoute plus tard `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` dans les variables d’environnement Vercel.
