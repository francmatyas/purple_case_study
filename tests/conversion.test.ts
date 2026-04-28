import { describe, it, expect } from "vitest";
import { computeRate } from "@/lib/exchangeRates";
import { AppError } from "@/lib/errors";
import type { ExchangeRates } from "@/types/currency";

const mockRates: ExchangeRates = {
  baseCurrency: "USD",
  rates: {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    CZK: 23.5,
    JPY: 154.3,
  },
  fetchedAt: new Date(),
};

describe("computeRate", () => {
  it("converts EUR to USD correctly", () => {
    const rate = computeRate(mockRates, "EUR", "USD");
    expect(rate).toBeCloseTo(1 / 0.92, 5);
  });

  it("converts USD to EUR correctly", () => {
    const rate = computeRate(mockRates, "USD", "EUR");
    expect(rate).toBeCloseTo(0.92, 5);
  });

  it("converts EUR to GBP correctly via USD base", () => {
    // GBP/USD ÷ EUR/USD = 0.79 / 0.92
    const rate = computeRate(mockRates, "EUR", "GBP");
    expect(rate).toBeCloseTo(0.79 / 0.92, 5);
  });

  it("returns 1 for same currency", () => {
    const rate = computeRate(mockRates, "USD", "USD");
    expect(rate).toBe(1);
  });

  it("converts EUR to CZK correctly", () => {
    const rate = computeRate(mockRates, "EUR", "CZK");
    expect(rate).toBeCloseTo(23.5 / 0.92, 4);
  });

  it("throws RATE_NOT_AVAILABLE for unsupported source currency", () => {
    expect(() => computeRate(mockRates, "XYZ", "USD")).toThrow(AppError);
    try {
      computeRate(mockRates, "XYZ", "USD");
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).code).toBe("RATE_NOT_AVAILABLE");
    }
  });

  it("throws RATE_NOT_AVAILABLE for unsupported target currency", () => {
    expect(() => computeRate(mockRates, "USD", "XYZ")).toThrow(AppError);
    try {
      computeRate(mockRates, "USD", "XYZ");
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).code).toBe("RATE_NOT_AVAILABLE");
    }
  });
});
