
import { Router } from "express"
import authorization from "../../middlewares/auth.middleware"
import UserController from "./user.controller"

const router = Router()

router.get(
  "/me",
  authorization,
  UserController.getMe
)

export default router