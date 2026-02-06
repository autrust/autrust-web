# Déploiement — 3 choses à faire (très simple)

Fais **dans l’ordre**. Pas besoin de tout comprendre, suis juste les numéros.

---

## 1. Créer la base de données (Supabase)

1. Ouvre : **https://supabase.com**
2. Connecte-toi ou crée un compte (gratuit).
3. Clique sur **"New project"** (bouton vert).
4. Remplis :
   - **Name** : `autrust` (ou ce que tu veux)
   - **Database Password** : invente un mot de passe et **note-le**
   - **Region** : Europe West (ou proche de toi)
5. Clique sur **"Create new project"** et attends 1–2 minutes.
6. Dans le menu à gauche, clique sur l’**icône engrenage** (Settings).
7. Clique sur **"Database"** dans le menu.
8. Descends jusqu’à **"Connection string"**. Clique sur l’onglet **"URI"**.
9. Tu vois une ligne qui commence par `postgresql://postgres...`  
   Clique sur **"Copy"** (ou sélectionne tout et copie).
10. Ouvre le fichier **`.env`** dans ton projet (dans Cursor, dans le dossier racine).
11. **Remplace** la ligne `DATABASE_URL="file:./dev.db"` par :
    ```env
    DATABASE_URL="postgresql://postgres:TON_MOT_DE_PASSE@db.XXXXX.supabase.co:5432/postgres"
    ```
    Colle à la place l’URL que tu as copiée, et remplace `[YOUR-PASSWORD]` (ou la partie mot de passe) par le mot de passe que tu as noté à l’étape 4. Sauvegarde le fichier.

---

## 2. Créer les tables dans la base (une commande)

Dans le **terminal** (Cursor : Terminal → New Terminal), tape exactement :

```bash
cd /Users/candel.s/autrust-web && node scripts/prepare-production.mjs && npx prisma db push
```

Tu dois voir des lignes qui défilent puis un message du type « Your database is now in sync ». Si une erreur s’affiche, copie-la et envoie-la-moi.

---

## 3. Donner l’URL de la base à Vercel

1. Ouvre **https://vercel.com** et va sur ton projet (autrust-web ou le nom que tu as choisi).
2. En haut de la page, tu vois plusieurs onglets : **Overview**, **Deployments**, **Analytics**, **Settings**…  
   Clique sur **Settings**.
3. Dans la liste à **gauche**, clique sur **Environment Variables**.
4. Tu dois ajouter **3 variables**. Pour chacune :
   - Clique sur **"Add New"** (ou **"Add"**).
   - Dans **Key** (ou Name), tape exactement le nom (voir ci-dessoux).
   - Dans **Value**, colle la valeur.
   - Clique sur **Save**.

**Variable 1**

- **Key** : `DATABASE_URL`
- **Value** : la **même** URL que tu as mise dans ton `.env` à l’étape 1 (celle qui commence par `postgresql://...`).

**Variable 2**

- **Key** : `APP_URL`
- **Value** : l’URL de ton site sur Vercel. Tu la trouves sur la page **Overview** du projet (en haut, quelque chose comme `https://autrust-web-xxx.vercel.app`). Copie-colle cette URL.

**Variable 3**

- **Key** : `NEXT_PUBLIC_APP_URL`
- **Value** : **exactement la même** que pour `APP_URL`.

5. Une fois les 3 variables enregistrées : va dans l’onglet **Deployments**, clique sur les **trois petits points** à droite du dernier déploiement, puis **Redeploy**.

---

## C’est tout

Quand le redeploy est terminé, ouvre l’URL de ton site (Overview). Le site devrait s’afficher. Si une page d’erreur s’affiche, dis-moi ce que tu vois (ou envoie une capture).
