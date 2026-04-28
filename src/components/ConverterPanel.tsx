"use client";

import { useState } from "react";
import CurrencyConverterForm from "@/components/CurrencyConverterForm";
import ResultCard from "@/components/ResultCard";
import ConversionStats from "@/components/ConversionStats";
import type { ConversionResult, StatsResponse } from "@/types/currency";

type Props = {
  initialStats: StatsResponse;
};

export default function ConverterPanel({ initialStats }: Props) {
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [stats, setStats] = useState<StatsResponse>(initialStats);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  async function refreshStats() {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error();
      setStats(await res.json());
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
