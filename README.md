# Currency Converter

A full-stack currency conversion app built with Next.js, Prisma, PostgreSQL, and live exchange rates from Open Exchange Rates.

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Framework  | Next.js 16 (App Router, TypeScript)    |
| Database   | PostgreSQL 16 via Prisma ORM           |
| Validation | Zod                                    |
| Styling    | Tailwind CSS                           |
| Testing    | Vitest                                 |
| Exchange   | Open Exchange Rates (free plan)        |

## Features

- Live exchange rate conversion with PostgreSQL-backed caching (configurable TTL)
- Persistent conversion records in PostgreSQL
- Conversion statistics (total count, most popular target currency, total volume in USD)
- Input validation with meaningful error responses
- Responsive desktop/mobile UI

## Prerequisites

- Node.js ≥ 18
- Docker (for PostgreSQL) — or a local PostgreSQL instance
- A free [Open Exchange Rates](https://openexchangerates.org/) API key

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and fill in your values
cp .env.example .env
# Edit .env — set EXCHANGE_RATE_API_KEY to your Open Exchange Rates key

# 3. Start PostgreSQL (Docker Compose)
docker compose up -d

# 4. Run Prisma migrations
npx prisma migrate dev --name init

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable                         | Default                                                  | Description                          |
|----------------------------------|----------------------------------------------------------|--------------------------------------|
| `DATABASE_URL`                   | `postgresql://postgres:postgres@localhost:5432/currency_converter?schema=public` | PostgreSQL connection string |
| `EXCHANGE_RATE_API_KEY`          | —                                                        | Open Exchange Rates API key (required) |
| `EXCHANGE_RATE_API_BASE_URL`     | `https://openexchangerates.org/api`                      | Exchange rate provider base URL      |
| `EXCHANGE_RATE_CACHE_TTL_SECONDS`| `3600`                                                   | Exchange rate cache TTL in seconds   |

## Commands

| Command               | Description                       |
|-----------------------|-----------------------------------|
| `npm run dev`         | Start development server          |
| `npm run build`       | Build production bundle           |
| `npm run start`       | Start production server           |
| `npm run typecheck`   | TypeScript type checking          |
| `npm run lint`        | ESLint                            |
| `npm test`            | Run Vitest unit tests             |
| `npx prisma studio`   | Open Prisma database browser      |
| `npx prisma migrate dev` | Apply database migrations      |

## API

### `POST /api/convert`

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
  "createdAt": "2026-04-27T12:00:00.000Z"
}
```

**Error responses:**
- `400 VALIDATION_ERROR` — invalid or missing input
- `400 UNSUPPORTED_CURRENCY` — currency not in supported list
- `400 RATE_NOT_AVAILABLE` — exchange rate unavailable for currency
- `502 EXCHANGE_RATE_PROVIDER_ERROR` — upstream provider unreachable
- `500 INTERNAL_SERVER_ERROR` — unexpected server error

### `GET /api/stats`

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

- **Exchange rate caching:** Persisted in the `exchange_rate_cache` PostgreSQL table (one row per base currency). Rates are re-fetched after the configured TTL. The cache survives process restarts, so only a genuinely stale or missing entry triggers an upstream call.
- **Rounding:** Exchange rates are stored and returned to 8 decimal places. Converted amounts are stored to 6 decimal places. This is adequate for display and statistics accuracy.
- **Total volume in USD:** Each conversion stores `convertedAmountUsd` — the target amount normalized to USD at conversion time using live rates. This enables an accurate global volume sum regardless of target currency.
- **Same-currency conversions:** Allowed. The rate will be `1.0` and the converted amount equals the input amount.
- **Free-plan provider:** Open Exchange Rates free plan uses USD as the fixed base. Cross-rates are calculated as `targetRate / sourceRate` relative to USD.
