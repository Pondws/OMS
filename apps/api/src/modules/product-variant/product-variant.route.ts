import { Router } from "express"
import authorization from "../../middlewares/auth.middleware"
import productVariantController from "./product-variant.controller"

const router = Router()

router.post("/", authorization, productVariantController.create)
router.get("/", authorization, productVariantController.getAll)
// router.get("/options", authorization, productCategoryController.getOptions)
router.get("/:id", authorization, productVariantController.getById)
// router.put("/:id", authorization, productCategoryController.update)
// router.delete("/:id", authorization, productCategoryController.delete)

export default router