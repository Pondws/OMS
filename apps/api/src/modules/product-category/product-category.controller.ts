import { Request, Response } from "express"
import productCategoryService from "./product-category.service"
import { asyncHandler } from "../../middlewares/async-handler"
import productCategorySchema from "./product-category.schema"

const productCategoryController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = productCategorySchema.create.parse(req.body)
    
    const productCategory = await productCategoryService.create(body)

    res.status(201).json({ data: productCategory })
  }),
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const query = productCategorySchema.get.parse(req.query)

    const productCategory = await productCategoryService.getAll(query)

    res.json({
      data: productCategory
    })
  })
}

export default productCategoryController