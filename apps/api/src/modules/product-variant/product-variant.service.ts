import { prisma } from "../../lib/prisma"
import { getPagination, getPaginationMeta } from "../../utils/pagination"
import {
  CreateProductVariant,
  GetProductVariant,
  // UpdateProductCategory,
  GetProductVariantOptions
} from "./product-variant.type"

const productVariantService = {
  create: (payload: CreateProductVariant) => {
    const {
      name,
      status,
      options
    } = payload

    const result = prisma.productVariant.create({
      data: {
        name,
        status,
        variants: options
          ? {
            create: options.map((variant, index) => (
              {
                name: variant.name,
                colorHex: variant.colorHex || null,
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
        }
      }),

      prisma.productVariant.count({
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
  getOptions: async (query: GetProductVariantOptions) => {
    const { search } = query

    const options = await prisma.productVariant.findMany({
      where: {
        status: "ACTIVE",
        ...(search
          ? {
            name: {
              contains: search,
              mode: "insensitive"
            }
          }
          : {}
        )
      },
      select: {
        id: true,
        name: true,
        variants: {
          select: {
            id: true,
            name: true,
            colorHex: true
          },
          orderBy: { sortOrder: "asc" }
        }
      },
      orderBy: { name: "asc", },
      take: 10
    })

    const result = options.map((item) => ({
      value: item.id,
      label: item.name,
      data: item
    }))

    return result
  },
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