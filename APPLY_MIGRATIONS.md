# Appliquer les migrations Supabase

## Vérifications avant de commencer

### 1. Vérifier que le projet est actif

Dans Supabase :
1. Va sur ton projet "Autrust"
2. Vérifie qu'il n'est **pas en pause**
3. Si en pause, clique sur **"Resume"** pour le réactiver

### 2. Vérifier la connection string

1. Dans Supabase : **Settings** > **Database**
2. Trouve **Connection string**
3. Sélectionne **URI** (pas "Connection pooling")
4. Copie l'URL complète
5. Elle devrait ressembler à :
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.tlpppjxnygvanktayulg.supabase.co:5432/postgres
   ```

### 3. Mettre à jour `.env`

Remplace `DATABASE_URL` dans `.env` avec l'URL copiée depuis Supabase, puis ajoute les paramètres de timeout :

```env
DATABASE_URL="postgresql://postgres:TON_MOT_DE_PASSE@db.tlpppjxnygvanktayulg.supabase.co:5432/postgres?schema=public&connect_timeout=30&pool_timeout=30"
```

**Important** : Remplace `TON_MOT_DE_PASSE` par ton vrai mot de passe (l'URL depuis Supabase sera déjà encodée).

## Appliquer les migrations

### Option 1 : Script automatique (recommandé)

```bash
npm run setup:supabase
```

### Option 2 : Manuellement

```bash
npx prisma migrate deploy
```

## Si ça ne fonctionne toujours pas

### Vérifier les restrictions réseau

Dans Supabase :
- **Settings** > **Database** > **Network restrictions**
- Assure-toi que ton IP n'est pas bannie
- Si nécessaire, ajoute ton IP aux restrictions

### Vérifier les logs Supabase

Dans Supabase :
- **Logs** > **Postgres Logs**
- Vérifie s'il y a des erreurs de connexion

### Alternative : Utiliser Prisma Studio

Pour tester la connexion sans migrations :

```bash
npx prisma studio
```

Cela ouvrira Prisma Studio dans ton navigateur. Si ça fonctionne, la connexion est bonne mais les migrations doivent être appliquées.

## Après avoir appliqué les migrations

1. **Redémarrer le serveur** :
   ```bash
   npm run dev
   ```

2. **Vérifier que tout fonctionne** sur `http://localhost:3000`
