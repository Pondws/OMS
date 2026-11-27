-- CreateEnum
CREATE TYPE "StockMovementReason" AS ENUM ('INITIAL', 'RESTOCK', 'SALE', 'RETURN', 'DAMAGED', 'COUNT_CORRECTION');

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" UUID NOT NULL,
    "skuId" UUID NOT NULL,
    "delta" INTEGER NOT NULL,
    "stockAfter" INTEGER NOT NULL,
    "reason" "StockMovementReason" NOT NULL,
    "note" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockMovement_skuId_createdAt_idx" ON "StockMovement"("skuId", "createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "ProductSku"("id") ON DELETE CASCADE ON UPDATE CASCADE;
