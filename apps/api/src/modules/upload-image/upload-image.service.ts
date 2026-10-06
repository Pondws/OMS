import { supabase } from "../../lib/supabase"
import { ImageFolderType } from './upload-image.type'

export const uploadImage = async (
  file: Express.Multer.File,
  folder: ImageFolderType // folder in supabase storage /images/{folder}/{file}
) => {
  const filePath = `${folder}/${crypto.randomUUID}-${file.originalname}`

  const { data, error } = await supabase.storage
    .from("images")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    })

  if (error) {
    throw error
  }

  const { data: publicUrl } = supabase.storage
    .from("images")
    .getPublicUrl(data.path)

  return {
    path: data.path,
    url: publicUrl
  }
}