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
- ✅ Rate limiting (middleware) : login (5/15 min), register (3/h), OTP (3/h), photos (10/h), listings (15/h), contact (5/15 min), checkouts (10–30/h)
- ✅ POST JSON-only : Content-Type `application/json` requis sur login, register, problem-report, plans/change (réduit la surface CSRF)
- ✅ Validation stricte des entrées (Zod)
- ✅ Gestion d'erreurs sans exposition de détails

## 🛡️ Mesures à Implémenter

### 1. Rate Limiting (Priorité Moyenne — déjà en place en mémoire)

En production à forte charge, remplacer le rate limiting en mémoire par **Upstash Redis** :

```bash
npm install @upstash/ratelimit @upstash/redis
```

Déjà protégé en mémoire : login, register, OTP, photos, listings, problem-report, deposits/sponsor/plans/reports checkout.

### 2. Headers de Sécurité

- ✅ **Déjà en place** (middleware) : CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS en production
- Optionnel : doublon dans `next.config.ts` si besoin

### 3. Protection CSRF

Pour les formulaires critiques (paiements, modifications), ajouter des tokens CSRF.

### 4. Validation Renforcée

- ✅ Sanitization HTML (lib/sanitize.ts, sanitize-html) : descriptions, titre, contact, message contact, etc. — aucun tag autorisé
- ✅ Redirections auth : `isSafeRedirectPath()` pour éviter les open redirects (paramètre `?next=`)
- Validation stricte des emails et numéros de téléphone (Zod)
- Limitation de la longueur des champs (Zod)

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
- ✅ Sanitization côté serveur (sanitizeText) pour annonces et formulaire contact
- ⚠️ Ne pas utiliser `dangerouslySetInnerHTML` avec du contenu utilisateur

## AppSec — Checklist des 10 règles (référence)

| # | Règle | Statut | Notes |
|---|--------|--------|-------|
| 1 | Zéro secret dans le repo | ✅ | .env + Vercel ; pas de Supabase client (Prisma seul) |
| 2 | Accès données / RLS | ⚠️ | Contrôle app (requireUser, ownership) ; RLS Postgres à ajouter si BDD Supabase |
| 3 | Validation serveur (Zod) | ✅ | Entrées API validées ; sanitization annonces/contact |
| 4 | Auth (verif email, rate limit, re-auth) | ✅/⚠️ | Email/phone verif pour actions sensibles ; rate limit ; re-auth manquante pour IBAN/suppression |
| 5 | Upload (privé, signé, limites) | ✅/⚠️ | MIME/taille/nombre/UUID ; stockage local (public/uploads) — pas de buckets privés |
| 6 | XSS/CSRF, cookies | ✅ | Pas dangerouslySetInnerHTML ; sanitize ; cookies sécurisés |
| 7 | Headers (CSP, HSTS, etc.) | ✅ | Middleware |
| 8 | Logging/Audit | ❌ | À mettre en place (admin, paiement, annonce, IBAN) |
| 9 | Anti-abus (rate limit + bot) | ✅ | Rate limit + Turnstile (login, signup, contact, signalement) si clés configurées |
| 10 | Paiements (Stripe, webhooks signés) | ✅ | Stripe uniquement ; signatures vérifiées |

### Avant la Mise en Production

- [x] Rate limiting implémenté (middleware)
- [x] Headers de sécurité configurés (middleware)
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
