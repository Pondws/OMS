/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `ProductSku` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProductSku" ADD COLUMN     "compareAtPrice" DECIMAL(12,2),
ADD COLUMN     "heightCm" DECIMAL(6,1),
ADD COLUMN     "lengthCm" DECIMAL(6,1),
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weightGrams" INTEGER,
ADD COLUMN     "widthCm" DECIMAL(6,1);

-- CreateTable
CREATE TABLE "ProductSkuValue" (
    "skuId" UUID NOT NULL,
    "variantId" UUID NOT NULL,

    CONSTRAINT "ProductSkuValue_pkey" PRIMARY KEY ("skuId","variantId")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "productId" UUID NOT NULL,
    "variantId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductSkuValue_variantId_idx" ON "ProductSkuValue"("variantId");

-- CreateIndex
CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductImage_variantId_idx" ON "ProductImage"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSku_sku_key" ON "ProductSku"("sku");

-- AddForeignKey
ALTER TABLE "ProductSkuValue" ADD CONSTRAINT "ProductSkuValue_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "ProductSku"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSkuValue" ADD CONSTRAINT "ProductSkuValue_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
