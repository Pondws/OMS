import { Request, Response } from "express"
import productCategoryService from "./product-category.service"
import { asyncHandler } from "../../middlewares/async-handler"

const productCategoryController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const productCategory = await productCategoryService.create(req.body)

    res.status(201).json({ data: productCategory })
  })
}

export default productCategoryController