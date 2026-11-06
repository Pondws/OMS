import { Router } from "express"
import authorization from "../../middlewares/auth.middleware"
import { uploadImageController } from "./upload-image.controller"
import { uploadImageMiddleware } from "../../middlewares/upload-image.middleware"

const router = Router()

router.post("/upload-image", authorization, uploadImageMiddleware, uploadImageController)

export default router