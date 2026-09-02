import z from 'zod'

const productTagSchema = {
  create: z.object({
    name: z.string().max(100)
  }),
  update: z.object({
    name: z.string().max(100)
  })
}

export default productTagSchema