import type { StatsResponse } from "@/types/currency";

type Props = {
  stats: StatsResponse | null;
  loading: boolean;
  error: string | null;
};

export default function ConversionStats({ stats, loading, error }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-800">Conversion Statistics</h2>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <SpinnerIcon />
          Loading statistics…
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {stats && !loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <StatCard
            label="Total Conversions"
            value={stats.totalConversions.toLocaleString()}
          />
          <StatCard
            label="Most Popular Target"
            value={stats.mostFrequentlyUsedTargetCurrency ?? "—"}
          />
          <StatCard
            label="Total Volume (USD)"
            value={
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 2,
              }).format(stats.totalConvertedAmount.amount)
            }
            sublabel="Total converted into USD"
          />
        </div>
      )}

      {!stats && !loading && !error && (
        <p className="text-sm text-gray-400">No conversions yet.</p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sublabel && <p className="mt-0.5 text-xs text-gray-400">{sublabel}</p>}
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-purple-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
