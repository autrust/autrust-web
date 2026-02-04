# Guide de Sécurité - AuTrust

Ce document décrit les mesures de sécurité mises en place et les bonnes pratiques à suivre.

## 🔒 Mesures de Sécurité Implémentées

### 1. Authentification & Sessions
- ✅ Mots de passe hashés avec `bcryptjs` (10 rounds)
- ✅ Sessions sécurisées avec tokens aléatoires (32 bytes)
- ✅ Cookies HTTP-only, SameSite=Lax, Secure en production
- ✅ Expiration automatique des sessions (30 jours)
- ✅ Validation de la force des mots de passe

### 2. Protection des Données
- ✅ Prisma ORM (protection contre les injections SQL)
- ✅ Validation des entrées avec Zod
- ✅ Hashage des tokens sensibles (SHA-256)
- ✅ Pas de stockage de mots de passe en clair

### 3. Upload de Fichiers
- ✅ Validation du type MIME
- ✅ Limitation de la taille (10MB max)
- ✅ Limitation du nombre de fichiers (15 max)
- ✅ Noms de fichiers sécurisés (UUID)
- ✅ Stockage séparé pour fichiers sensibles (KYC)

### 4. API & Rate Limiting
- ⚠️ **À IMPLÉMENTER** : Rate limiting sur les endpoints sensibles
- ✅ Validation stricte des entrées
- ✅ Gestion d'erreurs sans exposition de détails

## 🛡️ Mesures à Implémenter

### 1. Rate Limiting (Priorité Haute)

Installer `@upstash/ratelimit` ou utiliser un middleware Next.js :

```bash
npm install @upstash/ratelimit @upstash/redis
```

Protéger les endpoints sensibles :
- `/api/auth/login` : 5 tentatives / 15 min
- `/api/auth/register` : 3 inscriptions / heure
- `/api/auth/phone/send-otp` : 3 envois / heure
- `/api/photos/upload` : 10 uploads / heure

### 2. Headers de Sécurité

Ajouter dans `next.config.ts` :
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

### 3. Protection CSRF

Pour les formulaires critiques (paiements, modifications), ajouter des tokens CSRF.

### 4. Validation Renforcée

- Sanitization HTML pour les descriptions
- Validation stricte des emails
- Validation des numéros de téléphone
- Limitation de la longueur des champs

### 5. Monitoring & Logging

- Logger les tentatives de connexion échouées
- Logger les actions sensibles (modifications, suppressions)
- Alertes pour activités suspectes
- Monitoring avec Sentry ou similaire

### 6. HTTPS Obligatoire

En production, forcer HTTPS via :
- Configuration du serveur (Vercel, etc.)
- Headers HSTS

### 7. Secrets & Variables d'Environnement

- ✅ `.env` dans `.gitignore`
- ⚠️ Ne jamais commiter les secrets
- ⚠️ Utiliser des secrets différents dev/prod
- ⚠️ Rotation régulière des clés API

### 8. Base de Données

- ✅ Prisma ORM (protection SQL injection)
- ⚠️ Backups réguliers (Supabase le fait automatiquement)
- ⚠️ Accès restreint (utiliser connection pooling)
- ⚠️ Chiffrement au repos (Supabase le fait)

### 9. Stripe Webhooks

- ✅ Validation des signatures Stripe
- ⚠️ Vérifier l'idempotence des webhooks
- ⚠️ Logger tous les webhooks reçus

### 10. Protection XSS

- ✅ React échappe automatiquement le contenu
- ⚠️ Attention aux `dangerouslySetInnerHTML` (ne pas utiliser)
- ⚠️ Sanitizer pour les descriptions utilisateur

## 📋 Checklist de Sécurité

### Avant la Mise en Production

- [ ] Rate limiting implémenté
- [ ] Headers de sécurité configurés
- [ ] HTTPS forcé
- [ ] Variables d'environnement sécurisées
- [ ] Secrets différents dev/prod
- [ ] Monitoring configuré
- [ ] Backups testés
- [ ] Tests de sécurité effectués
- [ ] Audit de code effectué
- [ ] Documentation à jour

### Maintenance Continue

- [ ] Mise à jour régulière des dépendances
- [ ] Review des logs d'erreurs
- [ ] Vérification des tentatives d'intrusion
- [ ] Rotation des secrets (tous les 90 jours)
- [ ] Tests de sécurité périodiques
- [ ] Mise à jour de ce document

## 🔍 Outils Recommandés

### Monitoring
- **Sentry** : Gestion d'erreurs et monitoring
- **Vercel Analytics** : Analytics et performance
- **Supabase Logs** : Logs de la base de données

### Tests de Sécurité
- **OWASP ZAP** : Scanner de vulnérabilités
- **npm audit** : Audit des dépendances
- **Snyk** : Détection de vulnérabilités

### Rate Limiting
- **Upstash** : Rate limiting avec Redis
- **Vercel Edge Config** : Rate limiting edge

## 🚨 En Cas d'Incident

1. **Isoler** : Désactiver les fonctionnalités affectées
2. **Analyser** : Examiner les logs et identifier la faille
3. **Corriger** : Appliquer un correctif immédiat
4. **Notifier** : Informer les utilisateurs si nécessaire
5. **Documenter** : Enregistrer l'incident et les mesures prises

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [Stripe Security](https://stripe.com/docs/security)
