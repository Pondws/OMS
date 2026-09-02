import { prisma } from "../../lib/prisma"
import productTagSchema from "./product-tag.schema"
import {
  CreateProductTag,
  UpdateProductTag
} from "./product-tag.type"

const productTagService = {
  create: (data: CreateProductTag) => {
    const validated = productTagSchema.create.parse(data)

    return prisma.productTag.create({
      data: validated
    })
  },
  findAll: () => {
    return prisma.productTag.findMany()
  },
  findById: (id: string) => {
    return prisma.productTag.findUnique({
      where: {
        id,
      }
    })
  },
  update: (id: string, data: UpdateProductTag) => {
    const validated = productTagSchema.update.parse(data)

    return prisma.productTag.update({
      where: {
        id,
      },
      data: validated
    })
  },
  delete: (id: string) => {
    return prisma.productTag.delete({
      where: {
        id
      }
    })
  }
}

export default productTagService