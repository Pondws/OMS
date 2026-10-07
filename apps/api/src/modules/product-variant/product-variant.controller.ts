import { Request, Response } from "express"
import { asyncHandler } from "../../middlewares/async-handler"
import productVariantService from "./product-variant.service"
import productVariantSchema from "./product-variant.schema"

const productVariantController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const payload = productVariantSchema.create.parse(req.body)

    const productVariant = await productVariantService.create(payload)

    res.status(201).json({ data: productVariant })
  }),
  // getAll: asyncHandler(async (req: Request, res: Response) => {
  //   const query = productCategorySchema.get.parse(req.query)

  //   const result = await productCategoryService.getAll(query)

  //   res.json(result)
  // }),
  // getById: asyncHandler(async (req, res) => {
  //   const { id } = productCategorySchema.params.parse(req.params)

  //   const result = await productCategoryService.getById(id)

  //   res.json(result)
  // }),
  // getOptions: asyncHandler(async (req, res) => {
  //   const query = productCategorySchema.getOptions.parse(req.query)

  //   const data = await productCategoryService.getOptions(query)

  //   res.json(data)
  // }),
  // update: asyncHandler(async (req, res) => {
  //   const { id } = productCategorySchema.params.parse(req.params)

  //   const payload = productCategorySchema.update.parse(req.body)

  //   const result = await productCategoryService.update(id, payload)

  //   res.json({
  //     data: result,
  //     message: "อัปเดตหมวดหมู่สินค้าเรียบร้อย"
  //   })
  // }),
  // delete: asyncHandler(async (req, res) => {
  //   const { id } = productCategorySchema.params.parse(req.params)

  //   await productCategoryService.delete(id)
  //   res.json({
  //     message: "ลบหมวดหมู่สินค้าเรียบร้อย"
  //   }) 
  // }),
}

export default productVariantController