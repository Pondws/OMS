import { z } from "zod"

const productCategorySchema = {
  create: z.object({
    name: z.string().trim().min(1).max(100),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE")
  })
}

export default productCategorySchema