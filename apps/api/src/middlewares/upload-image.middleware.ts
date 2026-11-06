import multer from "multer"
import { AppError } from "../errors/app-error"

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB ต่อไฟล์, สูงสุด 10 ไฟล์
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true)

    cb(new AppError(400, "รองรับเฉพาะ JPG, PNG, WEBP, GIF"))
  },
})

export const uploadImageMiddleware = upload.array("images", 10)