import { Router } from "express"
import authorization from "../../middlewares/auth.middleware"
import productTagController from "./product-tag.controller"

const router = Router()

router.post("/", authorization, productTagController.create)
router.get("/", authorization, productTagController.getAll)
router.get("/options", authorization, productTagController.getOptions)
router.get("/:id", authorization, productTagController.getById)
router.put("/:id", authorization, productTagController.update)
router.delete("/:id", authorization, productTagController.delete)

export default router