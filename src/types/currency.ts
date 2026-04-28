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

export type ExchangeRates = {
  baseCurrency: string;
  rates: Record<string, number>;
  fetchedAt: Date;
};

export type ConversionRequest = {
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
};

export type ConversionResult = {
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  exchangeRate: number;
  convertedAmount: number;
  createdAt: string;
  calculationSteps: number;
};

export type StatsResponse = {
  totalConversions: number;
  mostFrequentlyUsedTargetCurrency: string | null;
  totalConvertedAmount: {
    currency: "USD";
    amount: number;
  };
};
