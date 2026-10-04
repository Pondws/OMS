import { prisma } from "../../lib/prisma"
import productTagSchema from "./product-tag.schema"
import {
  CreateProductTag,
  UpdateProductTag
} from "./product-tag.type"
import z from "zod"

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  dateType: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  // startDate: z.coerce.date().optional(),
  // endDate: z.coerce.date().optional(),
})

const productTagService = {
  create: (data: CreateProductTag) => {
    const validated = productTagSchema.create.parse(data)

    return prisma.productTag.create({
      data: validated
    })
  },
  findAll: async (query: any) => {
    const {
      page,
      limit,
      dateType,
      // startDate,
      // endDate,
    } = paginationSchema.parse(query)

    const skip = (page - 1) * limit

    // const filter = {
    //   [dateType]: {
    //     gte: startDate,
    //     lte: endDate
    //   }
    // }

    const [data, total] = await Promise.all([
      prisma.productTag.findMany({
        // where: filter,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),

      prisma.productTag.count()
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages
      }
    }
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