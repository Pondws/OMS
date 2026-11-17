import { Router } from "express"
import authorization from "../../middlewares/auth.middleware"
import productController from "./product.controller"

const router = Router()

router.post("/", authorization, productController.create)
router.get("/", authorization, productController.getAll)
router.get("/options", authorization, productController.getOptions)
router.get("/:id", authorization, productController.getById)
router.put("/:id", authorization, productController.update)
router.delete("/:id", authorization, productController.delete)

export default router