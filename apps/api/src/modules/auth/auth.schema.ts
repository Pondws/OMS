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
  })
}

export default authSchema

export type User = {
  id: string
  email: string
  password: string
  name?: string
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'
  createdAt?: Date
  updatedAt?: Date
}