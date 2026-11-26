import { Request, Response } from "express"
import { inventoryService } from "./inventory.service"
import { getInventoryQuerySchema } from './inventory.schema'

export const inventoryController = {
  getAll: async (req: Request, res: Response) => {
    const query = getInventoryQuerySchema.parse(req.query)
    const data = await inventoryService.getAll(query)
    res.json(data)
  },
}