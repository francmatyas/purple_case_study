import { z } from "zod";

export const SUPPORTED_CURRENCIES = [
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

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const currencySchema = z.enum(SUPPORTED_CURRENCIES);

export const conversionRequestSchema = z.object({
  amount: z.number().positive().finite(),
  sourceCurrency: currencySchema,
  targetCurrency: currencySchema,
});

export const conversionResultSchema = z.object({
  amount: z.number(),
  sourceCurrency: currencySchema,
  targetCurrency: currencySchema,
  exchangeRate: z.number(),
  convertedAmount: z.number(),
  createdAt: z.string(),
  calculationSteps: z.number(),
});

export const statsResponseSchema = z.object({
  totalConversions: z.number(),
  mostFrequentlyUsedTargetCurrency: currencySchema.nullable(),
  totalConvertedAmount: z.object({
    currency: z.literal("USD"),
    amount: z.number(),
  }),
});

export const conversionFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive").finite("Amount must be a valid number"),
  sourceCurrency: currencySchema,
  targetCurrency: currencySchema,
});

export type ConversionRequest = z.infer<typeof conversionRequestSchema>;
export type ConversionResult = z.infer<typeof conversionResultSchema>;
export type StatsResponse = z.infer<typeof statsResponseSchema>;
export type ConversionFormInput = z.infer<typeof conversionFormSchema>;
