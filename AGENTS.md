# AGENTS.md - Currency Conversion App Implementation Instructions

## Goal

Implement **Level 2** of the Backend Developer case study: a currency conversion application with:

- A working conversion API using live exchange rates
- A web frontend built with Next.js
- Persistent conversion statistics stored in PostgreSQL
- Prisma as the persistence layer
- Zod for input validation
- TypeScript across the codebase

The implementation must be practical, runnable locally, and easy to review.

## Technology Stack

Use the following stack:

- **Framework:** Next.js with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Styling:** CSS Modules, Tailwind CSS, or another lightweight approach
- **Testing:** Vitest, Jest, or Playwright where appropriate
- **External exchange rate API:** one free-plan provider such as:
  - Open Exchange Rates
  - Fixer
  - CurrencyLayer

Do not introduce unnecessary infrastructure unless it directly improves the assignment submission.

## Core Requirements

The app must allow a user to:

1. Enter an amount
2. Select a source currency
3. Select a target currency
4. Submit the conversion
5. See the converted result
6. See conversion statistics that survive application restarts

The implementation must include:

- API endpoints for currency conversion and statistics
- Live exchange rate retrieval from an external provider
- Rate caching to avoid calling the external API on every request
- Persistent conversion records in PostgreSQL
- Input validation and meaningful error responses
- A simple web UI following the provided Figma design as closely as reasonable
- Local setup instructions in `README.md`

## Recommended Project Structure

Use a clear structure such as:

```txt
src/
  app/
    page.tsx
    layout.tsx
    api/
      convert/
        route.ts
      stats/
        route.ts
  components/
    CurrencyConverterForm.tsx
    ConversionResult.tsx
    ConversionStats.tsx
  lib/
    prisma.ts
    exchangeRates.ts
    conversion.ts
    validation.ts
    errors.ts
  types/
    currency.ts
prisma/
  schema.prisma
  migrations/
tests/
  conversion.test.ts
  validation.test.ts
.env.example
README.md
```

Keep business logic outside route handlers. Route handlers should validate input, call application logic, and return HTTP responses.

## Environment Variables

Create `.env.example` with the required variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/currency_converter?schema=public"
EXCHANGE_RATE_API_KEY="replace-me"
EXCHANGE_RATE_API_BASE_URL="https://openexchangerates.org/api"
EXCHANGE_RATE_CACHE_TTL_SECONDS="3600"
```

The actual `.env` file must not be committed.

## Database Model

Use Prisma with PostgreSQL.

Minimum model:

```prisma
model Conversion {
  id             String   @id @default(cuid())
  amount         Decimal  @db.Decimal(18, 6)
  sourceCurrency String
  targetCurrency String
  exchangeRate   Decimal  @db.Decimal(18, 8)
  convertedAmount Decimal @db.Decimal(18, 6)
  createdAt      DateTime @default(now())

  @@index([targetCurrency])
  @@index([createdAt])
}
```

Optional but useful model for caching exchange rates:

```prisma
model ExchangeRateCache {
  id           String   @id @default(cuid())
  baseCurrency String
  rates        Json
  fetchedAt    DateTime

  @@unique([baseCurrency])
}
```

If cache is implemented in-memory instead of in the database, conversion statistics must still be persisted in PostgreSQL.

## API Design

### `POST /api/convert`

Converts an amount from one currency to another and stores the conversion.

Request body:

```json
{
  "amount": 100,
  "sourceCurrency": "EUR",
  "targetCurrency": "USD"
}
```

Successful response:

```json
{
  "amount": 100,
  "sourceCurrency": "EUR",
  "targetCurrency": "USD",
  "exchangeRate": 1.08,
  "convertedAmount": 108,
  "createdAt": "2026-04-26T12:00:00.000Z"
}
```

Validation errors should return `400`:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid conversion input",
  "details": []
}
```

External provider errors should return `502`:

```json
{
  "error": "EXCHANGE_RATE_PROVIDER_ERROR",
  "message": "Unable to fetch exchange rates"
}
```

### `GET /api/stats`

Returns persisted conversion statistics.

Response:

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

The assignment allows choosing the currency used for the total sum. Use USD unless there is a clear reason to choose another currency.

## Validation Rules

Use Zod for all API input validation.

Create a schema similar to:

```ts
import { z } from "zod";

export const conversionRequestSchema = z.object({
  amount: z.number().positive().finite(),
  sourceCurrency: z.string().length(3).transform((value) => value.toUpperCase()),
  targetCurrency: z.string().length(3).transform((value) => value.toUpperCase()),
});
```

Add additional validation where useful:

- Reject unsupported currencies
- Reject same source and target currency only if this simplifies the app logic; otherwise allow it and return the same amount
- Reject zero, negative, missing, or non-numeric amounts
- Normalize currency codes to uppercase

## Exchange Rate Integration

Create a dedicated exchange rate service in `src/lib/exchangeRates.ts`.

Responsibilities:

- Fetch rates from the configured external provider
- Cache rates for a configurable TTL
- Normalize provider-specific responses into an internal format
- Throw typed errors for provider failures
- Avoid leaking provider response details directly to API consumers

Recommended internal return shape:

```ts
export type ExchangeRates = {
  baseCurrency: string;
  rates: Record<string, number>;
  fetchedAt: Date;
};
```

