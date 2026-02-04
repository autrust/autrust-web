# Dépannage - Timeouts Supabase

## Erreur : "Connection terminated due to connection timeout" ou P1008

### Solutions à essayer dans l'ordre :

### 1. Vérifier que le projet Supabase est actif

Les projets gratuits Supabase peuvent être mis en pause après inactivité.

1. Va sur [supabase.com](https://supabase.com)
2. Vérifie que ton projet `tlpppjxnygvanktayulg` est **actif** (pas en pause)
3. Si il est en pause, clique sur "Resume" pour le réactiver

### 2. Vérifier le mot de passe

1. Va dans **Settings** > **Database** > **Database password**
2. Vérifie ou réinitialise le mot de passe
3. Assure-toi que le mot de passe dans `.env` correspond exactement

### 3. Utiliser la connection string depuis Supabase

Pour éviter les problèmes d'encodage :

1. Dans Supabase : **Settings** > **Database** > **Connection string**
2. Sélectionne **URI** (pas "Connection pooling")
3. Copie l'URL complète
4. Remplace `DATABASE_URL` dans `.env` par cette URL
5. Ajoute `&connect_timeout=30&pool_timeout=30` à la fin de l'URL

### 4. Vérifier les migrations

Les tables doivent exister dans Supabase :

```bash
npm run setup:supabase
```

Ou manuellement :
```bash
npx prisma migrate deploy
```

### 5. Tester la connexion directement

```bash
npm run test:db
```

### 6. Vérifier les restrictions réseau

Dans Supabase :
- **Settings** > **Database** > **Network restrictions**
- Assure-toi que ton IP n'est pas bannie
- Si nécessaire, ajoute ton IP aux restrictions

### 7. Vérifier les logs Supabase

Dans Supabase :
- **Logs** > **Postgres Logs**
- Vérifie s'il y a des erreurs de connexion

## Si rien ne fonctionne

1. **Réinitialiser le mot de passe de la base de données** dans Supabase
2. **Mettre à jour `.env`** avec le nouveau mot de passe
3. **Redémarrer complètement** :
   ```bash
   # Arrêter le serveur
   # Supprimer le cache Next.js
   rm -rf .next
   # Régénérer Prisma
   npx prisma generate
   # Relancer
   npm run dev
   ```

## Contact Supabase

Si le problème persiste, vérifie le statut de Supabase : https://status.supabase.com
