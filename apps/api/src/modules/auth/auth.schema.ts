import { z } from "zod"

const authSchema = {
  register: z.object({
    email: z.string(),
    password: z.string(),
    name: z.string()
  }),
  login: z.object({
    email: z.string(),
    password: z.string()
  }),
  refresh: z.object({
    refreshToken: z.string().min(1)
  })
}

export default authSchema