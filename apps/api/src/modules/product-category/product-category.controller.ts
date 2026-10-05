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

    const result = await productCategoryService.getAll(query)

    res.json(result)
  }),
  getById: asyncHandler(async (req, res) => {
    const { id } = productCategorySchema.params.parse(req.params)

    const result = await productCategoryService.getById(id)

    res.json(result)
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = productCategorySchema.params.parse(req.params)
    
    await productCategoryService.delete(id)
    res.json({
      message: "ลบหมวดหมู่สินค้าเรียบร้อย"
    }) 
  })
}

export default productCategoryController