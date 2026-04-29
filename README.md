# Currency Converter

A full-stack currency conversion app split into two independent packages.

**Live demo:** [https://purple.francmatyas.com/](https://purple.francmatyas.com/)

- **`api/`** — Express REST API with PostgreSQL via Prisma and live exchange rates
- **`web/`** — Next.js presentation layer that consumes the API

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| API        | Node.js + Express 4, TypeScript     |
| Frontend   | Next.js 16 (App Router, TypeScript) |
| Database   | PostgreSQL 16 via Prisma ORM        |
| Validation | Zod                                 |
| Styling    | Tailwind CSS                        |
| Testing    | Vitest                              |
| Exchange   | Open Exchange Rates (free plan)     |

## Features

- Live exchange rate conversion with PostgreSQL-backed caching (configurable TTL)
- Persistent conversion records in PostgreSQL
- Conversion statistics (total count, most popular target currency, total volume in USD)
- Input validation with meaningful error responses
- Responsive desktop/mobile UI

## Prerequisites

- Node.js ≥ 18
- Docker and Docker Compose
- A free [Open Exchange Rates](https://openexchangerates.org/) API key

## Project Structure

```text
.
├── api/                  # Express REST API
│   ├── prisma/           # Prisma schema and migrations
│   ├── src/
│   │   ├── lib/          # Business logic, DB, exchange rates
│   │   ├── routes/       # Express route handlers
│   │   └── types/        # Shared TypeScript types
│   └── tests/
├── web/                  # Next.js frontend
│   └── src/
│       ├── app/          # App Router pages
│       ├── components/   # React components
│       └── types/        # Frontend TypeScript types
├── .env.example
└── docker-compose.yml
```

## Quick Start (Docker)

```bash
# 1. Copy and configure environment
cp .env.example .env
# Edit .env — set EXCHANGE_RATE_API_KEY to your Open Exchange Rates key

# 2. Build and start all services (postgres + api + web)
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** `NEXT_PUBLIC_API_URL` is baked into the Next.js bundle at build time.
> The default (`http://localhost:3001`) works when accessing the app from your local browser.
> Override it before running `docker compose up --build` if deploying to a remote host.

## Local Development

```bash
# 1. Copy environment and fill in values
cp .env.example .env
# Edit .env — set EXCHANGE_RATE_API_KEY

# 2. Start PostgreSQL
docker compose up postgres -d

# 3. Install, migrate, and start the API (terminal 1)
cd api
npm install
npx prisma migrate dev --name init
npm run dev
# → http://localhost:3001

# 4. Install and start the frontend (terminal 2)
cd web
npm install
npm run dev
# → http://localhost:3000
```

## Environment Variables

All variables live in the root `.env` file and are shared between both packages.

| Variable                          | Default                             | Used by      | Description                                      |
|-----------------------------------|-------------------------------------|--------------|--------------------------------------------------|
| `API_URL`                         | `http://localhost:3001`             | web (SSR)    | URL for Next.js server-side fetch calls          |
| `NEXT_PUBLIC_API_URL`             | `http://localhost:3001`             | web (client) | URL baked into the browser bundle                |
| `API_PORT`                        | `3001`                              | api          | Port the Express server listens on               |
| `WEB_URL`                         | `http://localhost:3000`             | api          | Allowed CORS origin                              |
| `POSTGRES_PORT`                   | `5432`                              | api          | PostgreSQL port                                  |
| `POSTGRES_USERNAME`               | `postgres`                          | api          | PostgreSQL username                              |
| `POSTGRES_PASSWORD`               | `postgres`                          | api          | PostgreSQL password                              |
| `DATABASE_URL`                    | _(see `.env.example`)_              | api          | Full Prisma connection URL                       |
| `EXCHANGE_RATE_API_KEY`           | —                                   | api          | Open Exchange Rates API key **(required)**       |
| `EXCHANGE_RATE_API_BASE_URL`      | `https://openexchangerates.org/api` | api          | Exchange rate provider base URL                  |
| `EXCHANGE_RATE_CACHE_TTL_SECONDS` | `3600`                              | api          | Exchange rate cache TTL in seconds               |

## Commands

### API (`api/`)

| Command                    | Description                           |
|----------------------------|---------------------------------------|
| `npm run dev`              | Start Express with hot-reload (`tsx`) |
| `npm run build`            | Compile TypeScript to `dist/`         |
| `npm run start`            | Start compiled production server      |
| `npm run typecheck`        | TypeScript type checking              |
| `npm test`                 | Run Vitest unit tests                 |
| `npx prisma migrate dev`   | Create and apply a new migration      |
| `npx prisma studio`        | Open Prisma database browser          |

### Frontend (`web/`)

| Command             | Description                  |
|---------------------|------------------------------|
| `npm run dev`       | Start Next.js dev server     |
| `npm run build`     | Build production bundle      |
| `npm run start`     | Start production server      |
| `npm run typecheck` | TypeScript type checking     |
| `npm run lint`      | ESLint                       |

## API Reference

### `POST /convert`

Converts an amount between currencies and persists the record.

**Request:**

```json
{
  "amount": 100,
  "sourceCurrency": "EUR",
  "targetCurrency": "USD"
}
```

**Response 200:**

```json
{
  "amount": 100,
  "sourceCurrency": "EUR",
  "targetCurrency": "USD",
  "exchangeRate": 1.08742100,
  "convertedAmount": 108.742100,
  "createdAt": "2026-04-27T12:00:00.000Z",
  "calculationSteps": 2
}
```

**Error responses:**

- `400 VALIDATION_ERROR` — invalid input, missing fields, or unsupported currency
- `400 RATE_NOT_AVAILABLE` — exchange rate unavailable for a currency
- `502 EXCHANGE_RATE_PROVIDER_ERROR` — upstream provider unreachable
- `500 INTERNAL_SERVER_ERROR` — unexpected server error

### `GET /stats`

Returns aggregated conversion statistics.

**Response 200:**

```json
{
  "totalConversions": 42,
  "mostFrequentlyUsedTargetCurrency": "USD",
  "totalConvertedAmount": {
    "currency": "USD",
    "amount": 12345.67
  }
}
```

## Supported Currencies

USD, EUR, CZK, GBP, CHF, PLN, JPY, CAD, AUD

## Design Decisions & Trade-offs

- **Two-package architecture:** The Express API owns all database and business logic. Next.js is a pure presentation layer that communicates with the API over HTTP. This allows the two services to be deployed, scaled, and tested independently.
- **Exchange rate caching:** Persisted in the `exchange_rate_cache` PostgreSQL table (one row per base currency). Rates are re-fetched after the configured TTL. The cache survives process restarts, so only a genuinely stale or missing entry triggers an upstream call.
- **Rounding:** Exchange rates are stored and returned to 8 decimal places. Converted amounts are stored to 6 decimal places. This is adequate for display and statistics accuracy.
- **Total volume in USD:** Each conversion stores `convertedAmountUsd` — the target amount normalized to USD at conversion time using live rates. This enables an accurate global volume sum regardless of target currency.
- **Same-currency conversions:** Allowed. The rate will be `1.0` and the converted amount equals the input amount.
- **Free-plan provider:** Open Exchange Rates free plan uses USD as the fixed base. Cross-rates are calculated as `targetRate / sourceRate` relative to USD.
- **Docker networking:** Inside Docker Compose, `web` reaches `api` at `http://api:3001` (internal network). `NEXT_PUBLIC_API_URL` is baked into the browser bundle at image build time and must point to a host-accessible address (default: `http://localhost:3001` via the exposed port).
