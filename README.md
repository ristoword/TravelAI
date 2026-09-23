# TravelAI

Piattaforma di viaggio con autenticazione reale e schema database completo.

**Fase attuale: 2** — scaffold Next.js, Prisma/PostgreSQL, Auth.js, RBAC, i18n predisposto, health API, UI auth/profilo.

## Produzione (Railway)

- **URL:** https://travelai-production-ceae.up.railway.app  
- **Host:** `travelai-production-ceae.up.railway.app`  
- Deploy automatico da push su `main` (GitHub → Railway già collegato).  
- Healthcheck: `GET /api/health` (risponde **200** anche se `DATABASE_URL` manca: `database: "not_configured"`).  
- Start: `railway.toml` usa `PORT` iniettato da Railway (`next start -H 0.0.0.0 -p ${PORT:-3000}`).

**Senza `DATABASE_URL` e `NEXTAUTH_SECRET` (o `AUTH_SECRET`) su Railway, l’auth non è operativa** — non c’è login finto: registrazione/login falliscono in modo esplicito finché le variabili non sono impostate e le migration non sono applicate.

### Variabili da impostare nel pannello Railway (solo nomi)

Obbligatorie per auth/DB:
- `DATABASE_URL`
- `NEXTAUTH_SECRET` (oppure `AUTH_SECRET`)
- `NEXTAUTH_URL` = `https://travelai-production-ceae.up.railway.app`
- `AUTH_URL` = `https://travelai-production-ceae.up.railway.app`
- `AUTH_TRUST_HOST` = `true`

Opzionali (Fase 2): `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `EMAIL_SERVER`, `EMAIL_FROM`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.

Dopo aver impostato `DATABASE_URL`, applicare le migration (`prisma migrate deploy`) sul database di produzione.

## Cosa funziona davvero

- Registrazione, login (credentials), logout
- Reset password e verifica email **con token monouso hashati** persistiti in DB (quando `DATABASE_URL` è impostato)
- Profilo utente (GET/PATCH) con validazione Zod
- RBAC (`USER` / `ADMIN`) via helper `requireRole`
- Audit log per register / login / logout / cambio password (senza password o token)
- `GET /api/health` con stato reale di app, database e provider
- Schema Prisma completo per le entità di viaggio (nessun dato seed finto)
- Migration iniziale in `prisma/migrations/` (creata, **non applicata** se manca `DATABASE_URL`)
- i18n centralizzato: `it` (default), `en`, `nl`, `de`, `fr`, `es`
- Security headers, cookie session httpOnly + `secure` in production, rate limit in-memory su login/register/reset/verify
- Test Vitest (validazione, hash password, RBAC, shape health)

## INTEGRAZIONE NON CONFIGURATA

| Area | Stato |
|------|--------|
| PostgreSQL (`DATABASE_URL`) | Non configurato finché non imposti env e applichi le migration |
| Provider email | Non inviato: risposta `email_provider_not_configured` |
| OAuth Google/GitHub | Pulsanti/endpoint dichiarano “non configurato” se mancano le env |
| OpenAI | Env prevista, **non integrata** in Fase 2 |
| Stripe | Env previste, **non integrate** in Fase 2 |
| Provider voli/hotel/auto/attività | Da definire in Fase 4 — nessun adapter |

In **development**, se l’email non è configurata, le API di reset/verifica possono restituire `developmentOnly*Token` solo con `NODE_ENV=development` (documentato). In production il token **non** viene esposto.

## Setup locale

```bash
cp .env.example .env
# Imposta DATABASE_URL e NEXTAUTH_SECRET (o AUTH_SECRET)
npm install
npx prisma migrate deploy   # richiede PostgreSQL raggiungibile
npx prisma generate
npm run dev
```

Se `DATABASE_URL` è assente: la migration resta nei file; `prisma generate` funziona; health riporta `database: not_configured`.

Nota: lo script `npm start` usa la sintassi shell `${PORT:-3000}` (Linux/Railway). In locale su Windows preferire `npm run dev` oppure `npx next start -p 3000`.

## Script

- `npm run dev` — sviluppo
- `npm run build` / `npm start` — produzione (build include `prisma generate`)
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
- `npm test` — Vitest
- `npm run db:generate` / `db:migrate` — Prisma

## Rate limiting

Il rate limiter in `src/lib/rate-limit.ts` è **in-memory e non distribuito** (un contatore per processo Node). Adeguato solo a sviluppo / singola istanza.

## Stack

Next.js (App Router) · TypeScript · Prisma · PostgreSQL · Auth.js (NextAuth v5) · Zod · Vitest
