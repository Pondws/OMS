import { Router } from "express"
import { authenticate } from "../../middlewares/auth.middleware"
import { validate } from "../../middlewares/validate"
import productController from "./product.controller"
import { productBodySchema } from "./product.schema"

const router = Router()

router.post("/",  validate({ body: productBodySchema }), productController.create)
// router.post("/", validate({ body: productBodySchema }), productController.create)
// router.get("/", authorization, productController.getAll)
// router.get("/options", authorization, productController.getOptions)
// router.get("/:id", authorization, productController.getById)
// router.put("/:id", authorization, productController.update)
// router.delete("/:id", authorization, productController.delete)

export default router