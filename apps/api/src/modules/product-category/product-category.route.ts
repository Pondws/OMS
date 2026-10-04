import { Router } from "express"
import authorization from "../../middlewares/auth.middleware"
import productCategoryController from "./product-category.controller"

const router = Router()

router.post("/", authorization, productCategoryController.create)

export default router