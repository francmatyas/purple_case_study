"use client";

import { useState } from "react";
import { getApiErrorMessage, parseJsonSafely } from "@/lib/http";
import CurrencyConverterForm from "@/components/CurrencyConverterForm";
import ResultCard from "@/components/ResultCard";
import ConversionStats from "@/components/ConversionStats";
import { statsResponseSchema } from "@/types/currency";
import type { ConversionResult, StatsResponse } from "@/types/currency";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Props = {
  initialStats: StatsResponse | null;
};

export default function ConverterPanel({ initialStats }: Props) {
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(initialStats);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  async function refreshStats() {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await fetch(`${API_URL}/stats`);
      const data = await parseJsonSafely(res);
      if (!res.ok) {
        setStatsError(getApiErrorMessage(res, data, "Unable to refresh statistics."));
        return;
      }
      const parsed = statsResponseSchema.safeParse(data);
      if (!parsed.success) {
        setStatsError("Statistics response format is invalid.");
        return;
      }
      setStats(parsed.data);
    } catch {
      setStatsError("Unable to refresh statistics.");
    } finally {
      setStatsLoading(false);
    }
  }

  async function handleConversionSuccess(r: ConversionResult) {
    setResult(r);
    await refreshStats();
  }

  return (
    <div className="mx-auto flex max-w-[700px] flex-col px-5 pt-14 pb-14 sm:items-center sm:pt-20">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 sm:text-center sm:text-4xl">
        Purple currency converter
      </h1>

      <CurrencyConverterForm onSuccess={handleConversionSuccess} />

      {result && <ResultCard result={result} />}

      <div className="mt-10 w-full">
        <ConversionStats
          stats={stats}
          loading={statsLoading}
          error={statsError}
        />
      </div>
    </div>
  );
}
