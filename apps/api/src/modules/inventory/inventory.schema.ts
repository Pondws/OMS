import { z } from "zod"
import { listQuerySchema } from "../../shard/schemas/list-query"

export const LOW_STOCK_THRESHOLD = 5 
export const STOCK_STATUSES = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] as const

export const getInventoryQuerySchema = listQuerySchema.extend({
  categoryId: z.uuid().optional(),
  stockStatus: z.enum(STOCK_STATUSES).optional(),
})

export type GetInventory = z.infer<typeof getInventoryQuerySchema>