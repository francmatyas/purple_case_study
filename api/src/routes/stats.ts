import { Router } from "express";
import { getStats } from "../lib/conversion";
import { toErrorResponse } from "../lib/errors";

export const statsRouter = Router();

statsRouter.get("/", async (_req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    res.status(status).json(body);
  }
});
