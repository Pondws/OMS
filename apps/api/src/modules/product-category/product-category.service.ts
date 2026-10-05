import { prisma } from "../../lib/prisma"
import productCategorySchema from "./product-category.schema"
import { CreateProductCategory } from "./product-category.type"

const productCategoryService = {
  create: (payload: CreateProductCategory) => {
    const values = productCategorySchema.create.parse(payload)
    
    return prisma.productCategory.create({
      data: values,
    })
  }
}

export default productCategoryService