import { describe, it, expect } from "vitest";
import { conversionRequestSchema } from "@/lib/validation";

describe("conversionRequestSchema", () => {
  it("accepts valid input and normalizes currency codes to uppercase", () => {
    const result = conversionRequestSchema.safeParse({
      amount: 100,
      sourceCurrency: "eur",
      targetCurrency: "usd",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sourceCurrency).toBe("EUR");
      expect(result.data.targetCurrency).toBe("USD");
      expect(result.data.amount).toBe(100);
    }
  });

  it("rejects negative amount", () => {
    const result = conversionRequestSchema.safeParse({
      amount: -50,
      sourceCurrency: "EUR",
      targetCurrency: "USD",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero amount", () => {
    const result = conversionRequestSchema.safeParse({
      amount: 0,
      sourceCurrency: "EUR",
      targetCurrency: "USD",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing amount", () => {
    const result = conversionRequestSchema.safeParse({
      sourceCurrency: "EUR",
      targetCurrency: "USD",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unsupported currency code", () => {
    const result = conversionRequestSchema.safeParse({
      amount: 100,
      sourceCurrency: "XYZ",
      targetCurrency: "USD",
    });
    expect(result.success).toBe(false);
  });

  it("rejects currency code that is not 3 characters", () => {
    const result = conversionRequestSchema.safeParse({
      amount: 100,
      sourceCurrency: "EU",
      targetCurrency: "USD",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric amount", () => {
    const result = conversionRequestSchema.safeParse({
      amount: "not-a-number",
      sourceCurrency: "EUR",
      targetCurrency: "USD",
    });
    expect(result.success).toBe(false);
  });
});