If using a provider that only supports a fixed base currency on the free plan, implement conversion through that base currency.

Example:

```ts
// If provider base is USD:
// EUR -> CZK = CZK/USD rate divided by EUR/USD rate
const rate = targetRateAgainstUsd / sourceRateAgainstUsd;
```

Handle missing rates explicitly.

## Conversion Logic

Create conversion logic in `src/lib/conversion.ts`.

The conversion service should:

1. Validate that both currencies are available
2. Calculate the exchange rate
3. Calculate the converted amount
4. Store the conversion in PostgreSQL
5. Return a stable response DTO

Avoid floating-point surprises where possible. For this case study, JavaScript numbers are acceptable for API responses, but persist monetary values with Prisma Decimal fields.

Recommended rounding:

- Exchange rate: 6-8 decimal places
- Converted amount: 2-6 decimal places

Be consistent and document the decision briefly in code or README.

## Statistics Logic

Implement statistics from persisted `Conversion` records.

Required stats:

1. **Most frequently used target currency**
2. **Total sum of all conversions** in USD or another chosen currency
3. **Total number of conversions**

Implementation approach:

- `totalConversions`: Prisma `count`
- `mostFrequentlyUsedTargetCurrency`: Prisma `groupBy` on `targetCurrency`
- `totalConvertedAmount`: sum converted values only for the chosen reporting currency, or normalize records into USD if storing/reporting rates support it

Simplest acceptable approach:

- Display `totalConvertedAmount` as the sum of conversions where `targetCurrency = "USD"`
- Clearly label it as `Total converted amount into USD`

Better approach:

- Store an additional `convertedAmountUsd` field during every conversion
- Use it for global total volume regardless of target currency

Prefer the better approach if time allows.

## Frontend Requirements

Build the frontend in Next.js.

The UI should contain:

- Amount input
- Source currency selector
- Target currency selector
- Convert button
- Converted result display
- Conversion statistics display
- Loading state
- Error state

Recommended components:

- `CurrencyConverterForm`
- `ConversionResult`
- `ConversionStats`

UX expectations:

- Disable submit while converting
- Show validation errors near the form
- Show API errors in a readable way
- Refresh statistics after a successful conversion
- Keep the UI simple and close to the Figma Web layer

Do not overbuild authentication, dashboards, admin pages, or complex user management.

## Currency Options

Define a practical supported currency list.

Example:

```ts
export const supportedCurrencies = [
  "USD",
  "EUR",
  "CZK",
  "GBP",
  "CHF",
  "PLN",
  "JPY",
  "CAD",
  "AUD",
] as const;
```

Use the same list on frontend and backend to avoid mismatches.

## Error Handling

Create consistent error responses.

Recommended error codes:

- `VALIDATION_ERROR`
- `UNSUPPORTED_CURRENCY`
- `RATE_NOT_AVAILABLE`
- `EXCHANGE_RATE_PROVIDER_ERROR`
- `INTERNAL_SERVER_ERROR`

Route handlers should not expose stack traces, API keys, raw provider errors, or database internals.

## Testing Requirements

Add at least basic tests.

Prioritize:

1. Conversion rate calculation
2. Zod validation behavior
3. Statistics aggregation logic if extracted into a testable function
4. API integration tests if time allows

Example test cases:

- Converts EUR to USD correctly from mocked rates
- Rejects negative amount
- Rejects invalid currency code
- Handles missing target rate
- Returns same amount for same-currency conversion if supported

Mock the external exchange rate provider. Tests must not depend on live API calls.

## README Requirements

Create or update `README.md` with:

- Project overview
- Tech stack
- Local setup instructions
- Required environment variables
- Database setup
- Prisma migration command
- Development command
- Test command
- Short API documentation
- Known limitations or trade-offs

Example commands:

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
npm test
```

If Docker Compose is used for PostgreSQL, include:

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: currency_converter
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Implementation Order

Use this order:

1. Initialize Next.js TypeScript project
2. Add Prisma and PostgreSQL configuration
3. Define Prisma schema and run migration
4. Add Zod validation schemas
5. Implement exchange rate provider service with caching
6. Implement conversion logic and persistence
7. Implement `/api/convert`
8. Implement statistics aggregation
9. Implement `/api/stats`
10. Build frontend form and result display
11. Add statistics section to frontend
12. Add tests
13. Finalize README

## Acceptance Criteria

The submission is acceptable when:

- The app runs locally with documented commands
- PostgreSQL stores conversion records
- Conversion statistics survive restarts
- API validates input and returns meaningful errors
- Exchange rates are cached
- Frontend can perform conversions through the API
- Frontend displays required statistics
- At least basic tests are present
- README is clear enough for reviewers to run the project

## Avoid

Do not spend time on:

- AI collaboration diary content
- Future vision essays
- Authentication
- User accounts
- Billing
- Admin panels
- Complex deployment pipelines
- Overly abstract architecture
- Multiple databases
- Unnecessary microservices
- Premature infrastructure-as-code work

Bonus deployment is useful only after the local implementation is complete and stable.

## Final Deliverable

Submit a GitHub repository containing:

- Next.js application
- Prisma schema and migrations
- PostgreSQL-backed persistence
- API implementation
- Web frontend
- Tests
- README with setup instructions

If deployed, include the live URL in the README.
