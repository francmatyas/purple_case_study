"use client";

import { useState } from "react";
import CurrencyConverterForm from "@/components/CurrencyConverterForm";
import ConversionResult from "@/components/ConversionResult";
import ConversionStats from "@/components/ConversionStats";
import type { ConversionResult as ConversionResultType, StatsResponse } from "@/types/currency";

type Props = {
  initialStats: StatsResponse;
};

export default function ConverterPanel({ initialStats }: Props) {
  const [result, setResult] = useState<ConversionResultType | null>(null);
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

  function handleConversionSuccess(r: ConversionResultType) {
    setResult(r);
    refreshStats();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Converter panel */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-800">Exchange</h2>
          <CurrencyConverterForm onSuccess={handleConversionSuccess} />
          {result && <ConversionResult result={result} />}
        </div>
      </div>

      {/* Stats panel */}
      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <ConversionStats
            stats={stats}
            loading={statsLoading}
            error={statsError}
          />
        </div>
      </div>
    </div>
  );
}
