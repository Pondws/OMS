import { z } from "zod"
import productVariantSchema from "./product-variant.schema"

export type CreateProductVariant = z.input<
  typeof productVariantSchema.create
>

// export type UpdateProductCategory = z.input<
//   typeof productCategorySchema.update
// >

export type GetProductVariant = z.infer<
  typeof productVariantSchema.get
>

// export type GetProductCategoryOptions = z.infer<
//   typeof productCategorySchema.getOptions
// >