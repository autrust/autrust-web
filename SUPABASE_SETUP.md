# Configuration Supabase — Guide complet

Ce guide te permet de configurer Supabase depuis le début pour ton projet Autrust.

---

## Étape 1 : Créer un projet Supabase

1. Va sur **https://supabase.com** et connecte-toi (ou crée un compte gratuit)
2. Clique sur **"New project"** (ou "Nouveau projet")
3. Remplis le formulaire :
   - **Name** : `autrust` (ou le nom que tu veux)
   - **Database Password** : choisis un mot de passe fort (⚠️ **GARDE-LE EN SÉCURITÉ**, tu en auras besoin)
   - **Region** : choisis **Europe West** (ou la région la plus proche de toi)
   - Clique sur **"Create new project"**

4. ⏳ Attends 2-3 minutes que Supabase crée ton projet (tu verras un message de progression)

---

## Étape 2 : Récupérer l'URL de connexion PostgreSQL

Une fois le projet créé :

1. Dans le menu de gauche, clique sur **"Settings"** (icône ⚙️)
2. Clique sur **"Database"** dans le menu Settings
3. Descends jusqu'à la section **"Connection string"**
4. Clique sur l'onglet **"URI"**
5. Tu verras une URL qui ressemble à :
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
6. **Remplace `[YOUR-PASSWORD]`** par le mot de passe que tu as choisi à l'étape 1
7. **Copie cette URL complète** (avec le mot de passe remplacé)

---

## Étape 3 : Configurer le fichier `.env` local

1. Ouvre le fichier `.env` à la racine du projet
2. Remplace le contenu par :

```env
# PostgreSQL (Supabase) - Production
DATABASE_URL="postgresql://postgres.xxxxx:TON_MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# URL de l'application
APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

⚠️ **Remplace** `postgresql://postgres.xxxxx:TON_MOT_DE_PASSE@...` par l'URL que tu as copiée à l'étape 2.

---

## Étape 4 : Préparer le schéma Prisma pour PostgreSQL

Dans le terminal, à la racine du projet :

```bash
cd /Users/candel.s/autrust-web
node scripts/prepare-production.mjs
```

Tu devrais voir :
```
✅ DATABASE_URL pointe vers PostgreSQL
📝 Mise à jour de schema.prisma pour PostgreSQL...
✅ schema.prisma mis à jour
✅ Schema prêt pour PostgreSQL.
```

---

## Étape 5 : Générer le client Prisma

```bash
npx prisma generate
```

Cette commande génère le client Prisma adapté à PostgreSQL.

---

## Étape 6 : Créer les tables dans Supabase

```bash
npx prisma db push
```

Cette commande va :
- Se connecter à ta base Supabase
- Créer toutes les tables nécessaires (User, Listing, Photo, etc.)
- Configurer les relations entre les tables

Tu devrais voir un message de succès comme :
```
✅ Database synchronized successfully
```

---

## Étape 7 : Vérifier que tout fonctionne

1. Retourne sur Supabase dans ton navigateur
2. Dans le menu de gauche, clique sur **"Table Editor"**
3. Tu devrais voir toutes les tables créées : `User`, `Listing`, `ListingPhoto`, `Favorite`, etc.

✅ **Si tu vois les tables, c'est que tout fonctionne !**

---

## Étape 8 : Revenir au développement local (optionnel)

Si tu veux continuer à développer en local avec SQLite, tu peux remettre dans ton `.env` :

```env
# SQLite (développement local)
DATABASE_URL="file:./dev.db"

APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Et relancer :
```bash
node scripts/prepare-production.mjs
npx prisma generate
```

---

## Pour déployer sur Vercel

Quand tu seras prêt à déployer :

1. Va sur **Vercel** → ton projet → **Settings** → **Environment Variables**
2. Ajoute ces variables :
   - `DATABASE_URL` = l'URL Supabase complète (avec mot de passe)
   - `APP_URL` = l'URL de ton site Vercel (ex: `https://autrust-web.vercel.app`)
   - `NEXT_PUBLIC_APP_URL` = la même que `APP_URL`
3. Relance un déploiement

---

## Problèmes courants

### ❌ "DATABASE_URL n'est pas défini"
→ Vérifie que ton fichier `.env` existe et contient `DATABASE_URL=...`

### ❌ "Connection refused" ou "timeout"
→ Vérifie que l'URL PostgreSQL est correcte (avec le mot de passe remplacé)
→ Vérifie que ton projet Supabase est bien actif

### ❌ "Schema validation error"
→ Assure-toi d'avoir exécuté `node scripts/prepare-production.mjs` avant `npx prisma generate`

### ❌ "Table already exists"
→ C'est normal si tu as déjà créé les tables. Tu peux ignorer ou utiliser `npx prisma migrate reset` pour tout réinitialiser (⚠️ ça supprime toutes les données)

---

## Besoin d'aide ?

Si tu bloques, vérifie :
1. ✅ Le projet Supabase est créé et actif
2. ✅ L'URL PostgreSQL contient bien le mot de passe (pas `[YOUR-PASSWORD]`)
3. ✅ Le fichier `.env` est bien à la racine du projet
4. ✅ Tu as bien exécuté toutes les commandes dans l'ordre
