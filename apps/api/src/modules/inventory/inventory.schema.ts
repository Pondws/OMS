import { z } from "zod"
import { listQuerySchema } from "../../shard/schemas/list-query"

export const LOW_STOCK_THRESHOLD = 5
export const STOCK_STATUSES = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] as const

export const getInventoryQuerySchema = listQuerySchema.extend({
  categoryId: z.uuid().optional(),
  stockStatus: z.enum(STOCK_STATUSES).optional(),
})

export const adjustmentStock = z.object({
  skuId: z.uuid(),
  type: z.enum(["RESTOCK", "DAMAGED", "COUNT"]),
  quantity: z.number().int().min(0).max(1_000_000),
  note: z.string().trim().max(500).optional(),
}).refine((v) => v.type === "COUNT" || v.quantity > 0, {
  path: ["quantity"],
  message: "จำนวนต้องมากกว่า 0",
})

export type GetInventory = z.infer<typeof getInventoryQuerySchema>
export type AdjustStock  = z.infer<typeof adjustmentStock>