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

    const filter = {
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
        where: filter,
        skip,
        take,
        orderBy: {
          [dateType]: "desc"
        }
      }),

      prisma.productCategory.count({
        where: filter
      })
    ])

    return {
      data,
      meta: getPaginationMeta(page, limit, total)
    }
  }
}

export default productCategoryService