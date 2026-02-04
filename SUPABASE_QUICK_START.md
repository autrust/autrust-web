# Configuration rapide Supabase

Ton projet Supabase : `tlpppjxnygvanktayulg.supabase.co`

## Étapes pour finaliser la configuration

### 1. Récupérer le mot de passe de la base de données

1. Va sur [supabase.com](https://supabase.com) et connecte-toi
2. Sélectionne ton projet
3. Va dans **Settings** > **Database**
4. Trouve **Database password** (ou clique sur "Reset database password" si tu ne l'as pas)
5. Copie le mot de passe

### 2. Mettre à jour `.env`

Ouvre le fichier `.env` et remplace `[YOUR-PASSWORD]` par ton mot de passe :

```env
DATABASE_URL="postgresql://postgres:TON_MOT_DE_PASSE@db.tlpppjxnygvanktayulg.supabase.co:5432/postgres?schema=public"
```

### 3. Récupérer les clés API (optionnel)

Si tu veux utiliser Supabase Auth ou Storage plus tard :

1. Va dans **Settings** > **API**
2. Copie :
   - **Project URL** : `https://tlpppjxnygvanktayulg.supabase.co`
   - **anon public** key
   - **service_role** key (gardes-la secrète !)

Ajoute-les dans `.env` :
```env
NEXT_PUBLIC_SUPABASE_URL="https://tlpppjxnygvanktayulg.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="ton-anon-key"
SUPABASE_SERVICE_ROLE_KEY="ton-service-role-key"
```

### 4. Installer les dépendances

```bash
npm install
```

### 5. Générer le client Prisma

```bash
npx prisma generate
```

### 6. Appliquer les migrations

**Option simple (recommandé) :**
```bash
npm run setup:supabase
```

Ce script va :
- Tester la connexion
- Vérifier si les tables existent
- Appliquer automatiquement les migrations si nécessaire

**Option manuelle :**
```bash
npx prisma migrate deploy
```

Ou si c'est la première fois :
```bash
npx prisma migrate dev --name init
```

### 7. Vérifier la connexion

```bash
npx prisma studio
```

Cela ouvrira Prisma Studio dans ton navigateur pour voir les données.

## Test de connexion

Une fois configuré, lance le serveur :

```bash
npm run dev
```

Si tout fonctionne, tu devrais pouvoir accéder à l'application sans erreur de connexion à la base de données.

## Notes

- Le fichier `.env` ne doit **jamais** être commité dans Git (il est déjà dans `.gitignore`)
- Garde tes clés API secrètes
- Le mot de passe de la base de données est différent de ton mot de passe Supabase
