import { NextResponse } from "next/server";
import { getStats } from "@/lib/conversion";
import { toErrorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json(stats, { status: 200 });
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
