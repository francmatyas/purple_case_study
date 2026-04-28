import type { ConversionResult as ConversionResultType } from "@/types/currency";

type Props = {
  result: ConversionResultType;
};

export default function ConversionResult({ result }: Props) {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

  return (
    <div className="mt-5 rounded-xl border border-purple-100 bg-purple-50 px-5 py-5">
      <p className="text-xs font-medium uppercase tracking-wider text-purple-400">Result</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-purple-800">
          {formatted.format(result.convertedAmount)}
        </span>
        <span className="text-lg font-semibold text-purple-600">{result.targetCurrency}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
        <span>
          {formatted.format(result.amount)} {result.sourceCurrency}
        </span>
        <span className="text-gray-300">·</span>
        <span>
          1 {result.sourceCurrency} = {result.exchangeRate.toFixed(6)} {result.targetCurrency}
        </span>
      </div>
      <p className="mt-2 text-xs text-gray-400">
        {new Date(result.createdAt).toLocaleString()}
      </p>
    </div>
  );
}
