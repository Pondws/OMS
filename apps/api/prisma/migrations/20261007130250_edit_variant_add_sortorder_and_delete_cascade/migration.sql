-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_productVariantId_fkey";

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
