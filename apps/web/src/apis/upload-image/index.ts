import { axios } from 'utils'

export const uploadImageApi = async (folder: string, files: File[]) => {
  const form = new FormData()
  form.append("folder", folder)
  files.forEach((file) => form.append("images", file))

  const res = await axios.post(
    '/upload-image',
    form,
    { headers: { "Content-Type": "multipart/form-data" }, }
  )
  return res.data.images
} 