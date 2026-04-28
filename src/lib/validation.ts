import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "@/types/currency";

export const conversionRequestSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be positive")
    .finite("Amount must be finite"),
  sourceCurrency: z
    .string()
    .length(3, "Currency code must be exactly 3 characters")
    .transform((v) => v.toUpperCase())
    .refine(
      (v) => (SUPPORTED_CURRENCIES as readonly string[]).includes(v),
      (v) => ({ message: `Unsupported currency: ${v}` })
    ),
  targetCurrency: z
    .string()
    .length(3, "Currency code must be exactly 3 characters")
    .transform((v) => v.toUpperCase())
    .refine(
      (v) => (SUPPORTED_CURRENCIES as readonly string[]).includes(v),
      (v) => ({ message: `Unsupported currency: ${v}` })
    ),
});

export type ConversionRequestInput = z.input<typeof conversionRequestSchema>;
export type ConversionRequestParsed = z.output<typeof conversionRequestSchema>;
