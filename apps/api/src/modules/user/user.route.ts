
import { Router } from "express"
import { authenticate } from "../../middlewares/auth.middleware"
import UserController from "./user.controller"

const router = Router()

router.get(
  "/me",
  authenticate,
  UserController.getMe
)

export default router