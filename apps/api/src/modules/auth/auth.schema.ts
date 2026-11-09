import { z } from "zod"

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "รูปแบบอีเมลไม่ถูกต้อง" }))

const authSchema = {
  register: z.object({
    email: emailSchema,
    password: z.string().min(8).max(72),
    name: z.string().trim().min(1).max(100),
  }),
  login: z.object({
    email: emailSchema,
    password:  z.string().min(1).max(72)
  }),
  refresh: z.object({
    refreshToken: z.string().min(1)
  })
}

export default authSchema