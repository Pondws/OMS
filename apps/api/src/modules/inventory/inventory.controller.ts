import { Request, Response } from "express"
import { inventoryService } from "./inventory.service"
import { adjustmentStock, getInventoryQuerySchema } from './inventory.schema'
import { idParamsSchema } from "../../shard/schemas/params.schema"

export const inventoryController = {
  getAll: async (req: Request, res: Response) => {
    const query = getInventoryQuerySchema.parse(req.query)
    const data = await inventoryService.getAll(query)
    res.json(data)
  },
  getById: async (req: Request, res: Response) => {
    const { id } = idParamsSchema.parse(req.params)
    const data = await inventoryService.getById(id)
    res.json(data)
  },
  adjust: async (req: Request, res: Response) => {
    const body = adjustmentStock.parse(req.body)
    const data = await inventoryService.adjust(req.user!.id, body)
    res.status(201).json(data)
  }
}