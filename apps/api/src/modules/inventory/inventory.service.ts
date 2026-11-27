import { StockMovementReason } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import { getPagination, getPaginationMeta } from "../../utils/pagination"
import { AdjustStock, GetInventory, LOW_STOCK_THRESHOLD } from "./inventory.schema"
import { inventoryDetailSelect, InventoryRow, inventorySelect, movementSelect } from "./inventory.select"

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
  },
  getById: async (id: string) => {
    const data = await prisma.productSku.findFirst({
      where: {
        id,
        product: { deletedAt: null }
      },
      select: inventoryDetailSelect
    })

    if (!data) throw new Error("ไม่พบ SKU นี้")

    return {
      ...toInventoryItem(data),
      recentMovement: data.stockMovements,
      movementCount: data._count.stockMovements,
    }
  },
  adjust: async (userId: string, body: AdjustStock) => {
    return prisma.$transaction(async (tx) => {
      const [sku] = await tx.$queryRaw<{ stock: number; deletedAt: Date | null }[]>`
        SELECT s."stock", p."deletedAt"
        FROM "ProductSku" s
        JOIN "Product" p ON p."id" = s."productId"
        WHERE s."id" = ${body.skuId}::uuid
        FOR UPDATE OF s
      `
      if (!sku || sku.deletedAt) throw new Error("ไม่พบ SKU นี้")

      const changes = {
        RESTOCK: { delta: body.quantity, reason: "RESTOCK" },
        DAMAGED: { delta: -body.quantity, reason: "DAMAGED" },
        // นับได้: ส่วนต่างจากสต็อกในฐานข้อมูล ไม่ใช้ตัวเลขที่หน้าจอเห็น (อาจเก่าแล้ว)
        COUNT: { delta: body.quantity - sku.stock, reason: "COUNT_CORRECTION" },
      } satisfies Record<AdjustStock["type"], { delta: number; reason: StockMovementReason }>

      const { delta, reason } = changes[body.type]
      const stockAfter = sku.stock + delta

      if (delta === 0) throw new Error("จำนวนที่นับได้ตรงกับระบบอยู่แล้ว ไม่ต้องปรับ")
      if (stockAfter < 0) throw new Error(`สต็อกมีแค่ ${sku.stock} ชิ้น ลดได้ไม่เกินนี้`)

      await tx.productSku.update({
        where: { id: body.skuId },
        data: { stock: stockAfter },
      })
      const movement = await tx.stockMovement.create({
        data: {
          skuId: body.skuId,
          delta,
          stockAfter,
          reason,
          note: body.note || null,
          createdById: userId,
        },
        select: movementSelect,
      })

      return {
        skuId: body.skuId,
        stock: stockAfter,
        stockStatus: stockStatusOf(stockAfter),
        movement
      }
    })
  }
}