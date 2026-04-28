"use client";

import { useState } from "react";
import { SUPPORTED_CURRENCIES, conversionFormSchema, conversionResultSchema } from "@/types/currency";
import { getApiErrorMessage, parseJsonSafely } from "@/lib/http";
import type { ConversionResult } from "@/types/currency";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Props = {
  onSuccess: (result: ConversionResult) => void;
};

type FormError = {
  amount?: string;
  api?: string;
};

const inputClass =
  "w-full rounded-lg bg-white px-4 py-3 text-base text-gray-900 outline-none focus:ring-2 focus:ring-white/60";

const selectClass =
  "w-full appearance-none rounded-lg bg-white px-4 py-3 pr-10 text-base text-gray-900 outline-none focus:ring-2 focus:ring-white/60";

export default function CurrencyConverterForm({ onSuccess }: Props) {
  const [amount, setAmount] = useState("200");
  const [sourceCurrency, setSourceCurrency] = useState("EUR");
  const [targetCurrency, setTargetCurrency] = useState("CZK");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormError>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validated = conversionFormSchema.safeParse({
      amount,
      sourceCurrency,
      targetCurrency,
    });
    if (!validated.success) {
      const amountIssue = validated.error.issues.find((issue) => issue.path[0] === "amount");
      setErrors({ amount: amountIssue?.message ?? "Invalid input" });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated.data),
      });
      const data = await parseJsonSafely(res);
      if (!res.ok) {
        setErrors({
          api: getApiErrorMessage(res, data, "Conversion failed. Please try again."),
        });
        return;
      }

      const parsed = conversionResultSchema.safeParse(data);
      if (!parsed.success) {
        setErrors({ api: "Unexpected response format from server." });
        return;
      }

      onSuccess(parsed.data);
    } catch {
      setErrors({ api: "Network error. Please check your connection." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Purple card */}
      <div className="w-full rounded-xl bg-purple-900 px-8 py-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-4">
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="mb-1.5 block text-sm text-white">
              Amount to convert
            </label>
            <input
              id="amount"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-300">{errors.amount}</p>
            )}
          </div>

          {/* From */}
          <div>
            <label className="mb-1.5 block text-sm text-white">From</label>
            <div className="relative">
              <select
                title="Source currency"
                value={sourceCurrency}
                onChange={(e) => setSourceCurrency(e.target.value)}
                className={selectClass}
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </div>

          {/* To */}
          <div>
            <label className="mb-1.5 block text-sm text-white">To</label>
            <div className="relative">
              <select
                title="Target currency"
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className={selectClass}
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </div>
        </div>
      </div>

      {errors.api && (
        <p className="mt-3 text-center text-sm text-red-600">{errors.api}</p>
      )}

      {/* Button — outside the card, centered */}
      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-purple-900 px-10 py-3.5 text-base font-medium text-white transition hover:bg-purple-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Converting…" : "Convert currency"}
        </button>
      </div>
    </form>
  );
}

function ChevronIcon() {
  return (
    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
