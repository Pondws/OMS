import { z } from "zod"

export const idParamsSchema = z.object({ id: z.uuid("id ไม่ถูกต้อง") })
export type IdParams = z.infer<typeof idParamsSchema>