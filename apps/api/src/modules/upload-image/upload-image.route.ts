import { Router } from "express"
import { authenticate } from "../../middlewares/auth.middleware"
import { uploadImageController } from "./upload-image.controller"
import { uploadImageMiddleware } from "../../middlewares/upload-image.middleware"

const router = Router()

router.post("/upload-image", authenticate, uploadImageMiddleware, uploadImageController)

export default router