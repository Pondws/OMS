import z from 'zod'

const productTagSchema = {
  create: z.object({
    name: z.string().max(100),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional
  }),
  update: z.object({
    name: z.string().max(100),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional
  })
}

export default productTagSchema