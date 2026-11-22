import { Router } from "express"
import { authenticate } from "../../middlewares/auth.middleware"
import productVariantController from "./product-variant.controller"

const router = Router()

router.post("/", authenticate, productVariantController.create)
router.get("/", authenticate, productVariantController.getAll)
router.get("/options", authenticate, productVariantController.getOptions)
router.get("/:id", authenticate, productVariantController.getById)
// router.put("/:id", authenticate, productCategoryController.update)
// router.delete("/:id", authenticate, productCategoryController.delete)

export default router