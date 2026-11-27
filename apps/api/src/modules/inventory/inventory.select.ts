import { Prisma } from "../../../generated/prisma/client"

export const inventorySelect = {
  id: true,
  sku: true,
  stock: true,
  status: true,
  product: {
    select: {
      id: true,
      name: true,
      images: { where: { groupId: null }, orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
      options: { select: { productVariantId: true, sortOrder: true } },
    },
  },
  values: { select: { variant: { select: { name: true, productVariantId: true } } } },
  stockMovements: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
} satisfies Prisma.ProductSkuSelect

export const inventoryDetailSelect = {
  ...inventorySelect,
  stockMovements: {
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 3,
    select: {
      id: true,
      delta: true,
      stockAfter: true,
      reason: true,
      note: true,
      createdById: true,
      createdAt: true,
    },
  },
  _count: { select: { stockMovements: true } },
} satisfies Prisma.ProductSkuSelect

export type InventoryRow = Prisma.ProductSkuGetPayload<{ select: typeof inventorySelect }>
export type InventoryDetailRow = Prisma.ProductSkuGetPayload<{ select: typeof inventoryDetailSelect }>