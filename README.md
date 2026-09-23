# TravelAI

Piattaforma di viaggio con autenticazione reale e schema database completo.

**Fase attuale: 2** — scaffold Next.js, Prisma/PostgreSQL, Auth.js, RBAC, i18n predisposto, health API, UI auth/profilo.

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
- Security headers, rate limit in-memory su register/reset/verify
- Test Vitest (validazione, hash password, RBAC, shape health)

## INTEGRAZIONE NON CONFIGURATA

| Area | Stato |
|------|--------|
| PostgreSQL (`DATABASE_URL`) | Non configurato finché non imposti `.env` e applichi le migration |
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

## Script

- `npm run dev` — sviluppo
- `npm run build` / `npm start` — produzione
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
- `npm test` — Vitest
- `npm run db:generate` / `db:migrate` — Prisma

## Rate limiting

Il rate limiter in `src/lib/rate-limit.ts` è **in-memory e non distribuito** (un contatore per processo Node). Adeguato solo a sviluppo / singola istanza.

## Stack

Next.js (App Router) · TypeScript · Prisma · PostgreSQL · Auth.js (NextAuth v5) · Zod · Vitest
