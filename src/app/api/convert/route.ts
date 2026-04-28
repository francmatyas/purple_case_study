import { NextRequest, NextResponse } from "next/server";
import { conversionRequestSchema } from "@/lib/validation";
import { performConversion } from "@/lib/conversion";
import { toErrorResponse } from "@/lib/errors";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = conversionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Invalid conversion input",
        details: parsed.error.issues.map((i) => ({
          path: i.path,
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }

  const { amount, sourceCurrency, targetCurrency } = parsed.data;

  try {
    const result = await performConversion(amount, sourceCurrency, targetCurrency);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
