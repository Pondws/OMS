import { Router } from "express"
import { authenticate } from "../../middlewares/auth.middleware"
import { inventoryController } from "./inventory.controller"
import { validate } from "../../middlewares/validate"
import { getInventoryQuerySchema } from "./inventory.schema"

export const inventoryRouter = Router()

inventoryRouter.get(
  "/",
  authenticate,
  inventoryController.getAll
)
