import { Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import { ProductBody } from "./product.schema"

const productInclude = {
  category: { select: { id: true, name: true } },
  tags: { select: { id: true, name: true } },
  options: { orderBy: { sortOrder: "asc" } },
  skus: { include: { values: { select: { variantId: true } } } },
  images: { where: { groupId: null }, orderBy: { sortOrder: "asc" } },   // เฉพาะรูปหลัก
  imageGroups: {
    include: {
      values: { select: { variantId: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  },
} satisfies Prisma.ProductInclude

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>

const toImage = (img: { id: string; url: string; alt: string | null; sortOrder: number }) => ({
  id: img.id,
  url: img.url,
  alt: img.alt,
  sortOrder: img.sortOrder,
})

const toProductResponse = (p: ProductWithRelations) => ({
  ...p,
  images: p.images.map(toImage),
  imageGroups: p.imageGroups.map((g) => ({
    id: g.id,
    variantIds: g.values.map((v) => v.variantId),
    images: g.images.map(toImage),
  })),
  skus: p.skus.map(({ values, ...s }) => ({
    ...s,
    variantIds: values.map((v) => v.variantId),
  })),
})

export const assertReferences = async (body: ProductBody) => {
  const categoryId = prisma.productCategory.findUnique({
    where: { id: body.categoryId },
    select: { id: true }
  })
  if (!categoryId) throw new Error("ไม่พบหมวดหมู่นี้")

  if (body.tagIds.length) {
    const found = await prisma.productTag.count({
      where: { id: { in: body.tagIds } }
    })
    if (found !== body.tagIds.length) throw new Error("มีแท็กที่ไม่มีอยู่จริง")
  }

  if (body.options.length) {
    const productVariants = await prisma.productVariant.findMany({
      where: { id: { in: body.options.map((o) => o.productVariantId) }, status: "ACTIVE" },
      select: { id: true, variants: { select: { id: true } } },
    })

    const valuesOf = new Map(
      productVariants.map((pv) => [pv.id, new Set(pv.variants.map((v) => v.id))]),
    )

    for (const o of body.options) {
      const allowed = valuesOf.get(o.productVariantId)
      if (!allowed) throw new Error("มีตัวเลือกสินค้าที่ไม่มีอยู่จริง หรือถูกปิดใช้งาน")
      if (!o.variantIds.every((id) => allowed.has(id))) {
        throw new Error("มีค่าที่ไม่ได้อยู่ในตัวเลือกนี้")
      }
    }
  }
}

const productService = {
  create: async (body: ProductBody) => {
    await assertReferences(body)

    const groups = body.imageGroups.filter((g) => g.images.length > 0)

    const urls = [...body.images, ...groups.flatMap((g) => g.images)].map((i) => i.url)
    const taken = await prisma.productImage.count({ where: { url: { in: urls } } })
    if (taken > 0) throw new Error("มีรูปที่ถูกใช้กับสินค้าอื่นแล้ว กรุณาอัปโหลดใหม่")

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: body.name,
          slug: body.slug,
          description: body.description ?? null,
          status: body.status,
          categoryId: body.categoryId,
          tags: { connect: body.tagIds.map((id) => ({ id })) },
          options: {
            create: body.options.map((o, index) => ({
              productVariantId: o.productVariantId,
              showImage: o.showImage,
              sortOrder: index,
            })),
          },
          skus: {
            create: body.skus.map((s) => ({
              sku: s.sku,
              price: s.price,
              compareAtPrice: s.compareAtPrice ?? null,
              stock: s.initialStock,
              status: s.status,
              weightGrams: s.weightGrams ?? null,
              lengthCm: s.lengthCm ?? null,
              widthCm: s.widthCm ?? null,
              heightCm: s.heightCm ?? null,
              values: { create: s.variantIds.map((variantId) => ({ variantId })) },
            })),
          },
          images: {
            create: body.images.map((img) => ({
              url: img.url,
              alt: img.alt ?? null,
              sortOrder: img.sortOrder,
            })),
          },
        },
        select: { id: true }
      })

      for (const g of groups) {
        await tx.productImageGroup.create({
          data: {
            productId: created.id,
            values: { create: g.variantIds.map((variantId) => ({ variantId })) },
            images: {
              create: g.images.map((img) => ({
                productId: created.id,
                url: img.url,
                alt: img.alt ?? null,
                sortOrder: img.sortOrder,
              })),
            },
          },
        })
      }

      return tx.product.findUniqueOrThrow({
        where: { id: created.id },
        include: productInclude,
      })
    })

    return toProductResponse(product)
  },
  getAll: async () => { },
  getById: async () => { },
  getOptions: async () => { },
  update: async () => { },
  delete: async () => { },
}

export default productService