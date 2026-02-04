# Démarrer le serveur de développement

## Commande de base

```bash
npm run dev
```

Cela démarre le serveur sur le port **3000** par défaut.

## Si le port 3000 est occupé

### Option 1 : Utiliser un autre port

```bash
PORT=3001 npm run dev
```

### Option 2 : Modifier package.json

Ajoute `-p 3001` dans le script `dev` :

```json
"dev": "next dev -p 3001"
```

## Vérifier que le serveur fonctionne

Une fois démarré, tu devrais voir :
```
▲ Next.js 16.1.6
- Local:        http://localhost:3000
- Ready in XXXms
```

## Si tu vois des erreurs de connexion à la base de données

1. **Vérifie que les migrations sont appliquées** :
   ```bash
   npm run setup:supabase
   ```

2. **Vérifie que le projet Supabase est actif** (pas en pause)

3. **Vérifie le mot de passe dans `.env`**

## Redémarrer proprement

Si tu as des problèmes :

```bash
# Arrêter le serveur (Ctrl+C)
# Nettoyer le cache
rm -rf .next
# Relancer
npm run dev
```
