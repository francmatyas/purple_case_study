import path from "node:path";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { convertRouter } from "./routes/convert";
import { statsRouter } from "./routes/stats";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const app = express();

app.use(cors({ origin: process.env.WEB_URL ?? "http://localhost:3000" }));
app.use(express.json());

app.use("/convert", convertRouter);
app.use("/stats", statsRouter);

const port = parseInt(process.env.API_PORT ?? "3001", 10);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
