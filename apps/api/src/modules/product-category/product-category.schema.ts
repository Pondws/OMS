import { z } from "zod"
import { listQuerySchema } from "../../shard/schemas/list-query"

const productCategorySchema = {
  create: z.object({
    name: z.string().trim().min(1).max(100),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE")
  }),
  update: z.object({
    name: z.string().trim().min(1).max(100),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE")
  }),
  get: listQuerySchema.extend({
    name: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
  params: z.object({
    id: z.uuid()
  })
}

export default productCategorySchema