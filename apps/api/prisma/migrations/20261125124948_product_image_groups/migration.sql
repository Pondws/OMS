/*
  Warnings:

  - You are about to drop the column `variantId` on the `ProductImage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `ProductImage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId,groupId,sortOrder]` on the table `ProductImage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_variantId_fkey";

-- DropIndex
DROP INDEX "ProductImage_productId_sortOrder_idx";

-- DropIndex
DROP INDEX "ProductImage_variantId_idx";

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "variantId",
ADD COLUMN     "groupId" UUID;

-- AlterTable
ALTER TABLE "ProductOption" ADD COLUMN     "showImage" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ProductImageGroup" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,

    CONSTRAINT "ProductImageGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImageGroupValue" (
    "groupId" UUID NOT NULL,
    "variantId" UUID NOT NULL,

    CONSTRAINT "ProductImageGroupValue_pkey" PRIMARY KEY ("groupId","variantId")
);

-- CreateIndex
CREATE INDEX "ProductImageGroup_productId_idx" ON "ProductImageGroup"("productId");

-- CreateIndex
CREATE INDEX "ProductImageGroupValue_variantId_idx" ON "ProductImageGroupValue"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_url_key" ON "ProductImage"("url");

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_productId_groupId_sortOrder_key" ON "ProductImage"("productId", "groupId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ProductImageGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImageGroup" ADD CONSTRAINT "ProductImageGroup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImageGroupValue" ADD CONSTRAINT "ProductImageGroupValue_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ProductImageGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImageGroupValue" ADD CONSTRAINT "ProductImageGroupValue_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
