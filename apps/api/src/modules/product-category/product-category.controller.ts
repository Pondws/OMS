import { Request, Response } from "express"
import productCategoryService from "./product-category.service"

const productCategoryController = {
  create: async (req: Request, res: Response) => {
    try {
      const productCategory = await productCategoryService.create(req.body)
      res.status(201).json({ data: productCategory })
    } catch (error) {
      res.status(500).json({
        message: "Internal server error"
      })
    }
  }
}

export default productCategoryController