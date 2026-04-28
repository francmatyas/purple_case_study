"use client";

import { useState } from "react";
import { SUPPORTED_CURRENCIES } from "@/types/currency";
import type { ConversionResult } from "@/types/currency";

type Props = {
  onSuccess: (result: ConversionResult) => void;
};

type FormError = {
  amount?: string;
  sourceCurrency?: string;
  targetCurrency?: string;
  api?: string;
};

export default function CurrencyConverterForm({ onSuccess }: Props) {
  const [amount, setAmount] = useState("");
  const [sourceCurrency, setSourceCurrency] = useState("EUR");
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormError>({});

  function validate(): FormError {
    const errs: FormError = {};
    const num = parseFloat(amount);
    if (!amount.trim()) errs.amount = "Amount is required";
    else if (isNaN(num) || !isFinite(num))
      errs.amount = "Amount must be a valid number";
    else if (num <= 0) errs.amount = "Amount must be positive";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          sourceCurrency,
          targetCurrency,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({
          api: data.message ?? "Conversion failed. Please try again.",
        });
        return;
      }
      onSuccess(data as ConversionResult);
    } catch {
      setErrors({ api: "Network error. Please check your connection." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Amount */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Amount</label>
        <input
          type="number"
          min="0"
          step="any"
          placeholder="100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`w-full rounded-xl border px-4 py-3 text-base outline-none transition focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
            errors.amount
              ? "border-red-400 bg-red-50"
              : "border-gray-200 bg-white"
          }`}
        />
        {errors.amount && (
          <p className="text-xs text-red-500">{errors.amount}</p>
        )}
      </div>

      {/* Currency selectors */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">From</label>
          <div className="relative">
            <select
              title="Source Currency"
              name="sourceCurrency"
              value={sourceCurrency}
              onChange={(e) => setSourceCurrency(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-base outline-none transition focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">To</label>
          <div className="relative">
            <select
              name="targetCurrency"
              title="Target Currency"
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-base outline-none transition focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </div>
      </div>

      {/* API error */}
      {errors.api && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errors.api}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-purple-700 py-3.5 text-base font-semibold text-white transition hover:bg-purple-800 active:bg-purple-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Converting…" : "Convert"}
      </button>
    </form>
  );
}

function ChevronIcon() {
  return (
    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
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
