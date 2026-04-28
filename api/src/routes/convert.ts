import { Router } from "express";
import { conversionRequestSchema } from "../lib/validation";
import { performConversion } from "../lib/conversion";
import { toErrorResponse } from "../lib/errors";

export const convertRouter = Router();

convertRouter.post("/", async (req, res) => {
  const parsed = conversionRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Invalid conversion input",
      details: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });
    return;
  }

  try {
    const result = await performConversion(
      parsed.data.amount,
      parsed.data.sourceCurrency,
      parsed.data.targetCurrency
    );
    res.json(result);
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});
