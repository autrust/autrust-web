# Cloudflare devant autrust.be (recommandé)

Mettre **Cloudflare** en frontal du domaine `autrust.be` apporte WAF, DDoS, rate limiting, bot protection (Turnstile), firewall et logs. Ce guide décrit la configuration à faire dans le dashboard Cloudflare (et ce qui est déjà préparé dans le code).

---

## 1. Ajouter le domaine

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a site** → `autrust.be`.
2. Choisir le plan (Free suffit pour WAF basique + DDoS + rate limiting).
3. Cloudflare affiche des **nameservers** (ex. `xxx.ns.cloudflare.com`). Les configurer chez le registrar du domaine (où tu as acheté autrust.be) pour remplacer les NS actuels par ceux de Cloudflare.
4. Une fois la résolution propagée, Cloudflare **proxy** le trafic (icône orange « Proxied ») : requêtes → Cloudflare → ton origine (ex. Vercel).

---

## 2. WAF (Web Application Firewall)

- **Security** → **WAF** → **Custom rules** (ou **Managed rules** selon le plan).
- Activer au minimum :
  - **OWASP Core Ruleset** (si disponible) pour SQLi, XSS, patterns d’attaque connus.
  - **Cloudflare Managed Ruleset** (par défaut souvent activé).
- En **Custom rules** tu peux ajouter :
  - Bloquer si `http.request.uri.path` contient des patterns suspects (ex. `../`, `union select`, `<script`).
  - Exemple : `(http.request.uri.path contains "union") or (http.request.uri.query contains "<script")` → Action **Block**.

---

## 3. DDoS protection

- **Security** → **DDoS** : la protection L3/L4 et HTTP DDoS est **automatique** une fois le trafic proxyé.
- Vérifier que **HTTP DDoS Attack Protection** est activé (souvent par défaut).
- Aucune config obligatoire supplémentaire pour le niveau de base.

---

## 4. Rate limiting (IP / pays / URI)

- **Security** → **WAF** → **Rate limiting rules** (ou **Rate rules**).
- Exemples utiles :
  - **Login** : par IP, max 10 requêtes / 1 min sur `*autrust.be/api/auth/login` → Block 1 min.
  - **Register** : par IP, max 5 / 5 min sur `*autrust.be/api/auth/register` → Block 5 min.
  - **Contact** : par IP, max 5 / 10 min sur `*autrust.be/api/problem-report` → Block 10 min.
  - **API générale** : par IP, max 200 req / 1 min sur `*autrust.be/api/*` → Block 1 min (ajuster selon ton trafic).
- Tu peux combiner avec **Country** : ex. même règle mais seulement pour certains pays si tu veux durcir.

---

## 5. Bot protection (Turnstile)

- **Turnstile** : [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** → **Add widget**.
  - Créer un widget (ex. « AuTrust auth »), mode **Managed** ou **Non-interactive**.
  - Récupérer la **Site key** (publique) et la **Secret key** (privée).
- Dans le projet :
  - **Variables d’environnement** (Vercel / .env) :
    - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = la site key
    - `TURNSTILE_SECRET_KEY` = la secret key
  - Le code affiche déjà le widget sur **login**, **inscription** et **contact** ; les API correspondantes vérifient le token via l’API Cloudflare siteverify (voir ci‑dessous). Si les clés ne sont pas définies, le site fonctionne sans Turnstile (dégradé gracieux).

---

## 6. Firewall rules (bloquer pays si besoin)

- **Security** → **WAF** → **Tools** → **IP Access Rules** ou **Firewall rules**.
- Pour bloquer par pays :
  - **Create rule** : `(ip.geoip.country in {"XX" "YY"})` → Action **Block** (remplacer XX, YY par codes pays, ex. `RU` `CN` si tu ne vises pas ces marchés).
- Tu peux aussi **Challenge** (CAPTCHA) au lieu de Block pour certains pays.

---

## 7. Logs et alertes

- **Logs** :
  - **Security** → **Events** : voir requêtes bloquées (WAF, rate limit, firewall).
  - **Analytics** → **Traffic** : requêtes, bande passante, pays.
  - Pour des logs plus détaillés : **Logpush** (vers un bucket S3, Datadog, etc.) si besoin.
- **Alertes** :
  - **Notifications** (icône cloche) → **Add** : alerte quand « Firewall event » dépasse un seuil, ou « DDoS attack » détecté, etc.

---

## 8. Vercel + Cloudflare

- La **origine** reste ton déploiement Vercel (ex. `autrust-web.vercel.app` ou un domaine Vercel custom).
- Dans Cloudflare, pour `autrust.be` :
  - **DNS** : enregistrement **A** ou **CNAME** vers l’origine Vercel, avec **Proxy** activé (nuage orange).
- Dans Vercel, ajouter le domaine **autrust.be** (et www si tu l’utilises) ; Vercel te donnera l’IP ou le CNAME cible à mettre dans Cloudflare si besoin.
- Une fois le domaine pointé via Cloudflare vers Vercel, tout le trafic passe par Cloudflare (WAF, DDoS, rate limit, Turnstile côté client ; la vérification Turnstile reste côté ton app sur Vercel).

---

## 9. Résumé des bénéfices

| Fonctionnalité | Où c’est configuré |
|----------------|---------------------|
| WAF (SQLi/XSS, patterns) | Security → WAF (Managed + Custom rules) |
| DDoS protection | Automatique une fois proxy activé |
| Rate limiting IP/pays/URI | Security → WAF → Rate limiting rules |
| Bot protection (Turnstile) | Turnstile dashboard + env vars + code existant |
| Firewall (pays, IP) | Security → Firewall rules |
| Logs + alertes | Security → Events ; Notifications |

Après mise en place, revoir une fois les règles de rate limit et les pays bloqués selon le trafic réel et la cible géographique (Belgique / UE).
