import ConverterPanel from "@/components/ConverterPanel";
import { getStats } from "@/lib/conversion";

export default async function Home() {
  const stats = await getStats();
  return (
    <main className="min-h-screen bg-[#E8E8EE]">
      <ConverterPanel initialStats={stats} />
    </main>
  );
}
