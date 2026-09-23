# TravelAI

Piattaforma di viaggio: autenticazione reale, schema database, UI ricerca premium e adapter provider **senza dati inventati**.

**Fase attuale: 4** — ricerca voli/hotel/auto/package, dettaglio hotel, confronto, AI tool registry, trip builder, booking gated.

## Produzione (Railway)

- **URL:** https://travelai-production-ceae.up.railway.app  
- Deploy automatico da push su `main`.  
- Healthcheck: `GET /api/health` (phase 4; provider status reali da env).

### Variabili (solo nomi)

Auth/DB: `DATABASE_URL`, `NEXTAUTH_SECRET` / `AUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_URL`, `AUTH_TRUST_HOST`.

Travel (entrambe API_KEY + BASE_URL per attivare un adapter):  
`FLIGHT_PROVIDER_API_KEY`, `FLIGHT_PROVIDER_BASE_URL`, `HOTEL_PROVIDER_API_KEY`, `HOTEL_PROVIDER_BASE_URL`, `CAR_PROVIDER_API_KEY`, `CAR_PROVIDER_BASE_URL`.

Autocomplete: `AIRPORT_AUTOCOMPLETE_BASE_URL` e/o `AIRPORT_DATASET_PATH`.

AI / pagamenti: `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`.

Dopo `DATABASE_URL`, applicare migration (`prisma migrate deploy`) sul DB di produzione.

## Cosa funziona davvero

- Auth, profilo, RBAC, audit, health
- UI homepage con tab VOLI | VOLI+HOTEL | HOTEL | AUTO
- API search interne → adapter; senza credenziali → `provider_not_configured` (nessun mock)
- AI chat: tool registry reale; senza `OPENAI_API_KEY` messaggio esplicito, form manuale utilizzabile
- Trip builder (richiede auth + DB)
- Booking: solo con conferma utente + provider + Stripe configurati
- Migration additiva `20260923190000_travel_search_entities`

## INTEGRAZIONE NON CONFIGURATA (stato tipico)

| Area | Env necessarie |
|------|----------------|
| Voli | `FLIGHT_PROVIDER_API_KEY` + `FLIGHT_PROVIDER_BASE_URL` + collegamento vendor HTTP |
| Hotel | `HOTEL_PROVIDER_API_KEY` + `HOTEL_PROVIDER_BASE_URL` + collegamento vendor HTTP |
| Auto | `CAR_PROVIDER_API_KEY` + `CAR_PROVIDER_BASE_URL` + collegamento vendor HTTP |
| Aeroporti autocomplete | `AIRPORT_AUTOCOMPLETE_BASE_URL` o `AIRPORT_DATASET_PATH` + loader |
| OpenAI | `OPENAI_API_KEY` |
| Stripe | `STRIPE_SECRET_KEY` + `STRIPE_PUBLISHABLE_KEY` |

Con sole API_KEY+BASE_URL presenti ma senza SDK vendor collegato, gli adapter restituiscono errore strutturato (non offerte finte).

## Setup locale

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

## Script

- `npm run lint` / `typecheck` / `test` / `build`
