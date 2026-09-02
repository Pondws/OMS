import { Router } from "express";
import authorization from "../../middlewares/auth.middleware"
import productTagController from "./product-tag.controller";

const router = Router()

router.post("/", authorization, productTagController.create)
router.get("/", authorization, productTagController.findAll)
router.get("/:id", authorization, productTagController.findById)
router.put("/:id", authorization, productTagController.update)
router.delete("/:id", authorization, productTagController.delete)

export default router