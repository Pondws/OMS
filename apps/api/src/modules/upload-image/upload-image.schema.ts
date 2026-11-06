import { z } from "zod"

export const UPLOAD_FOLDERS = [
  "products",
  "product-categories",
  "avatars"
] as const

const uploadImageSchema = {
  body: z.object({
    folder: z.enum(UPLOAD_FOLDERS),
  }),
}

export default uploadImageSchema