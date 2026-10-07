import { prisma } from "../../lib/prisma"
import { getPagination, getPaginationMeta } from "../../utils/pagination"
import {
  CreateProductVariant,
  GetProductVariant,
  // UpdateProductCategory,
  // GetProductCategoryOptions
} from "./product-variant.type"

const productVariantService = {
  create: (payload: CreateProductVariant) => {
    const {
      name,
      status,
      variants
    } = payload

    const result = prisma.productVariant.create({
      data: {
        name,
        status,
        variants: variants
          ? {
            create: variants.map((variant, index) => (
              {
                name: variant.name,
                sortOrder: index + 1
              }
            ))
          }
          : undefined
      },
      include: {
        variants: {
          orderBy: {
            sortOrder: "asc"
          }
        }
      }
    })

    return result
  },
  getAll: async (query: GetProductVariant) => {
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
      prisma.productVariant.findMany({
        where,
        skip,
        take,
        orderBy: {
          [dateType]: "desc"
        },
        include: {
          variants: {
            orderBy: {
              sortOrder: "asc"
            }
          }
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
  getById: async (id: string) => {
    const result = await prisma.productVariant.findUnique({
      where: {
        id,
      },
      include: {
        variants: {
          orderBy: {
            sortOrder: "asc"
          }
        }
      }
    })

    return result
  },
  // getOptions: async (query: GetProductCategoryOptions) => {
  //   const { search } = query

  //   const result = await prisma.productCategory.findMany({
  //     where:  {
  //     status: "ACTIVE",
  //     ...(search
  //       ? {
  //         name: {
  //           contains: search,
  //           mode: "insensitive"
  //         }
  //       }
  //       : {}
  //     )
  //   },
  //     select: {
  //       id: true,
  //       name: true
  //     },
  //     orderBy: {
  //       name: "asc",
  //     },
  //     take: 10
  //   })

  //   return result
  // },
  // update: (id: string, payload: UpdateProductCategory) => {
  //   return prisma.productCategory.update({
  //     where: {
  //       id
  //     },
  //     data: payload
  //   })
  // },
  // delete: async (id: string) => {
  //   const result = await prisma.productCategory.delete({
  //     where: {
  //       id
  //     }
  //   })

  //   return result
  // },
}

export default productVariantService