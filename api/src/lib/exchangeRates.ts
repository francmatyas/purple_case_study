import { AppError } from "./errors";
import { prisma } from "./prisma";
import type { ExchangeRates } from "../types/currency";

type OpenExchangeRatesResponse = {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
};

function getCacheTtlMs(): number {
  const ttl = parseInt(process.env.EXCHANGE_RATE_CACHE_TTL_SECONDS ?? "3600", 10);
  if (!Number.isFinite(ttl) || ttl <= 0) return 3600 * 1000;
  return ttl * 1000;
}

function isCacheValid(fetchedAt: Date): boolean {
  return Date.now() - fetchedAt.getTime() < getCacheTtlMs();
}

async function fetchFromProvider(): Promise<ExchangeRates> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  const baseUrl = process.env.EXCHANGE_RATE_API_BASE_URL ?? "https://openexchangerates.org/api";

  if (!apiKey) {
    throw new AppError("EXCHANGE_RATE_PROVIDER_ERROR", "Exchange rate API key is not configured");
  }

  const url = `${baseUrl}/latest.json?app_id=${apiKey}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new AppError("EXCHANGE_RATE_PROVIDER_ERROR", "Unable to fetch exchange rates");
  }

  if (!response.ok) {
    throw new AppError("EXCHANGE_RATE_PROVIDER_ERROR", "Unable to fetch exchange rates");
  }

  let data: OpenExchangeRatesResponse;
  try {
    data = await response.json() as OpenExchangeRatesResponse;
  } catch {
    throw new AppError("EXCHANGE_RATE_PROVIDER_ERROR", "Unable to parse exchange rate response");
  }

  return {
    baseCurrency: data.base,
    rates: data.rates,
    fetchedAt: new Date(),
  };
}

export async function getExchangeRates(): Promise<ExchangeRates> {
  const baseCurrency = "USD";
  const cached = await prisma.exchangeRateCache.findUnique({
    where: { baseCurrency },
  });

  if (cached && isCacheValid(cached.fetchedAt)) {
    return {
      baseCurrency: cached.baseCurrency,
      rates: cached.rates as Record<string, number>,
      fetchedAt: cached.fetchedAt,
    };
  }

  const rates = await fetchFromProvider();

  await prisma.exchangeRateCache.upsert({
    where: { baseCurrency: rates.baseCurrency },
    create: {
      baseCurrency: rates.baseCurrency,
      rates: rates.rates,
      fetchedAt: rates.fetchedAt,
    },
    update: {
      rates: rates.rates,
      fetchedAt: rates.fetchedAt,
    },
  });

  return rates;
}

export function computeRate(
  rates: ExchangeRates,
  sourceCurrency: string,
  targetCurrency: string
): number {
  const sourceRate =
    sourceCurrency === rates.baseCurrency ? 1 : rates.rates[sourceCurrency];
  const targetRate =
    targetCurrency === rates.baseCurrency ? 1 : rates.rates[targetCurrency];

  if (sourceRate == null) {
    throw new AppError("RATE_NOT_AVAILABLE", `Rate not available for ${sourceCurrency}`);
  }
  if (targetRate == null) {
    throw new AppError("RATE_NOT_AVAILABLE", `Rate not available for ${targetCurrency}`);
  }

  return targetRate / sourceRate;
}
