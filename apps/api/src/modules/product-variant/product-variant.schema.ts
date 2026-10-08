import { z } from "zod"
// import { listQuerySchema } from "../../shard/schemas/list-query"

const productVariantSchema = {
  create: z.object({
    name: z.string().trim().min(1).max(100),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
    options: z.array(
      z.object({
        name: z.string().trim().min(1).max(100)
      })
    ).min(1)
  }),
  // update: z.object({
  //   name: z.string().trim().min(1).max(100),
  //   status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE")
  // }),
  // get: listQuerySchema.extend({
  //   name: z.string().optional(),
  //   status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  // }),
  // params: z.object({
  //   id: z.uuid()
  // }),
  // getOptions: z.object({
  //   search: z.string().trim().optional(),
  // }),
}

export default productVariantSchema