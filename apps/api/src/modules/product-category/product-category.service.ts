import { prisma } from "../../lib/prisma"
import productCategorySchema from "./product-category.schema"
import { CreateProductCategory } from "./product-category.type"

const productCategoryService = {
  create: (payload: CreateProductCategory) => {
    const data = productCategorySchema.create.parse(payload)
    
    return prisma.productCategory.create({
      data
    })
  }
}

export default productCategoryService