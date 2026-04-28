import ConverterPanel from "@/components/ConverterPanel";
import { statsResponseSchema } from "@/types/currency";
import type { StatsResponse } from "@/types/currency";

async function fetchInitialStats(): Promise<StatsResponse | null> {
  try {
    const res = await fetch(`${process.env.API_URL ?? "http://localhost:3001"}/stats`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const parsed = statsResponseSchema.safeParse(data);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const initialStats = await fetchInitialStats();
  return (
    <main className="min-h-screen bg-[#E8E8EE]">
      <ConverterPanel initialStats={initialStats} />
    </main>
  );
}
