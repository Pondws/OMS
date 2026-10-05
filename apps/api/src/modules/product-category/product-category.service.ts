import { prisma } from "../../lib/prisma"
import { getPagination, getPaginationMeta } from "../../utils/pagination"
import productCategorySchema from "./product-category.schema"
import { CreateProductCategory, GetProductCategory } from "./product-category.type"

const productCategoryService = {
  create: (payload: CreateProductCategory) => {
    return prisma.productCategory.create({
      data: payload,
    })
  },
  getAll: async (query: GetProductCategory) => {
    const {
      page,
      limit,
      dateType,
      startDate,
      endDate,
      name,
      status
    } = query

    const { skip, take } = getPagination(page, limit)

    const where = {
      ...(name && {
        name: {
          contains: name,
          mode: "insensitive" as const
        }
      }),

      ...(status && {
        status
      }),

      ...(startDate && endDate
        ? {
          [dateType]: {
            gte: startDate,
            lte: endDate
          }
        }
        : {}
      )
    }

    const [data, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        skip,
        take,
        orderBy: {
          [dateType]: "desc"
        }
      }),

      prisma.productCategory.count({
        where
      })
    ])

    return {
      data,
      meta: getPaginationMeta(page, limit, total)
    }
  },
  getById:  async (id: string) => {
    const result = await prisma.productCategory.findUnique({
      where: {
        id
      }
    })

    return result
  }
}

export default productCategoryService