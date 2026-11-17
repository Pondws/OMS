import { z } from "zod"
import productTagSchema from "./product.schema"

export type ProductTagParams = {
  id: string
}

export type CreateProductTag = z.infer<
  typeof productTagSchema.create
>

export type UpdateProductTag = z.infer<
  typeof productTagSchema.update
>