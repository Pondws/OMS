import { Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import { getPagination, getPaginationMeta } from "../../utils/pagination"
import { GetInventory, LOW_STOCK_THRESHOLD } from "./inventory.schema"

const inventorySelect = {
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
  // stockMovements: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
} satisfies Prisma.ProductSkuSelect

type InventoryRow = Prisma.ProductSkuGetPayload<{ select: typeof inventorySelect }>

const stockStatusOf = (stock: number) =>
  stock === 0 ? "OUT_OF_STOCK" : stock <= LOW_STOCK_THRESHOLD ? "LOW_STOCK" : "IN_STOCK"

function variantLabel(row: InventoryRow) {
  const order = new Map(row.product.options.map((o) => [o.productVariantId, o.sortOrder]))
  return [...row.values]
    .sort((a, b) => (order.get(a.variant.productVariantId) ?? 0) - (order.get(b.variant.productVariantId) ?? 0))
    .map((v) => v.variant.name)
    .join(" / ")
}

const toInventoryItem = (row: InventoryRow) => ({
 id: row.id,
  sku: row.sku,
  stock: row.stock,
  stockStatus: stockStatusOf(row.stock),
  status: row.status,
  product: {
    id: row.product.id,
    name: row.product.name,
    coverUrl: row.product.images[0]?.url ?? null,
  },
  variantLabel: variantLabel(row),
  // lastMovedAt: row.stockMovements[0]?.createdAt ?? null,
})

const stockWhere = {
  IN_STOCK: { stock: { gt: LOW_STOCK_THRESHOLD } },
  LOW_STOCK: { stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } },
  OUT_OF_STOCK: { stock: 0 },
}

const buildInventoryWhere = (q: GetInventory) => {
  return {
    product: {
      deletedAt: null,
      ...(q.categoryId && { categoryId: q.categoryId }),
    },
    // ...(q.search && {
    //   OR: [
    //     { sku: { contains: q.search, mode: "insensitive" } },
    //     { product: { name: { contains: q.search, mode: "insensitive" } } },
    //   ],
    // }),
    ...(q.stockStatus && stockWhere[q.stockStatus]), 
  }
}

export const inventoryService = {
  getAll: async (query: GetInventory) => {
    const { skip, take } = getPagination(query.page, query.limit)
    const where = buildInventoryWhere(query)

    const [data, total] = await Promise.all([
      prisma.productSku.findMany({
        where,
        select: inventorySelect,
        skip,
        take,
      }),

      prisma.productSku.count({ where }),
    ])

    return {
      data: data.map(toInventoryItem),
      meta: getPaginationMeta(query.page, query.limit, total)
    }
  }
}