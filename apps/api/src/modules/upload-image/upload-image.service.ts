import { randomUUID } from "crypto"
import { supabase } from "../../lib/supabase"

const BUCKET = "images"

export const uploadImageService = async (
  files: Express.Multer.File[],
  folder: string
) => {
  const results = []

  for (const file of files) {
    const ext = file.originalname.split(".").pop()
    const path = `${folder}/${randomUUID()}.${ext}`

    console.log("SUPABASE_URL =", JSON.stringify(process.env.SUPABASE_URL))
    console.log("path =", path)

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file.buffer, { contentType: file.mimetype })

    if (error) throw error

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    results.push({ url: data.publicUrl, path })
  }

  return results
}