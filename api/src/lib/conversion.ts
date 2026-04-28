import { prisma } from "./prisma";
import { getExchangeRates, computeRate } from "./exchangeRates";
import type { ConversionResult } from "../types/currency";

// Rounding: exchange rate to 8 dp, amounts to 6 dp
function round(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

// Same currency = 1 step; direct from/to base = 2; cross-rate through base = 3
function countCalculationSteps(source: string, target: string, base: string): number {
  if (source === target) return 1;
  if (source === base || target === base) return 2;
  return 3;
}

export async function performConversion(
  amount: number,
  sourceCurrency: string,
  targetCurrency: string
): Promise<ConversionResult> {
  const rates = await getExchangeRates();
  const exchangeRate = computeRate(rates, sourceCurrency, targetCurrency);
  const usdRate = computeRate(rates, targetCurrency, "USD");

  const convertedAmount = round(amount * exchangeRate, 6);
  const roundedRate = round(exchangeRate, 8);
  // Store USD equivalent of the converted amount for global stats
  const convertedAmountUsd = round(convertedAmount * usdRate, 6);
  const calculationSteps = countCalculationSteps(sourceCurrency, targetCurrency, rates.baseCurrency);

  const record = await prisma.conversion.create({
    data: {
      amount: amount.toString(),
      sourceCurrency,
      targetCurrency,
      exchangeRate: roundedRate.toString(),
      convertedAmount: convertedAmount.toString(),
      convertedAmountUsd: convertedAmountUsd.toString(),
    },
  });

  return {
    amount,
    sourceCurrency,
    targetCurrency,
    exchangeRate: roundedRate,
    convertedAmount,
    createdAt: record.createdAt.toISOString(),
    calculationSteps,
  };
}

export async function getStats() {
  const [totalConversions, topCurrency, totalUsd] = await Promise.all([
    prisma.conversion.count(),
    prisma.conversion.groupBy({
      by: ["targetCurrency"],
      _count: { targetCurrency: true },
      orderBy: { _count: { targetCurrency: "desc" } },
      take: 1,
    }),
    prisma.conversion.aggregate({ _sum: { convertedAmountUsd: true } }),
  ]);

  return {
    totalConversions,
    mostFrequentlyUsedTargetCurrency: topCurrency[0]?.targetCurrency ?? null,
    totalConvertedAmount: {
      currency: "USD" as const,
      amount: round(Number(totalUsd._sum.convertedAmountUsd ?? 0), 2),
    },
  };
}
