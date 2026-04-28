import ConverterPanel from "@/components/ConverterPanel";
import { getStats } from "@/lib/conversion";

export default async function Home() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[#f8f5ff]">
      {/* Header */}
      <header className="border-b border-purple-100 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-700">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 7v11h5v-5h4v5h5V7L10 2z" fill="white" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">Currency Converter</span>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Convert Currency</h1>
          <p className="mt-1 text-gray-500">Live exchange rates, updated hourly.</p>
        </div>

        <ConverterPanel initialStats={stats} />
      </main>
    </div>
  );
}
