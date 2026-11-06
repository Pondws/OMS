import { asyncHandler } from "../../middlewares/async-handler"
import uploadImageSchema from "./upload-image.schema"
import { uploadImageService } from "./upload-image.service"

export const uploadImageController = asyncHandler(async (req, res) => {
  const { folder } = uploadImageSchema.body.parse(req.body)

  const files = req.files as Express.Multer.File[]

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "ไม่พบไฟล์" })
  }

  const images = await uploadImageService(files, folder)
  res.json({ images })
})