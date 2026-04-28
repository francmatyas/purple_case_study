/*
  Warnings:

  - You are about to drop the `Conversion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExchangeRateCache` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Conversion";

-- DropTable
DROP TABLE "ExchangeRateCache";

-- CreateTable
CREATE TABLE "conversions" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(18,6) NOT NULL,
    "source_currency" TEXT NOT NULL,
    "target_currency" TEXT NOT NULL,
    "exchange_rate" DECIMAL(18,8) NOT NULL,
    "converted_amount" DECIMAL(18,6) NOT NULL,
    "converted_amount_usd" DECIMAL(18,6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rate_cache" (
    "id" TEXT NOT NULL,
    "base_currency" TEXT NOT NULL,
    "rates" JSONB NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_rate_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversions_target_currency_idx" ON "conversions"("target_currency");

-- CreateIndex
CREATE INDEX "conversions_created_at_idx" ON "conversions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rate_cache_base_currency_key" ON "exchange_rate_cache"("base_currency");
