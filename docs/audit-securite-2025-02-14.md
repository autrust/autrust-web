# Mini-audit sécurité — 2025-02-14

## 1. Endpoints sans validation Zod (ou validation faible)

| Endpoint | Méthode | Statut avant | Action |
|----------|---------|--------------|--------|
| `/api/chat` | POST | Pas de Zod, message sans limite longueur | ✅ **Patch** : `ChatBodySchema` (message 1–2000 car.) |
| `/api/listings/by-ids` | GET | `ids` en query, pas de schéma (risque injection / IDs invalides) | ✅ **Patch** : `IdsQuerySchema` (CUID, max 10, max 500 car. query) |
| `/api/locale` | POST | Enum manuel (fr/en/nl/de) | ⚠️ Acceptable (4 valeurs) ; Zod optionnel |
| `/api/auth/verify-email` | GET | `token` en query, non validé par Zod | À faire : schéma `token` (longueur/format) |
| `/api/ratings` | GET | `userId` en query, non validé | À faire : Zod sur query params |
| `/api/saved-searches` | DELETE / PATCH | `id` en query, non validé | À faire : Zod (cuid) |

## 2. Appels Supabase / RLS

- **Aucun client Supabase** dans le repo : accès BDD via **Prisma** uniquement.
- RLS : non applicable côté client. Si BDD prod = Supabase Postgres, ajouter des policies RLS en SQL (défense en profondeur) ; à ce jour contrôle d’accès côté app (requireUser, ownership).

## 3. Secrets commités

- **FIX_CONNECTION.md** : contenait un exemple d’URL avec mot de passe (ex. encodé).  
  ✅ **Patch** : exemple remplacé par placeholder `TON_MOT_DE_PASSE_ENCODE` et `TON_PROJECT_REF`, avec rappel de ne jamais commiter d’URL réelle.
- **.gitignore** : `.env*` présent ; pas d’autre fichier contenant de clé en dur repérée.

## 4. Headers de sécurité et CSP

- **Middleware** : CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS (prod) appliqués.
- **next.config.ts** : X-DNS-Prefetch-Control, X-XSS-Protection.
- Aucun relâchement détecté.

## 5. Améliorations appliquées ce jour (patches)

1. **FIX_CONNECTION.md** : suppression de l’exemple avec mot de passe réel ; placeholders + avertissement.
2. **/api/chat** : validation Zod `ChatBodySchema` (message 1–2000 caractères).
3. **/api/listings/by-ids** : validation Zod `IdsQuerySchema` (liste de CUIDs, max 10, query max 500 car.).

## 6. Recommandations pour les prochains jours

- Ajouter Zod sur `auth/verify-email` (paramètre `token`) et sur `ratings` GET / `saved-searches` DELETE-PATCH (query params).
- Envisager rate limit sur `/api/chat` (anti-abus coût OpenAI).

---

**Note de risque : moyen**  
Raison : un secret potentiel dans la doc (corrigé) ; deux endpoints sans validation stricte (corrigés). Il reste des query params non validés par Zod sur quelques routes (verify-email, ratings, saved-searches) et pas de rate limit sur le chat — d’où une note “moyen” et non “faible”.
