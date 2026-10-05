import { z } from "zod"
import productCategorySchema from "./product-category.schema"

export type CreateProductCategory = z.input<
  typeof productCategorySchema.create
>

export type GetProductCategory = z.infer<
  typeof productCategorySchema.get
>