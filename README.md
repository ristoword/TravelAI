# TravelAI

Piattaforma di viaggio: autenticazione reale, schema database, UI ricerca e adapter provider **senza dati inventati**.

**Fase attuale: 4** — ricerca voli/hotel/auto/package, dettaglio hotel, confronto, AI tool registry, trip builder, booking gated.

## Produzione (Railway)

- **URL:** https://travelai-production-ceae.up.railway.app  
- Deploy automatico da push su `main`.  
- Healthcheck: `GET /api/health` (phase 4; provider status reali da env).
- All'avvio: `prisma migrate deploy` (rete privata Railway) poi Next.js.

### Variabili (solo nomi)

Auth/DB: `DATABASE_URL`, `NEXTAUTH_SECRET` / `AUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_URL`, `AUTH_TRUST_HOST`.

**Amadeus for Developers (sandbox)** — un account OAuth2 per voli, hotel e transfer:  
`AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`, `AMADEUS_BASE_URL` (default documentato: `https://test.api.amadeus.com`).

Alias legacy opzionali: `FLIGHT_PROVIDER_API_KEY` / `HOTEL_PROVIDER_API_KEY` / `CAR_PROVIDER_API_KEY` come client id; il secret resta `AMADEUS_CLIENT_SECRET`.

Autocomplete aeroporti: dataset pubblico **OurAirports** (download automatico). Opzionali: `AIRPORT_AUTOCOMPLETE_BASE_URL`, `AIRPORT_DATASET_PATH`.

AI / pagamenti: `OPENAI_API_KEY`, `STRIPE_SECRET_KEY` + `STRIPE_PUBLISHABLE_KEY` (obbligatorie insieme), `STRIPE_WEBHOOK_SECRET` (firma webhook).

Health `stripe: configured` solo se secret **e** publishable sono presenti.

## Cosa funziona davvero

- Auth, profilo, RBAC, audit, health
- UI homepage con tab VOLI | VOLI+HOTEL | HOTEL | AUTO + autocomplete OurAirports
- API search → client HTTP Amadeus (Flight Offers Search, Hotel List + Hotel Offers v3, Transfer Offers)
- Senza `AMADEUS_CLIENT_ID` + `AMADEUS_CLIENT_SECRET` → `provider_not_configured` (nessun mock, nessuna chiamata)
- Con credenziali → chiamata HTTP reale; errori Amadeus propagati senza fallback inventati
- Trip builder (auth + DB)
- Booking: solo conferma utente + provider + Stripe; nessuna prenotazione simulata
- Migration additive all'avvio del servizio

## INTEGRAZIONE NON CONFIGURATA (stato tipico senza secret Amadeus)

| Area | Env necessarie |
|------|----------------|
| Voli / Hotel / Transfer | `AMADEUS_CLIENT_ID` + `AMADEUS_CLIENT_SECRET` |
| Aeroporti autocomplete | OurAirports (pubblico; fallisce solo se download down) |
| OpenAI | `OPENAI_API_KEY` |
| Stripe | `STRIPE_SECRET_KEY` + `STRIPE_PUBLISHABLE_KEY` |

## Setup locale

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

## Script

- `npm run lint` / `typecheck` / `test` / `build`
