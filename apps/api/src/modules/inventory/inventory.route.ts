import { Router } from "express"
import { authenticate } from "../../middlewares/auth.middleware"
import { inventoryController } from "./inventory.controller"

export const inventoryRouter = Router()

inventoryRouter.get( "/", authenticate, inventoryController.getAll)
inventoryRouter.get("/:id", authenticate, inventoryController.getById)
