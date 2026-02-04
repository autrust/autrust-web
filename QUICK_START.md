# Démarrage rapide - AuTrust

## 1. S'assurer d'être dans le bon répertoire

```bash
cd /Users/candel.s/autrust-web
```

Vérifie que tu es bien dans le répertoire du projet :
```bash
pwd
# Devrait afficher : /Users/candel.s/autrust-web

ls package.json
# Devrait afficher : package.json
```

## 2. Installer les dépendances (si nécessaire)

```bash
npm install
```

## 3. Configurer Supabase

Assure-toi que `.env` contient la bonne `DATABASE_URL` avec ton mot de passe Supabase.

## 4. Appliquer les migrations

```bash
npm run setup:supabase
```

## 5. Démarrer le serveur

```bash
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:3000`

## Si tu as des erreurs

### Erreur "permission denied"
```bash
chmod -R u+w /Users/candel.s/autrust-web
```

### Erreur "package.json not found"
Assure-toi d'être dans le bon répertoire :
```bash
cd /Users/candel.s/autrust-web
pwd  # Vérifie que c'est bien le bon chemin
```

### Erreur de connexion à la base de données
1. Vérifie que le projet Supabase est actif (pas en pause)
2. Vérifie le mot de passe dans `.env`
3. Lance `npm run setup:supabase` pour appliquer les migrations
