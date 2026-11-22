import { Router } from "express"
import {authenticate} from "../../middlewares/auth.middleware"
import productTagController from "./product-tag.controller"

const router = Router()

router.post("/", authenticate, productTagController.create)
router.get("/", authenticate, productTagController.getAll)
router.get("/options", authenticate, productTagController.getOptions)
router.get("/:id", authenticate, productTagController.getById)
router.put("/:id", authenticate, productTagController.update)
router.delete("/:id", authenticate, productTagController.delete)

export default router