import { Router } from "express"
import authorization from "../../middlewares/auth.middleware"
import productCategoryController from "./product-category.controller"

const router = Router()

router.post("/", authorization, productCategoryController.create)
router.get("/", authorization, productCategoryController.getAll)
router.get("/:id", authorization, productCategoryController.getById)
router.delete("/:id", authorization, productCategoryController.delete)

export default router