# Configuration Supabase pour AuTrust

Ce guide explique comment migrer le projet vers Supabase (PostgreSQL).

## 1. Créer un projet Supabase

1. Va sur [supabase.com](https://supabase.com) et crée un compte
2. Crée un nouveau projet
3. Note le mot de passe de la base de données (tu en auras besoin)

## 2. Récupérer la connection string

1. Dans ton projet Supabase, va dans **Settings** > **Database**
2. Trouve la section **Connection string**
3. Sélectionne **URI** (pas "Connection pooling")
4. Copie l'URL qui ressemble à :
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## 3. Configurer les variables d'environnement

1. Copie `.env.example` vers `.env` si ce n'est pas déjà fait :
   ```bash
   cp .env.example .env
   ```

2. Remplace `DATABASE_URL` dans `.env` avec l'URL de Supabase :
   ```env
   DATABASE_URL="postgresql://postgres:TON_MOT_DE_PASSE@db.xxxxx.supabase.co:5432/postgres?schema=public"
   ```

## 4. Installer les dépendances

```bash
npm install
```

## 5. Générer le client Prisma

```bash
npx prisma generate
```

## 6. Appliquer les migrations

```bash
npx prisma migrate deploy
```

Ou pour créer une nouvelle migration depuis zéro :
```bash
npx prisma migrate dev --name init
```

## 7. (Optionnel) Vérifier la connexion

```bash
npx prisma studio
```

Cela ouvrira Prisma Studio dans ton navigateur pour voir les données.

## Notes importantes

- **Migration des données** : Si tu as déjà des données dans SQLite, tu devras les exporter et les importer dans Supabase
- **Stripe** : Les webhooks Stripe doivent pointer vers ton URL de production (pas localhost)
- **Stockage de fichiers** : Tu peux utiliser Supabase Storage pour les photos d'annonces au lieu du système de fichiers local

## Utilisation de Supabase Storage (optionnel)

Si tu veux utiliser Supabase Storage pour les photos :

1. Active Storage dans ton projet Supabase
2. Crée un bucket `listing-photos`
3. Configure les variables dans `.env` :
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="ton-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="ton-service-role-key"
   ```

## Support

Pour plus d'infos sur Supabase : https://supabase.com/docs
