## AuTrust — Plateforme achat/vente véhicules

MVP marketplace **auto / moto / utilitaire**:

- **Catalogue**: `/listings` (filtres via query params)
- **Détail annonce**: `/listings/[id]`
- **Dépôt d’annonce**: `/sell` (pas de compte requis sur le MVP)
- **API (future app mobile)**:
  - `GET /api/listings`
  - `POST /api/listings`
  - `GET /api/listings/[id]`

### Prérequis

- Node.js (idéalement >= 20)
- npm

### Démarrage (DEV avec SQLite)

1) Installer les dépendances

```bash
npm install
```

2) Créer le fichier d’environnement

```bash
cp .env.example .env
```

3) Créer la base + générer le client Prisma

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4) (Optionnel) Seeder 3 annonces démo

```bash
npx prisma db seed
```

5) Lancer le serveur

```bash
npm run dev
```

Ouvre `http://localhost:3000`.

### Notes

- **Prisma ORM v7**: la connexion DB est configurée dans `prisma.config.ts` (pas dans `schema.prisma`).
- **Modération “IA” (MVP)**: filtre texte dans `lib/moderation.ts`. On peut ensuite brancher une vraie modération (texte + image) via un provider (Cloudinary / OpenAI / etc.).

### Cloudflare & Turnstile (optionnel)

- **Cloudflare** : mettre le domaine (ex. autrust.be) derrière Cloudflare pour WAF, DDoS, rate limiting, firewall et logs. Guide pas à pas : **`docs/CLOUDFLARE_SETUP.md`**.
- **Turnstile** (anti-bots) : widget sur login, inscription, contact et « signaler un problème ». Pour l’activer :
  1. Créer un widget sur [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile**.
  2. Renseigner dans `.env` (ou variables Vercel) : `NEXT_PUBLIC_TURNSTILE_SITE_KEY` et `TURNSTILE_SECRET_KEY`.
  - Code : `lib/turnstile.ts` (vérification serveur), `app/_components/TurnstileWidget.tsx` (widget). Sans clés, le site fonctionne sans Turnstile.
