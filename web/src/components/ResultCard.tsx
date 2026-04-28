import type { ConversionResult } from "@/types/currency";

type Props = {
  result: ConversionResult;
};

export default function ResultCard({ result }: Props) {
  const formatted = new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(result.convertedAmount);

  return (
    <div className="mt-6 w-full max-w-sm self-center rounded-xl border border-gray-300">
      <div className="px-6 py-5">
        <p className="text-sm text-gray-500">Result</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
          {formatted}&nbsp;{result.targetCurrency}
        </p>
      </div>

      <hr className="border-gray-300 mx-6" />

      <div className="px-6 py-5">
        <p className="text-sm text-gray-500">Number of calculations made</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{result.calculationSteps}</p>
      </div>
    </div>
  );
}
