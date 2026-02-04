# Correction des Timeouts Supabase

Les erreurs de timeout (P1008) indiquent que les tables n'existent pas encore dans Supabase.

## Solution : Appliquer les migrations

### 1. Vérifier la connexion

```bash
npm run test:db
```

### 2. Appliquer les migrations à Supabase

**Option A : Si c'est la première fois (recommandé)**
```bash
npx prisma migrate deploy
```

**Option B : Si tu veux créer une nouvelle migration**
```bash
npx prisma migrate dev --name init
```

### 3. Vérifier que les tables existent

```bash
npx prisma studio
```

Cela ouvrira Prisma Studio et tu devrais voir toutes les tables.

## Si les migrations échouent

### Vérifier le mot de passe

Le mot de passe dans `.env` doit être correctement encodé. Si ton mot de passe est `[Stephanedu4430-]`, l'URL devrait être :

```env
DATABASE_URL="postgresql://postgres:%5BStephanedu4430-%5D@db.tlpppjxnygvanktayulg.supabase.co:5432/postgres?schema=public"
```

### Vérifier la connection string dans Supabase

1. Va sur [supabase.com](https://supabase.com)
2. Sélectionne ton projet
3. Settings > Database > Connection string
4. Sélectionne **URI** (pas "Connection pooling")
5. Copie l'URL complète

### Alternative : Utiliser la connection string directe

Si l'encodage pose problème, utilise la connection string directement depuis Supabase (elle sera déjà encodée).

## Après avoir appliqué les migrations

1. Redémarre le serveur : `npm run dev`
2. Vérifie que le site fonctionne sur `http://localhost:3000`
