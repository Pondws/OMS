import { prisma } from "../../lib/prisma"
import { ProductBody } from "./product.schema"

const productTagService = {
  create: async (body: ProductBody) => {
    return prisma.$transaction(async (tx) => {
      const categoryId = prisma.productCategory.findUnique({
        where: { id: body.categoryId },
        select: { id: true }
      })
      if (!categoryId) throw new Error("ไม่พบหมวดหมู่นี้")

      const tagIds = [...new Set(body.tagIds)]
      if (tagIds.length) {
        const found = await tx.productTag.count({ where: { id: { in: tagIds } } })
        if (found !== tagIds.length) throw new Error("มีแท็กที่ไม่มีอยู่จริง")
      }

      const productVariantIds = body.options.map((o) => o.productVariantId)
      const productVariants = productVariantIds.length
        ? await tx.productVariant.findMany({
          where: { id: { in: productVariantIds }, status: "ACTIVE" },
          select: { id: true, variants: { select: { id: true } } },
        })
        : []

      if (productVariants.length !== productVariantIds.length) {
        throw new Error("มีตัวเลือกสินค้าที่ไม่มีอยู่จริง หรือถูกปิดใช้งาน")
      }

      const productVariantIdOf = new Map(
        productVariants.flatMap((pv) => pv.variants.map((v) => [v.id, pv.id])),
      )

      body.skus.forEach((sku) => {
        const skuProductVariantIds = sku.optionValueIds.map((id) => productVariantIdOf.get(id))
        if (skuProductVariantIds.some((id) => !id)) {
          throw new Error("มีค่าที่ไม่ได้อยู่ในตัวเลือกของสินค้านี้")
        }
        if (new Set(skuProductVariantIds).size !== productVariantIds.length) {
          throw new Error("ต้องเลือกตัวเลือกละ 1 ค่า")
        }
      })

      const used = new Set(body.skus.flatMap((s) => s.optionValueIds));
      body.images.forEach((img) => {
        if (img.optionValueId && !used.has(img.optionValueId)) {
          throw new Error("ผูกกับค่าที่ไม่มี SKU ใช้");
        }
      })

      return tx.product.create({
        data: {
          name: body.name,
          slug: body.slug,
          description: body.description ?? null,
          status: body.status,
          categoryId: body.categoryId,
          tags: { connect: tagIds.map((id) => ({ id })) },
          options: {
            create: body.options.map((o, index) => ({
              productVariantId: o.productVariantId,
              sortOrder: index,
            })),
          },
          skus: {
            create: body.skus.map((s) => ({
              sku: s.sku,
              price: s.price,
              compareAtPrice: s.compareAtPrice ?? null,
              stock: s.stock,
              status: s.status,
              weightGrams: s.weightGrams ?? null,
              lengthCm: s.lengthCm ?? null,
              widthCm: s.widthCm ?? null,
              heightCm: s.heightCm ?? null,
              values: { create: s.optionValueIds.map((variantId) => ({ variantId })) },
            })),
          },
          images: {
            create: body.images.map((img, index) => ({
              url: img.url,
              alt: img.alt ?? null,
              sortOrder: index,
              variantId: img.optionValueId ?? null,
            })),
          },
        },
        include: {
          category: { select: { id: true, name: true } },
          tags: { select: { id: true, name: true } },
          options: { orderBy: { sortOrder: "asc" } },
          skus: { include: { values: { select: { variantId: true } } } },
          images: { orderBy: { sortOrder: "asc" } },
        },
      })
    })
  },
  getAll: async () => { },
  getById: async () => { },
  getOptions: async () => { },
  update: async () => { },
  delete: async () => { },
}

export default productTagService