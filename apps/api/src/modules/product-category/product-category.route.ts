import { Router } from "express"
import { authenticate } from "../../middlewares/auth.middleware"
import productCategoryController from "./product-category.controller"

const router = Router()

router.post("/", authenticate, productCategoryController.create)
router.get("/", authenticate, productCategoryController.getAll)
router.get("/options", authenticate, productCategoryController.getOptions)
router.get("/:id", authenticate, productCategoryController.getById)
router.put("/:id", authenticate, productCategoryController.update)
router.delete("/:id", authenticate, productCategoryController.delete)

export default router