-- CreateTable
CREATE TABLE "Conversion" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(18,6) NOT NULL,
    "sourceCurrency" TEXT NOT NULL,
    "targetCurrency" TEXT NOT NULL,
    "exchangeRate" DECIMAL(18,8) NOT NULL,
    "convertedAmount" DECIMAL(18,6) NOT NULL,
    "convertedAmountUsd" DECIMAL(18,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRateCache" (
    "id" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "rates" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRateCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversion_targetCurrency_idx" ON "Conversion"("targetCurrency");

-- CreateIndex
CREATE INDEX "Conversion_createdAt_idx" ON "Conversion"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRateCache_baseCurrency_key" ON "ExchangeRateCache"("baseCurrency");
